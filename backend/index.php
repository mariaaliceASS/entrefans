<?php
/**
 * Ponto de entrada único da API (front controller). Toda requisição /api/... chega aqui (ver .htaccess),
 * é registrada no log e encaminhada para o método do controller definido em routes/api.php.
 */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/core.php';
foreach (['middlewares/AuthMiddleware', 'services/RecomendacaoService', 'services/CatalogoService', 'services/RedesService', 'services/LocalizacaoService',
          'services/MailService', 'services/IaService',
          'controllers/AuthController', 'controllers/UsuarioController', 'controllers/PerfilController', 'controllers/InteresseController',
          'controllers/RecomendacaoController', 'controllers/SeguidorController', 'controllers/ChamadoController', 'controllers/DetalheController',
          'controllers/PublicoController', 'controllers/ContatoController', 'controllers/IaController'] as $f) require __DIR__ . "/$f.php";

// CORS só para o servidor de desenvolvimento do Vite (em produção front e API ficam no mesmo domínio)
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, cfg()['allowed_origins'], true)) {
  header("Access-Control-Allow-Origin: $origin"); header('Access-Control-Allow-Credentials: true');
  header('Access-Control-Allow-Headers: Content-Type, X-Requested-With'); header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS'); header('Vary: Origin');
}
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

start_session();
$path = preg_match('#/api(/[^?]*)?#', parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), $m) ? rtrim($m[1] ?? '/', '/') : '/';
$method = $_SERVER['REQUEST_METHOD'];
LogService::iniciar($method, $path);
set_exception_handler(function (Throwable $e) { LogService::erro($e); error_log((string)$e); fail('Erro interno do servidor.', 500); });

foreach (require __DIR__ . '/routes/api.php' as $r) {
  if ($r[0] === $method && preg_match($r[1], $path, $mm)) {
    LogService::handler($r[2]);
    AuthMiddleware::csrf();
    array_shift($mm);
    call_user_func($r[2], $mm);
    exit;
  }
}
fail('Rota não encontrada.', 404);
