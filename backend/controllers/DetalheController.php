<?php
/**
 * Tela de detalhe: UM único PHP que busca 1 registro de qualquer recurso ("get one" dinâmico).
 *   GET /api/detalhe/fandom/{id}   -> um tema ou item de interesse (público)
 *   GET /api/detalhe/role/{id}     -> um rolê (público; logado vê também distância e "Eu topo!")
 *   GET /api/detalhe/usuario/{id}  -> perfil de um usuário (exige login, por privacidade)
 * Cada recurso é descrito em RECURSOS: qual tabela consultar e qual método monta a resposta.
 */
class DetalheController {
  const RECURSOS = [
    'fandom'  => ['tabela' => 'interesses', 'publico' => true,  'montar' => 'fandom'],
    'role'    => ['tabela' => 'chamados',   'publico' => true,  'montar' => 'role'],
    'usuario' => ['tabela' => 'usuarios',   'publico' => false, 'montar' => 'usuario'],
  ];

  public static function ver(array $a): void {
    [$tipo, $id] = [$a[0], (int)$a[1]];
    $rec = self::RECURSOS[$tipo] ?? null;
    if (!$rec) fail('Recurso desconhecido.', 404);
    $me = $rec['publico'] ? AuthMiddleware::opcional() : AuthMiddleware::user();
    // Nome da tabela vem da lista fixa acima (nunca do usuário), então pode ir no SQL
    $linha = q("SELECT * FROM {$rec['tabela']} WHERE id=?", [$id])->fetch();
    if (!$linha) fail('Não encontrado.', 404);
    LogService::acao('detalhe', ['tipo' => $tipo, 'id' => $id]);
    $montar = $rec['montar'];
    out(['tipo' => $tipo] + self::$montar($linha, $me));
  }

  /** Fandom: tema (com seus itens) ou item (com o tema "pai"), quantos fãs tem e os rolês abertos ligados a ele. */
  private static function fandom(array $i, ?int $me): array {
    $id = (int)$i['id'];
    $tema = $i['pai_id'] ? q('SELECT id, nome FROM interesses WHERE id=?', [$i['pai_id']])->fetch() : null;
    $itens = $tema ? [] : q('SELECT i.id, i.nome, (SELECT COUNT(*) FROM usuario_interesses ui WHERE ui.interesse_id=i.id) AS fas
                             FROM interesses i WHERE i.pai_id=? ORDER BY fas DESC, i.nome', [$id])->fetchAll();
    return [
      'id' => $id, 'nome' => $i['nome'],
      'categoria' => q('SELECT nome FROM categorias WHERE id=?', [$i['categoria_id']])->fetchColumn(),
      'tema' => $tema ? ['id' => (int)$tema['id'], 'nome' => $tema['nome']] : null,
      'itens' => array_map(fn($x) => ['id' => (int)$x['id'], 'nome' => $x['nome'], 'fas' => (int)$x['fas']], $itens),
      'fas' => (int)q('SELECT COUNT(*) FROM usuario_interesses WHERE interesse_id=?', [$id])->fetchColumn(),
      'roles' => PublicoController::listarRoles(['fandom' => $id], 12),
      'eu_tenho' => $me ? (bool)q('SELECT 1 FROM usuario_interesses WHERE usuario_id=? AND interesse_id=?', [$me, $id])->fetchColumn() : false,
      'logado' => $me !== null,
    ];
  }

  /** Rolê: visitante vê a versão pública; logado vê distância, se já topou e se é dele. */
  private static function role(array $c, ?int $me): array {
    if ($me) {
      $r = ChamadoController::umPorId((int)$c['id'], $me);
      if (!$r) fail('Não encontrado.', 404);
      return $r + ['logado' => true];
    }
    $r = PublicoController::listarRoles(['id' => (int)$c['id']], 1, true)[0] ?? null;
    if (!$r) fail('Não encontrado.', 404);
    return $r + ['logado' => false];
  }

  /** Perfil de outro usuário: afinidade, distância em faixa, interesses e redes (respeitando a visibilidade escolhida). */
  private static function usuario(array $u, ?int $me): array {
    $id = (int)$u['id'];
    $r = RecomendacaoService::listar($me, ['id' => $id])[0] ?? null;
    if (!$r) fail('Usuário não encontrado.', 404);
    $r['bio'] = q('SELECT bio FROM perfis WHERE usuario_id=?', [$id])->fetchColumn();
    $r['membro_desde'] = $u['criado_em'];
    $r['interesses'] = array_map([InteresseController::class, 'linha'], q('SELECT i.id, i.nome, c.nome AS categoria, i.pai_id FROM usuario_interesses ui
        JOIN interesses i ON i.id=ui.interesse_id JOIN categorias c ON c.id=i.categoria_id WHERE ui.usuario_id=? ORDER BY i.pai_id IS NOT NULL, i.nome', [$id])->fetchAll());
    $r['seguidores'] = (int)q('SELECT COUNT(*) FROM seguidores WHERE seguido_id=?', [$id])->fetchColumn();
    $r['seguindo_total'] = (int)q('SELECT COUNT(*) FROM seguidores WHERE seguidor_id=?', [$id])->fetchColumn();
    $r['segue_voce'] = (bool)q('SELECT 1 FROM seguidores WHERE seguidor_id=? AND seguido_id=?', [$id, $me])->fetchColumn();
    return $r + RedesService::paraVisitante($me, $id);
  }
}
