<?php
/** [método HTTP, caminho (regex), Controller::método]. Os grupos (\d+) viram o array de parâmetros do método. */
return [
  // ---- Públicas (sem login) ----
  ['POST', '#^/auth/register$#', 'AuthController::register'],
  ['POST', '#^/auth/login$#', 'AuthController::login'],
  ['POST', '#^/auth/logout$#', 'AuthController::logout'],
  ['POST', '#^/auth/esqueci-senha$#', 'AuthController::esqueciSenha'],
  ['POST', '#^/auth/redefinir-senha$#', 'AuthController::redefinirSenha'],
  ['POST', '#^/contato$#', 'ContatoController::enviar'],
  ['GET', '#^/publico/fandoms$#', 'PublicoController::fandoms'],      // listagem pública 1
  ['GET', '#^/publico/roles$#', 'PublicoController::roles'],          // listagem pública 2
  // Detalhe de 1 registro de QUALQUER recurso (fandom, rolê, usuário): um único PHP para todos
  ['GET', '#^/detalhe/(fandom|role|usuario)/(\d+)$#', 'DetalheController::ver'],

  // ---- Exigem login ----
  ['GET', '#^/usuarios/me$#', 'UsuarioController::me'],
  ['GET', '#^/usuarios/busca$#', 'UsuarioController::busca'],
  ['GET', '#^/perfis/me$#', 'PerfilController::me'],
  ['PUT', '#^/perfis/me$#', 'PerfilController::update'],
  ['POST', '#^/perfis/me/foto$#', 'PerfilController::foto'],
  ['POST', '#^/perfis/me/localizacao$#', 'PerfilController::localizacao'],
  ['GET', '#^/localizacao/cidades$#', 'PerfilController::cidades'],
  ['POST', '#^/ia/bio$#', 'IaController::bio'],
  ['GET', '#^/interesses$#', 'InteresseController::listar'],
  ['GET', '#^/interesses/(\d+)/buscar$#', 'InteresseController::buscar'],
  ['POST', '#^/interesses$#', 'InteresseController::criar'],
  ['GET', '#^/recomendacoes$#', 'RecomendacaoController::listar'],
  ['POST', '#^/seguidores/(\d+)$#', 'SeguidorController::seguir'],
  ['DELETE', '#^/seguidores/(\d+)$#', 'SeguidorController::deixar'],
  ['DELETE', '#^/seguidores/(\d+)/remover$#', 'SeguidorController::remover'],
  ['GET', '#^/conexoes$#', 'SeguidorController::conexoes'],
  ['GET', '#^/notificacoes$#', 'SeguidorController::notificacoes'],
  ['POST', '#^/notificacoes/vistas$#', 'SeguidorController::marcarVistas'],
  ['GET', '#^/chamados$#', 'ChamadoController::listar'],
  ['GET', '#^/chamados/meus$#', 'ChamadoController::meus'],
  ['GET', '#^/chamados/agenda$#', 'ChamadoController::agenda'],       // "carrinho": rolês que topei
  ['POST', '#^/chamados$#', 'ChamadoController::criar'],
  ['POST', '#^/chamados/vistos$#', 'ChamadoController::marcarVistos'],
  ['DELETE', '#^/chamados/(\d+)$#', 'ChamadoController::apagar'],
  ['POST', '#^/chamados/(\d+)/topo$#', 'ChamadoController::topar'],
  ['DELETE', '#^/chamados/(\d+)/topo$#', 'ChamadoController::desistir'],
];
