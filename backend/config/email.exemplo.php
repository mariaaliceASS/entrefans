<?php
/**
 * MODELO de configuração de e-mail. Copie este arquivo para "email.php" (na mesma pasta) e preencha.
 * O email.php NÃO vai para o git, porque contém a senha.
 *
 * Senha de app do Google: https://myaccount.google.com/apppasswords
 * (a verificação em duas etapas precisa estar ativada na conta).
 * Use a senha de 16 letras gerada lá, NÃO a senha normal do Gmail.
 */
return [
  'host' => 'smtp.gmail.com',
  'porta' => 587,
  'usuario' => 'nomedaconta@gmail.com',
  'senha_app' => 'xxxx xxxx xxxx xxxx',
  'nome_remetente' => 'EntreFans',
];
