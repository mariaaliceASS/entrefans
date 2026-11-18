<?php
/**
 * Log em arquivo de TODAS as rotas (uma linha por requisição) e das ações importantes (login, cadastro, e-mail, IA...).
 * Arquivos: backend/logs/app-AAAA-MM-DD.log (um por dia). A pasta é bloqueada para acesso pela web (.htaccess).
 * Senhas e tokens nunca são gravados.
 *
 * Exemplo de linha:
 * [2026-11-18 15:20:01] 127.0.0.1 usuario=3 POST /auth/login -> AuthController::login | 200 | 41ms
 * [2026-11-18 15:20:01] 127.0.0.1 usuario=3 ACAO login_ok {"login":"demo"}
 */
class LogService {
  private static float $inicio = 0;
  private static string $rota = '';
  private static string $handler = '-';
  private static string $msgErro = '';

  private static function escrever(string $linha): void {
    $dir = dirname(__DIR__) . '/logs';
    if (!is_dir($dir)) @mkdir($dir, 0775, true);
    $uid = $_SESSION['uid'] ?? '-';
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'cli';
    @file_put_contents("$dir/app-" . date('Y-m-d') . '.log', '[' . date('Y-m-d H:i:s') . "] $ip usuario=$uid $linha" . PHP_EOL, FILE_APPEND | LOCK_EX);
  }

  /** Chamado no início de cada requisição (index.php). A linha é escrita no fim, já com o status HTTP. */
  public static function iniciar(string $metodo, string $caminho): void {
    self::$inicio = microtime(true);
    self::$rota = "$metodo $caminho" . (!empty($_SERVER['QUERY_STRING']) ? '?' . mb_substr($_SERVER['QUERY_STRING'], 0, 120) : '');
    register_shutdown_function([self::class, 'finalizar']);
  }
  public static function handler(string $h): void { self::$handler = $h; }
  public static function erroValidacao(string $msg, int $code): void { self::$msgErro = $msg; }

  public static function finalizar(): void {
    $ms = (int)round((microtime(true) - self::$inicio) * 1000);
    $status = http_response_code() ?: 200;
    self::escrever(self::$rota . ' -> ' . self::$handler . " | $status | {$ms}ms" . (self::$msgErro ? ' | ' . self::$msgErro : ''));
  }

  /** Ação de negócio (ex.: login_ok, cadastro, email_enviado). $dados não deve conter senha nem token. */
  public static function acao(string $acao, array $dados = []): void {
    self::escrever("ACAO $acao" . ($dados ? ' ' . json_encode($dados, JSON_UNESCAPED_UNICODE) : ''));
  }

  public static function erro(Throwable $e): void {
    self::escrever('ERRO ' . get_class($e) . ': ' . $e->getMessage() . ' em ' . basename($e->getFile()) . ':' . $e->getLine());
  }
}
