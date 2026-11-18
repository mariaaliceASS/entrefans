<?php
/**
 * Conexão = as duas pessoas se seguem. Quando alguém segue você e você ainda não seguiu de volta,
 * isso é uma SOLICITAÇÃO de conexão: aceitar = seguir de volta; recusar = remover a pessoa dos seus seguidores.
 */
class SeguidorController {
  public static function seguir(array $a): void {
    $me = AuthMiddleware::user(); $id = (int)$a[0];
    if ($id === $me) fail('Você não pode seguir a si mesmo.');
    if (!q('SELECT 1 FROM usuarios WHERE id=?', [$id])->fetch()) fail('Usuário não encontrado.', 404);
    q('INSERT IGNORE INTO seguidores (seguidor_id, seguido_id) VALUES (?,?)', [$me, $id]); // PK composta impede duplicidade
    LogService::acao('seguir', ['seguido' => $id]);
    out(['seguindo' => true]);
  }
  public static function deixar(array $a): void {
    $me = AuthMiddleware::user();
    q('DELETE FROM seguidores WHERE seguidor_id=? AND seguido_id=?', [$me, (int)$a[0]]);
    LogService::acao('deixar_de_seguir', ['seguido' => (int)$a[0]]);
    out(['seguindo' => false]);
  }
  /** Recusar solicitação: a pessoa deixa de seguir você. */
  public static function remover(array $a): void {
    $me = AuthMiddleware::user();
    q('DELETE FROM seguidores WHERE seguidor_id=? AND seguido_id=?', [(int)$a[0], $me]);
    LogService::acao('recusar_solicitacao', ['seguidor' => (int)$a[0]]);
    out(['ok' => true]);
  }
  /** Quantas solicitações chegaram desde a última vez que abriu "Conexões" (para a bolinha vermelha). */
  public static function notificacoes(): void {
    $me = AuthMiddleware::user();
    $n = (int)q("SELECT COUNT(*) FROM seguidores s JOIN perfis p ON p.usuario_id = s.seguido_id
                 WHERE s.seguido_id = ? AND s.criado_em > COALESCE(p.conexoes_vistas_em, '1970-01-02')
                   AND NOT EXISTS (SELECT 1 FROM seguidores v WHERE v.seguidor_id = s.seguido_id AND v.seguido_id = s.seguidor_id)", [$me])->fetchColumn();
    out(['solicitacoes_novas' => $n, 'chamados_novos' => ChamadoController::novos($me)]);
  }
  public static function marcarVistas(): void {
    $me = AuthMiddleware::user();
    q('UPDATE perfis SET conexoes_vistas_em = CURRENT_TIMESTAMP WHERE usuario_id=?', [$me]);
    out(['ok' => true]);
  }

  /** Tudo da página "Conexões" de uma vez: solicitações (com marca de "nova"), conexões e quem você segue sem retorno. */
  public static function conexoes(): void {
    $me = AuthMiddleware::user();
    $vistas = q('SELECT conexoes_vistas_em FROM perfis WHERE usuario_id=?', [$me])->fetchColumn();
    $meSeguem = []; foreach (q('SELECT seguidor_id, criado_em FROM seguidores WHERE seguido_id=?', [$me])->fetchAll() as $r) $meSeguem[(int)$r['seguidor_id']] = $r['criado_em'];
    $sigo = array_flip(array_map('intval', array_column(q('SELECT seguido_id FROM seguidores WHERE seguidor_id=?', [$me])->fetchAll(), 'seguido_id')));
    $out = ['solicitacoes' => [], 'conexoes' => [], 'aguardando' => []];
    if (!$meSeguem && !$sigo) out($out);
    foreach (RecomendacaoService::listar($me, []) as $u) {
      $id = $u['id']; $segueMe = isset($meSeguem[$id]); $euSigo = isset($sigo[$id]);
      if ($segueMe && $euSigo) $out['conexoes'][] = $u;
      elseif ($segueMe) $out['solicitacoes'][] = $u + ['nova' => !$vistas || $meSeguem[$id] > $vistas, 'desde' => $meSeguem[$id]];
      elseif ($euSigo) $out['aguardando'][] = $u;
    }
    usort($out['solicitacoes'], fn($a, $b) => strcmp($b['desde'], $a['desde'])); // mais recentes primeiro
    out($out);
  }
}
