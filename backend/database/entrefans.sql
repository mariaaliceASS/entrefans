-- =====================================================================
-- EntreFans — exportação do banco (MySQL / MariaDB)
-- Importe no phpMyAdmin: crie o banco "entrefans" (utf8mb4_unicode_ci), selecione-o e use Importar.
-- Contém: estrutura das 11 tabelas, catálogo (categorias, interesses, cidades) e contas de exemplo.
-- Contas de exemplo: login "demo" (ou demo@entrefans.com), senha "demo12345". Os outros usuários de exemplo usam a mesma senha.
-- =====================================================================
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET FOREIGN_KEY_CHECKS = 0;
SET time_zone = "-03:00";
SET NAMES utf8mb4;
START TRANSACTION;

-- ---------------------------------------------------------------------
-- Estrutura
-- ---------------------------------------------------------------------
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categorias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(60) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome` (`nome`),
  UNIQUE KEY `uq_categorias_nome` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chamado_participantes` (
  `chamado_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`chamado_id`,`usuario_id`),
  KEY `fk_cp_usuario` (`usuario_id`),
  CONSTRAINT `fk_cp_chamado` FOREIGN KEY (`chamado_id`) REFERENCES `chamados` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cp_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chamados` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `interesse_id` int(11) NOT NULL,
  `texto` varchar(280) NOT NULL,
  `formato` varchar(10) NOT NULL DEFAULT 'presencial',
  `quando` date DEFAULT NULL,
  `expira_em` datetime NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_chamados_expira` (`expira_em`),
  KEY `fk_chamados_usuario` (`usuario_id`),
  KEY `fk_chamados_interesse` (`interesse_id`),
  CONSTRAINT `fk_chamados_interesse` FOREIGN KEY (`interesse_id`) REFERENCES `interesses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_chamados_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cidades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `uf` char(2) NOT NULL,
  `lat` decimal(8,4) DEFAULT NULL,
  `lng` decimal(8,4) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cidade` (`nome`,`uf`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contatos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) DEFAULT NULL,
  `nome` varchar(80) NOT NULL,
  `email` varchar(150) NOT NULL,
  `assunto` varchar(20) NOT NULL,
  `mensagem` text NOT NULL,
  `email_enviado` tinyint(1) NOT NULL DEFAULT 0,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_contatos_usuario` (`usuario_id`),
  CONSTRAINT `fk_contatos_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `interesses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `categoria_id` int(11) NOT NULL,
  `pai_id` int(11) DEFAULT NULL,
  `nome` varchar(60) NOT NULL,
  `fonte` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_interesses_pai_nome` (`pai_id`,`nome`),
  KEY `fk_interesses_categoria` (`categoria_id`),
  CONSTRAINT `fk_interesses_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`),
  CONSTRAINT `fk_interesses_pai` FOREIGN KEY (`pai_id`) REFERENCES `interesses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `perfis` (
  `usuario_id` int(11) NOT NULL,
  `bio` varchar(140) NOT NULL DEFAULT '',
  `foto` varchar(255) DEFAULT NULL,
  `cidade_id` int(11) DEFAULT NULL,
  `redes_visibilidade` varchar(10) NOT NULL DEFAULT 'conexoes',
  `lat_aprox` decimal(8,3) DEFAULT NULL,
  `lng_aprox` decimal(8,3) DEFAULT NULL,
  `localizacao_origem` varchar(10) DEFAULT NULL,
  `conexoes_vistas_em` timestamp NULL DEFAULT NULL,
  `chamados_vistos_em` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`usuario_id`),
  KEY `fk_perfis_cidade` (`cidade_id`),
  CONSTRAINT `fk_perfis_cidade` FOREIGN KEY (`cidade_id`) REFERENCES `cidades` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_perfis_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `redes_sociais` (
  `usuario_id` int(11) NOT NULL,
  `rede` varchar(20) NOT NULL,
  `usuario_rede` varchar(60) NOT NULL,
  PRIMARY KEY (`usuario_id`,`rede`),
  CONSTRAINT `fk_redes_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `seguidores` (
  `seguidor_id` int(11) NOT NULL,
  `seguido_id` int(11) NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`seguidor_id`,`seguido_id`),
  KEY `fk_seg_seguido` (`seguido_id`),
  CONSTRAINT `fk_seg_seguido` FOREIGN KEY (`seguido_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_seg_seguidor` FOREIGN KEY (`seguidor_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_nao_segue_a_si` CHECK (`seguidor_id` <> `seguido_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuario_interesses` (
  `usuario_id` int(11) NOT NULL,
  `interesse_id` int(11) NOT NULL,
  PRIMARY KEY (`usuario_id`,`interesse_id`),
  KEY `fk_ui_interesse` (`interesse_id`),
  CONSTRAINT `fk_ui_interesse` FOREIGN KEY (`interesse_id`) REFERENCES `interesses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ui_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(80) NOT NULL,
  `username` varchar(30) NOT NULL,
  `email` varchar(150) NOT NULL,
  `senha_hash` varchar(255) NOT NULL,
  `termos_aceitos_em` datetime DEFAULT NULL,
  `reset_token_hash` char(64) DEFAULT NULL,
  `reset_expira_em` datetime DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `uq_usuarios_username` (`username`),
  UNIQUE KEY `uq_usuarios_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

-- ---------------------------------------------------------------------
-- Dados: catálogo
-- ---------------------------------------------------------------------
INSERT INTO `categorias` VALUES (3,'Animes e mangás'),(6,'Cultura pop'),(4,'Jogos'),(5,'Livros'),(1,'Música'),(7,'Outros'),(2,'Séries e filmes');
INSERT INTO `cidades` VALUES (1,'São Paulo','SP',-23.5507,-46.6334),(2,'Campinas','SP',-22.9056,-47.0596),(3,'Porto Alegre','RS',-30.0325,-51.2304),(4,'Canoas','RS',-29.9216,-51.1800),(5,'Rio de Janeiro','RJ',-22.9110,-43.2094),(6,'Belo Horizonte','MG',-19.9227,-43.9451),(7,'Curitiba','PR',-25.4296,-49.2713);
INSERT INTO `interesses` VALUES (1,3,5,'One Piece',NULL),(2,3,5,'Hunter x Hunter',NULL),(3,3,5,'Jujutsu Kaisen',NULL),(4,3,NULL,'Mangás & HQs','manga'),(5,3,NULL,'Anime','anime'),(6,6,NULL,'Convenções',NULL),(7,6,NULL,'Colecionáveis',NULL),(8,6,NULL,'Cosplay',NULL),(9,4,14,'Minecraft',NULL),(10,4,14,'Elden Ring',NULL),(11,4,14,'Valorant',NULL),(12,4,NULL,'Retrogaming','games'),(13,4,NULL,'RPG de Mesa',NULL),(14,4,NULL,'Games','games'),(15,5,17,'Senhor dos Anéis',NULL),(16,5,17,'Harry Potter',NULL),(17,5,NULL,'Livros & Fantasia','livros'),(18,1,NULL,'Metal','musica'),(19,1,22,'Taylor Swift',NULL),(20,1,24,'NewJeans',NULL),(21,1,24,'BTS',NULL),(22,1,NULL,'Pop & Indie','musica'),(23,1,NULL,'Rock','musica'),(24,1,NULL,'K-pop','musica'),(25,7,NULL,'Culinária',NULL),(26,7,NULL,'Fotografia',NULL),(27,2,31,'Stranger Things',NULL),(28,2,30,'Marvel',NULL),(29,2,NULL,'Doramas','doramas'),(30,2,NULL,'Filmes','filmes'),(31,2,NULL,'Séries','series'),(33,1,24,'BLACKPINK',NULL),(34,1,24,'TWICE',NULL),(35,1,24,'Stray Kids',NULL),(36,1,24,'SEVENTEEN',NULL),(37,1,24,'aespa',NULL),(38,1,24,'IVE',NULL),(39,1,24,'LE SSERAFIM',NULL),(40,1,24,'(G)I-DLE',NULL),(41,1,24,'ENHYPEN',NULL),(42,1,24,'TOMORROW X TOGETHER',NULL),(43,1,24,'ATEEZ',NULL),(44,1,24,'NCT 127',NULL),(45,1,24,'Red Velvet',NULL),(46,1,24,'ITZY',NULL),(47,1,24,'EXO',NULL),(48,1,24,'BIGBANG',NULL),(49,1,24,'ILLIT',NULL),(50,1,24,'BABYMONSTER',NULL),(51,1,23,'Queen',NULL),(52,1,23,'The Beatles',NULL),(53,1,23,'Nirvana',NULL),(54,1,23,'Foo Fighters',NULL),(55,1,23,'Arctic Monkeys',NULL),(56,1,23,'Linkin Park',NULL),(57,1,23,'Red Hot Chili Peppers',NULL),(58,1,23,'Legião Urbana',NULL),(59,1,23,'Titãs',NULL),(60,1,23,'Paramore',NULL),(61,1,23,'Guns N\' Roses',NULL),(62,1,23,'AC/DC',NULL),(63,1,22,'Billie Eilish',NULL),(64,1,22,'Olivia Rodrigo',NULL),(65,1,22,'Dua Lipa',NULL),(66,1,22,'Sabrina Carpenter',NULL),(67,1,22,'Lana Del Rey',NULL),(68,1,22,'The Weeknd',NULL),(69,1,22,'Lady Gaga',NULL),(70,1,22,'Ariana Grande',NULL),(71,1,22,'Tame Impala',NULL),(72,1,22,'Anitta',NULL),(73,1,22,'Harry Styles',NULL),(74,1,18,'Metallica',NULL),(75,1,18,'Iron Maiden',NULL),(76,1,18,'Sepultura',NULL),(77,1,18,'Slipknot',NULL),(78,1,18,'Black Sabbath',NULL),(79,1,18,'Megadeth',NULL),(80,1,18,'System of a Down',NULL),(81,1,18,'Avenged Sevenfold',NULL),(82,1,18,'Angra',NULL),(83,1,18,'BABYMETAL',NULL),(84,2,31,'The Last of Us',NULL),(85,2,31,'Wandinha',NULL),(86,2,31,'Breaking Bad',NULL),(87,2,31,'Game of Thrones',NULL),(88,2,31,'The Boys',NULL),(89,2,31,'Friends',NULL),(90,2,31,'The Office',NULL),(91,2,31,'Arcane',NULL),(92,2,31,'The Bear',NULL),(93,2,31,'Round 6',NULL),(94,2,31,'House of the Dragon',NULL),(95,2,31,'Euphoria',NULL),(96,2,30,'Star Wars',NULL),(97,2,30,'DC',NULL),(98,2,30,'Studio Ghibli',NULL),(99,2,30,'Pixar',NULL),(100,2,30,'Jurassic Park',NULL),(101,2,30,'Matrix',NULL),(102,2,30,'Interestelar',NULL),(103,2,30,'Barbie',NULL),(104,2,30,'Oppenheimer',NULL),(105,2,29,'Crash Landing on You',NULL),(106,2,29,'Goblin',NULL),(107,2,29,'Extraordinary Attorney Woo',NULL),(108,2,29,'Business Proposal',NULL),(109,2,29,'True Beauty',NULL),(110,2,29,'Vincenzo',NULL),(111,2,29,'Queen of Tears',NULL),(112,2,29,'Lovely Runner',NULL),(113,2,29,'Hometown Cha-Cha-Cha',NULL),(114,2,29,'The Glory',NULL),(115,2,29,'Itaewon Class',NULL),(116,3,5,'Naruto',NULL),(117,3,5,'Dragon Ball',NULL),(118,3,5,'Attack on Titan',NULL),(119,3,5,'Demon Slayer',NULL),(120,3,5,'My Hero Academia',NULL),(121,3,5,'Chainsaw Man',NULL),(122,3,5,'Spy x Family',NULL),(123,3,5,'Death Note',NULL),(124,3,5,'Fullmetal Alchemist',NULL),(125,3,5,'Frieren',NULL),(126,3,5,'Solo Leveling',NULL),(127,3,5,'Cavaleiros do Zodíaco',NULL),(128,3,5,'Sailor Moon',NULL),(129,3,5,'Neon Genesis Evangelion',NULL),(130,3,5,'Haikyuu!!',NULL),(131,3,5,'Bleach',NULL),(132,3,4,'Berserk',NULL),(133,3,4,'Vagabond',NULL),(134,3,4,'Turma da Mônica',NULL),(135,3,4,'Batman',NULL),(136,3,4,'Homem-Aranha',NULL),(137,3,4,'X-Men',NULL),(138,3,4,'Sandman',NULL),(139,3,4,'Watchmen',NULL),(140,3,4,'Dandadan',NULL),(141,3,4,'Blue Lock',NULL),(142,3,4,'Oshi no Ko',NULL),(143,3,4,'Monster',NULL),(144,4,14,'League of Legends',NULL),(145,4,14,'Fortnite',NULL),(146,4,14,'The Legend of Zelda',NULL),(147,4,14,'Pokémon',NULL),(148,4,14,'Genshin Impact',NULL),(149,4,14,'Counter-Strike 2',NULL),(150,4,14,'GTA V',NULL),(151,4,14,'The Witcher 3',NULL),(152,4,14,'Hollow Knight',NULL),(153,4,14,'Baldur\'s Gate 3',NULL),(154,4,14,'Stardew Valley',NULL),(155,4,14,'Free Fire',NULL),(156,4,14,'Roblox',NULL),(157,4,13,'Dungeons & Dragons',NULL),(158,4,13,'Tormenta20',NULL),(159,4,13,'Ordem Paranormal',NULL),(160,4,13,'Call of Cthulhu',NULL),(161,4,13,'Pathfinder',NULL),(162,4,13,'Vampiro: A Máscara',NULL),(163,4,13,'Mutantes & Malfeitores',NULL),(164,4,13,'Cyberpunk RED',NULL),(165,4,12,'Super Mario World',NULL),(166,4,12,'Sonic the Hedgehog',NULL),(167,4,12,'Chrono Trigger',NULL),(168,4,12,'Street Fighter II',NULL),(169,4,12,'Super Metroid',NULL),(170,4,12,'Final Fantasy VII',NULL),(171,4,12,'Castlevania',NULL),(172,4,12,'Mega Man',NULL),(173,4,12,'Donkey Kong Country',NULL),(174,4,12,'The King of Fighters',NULL),(175,4,12,'Pac-Man',NULL),(176,4,12,'Crash Bandicoot',NULL),(177,5,17,'Percy Jackson',NULL),(178,5,17,'As Crônicas de Gelo e Fogo',NULL),(179,5,17,'O Hobbit',NULL),(180,5,17,'As Crônicas de Nárnia',NULL),(181,5,17,'Trono de Vidro',NULL),(182,5,17,'Corte de Espinhos e Rosas',NULL),(183,5,17,'Mistborn',NULL),(184,5,17,'O Nome do Vento',NULL),(185,5,17,'A Roda do Tempo',NULL),(186,5,17,'Jogos Vorazes',NULL),(187,5,17,'Duna',NULL),(188,5,17,'Discworld',NULL),(189,6,8,'Cosplay de anime',NULL),(190,6,8,'Cosplay de games',NULL),(191,6,8,'Cosplay de K-pop',NULL),(192,6,8,'Crossplay',NULL),(193,6,8,'Armaduras e props',NULL),(194,6,8,'Maquiagem artística',NULL),(195,6,7,'Funko Pop',NULL),(196,6,7,'Action figures',NULL),(197,6,7,'Pokémon TCG',NULL),(198,6,7,'Magic: The Gathering',NULL),(199,6,7,'Yu-Gi-Oh!',NULL),(200,6,7,'LEGO',NULL),(201,6,7,'Gunpla',NULL),(202,6,7,'Discos de vinil',NULL),(203,6,7,'Photocards de K-pop',NULL),(204,6,6,'CCXP',NULL),(205,6,6,'Anime Friends',NULL),(206,6,6,'Brasil Game Show',NULL),(207,6,6,'Campus Party',NULL),(208,6,6,'Perifacon',NULL),(209,6,6,'Bienal do Livro',NULL),(210,7,26,'Fotografia de rua',NULL),(211,7,26,'Retratos',NULL),(212,7,26,'Fotografia analógica',NULL),(213,7,26,'Natureza',NULL),(214,7,26,'Astrofotografia',NULL),(215,7,26,'Fotos de cosplay',NULL),(216,7,25,'Culinária asiática',NULL),(217,7,25,'Confeitaria',NULL),(218,7,25,'Receitas de anime',NULL),(219,7,25,'Churrasco',NULL),(220,7,25,'Culinária vegana',NULL),(221,7,25,'Cafés especiais',NULL),(288,1,24,'KISS OF LIFE',NULL),(290,2,30,'Duna',NULL),(292,4,14,'PEAK',NULL);

-- ---------------------------------------------------------------------
-- Dados: usuários de exemplo
-- ---------------------------------------------------------------------
INSERT INTO `usuarios` VALUES (1,'Conta Demo','demo','demo@entrefans.com','$2b$10$DY6BYPptgYhMBN5ibwc9LOlUqvgQySG0f/OxJcMBiMAc3ouY.Uo5i','2026-11-16 17:10:53',NULL,NULL,'2026-11-16 17:10:53'),(2,'Mariana Costa','mari.costa','mari.costa@demo.entrefans.com','$2b$10$DY6BYPptgYhMBN5ibwc9LOlUqvgQySG0f/OxJcMBiMAc3ouY.Uo5i','2026-11-16 17:10:53',NULL,NULL,'2026-11-16 17:10:53'),(3,'Lucas Silveira','lucas.shadow','lucas.shadow@demo.entrefans.com','$2b$10$DY6BYPptgYhMBN5ibwc9LOlUqvgQySG0f/OxJcMBiMAc3ouY.Uo5i','2026-11-16 17:10:53',NULL,NULL,'2026-11-16 17:10:53'),(4,'Camila Duarte','cami.duarte','cami.duarte@demo.entrefans.com','$2b$10$DY6BYPptgYhMBN5ibwc9LOlUqvgQySG0f/OxJcMBiMAc3ouY.Uo5i','2026-11-16 17:10:53',NULL,NULL,'2026-11-16 17:10:53'),(5,'Rafael Souza','rafa.souza','rafa.souza@demo.entrefans.com','$2b$10$DY6BYPptgYhMBN5ibwc9LOlUqvgQySG0f/OxJcMBiMAc3ouY.Uo5i','2026-11-16 17:10:53',NULL,NULL,'2026-11-16 17:10:53'),(6,'Ana Beatriz','ana.bia','ana.bia@demo.entrefans.com','$2b$10$DY6BYPptgYhMBN5ibwc9LOlUqvgQySG0f/OxJcMBiMAc3ouY.Uo5i','2026-11-16 17:10:53',NULL,NULL,'2026-11-16 17:10:53'),(7,'Julia Prado','ju.prado','ju.prado@demo.entrefans.com','$2b$10$DY6BYPptgYhMBN5ibwc9LOlUqvgQySG0f/OxJcMBiMAc3ouY.Uo5i','2026-11-16 17:10:53',NULL,NULL,'2026-11-16 17:10:53');
INSERT INTO `perfis` VALUES (1,'Conta de teste do EntreFans. Fã de anime, games e K-pop!',NULL,4,'conexoes',-29.915,-51.185,'cidade','2026-11-16 20:59:47',NULL),(2,'Maratonando Jujutsu Kaisen e sempre pronta para falar de NewJeans ou jogar Valorant.',NULL,4,'conexoes',-29.915,-51.185,'cidade','2026-11-16 20:58:41',NULL),(3,'Mestre de D&D há 4 anos. Procuro jogadores para mesa presencial.',NULL,4,'conexoes',-29.925,-51.165,'cidade','2026-11-16 20:58:41',NULL),(4,'K-popper e leitora voraz.',NULL,3,'conexoes',-30.045,-51.225,'cidade','2026-11-16 20:58:41',NULL),(5,'Fã de shonen e indie rock.',NULL,3,'conexoes',-30.025,-51.205,'cidade','2026-11-16 20:58:41',NULL),(6,'Estudante de computação. Apaixonada por RPG de mesa e animes clássicos.',NULL,1,'conexoes',-23.565,-46.705,'cidade','2026-11-16 20:58:41',NULL),(7,'Cosplayer aspirante e fã de convenções.',NULL,4,'conexoes',-29.955,-51.165,'cidade','2026-11-16 20:58:41',NULL);
INSERT INTO `usuario_interesses` VALUES (1,3),(1,5),(1,8),(1,13),(1,14),(1,24),(2,3),(2,5),(2,8),(2,11),(2,14),(2,20),(2,24),(3,10),(3,13),(3,14),(3,15),(3,17),(3,157),(4,17),(4,21),(4,24),(4,29),(4,31),(5,1),(5,2),(5,5),(5,14),(5,22),(5,23),(6,4),(6,5),(6,12),(6,13),(6,14),(6,165),(7,5),(7,6),(7,7),(7,8),(7,24),(7,28),(7,30),(7,204);
INSERT INTO `chamados` VALUES (1,2,3,'Alguém pra maratonar a temporada nova de Jujutsu Kaisen num sábado à tarde? Levo a pipoca!','presencial','2026-12-05','2026-12-05 23:59:59','2026-11-18 15:22:55'),(2,7,204,'Procuro grupo para ir à CCXP de cosplay! Ainda decidindo o personagem.','presencial','2026-12-04','2026-12-04 23:59:59','2026-11-18 15:22:55'),(3,6,165,'Speedrun casual de Super Mario World online, quem topa competir comigo?','online',NULL,'2026-12-20 23:59:59','2026-11-18 15:22:55'),(4,3,157,'Mesa de D&D 5e para iniciantes! Faltam 2 jogadores. Sessões quinzenais em café de jogos.','presencial','2026-12-12','2026-12-12 23:59:59','2026-11-18 15:22:55'),(5,4,21,'Watch party online do novo MV do BTS! Vamos reagir juntas pelo Discord.','online',NULL,'2026-12-20 23:59:59','2026-11-18 15:22:55');
INSERT INTO `seguidores` VALUES (1,2,'2026-11-16 17:10:53'),(1,3,'2026-11-16 17:10:53'),(4,1,'2026-11-16 17:10:53'),(7,1,'2026-11-16 17:10:53');
INSERT INTO `chamado_participantes` VALUES (1,1,'2026-11-18 15:22:55'),(1,5,'2026-11-18 15:22:55'),(1,7,'2026-11-18 15:22:55'),(4,1,'2026-11-18 15:22:55');

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
