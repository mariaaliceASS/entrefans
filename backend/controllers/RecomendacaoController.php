<?php
class RecomendacaoController {
  public static function listar(): void {
    $me = AuthMiddleware::user();
    out(array_slice(RecomendacaoService::listar($me, ['so_afins' => true]), 0, 30));
  }
}
