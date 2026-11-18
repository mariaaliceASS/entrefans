<?php
class UsuarioController {
  public static function me_data(int $id): array {
    $u = q('SELECT u.id, u.nome, u.username, u.email, p.cidade_id, p.lat_aprox,
              (SELECT COUNT(*) FROM usuario_interesses WHERE usuario_id=u.id) AS n_int
            FROM usuarios u JOIN perfis p ON p.usuario_id=u.id WHERE u.id=?', [$id])->fetch();
    $u['perfil_completo'] = $u['cidade_id'] && $u['lat_aprox'] !== null && $u['n_int'] >= 3;
    unset($u['cidade_id'], $u['lat_aprox'], $u['n_int']);
    return $u;
  }
  public static function me(): void { out(self::me_data(AuthMiddleware::user())); }
  public static function busca(): void {
    $me = AuthMiddleware::user();
    $f = array_intersect_key($_GET, array_flip(['q', 'interesse', 'raio_km']));
    out(array_slice(RecomendacaoService::listar($me, $f), 0, 60));
  }
}
