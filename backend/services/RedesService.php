<?php
/** Redes sociais do perfil: validação, leitura e regra de quem pode ver. */
class RedesService {
  /** rede => [regex do nome de usuário, nome para mensagens] */
  const REDES = [
    'instagram' => ['/^[a-z0-9._]{1,30}$/i', 'Instagram'],
    'tiktok'    => ['/^[a-z0-9._]{2,24}$/i', 'TikTok'],
    'x'         => ['/^[a-z0-9_]{1,15}$/i', 'X'],
    'discord'   => ['/^[a-z0-9_.]{2,32}$/', 'Discord'],
    'twitch'    => ['/^[a-z0-9_]{3,25}$/i', 'Twitch'],
    'youtube'   => ['/^[a-z0-9._-]{3,30}$/i', 'YouTube'],
  ];
  const VISIBILIDADES = ['todos', 'conexoes', 'ninguem'];

  /** Aceita "@nome", "nome" ou o link do perfil; devolve só o nome. Falha com mensagem amigável se for inválido. */
  public static function normalizar(string $rede, string $valor): string {
    $v = trim($valor);
    if (preg_match('#^(https?://)?(www\.|m\.)?[a-z0-9.-]+\.[a-z]{2,}/#i', $v)) { // é um link: pega o último trecho do caminho
      $path = trim((string)parse_url(preg_match('#^https?://#i', $v) ? $v : "https://$v", PHP_URL_PATH), '/');
      $partes = explode('/', $path); $v = end($partes) ?: '';
    }
    $v = ltrim($v, '@');
    if ($rede === 'discord') $v = mb_strtolower($v);
    [$re, $nome] = self::REDES[$rede];
    if (!preg_match($re, $v)) fail("Nome de usuário do $nome inválido.");
    return $v;
  }

  public static function listar(int $id): array {
    $r = [];
    foreach (q('SELECT rede, usuario_rede FROM redes_sociais WHERE usuario_id=?', [$id])->fetchAll() as $l) $r[$l['rede']] = $l['usuario_rede'];
    return $r;
  }

  /** Salva o conjunto completo de redes (campo vazio = remove aquela rede). */
  public static function salvar(int $id, array $redes): void {
    foreach (self::REDES as $rede => $_) {
      $valor = trim((string)($redes[$rede] ?? ''));
      if ($valor === '') { q('DELETE FROM redes_sociais WHERE usuario_id=? AND rede=?', [$id, $rede]); continue; }
      q('INSERT INTO redes_sociais (usuario_id, rede, usuario_rede) VALUES (?,?,?) ON DUPLICATE KEY UPDATE usuario_rede=VALUES(usuario_rede)',
        [$id, $rede, self::normalizar($rede, $valor)]);
    }
  }

  /** "conexao" = os dois se seguem. */
  public static function conexao(int $a, int $b): bool {
    return (int)q('SELECT COUNT(*) FROM seguidores WHERE (seguidor_id=? AND seguido_id=?) OR (seguidor_id=? AND seguido_id=?)', [$a, $b, $b, $a])->fetchColumn() === 2;
  }

  /** O que o usuário $me pode ver das redes de $id. */
  public static function paraVisitante(int $me, int $id): array {
    $vis = q('SELECT redes_visibilidade FROM perfis WHERE usuario_id=?', [$id])->fetchColumn() ?: 'conexoes';
    $conexao = self::conexao($me, $id);
    $pode = $me === $id || $vis === 'todos' || ($vis === 'conexoes' && $conexao);
    $redes = $pode ? self::listar($id) : [];
    $tem = $pode ? count($redes) > 0 : (int)q('SELECT COUNT(*) FROM redes_sociais WHERE usuario_id=?', [$id])->fetchColumn() > 0;
    return [
      'redes' => (object)$redes,                                          // objeto JSON mesmo quando vazio
      // nenhuma = não cadastrou | visivel = pode ver | conexoes / ninguem = tem redes, mas estão ocultas por esse motivo
      'redes_status' => !$tem ? 'nenhuma' : ($pode ? 'visivel' : $vis),
      'conexao' => $conexao,
    ];
  }
}
