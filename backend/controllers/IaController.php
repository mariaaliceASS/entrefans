<?php
/** Recursos que usam a LLM (Gemini, ver services/IaService.php). */
class IaController {
  /** POST /api/ia/bio {estilo?} -> sugere uma bio de até 140 caracteres a partir dos interesses do perfil. */
  public static function bio(): void {
    $me = AuthMiddleware::user();
    $estilo = ['divertida' => 'divertido e descontraído', 'fofa' => 'fofo e acolhedor', 'direta' => 'direto e simples'][(string)(body()['estilo'] ?? '')] ?? 'divertido e descontraído';
    $nome = q('SELECT nome FROM usuarios WHERE id=?', [$me])->fetchColumn();
    $ints = array_column(q('SELECT i.nome FROM usuario_interesses ui JOIN interesses i ON i.id = ui.interesse_id
                             WHERE ui.usuario_id=? ORDER BY i.pai_id IS NULL, i.nome LIMIT 15', [$me])->fetchAll(), 'nome');
    if (count($ints) === 0) fail('Escolha alguns interesses no perfil antes de pedir uma bio.');

    $prompt = "Escreva UMA bio curta, em português do Brasil, para o perfil de $nome numa rede social de fãs que se encontram por interesses em comum.\n"
      . 'Interesses: ' . implode(', ', $ints) . ".\n"
      . "Tom: $estilo. Primeira pessoa. No máximo 130 caracteres. Pode usar até 2 emojis. "
      . 'Não invente dados pessoais (idade, cidade, profissão). Não use aspas nem hashtags. Responda só com a bio.';
    $bio = trim(IaService::gerar($prompt), " \t\n\r\"'“”");
    out(['bio' => mb_substr($bio, 0, 140)]);
  }
}
