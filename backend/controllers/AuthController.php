<?php
class AuthController {
  const MINUTOS_TOKEN = 60; // validade do link de recuperação de senha

  /** Cadastro de usuário (validação no back-end, mesmo que o front já valide). */
  public static function register(): void {
    $d = body();
    $nome = str($d, 'nome', 80); $user = strtolower(str($d, 'username', 30)); $email = strtolower(str($d, 'email', 150));
    $senha = (string)($d['senha'] ?? '');
    if (!$nome || !$user || !$email || !$senha) fail('Preencha todos os campos.');
    if (mb_strlen($nome) < 2) fail('Nome muito curto.');
    if (!preg_match('/^[a-z0-9_.]{3,30}$/', $user)) fail('Usuário: 3 a 30 caracteres (letras, números, _ e .).');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) fail('E-mail inválido.');
    self::validarSenha($senha, $d['confirmar_senha'] ?? null);
    if (($d['aceite_termos'] ?? false) !== true) fail('É preciso aceitar os Termos de Uso e a Política de Privacidade.');
    if (q('SELECT 1 FROM usuarios WHERE email=?', [$email])->fetch()) fail('E-mail já cadastrado.', 409);
    if (q('SELECT 1 FROM usuarios WHERE username=?', [$user])->fetch()) fail('Nome de usuário já em uso.', 409);

    q('INSERT INTO usuarios (nome, username, email, senha_hash, termos_aceitos_em) VALUES (?,?,?,?, NOW())',
      [$nome, $user, $email, password_hash($senha, PASSWORD_DEFAULT)]);
    $id = (int)db()->lastInsertId();
    q('INSERT INTO perfis (usuario_id) VALUES (?)', [$id]);
    session_regenerate_id(true); $_SESSION['uid'] = $id;
    LogService::acao('cadastro', ['id' => $id, 'username' => $user]);
    out(UsuarioController::me_data($id), 201);
  }

  public static function login(): void {
    $d = body(); $l = strtolower(str($d, 'login'));
    if (!$l || empty($d['senha'])) fail('Informe o login e a senha.');
    $u = q('SELECT id, senha_hash FROM usuarios WHERE email=? OR username=?', [$l, $l])->fetch();
    if (!$u || !password_verify((string)$d['senha'], $u['senha_hash'])) {
      LogService::acao('login_falhou', ['login' => $l]);
      fail('Credenciais incorretas.', 401);
    }
    session_regenerate_id(true); $_SESSION['uid'] = (int)$u['id'];
    LogService::acao('login_ok', ['login' => $l]);
    out(UsuarioController::me_data((int)$u['id']));
  }

  public static function logout(): void {
    LogService::acao('logout');
    $_SESSION = []; session_destroy(); out(['ok' => true]);
  }

  /**
   * Recuperação de senha, passo 1: gera um token aleatório, guarda só o HASH dele no banco (válido por 1h)
   * e envia por e-mail o link com o token. A resposta é sempre a mesma, exista ou não o e-mail
   * (assim ninguém descobre quais e-mails estão cadastrados).
   */
  public static function esqueciSenha(): void {
    $email = strtolower(str(body(), 'email', 150));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) fail('Informe um e-mail válido.');
    $u = q('SELECT id, nome FROM usuarios WHERE email=?', [$email])->fetch();
    if ($u) {
      $token = bin2hex(random_bytes(32));
      q('UPDATE usuarios SET reset_token_hash=?, reset_expira_em = NOW() + INTERVAL ' . self::MINUTOS_TOKEN . ' MINUTE WHERE id=?',
        [hash('sha256', $token), $u['id']]);
      $link = rtrim(cfg()['app_url'], '/') . '/redefinir-senha?token=' . $token;
      $html = MailService::modelo('Recuperação de senha', '<p>Olá, ' . htmlspecialchars($u['nome']) . '!</p>'
        . '<p>Recebemos um pedido para redefinir a sua senha. Clique no link abaixo (válido por ' . self::MINUTOS_TOKEN . ' minutos):</p>'
        . '<p><a href="' . htmlspecialchars($link) . '">' . htmlspecialchars($link) . '</a></p>'
        . '<p>Se não foi você, ignore este e-mail: sua senha continua a mesma.</p>');
      MailService::enviar($email, 'EntreFans - recuperação de senha', $html);
      LogService::acao('recuperacao_senha_pedida', ['usuario' => (int)$u['id']]);
    } else {
      LogService::acao('recuperacao_senha_email_inexistente');
    }
    out(['mensagem' => 'Se o e-mail estiver cadastrado, você vai receber um link para criar uma nova senha.']);
  }

  /** Recuperação de senha, passo 2: confere o token (hash + validade) e grava a nova senha. O token só funciona uma vez. */
  public static function redefinirSenha(): void {
    $d = body(); $token = (string)($d['token'] ?? ''); $senha = (string)($d['senha'] ?? '');
    if (!preg_match('/^[a-f0-9]{64}$/', $token)) fail('Link inválido. Peça uma nova recuperação de senha.');
    self::validarSenha($senha, $d['confirmar_senha'] ?? null);
    $id = q('SELECT id FROM usuarios WHERE reset_token_hash=? AND reset_expira_em > NOW()', [hash('sha256', $token)])->fetchColumn();
    if (!$id) fail('Link inválido ou expirado. Peça uma nova recuperação de senha.');
    q('UPDATE usuarios SET senha_hash=?, reset_token_hash=NULL, reset_expira_em=NULL WHERE id=?', [password_hash($senha, PASSWORD_DEFAULT), $id]);
    LogService::acao('senha_redefinida', ['usuario' => (int)$id]);
    out(['mensagem' => 'Senha alterada! Já pode entrar com a nova senha.']);
  }

  private static function validarSenha(string $senha, $confirmar): void {
    if (strlen($senha) < 8) fail('A senha deve ter ao menos 8 caracteres.');
    if (strlen($senha) > 72) fail('A senha deve ter no máximo 72 caracteres.');
    if (!preg_match('/[A-Za-z]/', $senha) || !preg_match('/\d/', $senha)) fail('A senha precisa ter letras e números.');
    if ($senha !== $confirmar) fail('As senhas não conferem.');
  }
}
