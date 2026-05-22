DROP TYPE IF EXISTS tipuri_turism;
DROP TYPE IF EXISTS categorie_pachet;

CREATE TYPE tipuri_turism AS ENUM('cultural', 'aventura', 'relaxare', 'urban');
CREATE TYPE categorie_pachet AS ENUM('standard', 'lux', 'familie', 'cuplu');

CREATE TABLE IF NOT EXISTS pachete_turism (
   id serial PRIMARY KEY,
   destinatie VARCHAR(100) UNIQUE NOT NULL,
   descriere TEXT,
   pret NUMERIC(8,2) NOT NULL,
   durata_zile INT NOT NULL,
   tip_turism tipuri_turism,
   categorie categorie_pachet,
   facilitati VARCHAR[],
   disponibilitate_familie BOOLEAN NOT NULL DEFAULT TRUE,
   disponibilitate_cuplu BOOLEAN NOT NULL DEFAULT TRUE,
   disponibilitate_grup_tineri BOOLEAN NOT NULL DEFAULT TRUE,
   imagine VARCHAR(300),
   data_adaugare TIMESTAMP DEFAULT current_timestamp
);

INSERT INTO pachete_turism (destinatie, descriere, pret, durata_zile, tip_turism, categorie, facilitati, disponibilitate_familie, disponibilitate_cuplu, disponibilitate_grup_tineri, imagine) VALUES 
('Paris, Franța', 'Descoperiți frumusețea culturală a Parisului', 1500, 5, 'cultural', 'standard', '{"vizită la Muzeul Luvru", "Croazieră pe Sena", "Bilet la turnul Eiffel"}', TRUE, TRUE, TRUE, 'paris.jpg'),

('Safari în Masai Mara, Kenya', 'Experimentați aventura sălbatică în inima Africii', 2500, 7, 'aventura', 'lux', '{"safari cu jeepul", "călărie cu caii Masai", "cina tradițională la lumina focului"}', FALSE, TRUE, FALSE, 'masai-mara.jpg'),

('Insula Bali, Indonezia', 'Relaxare și aventură în paradisul insulei Bali', 3000, 10, 'relaxare', 'familie', '{"plajă privată", "excursie la templele hinduse", "scufundări în recifele de corali"}', TRUE, TRUE, TRUE, 'bali.jpg'),

('City break la Barcelona, Spania', 'Explorați frumusețea orașului Barcelona', 1200, 4, 'urban', 'cuplu', '{"vizită la Sagrada Familia", "plimbare pe La Rambla", "serată flamenco"}', FALSE, TRUE, TRUE, 'barcelona.jpg'),

('Excursie în Munții Alpi, Elveția', 'Experimentați frumusețea naturii și aventura în Alpii Elvețieni', 2800, 8, 'aventura', 'familie', '{"drumeții montane", "plimbări cu bicicleta", "excursie la cascadele Rhein"}', TRUE, TRUE, FALSE, 'alpi.jpg'),

('Croazieră în Insulele Grecești', 'O aventură relaxantă prin insulele pitorești ale Greciei', 3500, 10, 'relaxare', 'lux', '{"piscină pe punte", "excursii la vestigiile antice", "gustare la taverna tradițională"}', FALSE, TRUE, TRUE, 'grecia.jpg'),

('Tur cultural în Egipt', 'Descoperiți misterul și istoria Egiptului antic', 2000, 6, 'cultural', 'cuplu', '{"vizită la piramidele din Giza", "plimbare pe Nil cu barca cu pânze", "cina cu vedere la Templele Luxor"}', FALSE, TRUE, FALSE, 'egipt.jpg'),

('City break la Viena, Austria', 'Explorați capitala muzicii clasice și a arhitecturii impunătoare', 1300, 4, 'urban', 'standard', '{"vizită la Palatul Schönbrunn", "plimbare cu caleașca", "concert la Opera din Viena"}', TRUE, TRUE, TRUE, 'viena.jpg'),

('Tur în Asia de Sud-Est: Vietnam și Thailanda', 'O călătorie exotică și culturală prin Vietnam și Thailanda', 4000, 12, 'cultural', 'familie', '{"croazieră în Halong Bay", "vizită la templele din Bangkok", "plajă pe insula Phuket"}', TRUE, TRUE, TRUE, 'asia.jpg'),

('Circuit în Patagonia, Argentina și Chile', 'Descoperiți peisajele spectaculoase ale Patagoniei', 4500, 14, 'aventura', 'lux', '{"drumeții la baza Muntelui Fitz Roy", "croazieră în Fjordurile Patagoniei", "vizită la Glaciarul Perito Moreno"}', FALSE, TRUE, FALSE, 'patagonia.jpg'),

('Tur gastronomic în Italia', 'Explorați gastronomia și cultura Italia', 3000, 8, 'cultural', 'cuplu', '{"degustare de vinuri în Toscana", "curs de gătit în Napoli", "vizită la fabricile de brânzeturi din Emilia-Romagna"}', FALSE, TRUE, FALSE, 'italia.jpg'),

('Excursie în Insulele Hawaii', 'O aventură de relaxare pe plajele paradisiace ale Insulelor Hawaii', 5000, 10, 'relaxare', 'lux', '{"scufundări în recifurile de corali", "curs de surf în Maui", "excursie la vulcanul Kilauea"}', TRUE, TRUE, TRUE, 'hawai.jpg'),

('Descoperă Transilvania', 'Explorare culturală și aventură în inima României', 1800, 5, 'cultural', 'standard', '{"vizită la Castelul Bran și Castelul Peleș", "drumeții în Munții Carpați", "gustare de mâncăruri tradiționale românești"}', TRUE, TRUE, TRUE, 'transilvania.jpg')

('Croazieră în Insulele Caraibe', 'O aventură tropicală în apele cristaline ale Caraibelor', 4200, 7, 'relaxare', 'cuplu', '{"plajă pe insulele Bahamas", "scufundări la reciful de corali", "cina romantică la lumina lumânărilor"}', FALSE, TRUE, TRUE, 'caraibe.jpg'),

('Tur panoramic în Scandinavia', 'Descoperiți peisajele spectaculoase ale Scandinaviei', 3500, 10, 'aventura', 'familie', '{"vizită la fiordurile norvegiene", "plimbare cu feribotul în Suedia", "curs de supraviețuire în pădurile din Finlanda"}', TRUE, TRUE, TRUE, 'scandinavia.jpg');

