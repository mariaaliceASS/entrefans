<?php
class RecomendacaoService {
  /**
   * Lista usuários com interesses em comum e proximidade.
   * $f: q, interesse, raio_km (5|10|25|50|100), id, so_afins
   * Privacidade: devolve só a cidade e a FAIXA de distância; nunca coordenadas nem a distância exata.
   */
  public static function listar(int $me, array $f = []): array {
    $mine = q('SELECT lat_aprox, lng_aprox FROM perfis WHERE usuario_id=?', [$me])->fetch() ?: ['lat_aprox' => null, 'lng_aprox' => null];
    $lat = $mine['lat_aprox'] === null ? null : (float)$mine['lat_aprox'];
    $lng = $mine['lng_aprox'] === null ? null : (float)$mine['lng_aprox'];
    $total = (int)q('SELECT COUNT(*) FROM usuario_interesses WHERE usuario_id=?', [$me])->fetchColumn();
    $dist = LocalizacaoService::sqlDistancia('p');
    $sql = "SELECT u.id, u.nome, u.username, p.foto, c.nome AS cidade, c.uf, $dist AS dist_km,
              (SELECT COUNT(*) FROM seguidores s WHERE s.seguidor_id=? AND s.seguido_id=u.id) AS seguindo,
              COUNT(i.id) AS em_comum, GROUP_CONCAT(i.nome ORDER BY i.nome SEPARATOR '|') AS nomes
            FROM usuarios u JOIN perfis p ON p.usuario_id=u.id
            LEFT JOIN cidades c ON c.id=p.cidade_id
            LEFT JOIN usuario_interesses ui ON ui.usuario_id=u.id
            LEFT JOIN usuario_interesses mine ON mine.interesse_id=ui.interesse_id AND mine.usuario_id=?
            LEFT JOIN interesses i ON i.id=mine.interesse_id
            WHERE u.id<>?";
    $p = [$lat, $lat, $lng, $me, $me, $me];
    if (!empty($f['id'])) { $sql .= ' AND u.id=?'; $p[] = (int)$f['id']; }
    if (!empty($f['q'])) { $sql .= ' AND (u.username LIKE ? OR u.nome LIKE ?)'; $l = '%' . $f['q'] . '%'; array_push($p, $l, $l); }
    if (!empty($f['interesse'])) {
      $sql .= ' AND EXISTS (SELECT 1 FROM usuario_interesses x JOIN interesses xi ON xi.id=x.interesse_id WHERE x.usuario_id=u.id AND xi.nome LIKE ?)';
      $p[] = '%' . $f['interesse'] . '%';
    }
    $sql .= ' GROUP BY u.id';
    $having = [];
    if (!empty($f['so_afins'])) $having[] = 'em_comum > 0';
    if (!empty($f['raio_km']) && in_array((int)$f['raio_km'], LocalizacaoService::RAIOS, true)) {
      if ($lat === null) fail('Defina sua localização para filtrar por distância.');
      $having[] = 'dist_km < ' . (int)$f['raio_km'];
    }
    if ($having) $sql .= ' HAVING ' . implode(' AND ', $having);
    $rows = q($sql, $p)->fetchAll();
    foreach ($rows as &$r) {
      $r['id'] = (int)$r['id'];
      $r['compat'] = $total ? (int)round(100 * $r['em_comum'] / $total) : 0;
      [$r['distancia'], $bonus] = LocalizacaoService::faixa($r['dist_km'] === null ? null : (float)$r['dist_km']);
      $r['distancia'] = $r['distancia'] ?: null;
      $r['proximidade'] = $bonus; // ordenação usa a faixa, não a distância exata
      $r['compartilhados'] = $r['nomes'] ? explode('|', $r['nomes']) : [];
      $r['seguindo'] = (bool)$r['seguindo'];
      $r['score'] = $r['compat'] + $bonus;
      unset($r['nomes'], $r['em_comum'], $r['dist_km']);
    }
    unset($r);
    usort($rows, fn($a, $b) => $b['score'] <=> $a['score'] ?: strcmp($a['username'], $b['username']));
    return $rows;
  }
}
