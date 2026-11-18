<?php
/**
 * Consumo de LLM: Google Gemini (API REST, plano gratuito), chamado com cURL.
 * Documentação: https://ai.google.dev/api/generate-content
 * A chave fica em config/config.php (gemini_key) e nunca é enviada ao navegador.
 */
class IaService {
  public static function gerar(string $prompt, int $maxTokens = 200): string {
    $c = cfg();
    if (!$c['gemini_key']) fail('O recurso de IA não está configurado (falta a chave do Gemini em config/config.php).', 503);

    $url = 'https://generativelanguage.googleapis.com/v1beta/models/' . rawurlencode($c['gemini_model']) . ':generateContent';
    $payload = [
      'contents' => [['parts' => [['text' => $prompt]]]],
      'generationConfig' => ['temperature' => 0.9, 'maxOutputTokens' => $maxTokens],
    ];
    $ch = curl_init($url);
    curl_setopt_array($ch, [
      CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true, CURLOPT_TIMEOUT => 20, CURLOPT_CONNECTTIMEOUT => 5,
      CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'x-goog-api-key: ' . $c['gemini_key']],
      CURLOPT_POSTFIELDS => json_encode($payload),
    ]);
    $resp = curl_exec($ch); $code = curl_getinfo($ch, CURLINFO_HTTP_CODE); $err = curl_error($ch); curl_close($ch);

    $d = json_decode((string)$resp, true);
    $texto = trim((string)($d['candidates'][0]['content']['parts'][0]['text'] ?? ''));
    LogService::acao('ia_chamada', ['modelo' => $c['gemini_model'], 'status' => $code, 'ok' => $texto !== '']);
    if ($resp === false || $code >= 400 || $texto === '') {
      LogService::acao('ia_erro', ['status' => $code, 'erro' => $err ?: mb_substr((string)($d['error']['message'] ?? ''), 0, 200)]);
      fail('A IA não respondeu agora. Tente de novo em instantes.', 502);
    }
    return $texto;
  }
}
