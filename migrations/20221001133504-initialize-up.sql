----- USERS TABLE -----

CREATE TABLE public.users(
	id SERIAL PRIMARY KEY,
	email VARCHAR(255) NOT NULL,
	is_email_validated BOOLEAN NOT NULL,
	name VARCHAR(255) NOT NULL,
	password VARCHAR(255) NOT NULL,
	role VARCHAR(255) NOT NULL,
	account_creation DATE NOT NULL DEFAULT CURRENT_DATE,
	discord_id VARCHAR(255),
	avatar_id VARCHAR(50),
	bio TEXT,
	member_start DATE,
	member_stop DATE
);

---- COOKIES TABLE -----

CREATE TABLE public.cookies(
	email VARCHAR(255) PRIMARY KEY NOT NULL,
	cookieId VARCHAR(255) NOT NULL
);

 ----- EMAIL VALIDATION CODE TABLE -----

CREATE TABLE public.email_validation(
	id INT PRIMARY KEY NOT NULL,
	validation_token VARCHAR(255) NOT NULL
);

 ----- MEMBER CODE TABLE -----

CREATE TABLE public.members_code(
	validation_token VARCHAR(255) PRIMARY KEY NOT NULL,
	periods INT NOT NULL,
	code_creation DATE NOT NULL DEFAULT CURRENT_DATE
);

 ----- EVENTS TABLE -----

CREATE TABLE IF NOT EXISTS public.events(
	id SERIAL NOT NULL,
	title VARCHAR(255) NOT NULL,
	author INT NOT NULL,
	date DATE NOT NULL,
	inscription BOOLEAN NOT NULL DEFAULT true,
	inscription_group VARCHAR(255) NOT NULL DEFAULT 'USER',
	inscription_start DATE,
	inscription_stop DATE,
	description TEXT,
	CONSTRAINT events_pk PRIMARY KEY (id)
);

ALTER TABLE public.events
	ADD CONSTRAINT author_fk FOREIGN KEY (author) 
		REFERENCES public.users (id) MATCH SIMPLE
		ON DELETE NO ACTION ON UPDATE CASCADE;


----- EVENT INSCRIPTION TABLE -----

CREATE TABLE public.event_inscription
(
    user_id             INT NOT NULL,
    event_id            INT NOT NULL,
    CONSTRAINT event_inscription_pk PRIMARY KEY (user_id, event_id)
);

ALTER TABLE public.event_inscription
    ADD CONSTRAINT user_id_fk FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE public.event_inscription
    ADD CONSTRAINT event_id_fk FOREIGN KEY (event_id)
        REFERENCES public.events (id) MATCH SIMPLE
        ON DELETE CASCADE ON UPDATE CASCADE;