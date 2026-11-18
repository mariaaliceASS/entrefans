<?php
/**
 * Listagens PÚBLICAS (não exigem login):
 *   GET /api/publico/fandoms?q=&categoria=        -> temas de interesse com nº de fãs e de rolês abertos
 *   GET /api/publico/roles?formato=&fandom=       -> mural de rolês abertos
 * Privacidade: visitantes veem só o primeiro nome do autor e a cidade. Nada de foto, @, distância ou contatos.
 */
class PublicoController {
  public static function fandoms(): void {
    $sql = "SELECT t.id, t.nome, c.nome AS categoria,
              (SELECT COUNT(*) FROM usuario_interesses ui WHERE ui.interesse_id = t.id) AS fas,
              (SELECT COUNT(*) FROM interesses x WHERE x.pai_id = t.id) AS itens,
              (SELECT COUNT(*) FROM chamados ch JOIN interesses ci ON ci.id = ch.interesse_id
                WHERE ch.expira_em > NOW() AND (ci.id = t.id OR ci.pai_id = t.id)) AS roles
            FROM interesses t JOIN categorias c ON c.id = t.categoria_id
            WHERE t.pai_id IS NULL";
    $p = [];
    $busca = mb_substr(trim((string)($_GET['q'] ?? '')), 0, 60);
    if ($busca !== '') { $sql .= ' AND (t.nome LIKE ? OR EXISTS (SELECT 1 FROM interesses x WHERE x.pai_id = t.id AND x.nome LIKE ?))'; array_push($p, "%$busca%", "%$busca%"); }
    if (!empty($_GET['categoria'])) { $sql .= ' AND c.nome = ?'; $p[] = (string)$_GET['categoria']; }
    $rows = q($sql . ' ORDER BY c.id, fas DESC, t.nome', $p)->fetchAll();
    out([
      'categorias' => array_column(q('SELECT nome FROM categorias ORDER BY id')->fetchAll(), 'nome'),
      'fandoms' => array_map(fn($r) => ['id' => (int)$r['id'], 'nome' => $r['nome'], 'categoria' => $r['categoria'],
        'fas' => (int)$r['fas'], 'itens' => (int)$r['itens'], 'roles' => (int)$r['roles']], $rows),
    ]);
  }

  public static function roles(): void {
    $f = [];
    if (in_array($_GET['formato'] ?? '', ['online', 'presencial'], true)) $f['formato'] = $_GET['formato'];
    if (!empty($_GET['fandom'])) $f['fandom'] = (int)$_GET['fandom'];
    out(self::listarRoles($f, 60));
  }

  /** Rolês abertos na versão pública. $f: id | formato | fandom (tema ou item). $incluirEncerrado: para a tela de detalhe. */
  public static function listarRoles(array $f, int $limite, bool $incluirEncerrado = false): array {
    $sql = "SELECT c.id, c.texto, c.formato, c.quando, c.expira_em, c.criado_em, (c.expira_em <= NOW()) AS encerrado,
              i.id AS interesse_id, i.nome AS interesse, t.id AS tema_id, t.nome AS tema,
              u.nome AS autor_nome, ci.nome AS cidade, ci.uf,
              (SELECT COUNT(*) FROM chamado_participantes cp WHERE cp.chamado_id = c.id) AS total
            FROM chamados c
            JOIN usuarios u ON u.id = c.usuario_id JOIN perfis p ON p.usuario_id = u.id
            LEFT JOIN cidades ci ON ci.id = p.cidade_id
            JOIN interesses i ON i.id = c.interesse_id LEFT JOIN interesses t ON t.id = i.pai_id
            WHERE 1=1";
    $p = [];
    if (!$incluirEncerrado) $sql .= ' AND c.expira_em > NOW()';
    if (isset($f['id'])) { $sql .= ' AND c.id = ?'; $p[] = $f['id']; }
    if (isset($f['formato'])) { $sql .= ' AND c.formato = ?'; $p[] = $f['formato']; }
    if (isset($f['fandom'])) { $sql .= ' AND (i.id = ? OR i.pai_id = ?)'; array_push($p, $f['fandom'], $f['fandom']); }
    $sql .= ' ORDER BY c.quando IS NULL, c.quando, c.criado_em DESC LIMIT ' . (int)$limite;
    return array_map(fn($r) => [
      'id' => (int)$r['id'], 'texto' => $r['texto'], 'formato' => $r['formato'], 'quando' => $r['quando'],
      'expira_em' => $r['expira_em'], 'criado_em' => $r['criado_em'], 'encerrado' => (bool)$r['encerrado'],
      'interesse' => ['id' => (int)$r['interesse_id'], 'nome' => $r['interesse'], 'tema' => $r['tema'], 'tema_id' => $r['tema_id'] === null ? null : (int)$r['tema_id']],
      'autor' => ['nome' => explode(' ', trim($r['autor_nome']))[0], 'cidade' => $r['cidade'], 'uf' => $r['uf']],
      'total' => (int)$r['total'],
    ], q($sql, $p)->fetchAll());
  }
}
