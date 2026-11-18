<?php
class InteresseController {
  const CAMPOS = 'SELECT i.id, i.nome, c.nome AS categoria, i.pai_id, i.fonte FROM interesses i JOIN categorias c ON c.id=i.categoria_id';

  public static function linha(array $r): array {
    $r['id'] = (int)$r['id']; $r['pai_id'] = $r['pai_id'] === null ? null : (int)$r['pai_id'];
    return $r;
  }
  /** Temas (pai_id NULL) e itens de cada tema (pai_id = tema) */
  public static function listar(): void {
    AuthMiddleware::user();
    out(array_map([self::class, 'linha'], q(self::CAMPOS . ' ORDER BY c.id, i.pai_id IS NOT NULL, i.nome')->fetchAll()));
  }
  /** Cria um tema (em "Outros") ou, com pai_id, um item dentro de um tema. Se o nome já existir, devolve o existente. */
  public static function criar(): void {
    AuthMiddleware::user();
    $d = body(); $nome = str($d, 'nome', 60); $pai = (int)($d['pai_id'] ?? 0) ?: null;
    if (mb_strlen($nome) < 2) fail('Nome muito curto.');
    $ex = q('SELECT id FROM interesses WHERE nome=? AND pai_id <=> ?', [$nome, $pai])->fetchColumn();
    if (!$ex) {
      if ($pai) {
        $p = q('SELECT id, categoria_id FROM interesses WHERE id=? AND pai_id IS NULL', [$pai])->fetch();
        if (!$p) fail('Tema inválido.');
        q('INSERT INTO interesses (categoria_id, pai_id, nome) VALUES (?,?,?)', [$p['categoria_id'], $pai, $nome]);
      } else {
        q("INSERT INTO interesses (categoria_id, nome) SELECT id, ? FROM categorias WHERE nome='Outros'", [$nome]);
      }
      $ex = db()->lastInsertId();
      LogService::acao('interesse_criado', ['id' => (int)$ex, 'nome' => $nome, 'pai_id' => $pai]);
    }
    out(self::linha(q(self::CAMPOS . ' WHERE i.id=?', [$ex])->fetch()), 201);
  }
  /** Busca itens de um tema na API externa ligada a ele. Marca os que já existem no banco (id). */
  public static function buscar(array $a): void {
    AuthMiddleware::user();
    $tema = q('SELECT id, fonte FROM interesses WHERE id=? AND pai_id IS NULL', [(int)$a[0]])->fetch();
    if (!$tema) fail('Tema não encontrado.', 404);
    $termo = mb_substr(trim((string)($_GET['q'] ?? '')), 0, 60);
    if (mb_strlen($termo) < 2 || !$tema['fonte']) out([]);
    $res = CatalogoService::buscar($tema['fonte'], $termo);
    if ($res) {
      $nomes = array_column($res, 'nome');
      $ids = [];
      $sql = 'SELECT nome, id FROM interesses WHERE pai_id=? AND nome IN (' . implode(',', array_fill(0, count($nomes), '?')) . ')';
      foreach (q($sql, [(int)$tema['id'], ...$nomes])->fetchAll() as $row)
        $ids[mb_strtolower($row['nome'])] = $row['id'];
      foreach ($res as &$r) $r['id'] = isset($ids[mb_strtolower($r['nome'])]) ? (int)$ids[mb_strtolower($r['nome'])] : null;
    }
    out($res);
  }
}
