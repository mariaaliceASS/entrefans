<?php
/**
 * Localização por proximidade, com proteção contra triangulação:
 *  1. o ponto recebido é encaixado no centro de uma quadrícula de 0,01° (~1 km) ANTES de ser gravado ou enviado a qualquer serviço;
 *  2. a API nunca devolve coordenadas, só a faixa de distância ("a menos de 2 km") e a cidade;
 *  3. ordenação e filtros usam as mesmas faixas.
 * Cidade/UF vêm do OpenStreetMap (Nominatim), gratuito e sem chave. Política de uso: até 1 requisição/s, com cache.
 */
class LocalizacaoService {
  const GRADE = 0.01;
  /** [até km, texto, bônus no score das recomendações] */
  const FAIXAS = [[2, 'a menos de 2 km', 45], [5, 'a 2–5 km', 35], [10, 'a 5–10 km', 25], [25, 'a 10–25 km', 15], [50, 'a 25–50 km', 8], [100, 'a 50–100 km', 4]];
  const RAIOS = [5, 10, 25, 50, 100]; // filtros permitidos em "Explorar"

  public static function encaixar(float $v): float { return round(floor($v / self::GRADE) * self::GRADE + self::GRADE / 2, 3); }

  /** @return array{0: string, 1: int} texto e bônus da faixa (km null = sem localização) */
  public static function faixa(?float $km): array {
    if ($km === null) return ['', 0];
    foreach (self::FAIXAS as [$max, $txt, $bonus]) if ($km < $max) return [$txt, $bonus];
    return ['a mais de 100 km', 0];
  }

  /** Expressão SQL da distância em km entre (?, ?) e as colunas de perfis (fórmula de Haversine). Usa 3 parâmetros: lat, lat, lng. */
  public static function sqlDistancia(string $alias = 'p'): string {
    return "6371 * 2 * ASIN(SQRT(POW(SIN(RADIANS($alias.lat_aprox - ?) / 2), 2)
            + COS(RADIANS(?)) * COS(RADIANS($alias.lat_aprox)) * POW(SIN(RADIANS($alias.lng_aprox - ?) / 2), 2)))";
  }

  private static function nominatim(string $rota, array $params): array {
    $url = "https://nominatim.openstreetmap.org/$rota?" . http_build_query($params + ['format' => 'jsonv2', 'addressdetails' => 1]);
    $file = sys_get_temp_dir() . '/entrefans_geo_' . md5($url) . '.json';
    if (is_file($file) && filemtime($file) > time() - 30 * 86400) return json_decode((string)file_get_contents($file), true) ?: [];
    $c = curl_init($url);
    curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10, CURLOPT_CONNECTTIMEOUT => 5,
      CURLOPT_USERAGENT => 'EntreFans/1.0', CURLOPT_HTTPHEADER => ['Accept-Language: pt-BR', 'Accept: application/json']]);
    $body = curl_exec($c); $code = curl_getinfo($c, CURLINFO_HTTP_CODE); curl_close($c);
    if ($body === false || $code >= 400) fail('Não foi possível consultar o mapa agora. Tente de novo em instantes.', 502);
    @file_put_contents($file, $body);
    return json_decode($body, true) ?: [];
  }

  private static function cidadeDoEndereco(array $a): ?array {
    $nome = $a['city'] ?? $a['town'] ?? $a['municipality'] ?? $a['village'] ?? null;
    $iso = $a['ISO3166-2-lvl4'] ?? '';
    if (!$nome || ($a['country_code'] ?? '') !== 'br' || !str_starts_with($iso, 'BR-')) return null;
    return [$nome, substr($iso, 3, 2)];
  }

  /** Busca cidades brasileiras pelo nome (para quem não quer/não pode usar a localização do aparelho). */
  public static function buscarCidades(string $q): array {
    $out = []; $vistos = [];
    foreach (self::nominatim('search', ['q' => $q, 'countrycodes' => 'br', 'featureType' => 'city', 'limit' => 8]) as $r) {
      $c = self::cidadeDoEndereco($r['address'] ?? []); if (!$c) continue;
      $k = "$c[0]|$c[1]"; if (isset($vistos[$k])) continue; $vistos[$k] = true;
      $out[] = ['nome' => $c[0], 'uf' => $c[1], 'lat' => round((float)$r['lat'], 4), 'lng' => round((float)$r['lon'], 4)];
    }
    return $out;
  }

  /** Cidade em que fica o ponto (já encaixado). Cria a cidade no banco se for nova, com o centro dela. */
  public static function cidadeDoPonto(float $lat, float $lng): int {
    $r = self::nominatim('reverse', ['lat' => $lat, 'lon' => $lng, 'zoom' => 10]);
    $c = self::cidadeDoEndereco($r['address'] ?? []);
    if (!$c) fail('Não identificamos uma cidade brasileira nessa localização. Por enquanto o EntreFans funciona só no Brasil.');
    [$nome, $uf] = $c;
    $id = q('SELECT id FROM cidades WHERE nome=? AND uf=?', [$nome, $uf])->fetchColumn();
    if ($id) return (int)$id;
    $centro = null;
    foreach (self::buscarCidades("$nome, $uf") as $cand) if ($cand['nome'] === $nome && $cand['uf'] === $uf) { $centro = $cand; break; }
    q('INSERT IGNORE INTO cidades (nome, uf, lat, lng) VALUES (?,?,?,?)', [$nome, $uf, $centro['lat'] ?? $lat, $centro['lng'] ?? $lng]);
    return (int)q('SELECT id FROM cidades WHERE nome=? AND uf=?', [$nome, $uf])->fetchColumn();
  }

  /** Grava a localização aproximada do usuário. origem: aparelho (GPS/Wi-Fi) | cidade (centro da cidade). */
  public static function salvar(int $usuario, ?float $lat, ?float $lng, string $origem): void {
    if (!in_array($origem, ['aparelho', 'cidade'], true)) fail('Origem da localização inválida.');
    if ($lat === null || $lng === null) {
      // "Usar só o centro da minha cidade": sem coordenadas novas, usa o centro da cidade atual
      if ($origem !== 'cidade') fail('Localização não recebida.');
      $c = q('SELECT c.lat, c.lng FROM perfis p JOIN cidades c ON c.id=p.cidade_id WHERE p.usuario_id=?', [$usuario])->fetch();
      if (!$c || $c['lat'] === null) fail('Escolha sua cidade primeiro.');
      [$lat, $lng] = [(float)$c['lat'], (float)$c['lng']];
    }
    if ($lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) fail('Coordenadas inválidas.');
    $la = self::encaixar($lat); $ln = self::encaixar($lng); // o ponto exato é descartado aqui
    $cidade = self::cidadeDoPonto($la, $ln);
    q('UPDATE perfis SET lat_aprox=?, lng_aprox=?, cidade_id=?, localizacao_origem=? WHERE usuario_id=?', [$la, $ln, $cidade, $origem, $usuario]);
  }
}
