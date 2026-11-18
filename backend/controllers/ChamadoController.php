<?php
/**
 * Rolês ("chamados"): convites curtos ligados a um interesse — "Procuro companhia pro show do Stray Kids",
 * "Alguém pra maratonar Frieren no sábado?". Fãs próximos (ou de qualquer lugar, se for online) com o mesmo
 * interesse veem e clicam em "Eu topo!". Só o autor vê QUEM topou; os outros veem só a quantidade.
 * A posição do rolê é a posição aproximada do autor (mesma privacidade dos perfis: só cidade + faixa de distância).
 */
class ChamadoController {
  const MAX_ATIVOS = 3;      // rolês abertos ao mesmo tempo por pessoa
  const DIAS_SEM_DATA = 7;   // sem data marcada, o rolê some depois de 7 dias
  const DIAS_MAX = 60;       // data do rolê: no máximo daqui a 60 dias
  const RAIO_PADRAO = 50;

  private static function formatar(array $r, int $me): array {
    [$dist] = LocalizacaoService::faixa($r['dist_km'] === null ? null : (float)$r['dist_km']);
    return [
      'id' => (int)$r['id'], 'texto' => $r['texto'], 'formato' => $r['formato'], 'quando' => $r['quando'],
      'expira_em' => $r['expira_em'], 'criado_em' => $r['criado_em'],
      'interesse' => ['id' => (int)$r['interesse_id'], 'nome' => $r['interesse'], 'tema' => $r['tema']],
      'autor' => ['id' => (int)$r['autor_id'], 'nome' => $r['autor_nome'], 'username' => $r['username'], 'foto' => $r['foto'],
                  'cidade' => $r['cidade'], 'uf' => $r['uf'], 'distancia' => $r['formato'] === 'presencial' && $dist ? $dist : null],
      'total' => (int)$r['total'], 'eu_topo' => (bool)$r['eu_topo'], 'meu' => (int)$r['autor_id'] === $me, 'afim' => (bool)$r['afim'],
    ];
  }

  /** SELECT comum. Parâmetros na ordem: lat, lat, lng, me (eu_topo), me (afim). */
  private static function sqlBase(): string {
    $dist = LocalizacaoService::sqlDistancia('p');
    return "SELECT c.id, c.texto, c.formato, c.quando, c.expira_em, c.criado_em, (c.expira_em <= NOW()) AS encerrado,
              i.id AS interesse_id, i.nome AS interesse, t.nome AS tema,
              u.id AS autor_id, u.nome AS autor_nome, u.username, p.foto, ci.nome AS cidade, ci.uf, $dist AS dist_km,
              (SELECT COUNT(*) FROM chamado_participantes cp WHERE cp.chamado_id = c.id) AS total,
              EXISTS(SELECT 1 FROM chamado_participantes cp WHERE cp.chamado_id = c.id AND cp.usuario_id = ?) AS eu_topo,
              EXISTS(SELECT 1 FROM usuario_interesses ui WHERE ui.usuario_id = ? AND ui.interesse_id IN (i.id, COALESCE(i.pai_id, i.id))) AS afim
            FROM chamados c
            JOIN usuarios u ON u.id = c.usuario_id JOIN perfis p ON p.usuario_id = u.id
            LEFT JOIN cidades ci ON ci.id = p.cidade_id
            JOIN interesses i ON i.id = c.interesse_id LEFT JOIN interesses t ON t.id = i.pai_id";
  }

  private static function minhaPosicao(int $me): array {
    $r = q('SELECT lat_aprox, lng_aprox FROM perfis WHERE usuario_id=?', [$me])->fetch() ?: [];
    return [isset($r['lat_aprox']) ? (float)$r['lat_aprox'] : null, isset($r['lng_aprox']) ? (float)$r['lng_aprox'] : null];
  }

