BEGIN;

--
-- Create model Relatorio
--

CREATE TABLE "mapa_relatorio" (
 "id"              integer NOT NULL PRIMARY KEY AUTOINCREMENT,
 "cod_req"         integer NOT NULL,
 "cod_funcionario" integer NOT NULL,
 "hora_registro"   datetime NOT NULL, 
 "data_registro"   date NOT NULL
 );

--
-- Create model Users
--

CREATE TABLE "mapa_users" (
 "id"       	   integer NOT NULL PRIMARY KEY AUTOINCREMENT, 
 "login"    	   varchar(20) NOT NULL,
 "password" 	   varchar(255) NOT NULL,
 "nome"     	   varchar(30) NOT NULL,
 "email"     	   varchar(100) NOT NULL
 );
 
COMMIT;