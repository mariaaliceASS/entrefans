<?php
/** Fale conosco: valida, grava a mensagem na tabela "contatos" e envia por e-mail com mail(). */
class ContatoController {
  const ASSUNTOS = ['duvida' => 'Dúvida', 'sugestao' => 'Sugestão', 'problema' => 'Problema técnico', 'denuncia' => 'Denúncia', 'privacidade' => 'Privacidade / LGPD', 'outro' => 'Outro'];

  public static function enviar(): void {
    $d = body();
    $nome = str($d, 'nome', 80); $email = strtolower(str($d, 'email', 150)); $assunto = (string)($d['assunto'] ?? ''); $msg = str($d, 'mensagem', 2000);
    if (mb_strlen($nome) < 2) fail('Informe seu nome.');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) fail('E-mail inválido.');
    if (!isset(self::ASSUNTOS[$assunto])) fail('Escolha um assunto.');
    if (mb_strlen($msg) < 10) fail('A mensagem deve ter ao menos 10 caracteres.');
    // Anti-spam simples: 1 mensagem a cada 30 segundos por sessão
    if (time() - ($_SESSION['ultimo_contato'] ?? 0) < 30) fail('Aguarde alguns segundos antes de enviar outra mensagem.', 429);
    $_SESSION['ultimo_contato'] = time();

    $uid = AuthMiddleware::opcional();
    q('INSERT INTO contatos (usuario_id, nome, email, assunto, mensagem) VALUES (?,?,?,?,?)', [$uid, $nome, $email, $assunto, $msg]);
    $id = (int)db()->lastInsertId();

    $html = MailService::modelo('Nova mensagem do Fale conosco', '<p><b>Nome:</b> ' . htmlspecialchars($nome) . '<br><b>E-mail:</b> ' . htmlspecialchars($email)
      . '<br><b>Assunto:</b> ' . self::ASSUNTOS[$assunto] . '</p><p>' . nl2br(htmlspecialchars($msg)) . '</p>');
    $enviado = MailService::enviar(cfg()['email_contato'], 'EntreFans - ' . self::ASSUNTOS[$assunto] . " (#$id)", $html, $email);
    q('UPDATE contatos SET email_enviado=? WHERE id=?', [(int)$enviado, $id]);
    LogService::acao('contato_recebido', ['id' => $id, 'assunto' => $assunto]);
    out(['mensagem' => 'Mensagem enviada! Responderemos no seu e-mail.'], 201);
  }
}