  /**
   * Feed: rolês abertos de outras pessoas. GET /chamados?filtro=afins|todos&raio_km=5..100
   * Presencial: só dentro do raio. Online: de qualquer lugar.
   */
  public static function listar(): void {
    $me = AuthMiddleware::user(); [$lat, $lng] = self::minhaPosicao($me);
    $raio = (int)($_GET['raio_km'] ?? self::RAIO_PADRAO);
    if (!in_array($raio, LocalizacaoService::RAIOS, true)) $raio = self::RAIO_PADRAO;
    $sql = self::sqlBase() . ' WHERE c.expira_em > NOW() AND c.usuario_id <> ?'
         . " HAVING (formato = 'online' OR dist_km < ?)" . (($_GET['filtro'] ?? 'afins') === 'todos' ? '' : ' AND afim')
         . ' ORDER BY c.quando IS NULL, c.quando, c.criado_em DESC LIMIT 60';
    $rows = q($sql, [$lat, $lat, $lng, $me, $me, $me, $raio])->fetchAll();
    out(['tem_localizacao' => $lat !== null, 'raio_km' => $raio, 'chamados' => array_map(fn($r) => self::formatar($r, $me), $rows)]);
  }

  /** Um rolê pelo id, no formato do feed (usado pela tela de detalhe). Inclui "encerrado". */
  public static function umPorId(int $id, int $me): ?array {
    [$lat, $lng] = self::minhaPosicao($me);
    $r = q(self::sqlBase() . ' WHERE c.id = ?', [$lat, $lat, $lng, $me, $me, $id])->fetch();
    return $r ? self::formatar($r, $me) + ['encerrado' => (bool)$r['encerrado']] : null;
  }

  /**
   * "Carrinho" do EntreFans: a agenda com os rolês que a pessoa topou (relação n..n usuarios x chamados,
   * tabela chamado_participantes). O botão "Eu topo!" adiciona aqui; "Desistir" remove.
   */
  public static function agenda(): void {
    $me = AuthMiddleware::user(); [$lat, $lng] = self::minhaPosicao($me);
    $rows = q(self::sqlBase() . ' JOIN chamado_participantes eu ON eu.chamado_id = c.id AND eu.usuario_id = ?
               WHERE c.expira_em > NOW() - INTERVAL 1 DAY ORDER BY c.expira_em <= NOW(), c.quando IS NULL, c.quando, eu.criado_em DESC',
              [$lat, $lat, $lng, $me, $me, $me])->fetchAll();
    out(array_map(fn($r) => self::formatar($r, $me) + ['encerrado' => (bool)$r['encerrado']], $rows));
  }

