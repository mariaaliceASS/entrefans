# EntreFans — encontre fãs perto de você

Rede para fãs encontrarem pessoas com os mesmos interesses (K-pop, anime, games, séries, RPG, livros) perto de onde vivem
e combinarem **rolês** (encontros presenciais ou online).

- **Aplicação hospedada:** https://SEU-DOMINIO.com.br  ← _preencher_
- **Repositório (público):** https://github.com/SEU-USUARIO/entrefans  ← _preencher_
- **Banco de dados (export):** [`backend/database/entrefans.sql`](backend/database/entrefans.sql)
- **Conta de teste:** login `demo` (ou `demo@entrefans.com`) · senha `demo12345`

**Tecnologias:** React 18 + React Router 6 + TypeScript + Tailwind (front-end, SPA) · PHP 8 puro com PDO (API REST, sem frameworks) · MySQL/MariaDB.

---

## Onde está cada requisito

| Requisito | Onde |
|---|---|
| React + React Router, SPA e AJAX | todo o front-end ([src/App.tsx](src/App.tsx)); as chamadas AJAX passam por [src/services/api.ts](src/services/api.ts) |
| Login (1) | tela `/login` · `POST /api/auth/login` ([AuthController](backend/controllers/AuthController.php)) |
| Recuperação de senha (2) | telas `/esqueci-senha` e `/redefinir-senha?token=…` · token aleatório, só o hash fica no banco, vale 1 h e só uma vez |
| Foto do usuário salva em arquivo (3) | onboarding e Meu Perfil · `POST /api/perfis/me/foto` grava em `backend/uploads/` (tipo real conferido, até 5 MB, nome aleatório) |
| Cadastro de usuário com validação no front e no back | tela `/cadastro` ([Cadastro.tsx](src/pages/Cadastro.tsx) + [validacao.ts](src/services/validacao.ts)) · `AuthController::register` |
| Termos de serviço, privacidade (LGPD) e política de plágio | tela `/termos` (seções `#privacidade` e `#plagio`); aceite obrigatório no cadastro (`usuarios.termos_aceitos_em`) |
| Fale conosco com validação, enviando e-mail via PHP | tela `/contato` · [ContatoController](backend/controllers/ContatoController.php) grava em `contatos` e envia com `mail()` ([MailService](backend/services/MailService.php)) |
| Meta tags de autoria/plágio e Open Graph | [index.html](index.html) (author, copyright, plagiarism, dcterms, og:, twitter:, JSON-LD) + [Seo.tsx](src/components/Seo.tsx) atualiza título/OG em cada tela pública; `robots.txt`, `sitemap.xml`, `llms.txt` em `public/` |
| Detalhe de 1 item, **um único PHP para todos os recursos** | [DetalheController.php](backend/controllers/DetalheController.php): `GET /api/detalhe/{fandom\|role\|usuario}/{id}` · telas `/fandom/:id`, `/role/:id`, `/u/:id` |
| Carrinho (n..n) com botão que leva até ele | **Agenda** (`/agenda`): o botão **“Eu topo!”** de um rolê o adiciona à agenda e abre a tela; “Desistir” remove. Tabela `chamado_participantes` (usuários × rolês) |
| 2 cadastros simples | **usuários** (`/cadastro`) e **mensagens de contato** (`/contato`, tabela `contatos`) |
| 1 cadastro 1..n | **rolês**: um usuário tem vários rolês (`chamados.usuario_id`), tela `/roles` (criar, listar, encerrar) |
| 2 cadastros n..n | **interesses do usuário** (`usuario_interesses`) e **seguidores/conexões** (`seguidores`, usuário × usuário); além da agenda (`chamado_participantes`) |
| 2 listagens públicas | **Fandoms** (`/fandoms`) e **Mural de rolês** (`/mural`), sem login · [PublicoController](backend/controllers/PublicoController.php) |
| Recurso com LLM | **“Sugerir bio com IA”** em Meu Perfil · `POST /api/ia/bio` → Google Gemini ([IaService](backend/services/IaService.php)) |
| Log em arquivo de todas as rotas e ações | [LogService](backend/services/LogService.php): uma linha por requisição + ações (login, cadastro, e-mail, IA, rolês…) em `backend/logs/app-AAAA-MM-DD.log` |
| Arquivo PHP só para conexão com o banco | [backend/config/database.php](backend/config/database.php) |
| Cabeçalho e rodapé reaproveitados | [Header.tsx](src/components/Header.tsx), [PublicLayout.tsx](src/components/PublicLayout.tsx) e [Footer.tsx](src/components/Footer.tsx) (Full React) |

### Banco de dados (11 tabelas)
`usuarios`, `perfis` (1..1 com usuário), `cidades`, `categorias`, `interesses` (categoria 1..n interesses; tema → itens),
`usuario_interesses` (n..n), `seguidores` (n..n), `redes_sociais`, `chamados` (rolês, 1..n), `chamado_participantes` (n..n, agenda) e `contatos`.

---

