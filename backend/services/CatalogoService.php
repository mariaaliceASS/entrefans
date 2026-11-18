<?php
/**
 * Busca itens de um tema (grupos, séries, animes, jogos, livros...) em APIs públicas gratuitas, sem chave:
 *   musica  -> iTunes Search (artistas)      filmes  -> Wikidata (títulos em português)
 *   series  -> TVMaze                         doramas -> TVMaze (só produções asiáticas)
 *   anime   -> AniList (GraphQL)              manga   -> AniList (GraphQL)
 *   games   -> Steam Store                    livros  -> Open Library
 * Resultados ficam em cache por 1 dia. Se a API falhar, devolve lista vazia (o usuário ainda pode adicionar à mão).
 */
class CatalogoService {
  const FONTES = ['musica', 'filmes', 'series', 'doramas', 'anime', 'manga', 'games', 'livros'];

  /** @return array<int, array{nome: string, detalhe: string}> */
  public static function buscar(string $fonte, string $q): array {
    if (!in_array($fonte, self::FONTES, true)) return [];
    $file = sys_get_temp_dir() . '/entrefans_cat_' . md5("$fonte|" . mb_strtolower($q)) . '.json';
    if (is_file($file) && filemtime($file) > time() - 86400) return json_decode((string)file_get_contents($file), true) ?: [];
    try { $r = self::$fonte($q); } catch (Throwable $e) { error_log("CatalogoService($fonte): " . $e->getMessage()); return []; }
    // Remove nomes repetidos e corta no tamanho da coluna
    $vistos = []; $out = [];
    foreach ($r as $item) {
      $nome = mb_substr(trim($item['nome']), 0, 60); $k = mb_strtolower($nome);
      if ($nome === '' || isset($vistos[$k])) continue;
      $vistos[$k] = true; $out[] = ['nome' => $nome, 'detalhe' => trim($item['detalhe'] ?? '')];
      if (count($out) >= 10) break;
    }
    @file_put_contents($file, json_encode($out, JSON_UNESCAPED_UNICODE));
    return $out;
  }

  private static function http(string $url, ?array $jsonPost = null): array {
    $c = curl_init($url);
    $opts = [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8, CURLOPT_CONNECTTIMEOUT => 5, CURLOPT_FOLLOWLOCATION => true,
             CURLOPT_USERAGENT => 'EntreFans/1.0', CURLOPT_HTTPHEADER => ['Accept: application/json']];
    if ($jsonPost !== null) {
      $opts[CURLOPT_POST] = true; $opts[CURLOPT_POSTFIELDS] = json_encode($jsonPost);
      $opts[CURLOPT_HTTPHEADER][] = 'Content-Type: application/json';
    }
    curl_setopt_array($c, $opts);
    $body = curl_exec($c); $code = curl_getinfo($c, CURLINFO_HTTP_CODE); $err = curl_error($c); curl_close($c);
    if ($body === false || $code >= 400) throw new RuntimeException("HTTP $code $err");
    return json_decode($body, true) ?: [];
  }
  private static function ano(?string $data): string { return $data ? substr($data, 0, 4) : ''; }
  private static function juntar(string ...$p): string { return implode(' · ', array_filter($p)); }

  private static function musica(string $q): array {
    $d = self::http('https://itunes.apple.com/search?' . http_build_query(['term' => $q, 'entity' => 'musicArtist', 'limit' => 15, 'country' => 'BR']));
    return array_map(fn($a) => ['nome' => $a['artistName'], 'detalhe' => $a['primaryGenreName'] ?? ''], $d['results'] ?? []);
  }
  private static function filmes(string $q): array {
    $d = self::http('https://www.wikidata.org/w/api.php?' . http_build_query(['action' => 'wbsearchentities', 'search' => $q, 'language' => 'pt',
      'uselang' => 'pt', 'type' => 'item', 'limit' => 30, 'format' => 'json']));
    $out = [];
    foreach ($d['search'] ?? [] as $s) {
      $desc = $s['description'] ?? '';
      if (preg_match('/\b(filme|film|franquia|franchise|saga|trilogia|trilogy)\b/i', $desc)) $out[] = ['nome' => $s['label'], 'detalhe' => $desc];
    }
    return $out;
  }
  private static function tvmaze(string $q, bool $asiaticas): array {
    $d = self::http('https://api.tvmaze.com/search/shows?' . http_build_query(['q' => $q]));
    $asia = ['Korean', 'Japanese', 'Chinese', 'Thai', 'Taiwanese'];
    $out = [];
    foreach ($d as $r) {
      $s = $r['show'];
      if ($asiaticas && !in_array($s['language'] ?? '', $asia, true)) continue;
      $canal = $s['network']['name'] ?? $s['webChannel']['name'] ?? '';
      $out[] = ['nome' => $s['name'], 'detalhe' => self::juntar(self::ano($s['premiered'] ?? null), $canal)];
    }
    return $out;
  }
  private static function series(string $q): array { return self::tvmaze($q, false); }
  private static function doramas(string $q): array { return self::tvmaze($q, true); }

  private static function anilist(string $q, string $tipo): array {
    $gql = 'query($s:String,$t:MediaType){Page(perPage:20){media(search:$s,type:$t,isAdult:false,sort:SEARCH_MATCH){title{romaji english} startDate{year} format}}}';
    $d = self::http('https://graphql.anilist.co', ['query' => $gql, 'variables' => ['s' => $q, 't' => $tipo]]);
    $out = [];
    foreach ($d['data']['Page']['media'] ?? [] as $m) {
      $nome = $m['title']['english'] ?: $m['title']['romaji'];
      // Ignora temporadas/partes extras para listar só a obra principal
      if (preg_match('/(season|part|cour)\s*\d|\d+(st|nd|rd|th)\s+season|temporada/i', $nome . ' ' . $m['title']['romaji'])) continue;
      $out[] = ['nome' => $nome, 'detalhe' => self::juntar((string)($m['startDate']['year'] ?? ''), $m['format'] ?? '')];
    }
    return $out;
  }
  private static function anime(string $q): array { return self::anilist($q, 'ANIME'); }
  private static function manga(string $q): array { return self::anilist($q, 'MANGA'); }

  private static function games(string $q): array {
    $d = self::http('https://store.steampowered.com/api/storesearch/?' . http_build_query(['term' => $q, 'l' => 'portuguese', 'cc' => 'BR']));
    $jogos = array_filter($d['items'] ?? [], fn($g) => !preg_match('/soundtrack|\bOST\b|\bDLC\b|demo$|artbook|season pass|expansion pack/i', $g['name']));
    return array_map(fn($g) => ['nome' => $g['name'], 'detalhe' => 'Steam'], $jogos);
  }
  private static function livros(string $q): array {
    $d = self::http('https://openlibrary.org/search.json?' . http_build_query(['q' => $q, 'limit' => 15, 'fields' => 'title,author_name,first_publish_year']));
    return array_map(fn($b) => ['nome' => $b['title'], 'detalhe' => self::juntar($b['author_name'][0] ?? '', (string)($b['first_publish_year'] ?? ''))], $d['docs'] ?? []);
  }
}
