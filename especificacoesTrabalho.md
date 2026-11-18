Desenvolva uma aplicação virtual 100% funcional
Vocês escolhem o problema, pode ser qualquer coisa mesmo que não faça muito sentido, já teve até loja de memes, batalha de coisas, gerenciador de playlists somente de Rock. Uma ideia é usar o TCC como experimento. Mas na dúvida uma loja virtual sempre contempla todos o requisitos. 

O que será cobrado (LEIA ITEM POR ITEM AGORA E ANTES DE SUBMETER!):

HTML e CSS: a biblioteca Bootstrap e templates prontos de front-end . (HTML e CSS) poderão ser utilizados; não avaliarei aparência, usabilidade, acessibilidade ou responsividade, isso ficou em Web 1.
REACT: Ao menos uma funcionalidade deve ser com react + react router. 
OBRIGATÓRIO: Entrega via Github ou Gitlab (público) e TAMBÉM deverá ser enviado aqui no Moodle
PODE usar o trabalho de Web 1 como base para o HTML e CSS.
NÃO PODE usar códigos prontos de lojas e afins studio ai e etc (códigos prontos e libs somente de coisas periféricas ou extras, geração de gráficos, imagens, PDF se for o caso).
NÃO PODE usar frameworks ou bibliotecas PHP (fora as vistas em aula), devem ser usadas as linguagens "cruas".
Deve ter um BD com usuários, produtos, etc... (com SGBD MySQL ou PostgreSQL) (envie o .sql exportado do PHPMyAdmin ou equivalente). Entre 6 e 8 tabelas é o suficiente.
Telas meio que obrigatórias:
Principal: Sistema de login (1), com recuperação de senha (2) e cadastro de foto (3) do usuario salvando em arquivo.
Tela de cadastro de usuário, com validação de campos (HTML e/ou JS) e no backend também;
Tela de termos de serviço e política de plágio (muito importante para regras de LGPD)
Fale conosco (formulário de contato), com validação de campos (HTML e/ou JS). Deve enviar e-mail via PHP;
Todas as telas públicas devem conter tags de meta plagiarism e tags OG: para aumentar o SEO e o GEO
Tela específica para detalhar apenas 1 produto, um serviço uma redação  clicado (deve funcionar para todos os recursos um get one dinamicamente, apenas 1 PHP para todos).
Tela especifica para um carrinho de comparas o similar (n..n). Exemplo possuir um botão de compra que manda para a tela do carrinho;
Ao menos deve ter:
2 cadastros simples
1 cadastro 1 ..n
2 cadastros n..n
2 telas de listagem públicas (o resto pode ser tudo sob um login)
Validação de dados (básico no front e no back - Expressão regular é preciosismo eheh)
Algum recurso consumindo uma LLM (Gemini é de grátis - Gemma ou lite funcionam bem,  ou tem um Groq ou openrouter  )
Sistema de logs em arquivo de todas a funções (rotas, ou ações executadas). Deve ser demonstrado na apresentação que isso funciona.
É recomendado ter um arquivo PHP separado só para conexão com o banco.
Também pode fazer um arquivo PHP de cabeçalho e um de rodapé e incluir em todas as páginas para não se repetir (ou Fullreact). 
Isso dá algo entre 5 e 10 arquivos PHP +-.
AJAX e SPA pelo menos em um recurso
O sistema deve estar hospedado (recomendo usar a Locaweb fornecido em aula), você pode tentar um Heroku, Render da vida também, mas não garanto nada.
Envie o endereço do APP/Sistema, link do git, em um arquivo README.md na raiz do zip.
Não se esqueça de incluir o SQL do banco entre os arquivos upados. Ele pode ser obtido no PHPMyAdmin através do item 'Export' do menu.
Mande tudo em 1 zip aqui no Moodle. O tamanho máximo de envio é de 20MB. Se o seu sistema tem mais que isso, tem algum problema sério. Não aceitarei arquivos enviados por outros meios.
O sistema deverá ser entregue até o dia 25/11/2026. Deve ser feito individualmente.

TRABALHO INDIVIDUAL. Cópias totais ou parciais de colegas ou conteúdo encontrado na Web (inclusive IA) = ZERO. Com saberei que não fizeram tudo com IA vocês vão ter que me explicar os seus códigos então caprichem e aprendam. 



Como importar o BD local para a hospedagem
Abra o XAMPP, ligue o Apache e o MySQL
Acesse localhost/phpmyadmin
Acesse o BD que está usando para o trabalho
Clique em Export/Exportar no menu do topo
Deixe a configuração padrão e clique em Execute/Executar (ele vai baixar um arquivo com a extensão .sql)
Acesse sua conta no de hospedeagem
No painel principal, desça até a seção de Databases e entre em MySQL Databases
Clique em Create New Database
Escolha um nome para a DB (pode ser o mesmo nome usado localmente), um login e uma senha
Agora sua DB estará lista em Manage Databases na tela onde tinha o botão de Create. Anote o nome e o user do banco, que serão os que você escolheu 
Clique no 3 pontinhos ao lado da DB e selecione PHPMyAdmin
Entre na sua DB e clique em Import/Importar no topo da tela
Selecione o arquivo SQL que foi gerado pelo export no passo 5
Deixe as outras configurações como estão e clica em Execute/Executar
Vai aparecer uma tela com todos os comandos que foram rodados e, se tudo deu certo, várias mensagens com fundo verde
Entre novamente na sua DB (clicando nela na lista de databases no menu da esquerda do PHPMyAdmin). Suas tabelas e dados devem estar todos lá agora.
No seu arquivo PHP onde é feita a conexão com o BD (recomendo fazer 1 arquivo separado com isso e dar include dele em todas suas páginas), na versão que está hospedada, altere o nome da database e do login anotados no passo 10.
Deve estar tudo funcionando no  remoto agora, da mesma forma que funciona localmente.
Se usou algum outro host, o procedimento é análogo.