<?php
class AuthMiddleware {
  /** Exige login: devolve o id do usuário da sessão ou responde 401. */
  public static function user(): int {
    $id = $_SESSION['uid'] ?? null;
    if (!$id) fail('Não autenticado.', 401);
    return (int)$id;
  }
  /** Para rotas públicas que mostram algo a mais para quem está logado. */
  public static function opcional(): ?int {
    return isset($_SESSION['uid']) ? (int)$_SESSION['uid'] : null;
  }
  // Proteção CSRF: SameSite=Lax + header customizado exigido em requisições que alteram estado
  public static function csrf(): void {
    if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'DELETE'], true)
        && ($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') !== 'XMLHttpRequest') fail('Requisição inválida.', 403);
  }
}
