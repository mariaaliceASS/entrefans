<?php
class PerfilController {
  public static function me(): void { out(self::data(AuthMiddleware::user())); }
  public static function data(int $id): array {
    $p = q('SELECT u.id, u.nome, u.username, p.bio, p.foto, c.nome AS cidade, c.uf, p.localizacao_origem, p.redes_visibilidade
            FROM usuarios u JOIN perfis p ON p.usuario_id=u.id LEFT JOIN cidades c ON c.id=p.cidade_id
            WHERE u.id=?', [$id])->fetch();
    // Nem o próprio usuário recebe as coordenadas: só a cidade e de onde veio a localização
    $p['tem_localizacao'] = $p['localizacao_origem'] !== null;
    $p['interesses'] = array_map([InteresseController::class, 'linha'], q('SELECT i.id, i.nome, c.nome AS categoria, i.pai_id FROM usuario_interesses ui
        JOIN interesses i ON i.id=ui.interesse_id JOIN categorias c ON c.id=i.categoria_id WHERE ui.usuario_id=? ORDER BY i.pai_id IS NOT NULL, i.nome', [$id])->fetchAll());
    $p['redes'] = (object)RedesService::listar($id);
    return $p;
  }
  public static function update(): void {
    $id = AuthMiddleware::user(); $d = body();
    $nome = str($d, 'nome', 80); $bio = str($d, 'bio', 140);
    if (!$nome) fail('Informe o nome de exibição.');
    $ints = array_values(array_unique(array_map('intval', (array)($d['interesses'] ?? []))));
    $vis = $d['redes_visibilidade'] ?? null;
    if ($vis !== null && !in_array($vis, RedesService::VISIBILIDADES, true)) fail('Visibilidade das redes inválida.');
    if (isset($d['redes'])) foreach ((array)$d['redes'] as $rede => $v) {   // valida antes de gravar qualquer coisa
      if (!isset(RedesService::REDES[$rede])) fail('Rede social não suportada.');
      if (trim((string)$v) !== '') RedesService::normalizar($rede, (string)$v);
    }
    $pdo = db(); $pdo->beginTransaction();
    // Redes só mudam quando enviadas (o onboarding, por exemplo, não envia)
    if (isset($d['redes'])) RedesService::salvar($id, (array)$d['redes']);
    if ($vis !== null) q('UPDATE perfis SET redes_visibilidade=? WHERE usuario_id=?', [$vis, $id]);
    q('UPDATE usuarios SET nome=? WHERE id=?', [$nome, $id]);
    q('UPDATE perfis SET bio=? WHERE usuario_id=?', [$bio, $id]); // localização tem rota própria: POST /perfis/me/localizacao
    q('DELETE FROM usuario_interesses WHERE usuario_id=?', [$id]);
    foreach ($ints as $i) q('INSERT IGNORE INTO usuario_interesses (usuario_id, interesse_id) SELECT ?, id FROM interesses WHERE id=?', [$id, $i]);
    // Escolher um item (ex.: BTS) inclui automaticamente o tema dele (K-pop)
    q('INSERT IGNORE INTO usuario_interesses (usuario_id, interesse_id)
       SELECT ui.usuario_id, i.pai_id FROM usuario_interesses ui JOIN interesses i ON i.id=ui.interesse_id
       WHERE ui.usuario_id=? AND i.pai_id IS NOT NULL', [$id]);
    $pdo->commit();
    LogService::acao('perfil_atualizado', ['interesses' => count($ints)]);
    out(self::data($id));
  }
  /** Recebe {lat, lng, origem: 'aparelho'|'cidade'} ou só {origem: 'cidade'} (centro da cidade atual). */
  public static function localizacao(): void {
    $id = AuthMiddleware::user(); $d = body();
    $num = fn($k) => isset($d[$k]) && is_numeric($d[$k]) ? (float)$d[$k] : null;
    LocalizacaoService::salvar($id, $num('lat'), $num('lng'), (string)($d['origem'] ?? 'aparelho'));
    LogService::acao('localizacao_atualizada', ['origem' => (string)($d['origem'] ?? 'aparelho')]);
    out(self::data($id));
  }
  public static function cidades(): void {
    AuthMiddleware::user();
    $termo = mb_substr(trim((string)($_GET['q'] ?? '')), 0, 60);
    out(mb_strlen($termo) < 3 ? [] : LocalizacaoService::buscarCidades($termo));
  }
  public static function foto(): void {
    $id = AuthMiddleware::user();
    $f = $_FILES['foto'] ?? null;
    if (!$f || $f['error'] !== UPLOAD_ERR_OK) fail('Envie uma imagem.');
    if ($f['size'] > 5 * 1024 * 1024) fail('A imagem deve ter até 5MB.');
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']);
    $ext = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'][$mime] ?? null;
    if (!$ext || !getimagesize($f['tmp_name'])) fail('Formato inválido (use JPG, PNG ou WEBP).');
    $name = bin2hex(random_bytes(12)) . '.' . $ext;
    if (!move_uploaded_file($f['tmp_name'], dirname(__DIR__) . '/uploads/' . $name)) fail('Falha ao salvar a imagem.', 500);
    // Apaga a foto anterior do disco para não acumular arquivos
    $antiga = q('SELECT foto FROM perfis WHERE usuario_id=?', [$id])->fetchColumn();
    if ($antiga && preg_match('#^/uploads/[a-f0-9]{24}\.(jpg|png|webp)$#', $antiga)) @unlink(dirname(__DIR__) . $antiga);
    q('UPDATE perfis SET foto=? WHERE usuario_id=?', ['/uploads/' . $name, $id]);
    LogService::acao('foto_enviada', ['arquivo' => $name]);
    out(['foto' => '/uploads/' . $name]);
  }
}
