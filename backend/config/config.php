<?php
/**
 * Configurações gerais do sistema (o que não é conexão com o banco).
 * Na hospedagem, ajuste app_url, os e-mails e a chave da IA.
 */
return [
  // Endereço do front-end (usado no link de recuperação de senha enviado por e-mail)
  'app_url' => 'http://localhost:5173',
  // Origens que podem chamar a API em desenvolvimento (Vite). Em produção o front e a API ficam no mesmo domínio.
  'allowed_origins' => ['http://localhost:5173', 'http://127.0.0.1:5173'],

  // E-mail (função mail() do PHP)
  'email_remetente' => 'nao-responda@entrefans.com.br',
  'email_contato' => 'contato@entrefans.com.br', // quem recebe as mensagens do "Fale conosco"

  // IA (Google Gemini - plano gratuito). Gere a chave em https://aistudio.google.com/apikey
  'gemini_key' => '',
  'gemini_model' => 'gemini-2.5-flash-lite',
];
