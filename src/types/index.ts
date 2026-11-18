export interface Usuario { id: number; nome: string; username: string; email: string; perfil_completo: boolean }
/** pai_id null = tema (ex.: K-pop); pai_id preenchido = item do tema (ex.: BTS). fonte = API usada para buscar itens do tema. */
export interface Interesse { id: number; nome: string; categoria: string; pai_id: number | null; fonte?: string | null }
export interface ResultadoBusca { nome: string; detalhe: string; id: number | null }
/** Sugestão de cidade (busca por nome). lat/lng = centro da cidade, enviado ao salvar. */
export interface CidadeSugestao { nome: string; uf: string; lat: number; lng: number }
/** Localização do próprio usuário: só cidade e origem; as coordenadas aproximadas nunca saem do backend. */
export interface Localizacao { cidade: string | null; uf: string | null; localizacao_origem: 'aparelho' | 'cidade' | null; tem_localizacao: boolean }
export type Rede = 'instagram' | 'tiktok' | 'x' | 'discord' | 'twitch' | 'youtube'
export type Redes = Partial<Record<Rede, string>>
/** todos = qualquer usuário logado · conexoes = quem se segue mutuamente · ninguem = só eu */
export type VisibilidadeRedes = 'todos' | 'conexoes' | 'ninguem'
export interface Perfil extends Localizacao { id: number; nome: string; username: string; bio: string; foto: string | null; interesses: Interesse[]; redes: Redes; redes_visibilidade: VisibilidadeRedes }
export interface CardUsuario { id: number; nome: string; username: string; foto: string | null; cidade: string | null; uf: string | null; /** faixa, ex.: "a menos de 2 km" (null = sem localização) */ distancia: string | null; compat: number; proximidade: number; compartilhados: string[]; seguindo: boolean }
export interface PerfilPublico extends CardUsuario { bio: string; membro_desde: string; interesses: Interesse[]; seguidores: number; seguindo_total: number
  segue_voce: boolean; conexao: boolean; redes: Redes; redes_status: 'visivel' | 'nenhuma' | 'conexoes' | 'ninguem' }
/** Solicitação de conexão = alguém segue você e você ainda não seguiu de volta */
export interface Solicitacao extends CardUsuario { nova: boolean }
export interface Conexoes { solicitacoes: Solicitacao[]; conexoes: CardUsuario[]; aguardando: CardUsuario[] }
/** Rolê: convite curto ligado a um interesse. Presencial = só aparece para quem está no raio; online = para todos. */
export interface Chamado { id: number; texto: string; formato: 'presencial' | 'online'; quando: string | null; expira_em: string; criado_em: string
  interesse: { id: number; nome: string; tema: string | null }
  autor: { id: number; nome: string; username: string; foto: string | null; cidade: string | null; uf: string | null; distancia: string | null }
  total: number; eu_topo: boolean; meu: boolean; afim: boolean }
export interface Participante { id: number; nome: string; username: string; foto: string | null; novo: boolean }
export interface MeuChamado extends Chamado { encerrado: boolean; participantes: Participante[] }
export interface FeedChamados { tem_localizacao: boolean; raio_km: number; chamados: Chamado[] }
export interface Notificacoes { solicitacoes_novas: number; chamados_novos: number }
export interface Agendado extends Chamado { encerrado: boolean }
/** Rolê na versão pública (visitante sem login): só o primeiro nome e a cidade do autor. */
export interface RolePublico { id: number; texto: string; formato: 'presencial' | 'online'; quando: string | null; expira_em: string; criado_em: string; encerrado: boolean
  interesse: { id: number; nome: string; tema: string | null; tema_id: number | null }
  autor: { nome: string; cidade: string | null; uf: string | null }; total: number }
export interface FandomResumo { id: number; nome: string; categoria: string; fas: number; itens: number; roles: number }
export interface ListaFandoms { categorias: string[]; fandoms: FandomResumo[] }
/** Respostas de GET /detalhe/{tipo}/{id} */
export interface DetalheFandom { tipo: 'fandom'; id: number; nome: string; categoria: string; tema: { id: number; nome: string } | null
  itens: { id: number; nome: string; fas: number }[]; fas: number; roles: RolePublico[]; eu_tenho: boolean; logado: boolean }
export type DetalheRole = ({ tipo: 'role'; logado: true } & Agendado) | ({ tipo: 'role'; logado: false } & RolePublico)