  /** Meus rolês (abertos e os encerrados há até 7 dias), com quem topou. */
  public static function meus(): void {
    $me = AuthMiddleware::user(); [$lat, $lng] = self::minhaPosicao($me);
    $vistos = q('SELECT chamados_vistos_em FROM perfis WHERE usuario_id=?', [$me])->fetchColumn();
    $rows = q(self::sqlBase() . ' WHERE c.usuario_id = ? AND c.expira_em > NOW() - INTERVAL 7 DAY ORDER BY c.expira_em <= NOW(), c.criado_em DESC',
              [$lat, $lat, $lng, $me, $me, $me])->fetchAll();
    $out = [];
    foreach ($rows as $r) {
      $c = self::formatar($r, $me) + ['encerrado' => (bool)$r['encerrado']];
      $c['participantes'] = array_map(fn($p) => ['id' => (int)$p['id'], 'nome' => $p['nome'], 'username' => $p['username'], 'foto' => $p['foto'],
          'novo' => !$vistos || $p['criado_em'] > $vistos],
        q('SELECT u.id, u.nome, u.username, pf.foto, cp.criado_em FROM chamado_participantes cp
           JOIN usuarios u ON u.id = cp.usuario_id JOIN perfis pf ON pf.usuario_id = u.id
           WHERE cp.chamado_id = ? ORDER BY cp.criado_em DESC', [$c['id']])->fetchAll());
      $out[] = $c;
    }
    out($out);
  }

  public static function criar(): void {
    $me = AuthMiddleware::user(); $b = body();
    $texto = str($b, 'texto', 280); $interesse = (int)($b['interesse_id'] ?? 0);
    $formato = ($b['formato'] ?? '') === 'online' ? 'online' : 'presencial';
    if (mb_strlen($texto) < 10) fail('Conte um pouco mais sobre o rolê (mínimo 10 caracteres).');
    if (!q('SELECT 1 FROM usuario_interesses WHERE usuario_id=? AND interesse_id=?', [$me, $interesse])->fetch())
      fail('Escolha um dos interesses do seu perfil.');
    if ($formato === 'presencial' && self::minhaPosicao($me)[0] === null) fail('Defina sua localização no perfil para criar um rolê presencial.');
    $ativos = (int)q('SELECT COUNT(*) FROM chamados WHERE usuario_id=? AND expira_em > NOW()', [$me])->fetchColumn();
    if ($ativos >= self::MAX_ATIVOS) fail('Você já tem ' . self::MAX_ATIVOS . ' rolês abertos. Encerre um para criar outro.');

    // Datas calculadas no MySQL (mesmo relógio do NOW() usado nas consultas)
    $quando = trim((string)($b['quando'] ?? '')) ?: null;
    if ($quando !== null) {
      $d = DateTime::createFromFormat('!Y-m-d', $quando);
      if (!$d || $d->format('Y-m-d') !== $quando) fail('Data inválida.');
      $dif = (int)q('SELECT DATEDIFF(?, CURDATE())', [$quando])->fetchColumn();
      if ($dif < 0) fail('A data do rolê já passou.');
      if ($dif > self::DIAS_MAX) fail('Marque rolês para no máximo ' . self::DIAS_MAX . ' dias à frente.');
    }
    q("INSERT INTO chamados (usuario_id, interesse_id, texto, formato, quando, expira_em)
       VALUES (?,?,?,?,?, IF(? IS NULL, NOW() + INTERVAL " . self::DIAS_SEM_DATA . " DAY, CONCAT(?, ' 23:59:59')))",
      [$me, $interesse, $texto, $formato, $quando, $quando, $quando]);
    $id = (int)db()->lastInsertId();
    LogService::acao('role_criado', ['id' => $id, 'formato' => $formato]);
    out(['id' => $id], 201);
  }

  /** Encerrar (apagar) o próprio rolê. */
  public static function apagar(array $a): void {
    $me = AuthMiddleware::user();
    $n = q('DELETE FROM chamados WHERE id=? AND usuario_id=?', [(int)$a[0], $me])->rowCount();
    if (!$n) fail('Rolê não encontrado.', 404);
    LogService::acao('role_encerrado', ['id' => (int)$a[0]]);
    out(['ok' => true]);
  }

  public static function topar(array $a): void {
    $me = AuthMiddleware::user(); $id = (int)$a[0];
    $c = q('SELECT usuario_id, expira_em > NOW() AS aberto FROM chamados WHERE id=?', [$id])->fetch();
    if (!$c) fail('Rolê não encontrado.', 404);
    if ((int)$c['usuario_id'] === $me) fail('Esse rolê é seu.');
    if (!$c['aberto']) fail('Esse rolê já foi encerrado.');
    q('INSERT IGNORE INTO chamado_participantes (chamado_id, usuario_id) VALUES (?,?)', [$id, $me]);
    LogService::acao('role_topei', ['id' => $id]);
    out(['eu_topo' => true, 'total' => (int)q('SELECT COUNT(*) FROM chamado_participantes WHERE chamado_id=?', [$id])->fetchColumn()]);
  }

  public static function desistir(array $a): void {
    $me = AuthMiddleware::user(); $id = (int)$a[0];
    q('DELETE FROM chamado_participantes WHERE chamado_id=? AND usuario_id=?', [$id, $me]);
    LogService::acao('role_desisti', ['id' => $id]);
    out(['eu_topo' => false, 'total' => (int)q('SELECT COUNT(*) FROM chamado_participantes WHERE chamado_id=?', [$id])->fetchColumn()]);
  }

  /** Quantas pessoas toparam seus rolês desde a última vez que você abriu "Meus rolês". */
  public static function novos(int $me): int {
    return (int)q("SELECT COUNT(*) FROM chamado_participantes cp JOIN chamados c ON c.id = cp.chamado_id JOIN perfis p ON p.usuario_id = c.usuario_id
                   WHERE c.usuario_id = ? AND cp.criado_em > COALESCE(p.chamados_vistos_em, '1970-01-02')", [$me])->fetchColumn();
  }

  public static function marcarVistos(): void {
    $me = AuthMiddleware::user();
    q('UPDATE perfis SET chamados_vistos_em = CURRENT_TIMESTAMP WHERE usuario_id=?', [$me]);
    out(['ok' => true]);
  }
}
