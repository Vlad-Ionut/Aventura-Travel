-- AventuraTravel - Schema completă
DROP TABLE IF EXISTS notificari CASCADE;
DROP TABLE IF EXISTS wishlist CASCADE;
DROP TABLE IF EXISTS recenzii CASCADE;
DROP TABLE IF EXISTS plati CASCADE;
DROP TABLE IF EXISTS rezervari CASCADE;
DROP TABLE IF EXISTS pachet_imagini CASCADE;
DROP TABLE IF EXISTS perioade_disponibile CASCADE;
DROP TABLE IF EXISTS pachete_turism CASCADE;
DROP TABLE IF EXISTS utilizatori CASCADE;
DROP TABLE IF EXISTS destinatie_poi CASCADE;

DROP TYPE IF EXISTS tipuri_turism CASCADE;
DROP TYPE IF EXISTS categorie_pachet CASCADE;
DROP TYPE IF EXISTS rol_utilizator CASCADE;
DROP TYPE IF EXISTS status_rezervare CASCADE;
DROP TYPE IF EXISTS status_plata CASCADE;
DROP TYPE IF EXISTS status_recenzie CASCADE;

CREATE TYPE tipuri_turism AS ENUM('cultural', 'aventura', 'relaxare', 'urban');
CREATE TYPE categorie_pachet AS ENUM('standard', 'lux', 'familie', 'cuplu');
CREATE TYPE rol_utilizator AS ENUM('administrator', 'angajat', 'client');
CREATE TYPE status_rezervare AS ENUM('pending', 'confirmata', 'anulata', 'finalizata');
CREATE TYPE status_plata AS ENUM('pending', 'reusita', 'esuata', 'rambursata');
CREATE TYPE status_recenzie AS ENUM('pending', 'aprobata', 'respinsa');

CREATE TABLE utilizatori (
    id SERIAL PRIMARY KEY,
    nume VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    parola_hash VARCHAR(255) NOT NULL,
    rol rol_utilizator NOT NULL DEFAULT 'client',
    telefon VARCHAR(30),
    activ BOOLEAN NOT NULL DEFAULT TRUE,
    data_creare TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pachete_turism (
    id SERIAL PRIMARY KEY,
    destinatie VARCHAR(100) NOT NULL,
    tara VARCHAR(80),
    oras VARCHAR(80),
    descriere TEXT,
    pret NUMERIC(10,2) NOT NULL,
    reducere_procent NUMERIC(5,2) DEFAULT 0,
    durata_zile INT NOT NULL,
    tip_turism tipuri_turism,
    categorie categorie_pachet,
    facilitati VARCHAR[],
    locuri_disponibile INT NOT NULL DEFAULT 20,
    disponibilitate_familie BOOLEAN NOT NULL DEFAULT TRUE,
    disponibilitate_cuplu BOOLEAN NOT NULL DEFAULT TRUE,
    disponibilitate_grup_tineri BOOLEAN NOT NULL DEFAULT TRUE,
    imagine VARCHAR(300),
    latitudine NUMERIC(10,6),
    longitudine NUMERIC(10,6),
    hotel_nume VARCHAR(150),
    activ BOOLEAN NOT NULL DEFAULT TRUE,
    data_adaugare TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pachet_imagini (
    id SERIAL PRIMARY KEY,
    pachet_id INT NOT NULL REFERENCES pachete_turism(id) ON DELETE CASCADE,
    cale VARCHAR(400) NOT NULL,
    ordine INT DEFAULT 0,
    alt_text VARCHAR(200)
);

CREATE TABLE perioade_disponibile (
    id SERIAL PRIMARY KEY,
    pachet_id INT NOT NULL REFERENCES pachete_turism(id) ON DELETE CASCADE,
    data_start DATE NOT NULL,
    data_end DATE NOT NULL,
    locuri INT NOT NULL DEFAULT 20,
    pret_special NUMERIC(10,2)
);

CREATE TABLE rezervari (
    id SERIAL PRIMARY KEY,
    utilizator_id INT NOT NULL REFERENCES utilizatori(id),
    pachet_id INT NOT NULL REFERENCES pachete_turism(id),
    perioada_id INT REFERENCES perioade_disponibile(id),
    numar_persoane INT NOT NULL DEFAULT 1,
    data_start DATE,
    data_end DATE,
    pret_total NUMERIC(10,2) NOT NULL,
    status status_rezervare NOT NULL DEFAULT 'pending',
    note TEXT,
    data_creare TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_anulare TIMESTAMP
);

CREATE TABLE plati (
    id SERIAL PRIMARY KEY,
    rezervare_id INT NOT NULL REFERENCES rezervari(id) ON DELETE CASCADE,
    suma NUMERIC(10,2) NOT NULL,
    metoda VARCHAR(50) NOT NULL DEFAULT 'simulat',
    status status_plata NOT NULL DEFAULT 'pending',
    referinta VARCHAR(100),
    detalii JSONB,
    data_plata TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recenzii (
    id SERIAL PRIMARY KEY,
    utilizator_id INT NOT NULL REFERENCES utilizatori(id),
    pachet_id INT NOT NULL REFERENCES pachete_turism(id),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comentariu TEXT,
    status status_recenzie NOT NULL DEFAULT 'pending',
    data_creare TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(utilizator_id, pachet_id)
);

CREATE TABLE wishlist (
    id SERIAL PRIMARY KEY,
    utilizator_id INT NOT NULL REFERENCES utilizatori(id) ON DELETE CASCADE,
    pachet_id INT NOT NULL REFERENCES pachete_turism(id) ON DELETE CASCADE,
    data_adaugare TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(utilizator_id, pachet_id)
);

CREATE TABLE notificari (
    id SERIAL PRIMARY KEY,
    utilizator_id INT REFERENCES utilizatori(id) ON DELETE CASCADE,
    tip VARCHAR(50) NOT NULL,
    subiect VARCHAR(200),
    mesaj TEXT,
    citita BOOLEAN DEFAULT FALSE,
    email_trimis BOOLEAN DEFAULT FALSE,
    data_creare TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE destinatie_poi (
    id SERIAL PRIMARY KEY,
    pachet_id INT REFERENCES pachete_turism(id) ON DELETE CASCADE,
    tip VARCHAR(50) NOT NULL,
    nume VARCHAR(150) NOT NULL,
    latitudine NUMERIC(10,6) NOT NULL,
    longitudine NUMERIC(10,6) NOT NULL,
    descriere TEXT
);

CREATE INDEX idx_pachete_destinatie ON pachete_turism(destinatie);
CREATE INDEX idx_pachete_tip ON pachete_turism(tip_turism);
CREATE INDEX idx_pachete_pret ON pachete_turism(pret);
CREATE INDEX idx_rezervari_user ON rezervari(utilizator_id);
CREATE INDEX idx_rezervari_status ON rezervari(status);