## Como rodar localmente (XAMPP)

1. Coloque o projeto em `C:\xampp\htdocs\entrefans\entrefans` e ligue o Apache e o MySQL.
2. No phpMyAdmin, crie o banco **`entrefans`** (`utf8mb4_unicode_ci`), selecione-o e **importe** `backend/database/entrefans.sql`.
3. Confira usuário/senha do banco em [`backend/config/database.php`](backend/config/database.php).
4. Na raiz do projeto: `npm install` e `npm run dev` → http://localhost:5173
   (o Vite repassa `/api` e `/uploads` para o Apache; se o seu Apache não estiver em `localhost:8080` ou o caminho for outro, ajuste [vite.config.ts](vite.config.ts)).

### Configurações ([backend/config/config.php](backend/config/config.php))
- **IA:** coloque a chave gratuita do Gemini em `gemini_key` (gere em https://aistudio.google.com/apikey). Sem a chave, o botão avisa que a IA não está configurada.
- **E-mail:** `email_remetente` e `email_contato` (quem recebe o Fale conosco). `app_url` é usado no link de recuperação de senha.
- **No XAMPP o `mail()` normalmente não envia.** Nesse caso o e-mail é gravado em `backend/logs/emails.log` (dá para copiar dali o link de recuperação de senha). Na hospedagem o `mail()` funciona normalmente.

### Autoria nas meta tags
Edite o arquivo [`.env`](.env) (`VITE_AUTOR` e `VITE_SITE_URL`) antes do build: os valores entram nas meta tags de autoria/OG, no rodapé e nos termos.
Troque também `seu-dominio.com.br` em `public/robots.txt` e `public/sitemap.xml`.

## Como ver os logs (demonstração)
Use o sistema (entrar, abrir um rolê, topar, mandar contato…) e abra `backend/logs/app-AAAA-MM-DD.log`:
```
[2026-11-18 15:31:17] ::1 usuario=1 ACAO login_ok {"login":"demo"}
[2026-11-18 15:31:17] ::1 usuario=1 POST /auth/login -> AuthController::login | 200 | 140ms
[2026-11-18 15:31:18] ::1 usuario=1 ACAO role_topei {"id":5}
[2026-11-18 15:31:18] ::1 usuario=1 POST /chamados/5/topo -> ChamadoController::topar | 200 | 9ms
[2026-11-18 15:31:21] ::1 usuario=1 POST /ia/bio -> IaController::bio | 503 | 5ms | O recurso de IA não está configurado…
```
Cada linha traz data/hora, IP, usuário logado, rota, função executada, status HTTP, tempo e a mensagem de erro (se houver). Senhas e tokens nunca são gravados.
A pasta `logs/` é bloqueada para acesso pela web.

## Hospedagem (Apache, ex.: Locaweb)
1. `npm run build` → gera a pasta `dist/`.
2. Envie para a raiz do site (`public_html`): **o conteúdo de `dist/`** (inclui o `.htaccess` que manda `/api` para o PHP e as outras rotas para o React) **e a pasta `backend/`**.
3. Importe `entrefans.sql` no phpMyAdmin da hospedagem e troque os dados de acesso em `backend/config/database.php`.
4. Em `backend/config/config.php`, ajuste `app_url` para o endereço do site, os e-mails e a chave do Gemini.
5. Dê permissão de escrita às pastas `backend/uploads/` e `backend/logs/`.

---

## Funcionalidades
- **Descobrir:** recomendações por interesses em comum + proximidade (score = % de afinidade + bônus por faixa de distância).
- **Explorar:** busca por nome, fandom e distância. **Perfil de outros fãs:** afinidade, interesses e redes sociais (conforme a visibilidade escolhida).
- **Conexões:** seguir; quando as duas pessoas se seguem, viram conexão. Solicitações com aceitar/recusar e aviso no menu.
- **Rolês:** convite ligado a um interesse, presencial (aparece para quem está no raio escolhido) ou online; até 3 abertos por pessoa; somem sozinhos depois da data (ou de 7 dias). Só o autor vê quem topou.
- **Interesses em 2 níveis** (tema › itens), com busca em APIs públicas gratuitas pelo backend: iTunes (música), TVMaze (séries/doramas), Wikidata (filmes), AniList (anime/mangá), Steam (jogos), Open Library (livros).

## Segurança e privacidade
- PDO com prepared statements; senhas com `password_hash`; sessão em cookie HttpOnly + SameSite; header obrigatório contra CSRF.
- Validação de todos os dados no backend, mesmo os já validados no front.
- Upload: tipo real do arquivo (finfo), 5 MB, nome aleatório, PHP desativado em `uploads/`.
- **Localização aproximada:** o ponto é encaixado numa quadrícula de ~1 km antes de ser gravado; a API nunca devolve coordenadas, só a cidade e a faixa de distância (“a menos de 2 km”). Cidade via OpenStreetMap/Nominatim.
- Listagens públicas mostram só o primeiro nome e a cidade de quem criou o rolê.
