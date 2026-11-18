<?php
/**
 * Arquivo SÓ de conexão com o banco (MySQL/MariaDB via PDO).
 * Na hospedagem, troque host, nome do banco, usuário e senha pelos dados criados no painel.
 */
const DB_HOST = '127.0.0.1';
const DB_PORT = 3306;
const DB_NAME = 'entrefans';
const DB_USER = 'root';
const DB_PASS = '';

function db(): PDO {
  static $pdo = null;
  if ($pdo === null) {
    $pdo = new PDO('mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASS, [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,        // erro de SQL vira exceção
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,   // linhas como array associativo
      PDO::ATTR_EMULATE_PREPARES => false,                // prepared statements reais (contra SQL injection)
    ]);
  }
  return $pdo;
}
