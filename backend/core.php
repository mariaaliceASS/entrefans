<?php
/** Funções de apoio usadas por todos os controllers. */
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/services/LogService.php';
date_default_timezone_set('America/Sao_Paulo'); // horário dos logs igual ao do Brasil

function cfg(): array { static $c; return $c ??= require __DIR__ . '/config/config.php'; }

/** Responde em JSON e encerra. */
function out($data, int $code = 200): never { http_response_code($code); echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE); exit; }
/** Responde com erro ({"erro": "..."}) e encerra. */
function fail(string $msg, int $code = 400): never { LogService::erroValidacao($msg, $code); out(['erro' => $msg], $code); }
/** Corpo da requisição (JSON) como array. */
function body(): array { $d = json_decode(file_get_contents('php://input'), true); return is_array($d) ? $d : []; }
/** Executa um SQL com parâmetros (prepared statement). */
function q(string $sql, array $p = []): PDOStatement { $s = db()->prepare($sql); $s->execute($p); return $s; }
/** Texto do array, sem espaços nas pontas e cortado no tamanho máximo. */
function str(array $a, string $k, int $max = 255): string { return mb_substr(trim((string)($a[$k] ?? '')), 0, $max); }

function start_session(): void {
  $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
  session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'httponly' => true, 'secure' => $https, 'samesite' => 'Lax']);
  session_name('entrefans_sid');
  session_start();
}
