<?php
/**
 * Envio de e-mail via SMTP do Gmail usando a biblioteca PHPMailer (instalada com o Composer em backend/vendor).
 * Os dados da conta (e-mail e senha de app do Google) ficam em backend/config/email.php, que NÃO vai para o git.
 * Se o PHPMailer não estiver instalado, faltar a configuração ou o envio falhar, o e-mail é gravado em
 * backend/logs/emails.log para dar para conferir o conteúdo (e o link de recuperação de senha).
 */
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

$autoload = dirname(__DIR__) . '/vendor/autoload.php';
if (is_file($autoload)) require_once $autoload;

class MailService {
  /** Lê backend/config/email.php (ou null se o arquivo não existir). */
  private static function config(): ?array {
    $arq = dirname(__DIR__) . '/config/email.php';
    return is_file($arq) ? require $arq : null;
  }

  public static function enviar(string $para, string $assunto, string $html, ?string $responderPara = null): bool {
    $c = self::config();
    $erro = null;

    if (!class_exists(PHPMailer::class)) {
      $erro = 'PHPMailer não instalado (rode "composer install" na pasta backend)';
    } elseif (!$c || empty($c['usuario']) || empty($c['senha_app'])) {
      $erro = 'Configuração de e-mail ausente (copie config/email.exemplo.php para config/email.php)';
    } else {
      $mail = new PHPMailer(true); // true = lança exceção em caso de erro
      try {
        // Servidor SMTP (dados especificados pelo Google)
        $mail->isSMTP();
        $mail->Host       = $c['host'] ?? 'smtp.gmail.com';
        $mail->Port       = (int)($c['porta'] ?? 587);
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // 'tls'
        $mail->SMTPAuth   = true;
        $mail->Username   = $c['usuario'];
        $mail->Password   = $c['senha_app'];
        $mail->CharSet    = PHPMailer::CHARSET_UTF8; // acentos no assunto e no corpo
        $mail->Timeout    = 15;

        // Remetente (o Gmail só aceita a própria conta como remetente) e destinatário
        $mail->setFrom($c['usuario'], $c['nome_remetente'] ?? 'EntreFans');
        $mail->addAddress($para);
        if ($responderPara) $mail->addReplyTo($responderPara);

        // Conteúdo
        $mail->isHTML(true);
        $mail->Subject = $assunto;
        $mail->Body    = $html;
        $mail->AltBody = self::textoPuro($html); // para clientes que não mostram HTML

        $mail->send();
      } catch (PHPMailerException $e) {
        $erro = $mail->ErrorInfo ?: $e->getMessage();
      }
    }

    $ok = $erro === null;
    LogService::acao($ok ? 'email_enviado' : 'email_falhou', ['para' => $para, 'assunto' => $assunto] + ($ok ? [] : ['erro' => $erro]));
    if (!$ok) {
      $dir = dirname(__DIR__) . '/logs';
      if (!is_dir($dir)) @mkdir($dir, 0775, true);
      @file_put_contents("$dir/emails.log", "==== " . date('Y-m-d H:i:s') . " | Para: $para | Assunto: $assunto | Erro: $erro\n"
        . self::textoPuro($html) . "\n\n", FILE_APPEND | LOCK_EX);
    }
    return $ok;
  }

  private static function textoPuro(string $html): string {
    return html_entity_decode(strip_tags(str_replace(['<br>', '</p>', '</h2>'], "\n", $html)), ENT_QUOTES, 'UTF-8');
  }

  /** Molde simples de e-mail em HTML. $corpo já deve estar escapado. */
  public static function modelo(string $titulo, string $corpo): string {
    return '<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:2px solid #b14cff;padding:24px">'
      . '<h2 style="color:#4b1a8f;margin-top:0">' . htmlspecialchars($titulo) . '</h2>' . $corpo
      . '<p style="color:#888;font-size:12px;margin-top:24px">EntreFans — encontre fãs perto de você.</p></div>';
  }
}
