import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Seo from '../components/Seo'

const ATUALIZADO = '18/11/2026'

/** Termos de Uso, Política de Privacidade (LGPD) e Política de Plágio e Direitos Autorais. */
export default function Termos() {
  const { hash } = useLocation()
  // Rola até a seção pedida (/termos#privacidade, /termos#plagio)
  useEffect(() => { if (hash) document.getElementById(hash.slice(1))?.scrollIntoView() }, [hash])
  const h2 = 'scroll-mt-24'
  return (
    <article className="space-y-5">
      <Seo titulo="Termos de uso, privacidade e plágio" descricao="Termos de uso do EntreFans, política de privacidade conforme a LGPD e política de plágio e direitos autorais." />
      <div>
        <h1 className="y2k-titulo">Termos e políticas</h1>
        <p className="text-sm text-on-surface-variant">Última atualização: {ATUALIZADO}. Ao criar uma conta você declara que leu e concorda com tudo abaixo.</p>
        <nav className="mt-3 flex flex-wrap gap-2 text-xs">
          <a href="#termos" className="btn-ghost">Termos de uso</a><a href="#privacidade" className="btn-ghost">Privacidade (LGPD)</a><a href="#plagio" className="btn-ghost">Plágio e direitos autorais</a>
        </nav>
      </div>

      <section id="termos" className={`card space-y-3 text-sm leading-relaxed ${h2}`}>
        <h2>1. Termos de uso</h2>
        <p><b>1.1 O serviço.</b> O EntreFans é uma rede para fãs encontrarem pessoas com os mesmos interesses (fandoms) perto de onde vivem e combinarem “rolês” (encontros presenciais ou online).</p>
        <p><b>1.2 Idade mínima.</b> É preciso ter 13 anos ou mais. Menores de 18 anos devem usar o serviço com o conhecimento dos responsáveis e nunca ir a encontros presenciais sozinhos.</p>
        <p><b>1.3 Conta.</b> Você é responsável pela sua senha e por tudo que for feito com a sua conta. Use dados verdadeiros e não crie contas em nome de outras pessoas.</p>
        <p><b>1.4 Conduta.</b> É proibido: assédio, discurso de ódio, ameaças, conteúdo sexual, spam, golpes, venda de produtos, divulgação de dados pessoais de terceiros e publicar endereço ou horário exato em rolês. Encontros devem acontecer em locais públicos.</p>
        <p><b>1.5 Moderação.</b> Podemos remover conteúdo e suspender contas que violem estes termos. Denúncias podem ser feitas pelo <Link to="/contato" className="text-[var(--y2k)] underline">Fale conosco</Link>.</p>
        <p><b>1.6 Responsabilidade.</b> O EntreFans aproxima pessoas, mas não organiza nem fiscaliza os encontros. Cada participante é responsável pela própria segurança.</p>
        <p><b>1.7 Alterações.</b> Estes termos podem mudar; avisaremos na plataforma quando houver mudanças importantes.</p>
      </section>

      <section id="privacidade" className={`card space-y-3 text-sm leading-relaxed ${h2}`}>
        <h2>2. Política de privacidade (LGPD — Lei 13.709/2018)</h2>
        <p><b>2.1 Dados coletados.</b> Nome, nome de usuário, e-mail, senha (guardada apenas como hash irreversível), foto de perfil (opcional), bio, interesses, redes sociais (opcional), seguidores, rolês criados e topados, mensagens do Fale conosco e registros de acesso (data, hora, endereço IP e ação realizada).</p>
        <p><b>2.2 Localização.</b> Guardamos só uma <b>área aproximada de cerca de 1 km</b> e a cidade; o ponto exato é descartado antes de ser gravado. Outras pessoas veem apenas a cidade e a distância em faixas (“a menos de 2 km”). A localização só muda quando você atualiza.</p>
        <p><b>2.3 Finalidade e base legal.</b> Os dados são usados para criar sua conta, recomendar fãs com interesses em comum, mostrar rolês próximos, responder contatos e manter a segurança do sistema (art. 7º, V e IX da LGPD — execução do contrato e legítimo interesse) e, para a localização, com o seu consentimento (art. 7º, I).</p>
        <p><b>2.4 Compartilhamento.</b> Não vendemos dados. Usamos serviços externos apenas para funções específicas: OpenStreetMap/Nominatim (identificar a cidade a partir da área aproximada), APIs públicas de catálogos (buscar nomes de bandas, séries, jogos) e Google Gemini (sugerir uma bio a partir dos seus interesses, só quando você pede). Seu e-mail e senha nunca são enviados a esses serviços.</p>
        <p><b>2.5 Quem vê o quê.</b> Visitantes sem login veem só os fandoms, o mural de rolês com o primeiro nome e a cidade de quem criou. Suas redes sociais aparecem conforme a visibilidade que você escolher (só conexões, todos ou ninguém).</p>
        <p><b>2.6 Seus direitos (art. 18).</b> Você pode pedir confirmação, acesso, correção, portabilidade e exclusão dos seus dados e revogar o consentimento a qualquer momento pelo <Link to="/contato" className="text-[var(--y2k)] underline">Fale conosco</Link> (assunto “Privacidade / LGPD”). Respondemos em até 15 dias.</p>
        <p><b>2.7 Cookies.</b> Usamos apenas um cookie de sessão, essencial para manter você logado. Não usamos cookies de propaganda.</p>
        <p><b>2.8 Segurança e retenção.</b> Senhas com hash, consultas protegidas contra SQL injection, upload de imagens verificado e logs protegidos. Os dados ficam guardados enquanto a conta existir; os logs de acesso, por até 6 meses (Marco Civil da Internet, art. 15).</p>
      </section>

      <section id="plagio" className={`card space-y-3 text-sm leading-relaxed ${h2}`}>
        <h2>3. Política de plágio e direitos autorais</h2>
        <p><b>3.1 Autoria.</b> O código-fonte, o design, os textos e a marca EntreFans são obra original de {import.meta.env.VITE_AUTOR}, protegidos pela Lei de Direitos Autorais (Lei 9.610/1998) e pela Lei do Software (Lei 9.609/1998). É proibido copiar, reproduzir ou apresentar este trabalho, no todo ou em parte, como se fosse de outra pessoa.</p>
        <p><b>3.2 Conteúdo dos usuários.</b> Ao publicar bio, foto ou rolê, você declara que o conteúdo é seu ou que tem direito de usá-lo. Não publique fotos, textos ou artes de outras pessoas sem autorização e sem dar o crédito.</p>
        <p><b>3.3 Marcas e obras citadas.</b> Nomes de bandas, séries, animes, jogos e livros pertencem aos seus donos e aparecem apenas para identificar interesses dos fãs, sem qualquer vínculo ou patrocínio.</p>
        <p><b>3.4 Créditos.</b> Dados de catálogo: iTunes Search, TVMaze, Wikidata, AniList, Steam e Open Library. Mapas: © colaboradores do OpenStreetMap. Ícones: Material Symbols (Google, licença Apache 2.0).</p>
        <p><b>3.5 Denúncias.</b> Encontrou plágio ou uso indevido de conteúdo? Envie pelo <Link to="/contato" className="text-[var(--y2k)] underline">Fale conosco</Link> (assunto “Denúncia”) com o link do conteúdo; ele será analisado e removido se a denúncia for confirmada.</p>
      </section>
    </article>
  )
}
