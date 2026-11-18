/**
 * Validação dos formulários no front-end (o backend PHP valida tudo de novo).
 * Cada função devolve um objeto { campo: 'mensagem de erro' }; vazio = tudo certo.
 */
export type Erros = Record<string, string>

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const USUARIO_RE = /^[a-z0-9_.]{3,30}$/

export function validarSenha(senha: string, confirmar: string): Erros {
  const e: Erros = {}
  if (senha.length < 8) e.senha = 'A senha deve ter ao menos 8 caracteres.'
  else if (senha.length > 72) e.senha = 'A senha deve ter no máximo 72 caracteres.'
  else if (!/[A-Za-z]/.test(senha) || !/\d/.test(senha)) e.senha = 'Use letras e números na senha.'
  if (confirmar !== senha) e.confirmar_senha = 'As senhas não conferem.'
  return e
}

export function validarCadastro(f: { nome: string; username: string; email: string; senha: string; confirmar_senha: string; aceite_termos: boolean }): Erros {
  const e: Erros = {}
  if (f.nome.trim().length < 2) e.nome = 'Informe seu nome (mínimo 2 letras).'
  if (!USUARIO_RE.test(f.username.trim().toLowerCase())) e.username = 'De 3 a 30 caracteres: letras minúsculas, números, _ e .'
  if (!EMAIL_RE.test(f.email.trim())) e.email = 'E-mail inválido.'
  Object.assign(e, validarSenha(f.senha, f.confirmar_senha))
  if (!f.aceite_termos) e.aceite_termos = 'É preciso aceitar os termos para criar a conta.'
  return e
}

export function validarContato(f: { nome: string; email: string; assunto: string; mensagem: string }): Erros {
  const e: Erros = {}
  if (f.nome.trim().length < 2) e.nome = 'Informe seu nome.'
  if (!EMAIL_RE.test(f.email.trim())) e.email = 'E-mail inválido.'
  if (!f.assunto) e.assunto = 'Escolha um assunto.'
  if (f.mensagem.trim().length < 10) e.mensagem = 'Escreva ao menos 10 caracteres.'
  return e
}
