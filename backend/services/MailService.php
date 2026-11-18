<?php
/**
 * Envio de e-mail com a função mail() nativa do PHP (sem bibliotecas).
 * Na hospedagem (ex.: Locaweb) o mail() já vem configurado. No XAMPP ele normalmente NÃO envia:
 * nesse caso o e-mail é gravado em backend/logs/emails.log para dar para conferir o conteúdo.
 */
class MailService {
  public static function enviar(string $para, string $assunto, string $html, ?string $responderPara = null): bool {
    $c = cfg();
    $headers = [
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      'From: EntreFans <' . $c['email_remetente'] . '>',
      'X-Mailer: PHP/' . phpversion(),
    ];
    if ($responderPara) $headers[] = 'Reply-To: ' . $responderPara;
    // Assunto com acento precisa ser codificado (RFC 2047)
    $assuntoCod = '=?UTF-8?B?' . base64_encode($assunto) . '?=';

    $ok = @mail($para, $assuntoCod, $html, implode("\r\n", $headers));
    LogService::acao($ok ? 'email_enviado' : 'email_falhou', ['para' => $para, 'assunto' => $assunto]);
    if (!$ok) {
      $dir = dirname(__DIR__) . '/logs';
      if (!is_dir($dir)) @mkdir($dir, 0775, true);
      @file_put_contents("$dir/emails.log", "==== " . date('Y-m-d H:i:s') . " | Para: $para | Assunto: $assunto\n" . strip_tags(str_replace(['<br>', '</p>'], "\n", $html)) . "\n\n", FILE_APPEND | LOCK_EX);
    }
    return $ok;
  }

  /** Molde simples de e-mail em HTML. $corpo já deve estar escapado. */
  public static function modelo(string $titulo, string $corpo): string {
    return '<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:2px solid #b14cff;padding:24px">'
      . '<h2 style="color:#4b1a8f;margin-top:0">' . htmlspecialchars($titulo) . '</h2>' . $corpo
      . '<p style="color:#888;font-size:12px;margin-top:24px">EntreFans — encontre fãs perto de você.</p></div>';
  }
}
