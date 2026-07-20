-- Seed AventuraTravel
INSERT INTO utilizatori (nume, email, parola_hash, rol, telefon) VALUES
('Admin Aventura', 'admin@aventuratravel.ro', '$2b$10$w/8/hSlPcuXrJvf1JihUwOzeIyE7IdYsObeGY9jnw950HeHSer.OC', 'administrator', '0700000001'),
('Elena Angajat', 'angajat@aventuratravel.ro', '$2b$10$/Vj7m4wPbXR5EVFtNy/yGOK0.2r..YWqLHLw51C.2DtSjzRZaZ8Sa', 'angajat', '0700000002'),
('Ion Client', 'client@aventuratravel.ro', '$2b$10$3yeMSyWqUE79yUl.QZBuN.hwbN1NJ56/5Ul/uDr7ZV9gYdHxPCy7e', 'client', '0700000003'),
('Maria Popescu', 'maria@email.com', '$2b$10$3yeMSyWqUE79yUl.QZBuN.hwbN1NJ56/5Ul/uDr7ZV9gYdHxPCy7e', 'client', '0722123456'),
('Andrei Ionescu', 'andrei@email.com', '$2b$10$3yeMSyWqUE79yUl.QZBuN.hwbN1NJ56/5Ul/uDr7ZV9gYdHxPCy7e', 'client', '0733987654');

INSERT INTO pachete_turism (destinatie, tara, oras, descriere, pret, reducere_procent, durata_zile, tip_turism, categorie, facilitati, locuri_disponibile, disponibilitate_familie, disponibilitate_cuplu, disponibilitate_grup_tineri, imagine, latitudine, longitudine, hotel_nume) VALUES
('Paris, Franța', 'Franța', 'Paris', 'Descoperiți frumusețea culturală a Parisului: Luvru, Turnul Eiffel și croazieră pe Sena.', 1500, 10, 5, 'cultural', 'standard', ARRAY['vizită la Muzeul Luvru','Croazieră pe Sena','Bilet la Turnul Eiffel'], 25, TRUE, TRUE, TRUE, 'paris.jpg', 48.856600, 2.352200, 'Hôtel Le Marais'),
('Safari Masai Mara, Kenya', 'Kenya', 'Masai Mara', 'Aventură sălbatică în inima Africii cu safari și experiențe Masai.', 2500, 0, 7, 'aventura', 'lux', ARRAY['safari cu jeepul','călărie Masai','cină la foc'], 12, FALSE, TRUE, FALSE, 'masai-mara.jpg', -1.406100, 35.011700, 'Mara Serena Lodge'),
('Insula Bali, Indonezia', 'Indonezia', 'Denpasar', 'Relaxare și aventură în paradisul tropical Bali.', 3000, 15, 10, 'relaxare', 'familie', ARRAY['plajă privată','temple hinduse','scufundări'], 30, TRUE, TRUE, TRUE, 'bali.jpg', -8.409500, 115.188900, 'Bali Beach Resort'),
('City break Barcelona', 'Spania', 'Barcelona', 'Explorați Sagrada Familia, La Rambla și atmosfera mediteraneană.', 1200, 5, 4, 'urban', 'cuplu', ARRAY['Sagrada Familia','La Rambla','serată flamenco'], 20, FALSE, TRUE, TRUE, 'barcelona.jpg', 41.387400, 2.168600, 'Hotel Gothic Quarter'),
('Munții Alpi, Elveția', 'Elveția', 'Interlaken', 'Natură și aventură în Alpii Elvețieni.', 2800, 0, 8, 'aventura', 'familie', ARRAY['drumeții montane','bicicletă','cascadele Rhein'], 18, TRUE, TRUE, FALSE, 'alpi.jpg', 46.686300, 7.863200, 'Alpine Lodge Interlaken'),
('Insulele Grecești', 'Grecia', 'Santorini', 'Croazieră relaxantă prin insulele pitorești ale Greciei.', 3500, 20, 10, 'relaxare', 'lux', ARRAY['piscină pe punte','vestigii antice','tavernă grecească'], 15, FALSE, TRUE, TRUE, 'grecia.jpg', 36.393200, 25.461500, 'Santorini Caldera View'),
('Tur cultural Egipt', 'Egipt', 'Cairo', 'Misterul și istoria Egiptului antic: piramide, Nil, Luxor.', 2000, 0, 6, 'cultural', 'cuplu', ARRAY['piramidele din Giza','Nil','Templele Luxor'], 22, FALSE, TRUE, FALSE, 'egipt.jpg', 30.044400, 31.235700, 'Cairo Nile Hotel'),
('City break Viena', 'Austria', 'Viena', 'Capitala muzicii clasice și a arhitecturii impunătoare.', 1300, 8, 4, 'urban', 'standard', ARRAY['Palatul Schönbrunn','caleașcă','Opera din Viena'], 28, TRUE, TRUE, TRUE, 'viena.jpg', 48.208200, 16.373800, 'Hotel Stephansplatz'),
('Vietnam & Thailanda', 'Vietnam', 'Hanoi', 'Călătorie exotică prin Vietnam și Thailanda.', 4000, 10, 12, 'cultural', 'familie', ARRAY['Halong Bay','temple Bangkok','plajă Phuket'], 16, TRUE, TRUE, TRUE, 'asia.jpg', 21.028500, 105.854200, 'Indochina Heritage Hotel'),
('Patagonia', 'Argentina', 'El Calafate', 'Peisaje spectaculoase în Patagonia: Fitz Roy și ghețari.', 4500, 0, 14, 'aventura', 'lux', ARRAY['Fitz Roy','fiorduri','Perito Moreno'], 10, FALSE, TRUE, FALSE, 'patagonia.jpg', -50.337900, -72.264800, 'Patagonia Eco Lodge'),
('Tur gastronomic Italia', 'Italia', 'Roma', 'Gastronomie și cultură: Toscana, Napoli, Emilia-Romagna.', 3000, 12, 8, 'cultural', 'cuplu', ARRAY['vinuri Toscana','curs de gătit Napoli','brânzeturi'], 20, FALSE, TRUE, FALSE, 'italia.jpg', 41.902800, 12.496400, 'Roma Trastevere Inn'),
('Insulele Hawaii', 'SUA', 'Honolulu', 'Relaxare pe plajele paradisiace din Hawaii.', 5000, 5, 10, 'relaxare', 'lux', ARRAY['scufundări','surf Maui','vulcanul Kilauea'], 14, TRUE, TRUE, TRUE, 'hawai.jpg', 21.306900, -157.858300, 'Waikiki Paradise Resort'),
('Descoperă Transilvania', 'România', 'Brașov', 'Cultură și aventură în inima României: Bran, Peleș, Carpați.', 1800, 15, 5, 'cultural', 'standard', ARRAY['Castelul Bran','Peleș','Carpați','mâncare tradițională'], 35, TRUE, TRUE, TRUE, 'transilvania.jpg', 45.642700, 25.588700, 'Hotel Bran Castle View'),
('Insulele Caraibe', 'Bahamas', 'Nassau', 'Aventură tropicală în apele cristaline ale Caraibelor.', 4200, 10, 7, 'relaxare', 'cuplu', ARRAY['plajă Bahamas','scufundări','cină romantică'], 12, FALSE, TRUE, TRUE, 'caraibe.jpg', 25.034300, -77.396300, 'Caribbean Dream Resort'),
('Scandinavia panoramic', 'Norvegia', 'Bergen', 'Fiorduri, feriboturi și păduri nordice.', 3500, 0, 10, 'aventura', 'familie', ARRAY['fiorduri','feribot Suedia','supraviețuire Finlanda'], 18, TRUE, TRUE, TRUE, 'scandinavia.jpg', 60.391300, 5.322100, 'Bergen Fjord Hotel'),
('City break Roma', 'Italia', 'Roma', 'Colosseumul, Vaticanul și viața romană autentică.', 1100, 0, 3, 'urban', 'cuplu', ARRAY['Colosseum','Vatican','Trastevere'], 24, TRUE, TRUE, TRUE, 'roma.jpg', 41.890200, 12.492200, 'Hotel Colosseo'),
('City break Florența', 'Italia', 'Florența', 'Artă renascentistă, Ponte Vecchio și Toscana.', 1250, 5, 4, 'urban', 'cuplu', ARRAY['Uffizi','Duomo','Ponte Vecchio'], 22, TRUE, TRUE, TRUE, 'florenta.jpg', 43.769600, 11.255800, 'Hotel Duomo Firenze');

-- Perioade disponibile (următoarele 6 luni)
INSERT INTO perioade_disponibile (pachet_id, data_start, data_end, locuri, pret_special)
SELECT id, CURRENT_DATE + (n * 30), CURRENT_DATE + (n * 30) + durata_zile, locuri_disponibile,
       CASE WHEN reducere_procent > 0 THEN ROUND(pret * (1 - reducere_procent/100), 2) ELSE NULL END
FROM pachete_turism, generate_series(1, 4) AS n;

-- POI pe hartă
INSERT INTO destinatie_poi (pachet_id, tip, nume, latitudine, longitudine, descriere) VALUES
(1, 'hotel', 'Hôtel Le Marais', 48.856600, 2.352200, 'Hotel central în cartierul Marais'),
(1, 'aeroport', 'Aeroportul Charles de Gaulle', 49.009700, 2.547900, 'Aeroport principal Paris'),
(1, 'obiectiv', 'Turnul Eiffel', 48.858400, 2.294500, 'Simbolul Parisului'),
(1, 'obiectiv', 'Muzeul Luvru', 48.860600, 2.337600, 'Cel mai mare muzeu de artă'),
(4, 'hotel', 'Hotel Gothic Quarter', 41.387400, 2.168600, 'Hotel în cartierul gotic'),
(4, 'aeroport', 'Aeroportul El Prat', 41.297400, 2.083300, 'Aeroport Barcelona'),
(4, 'obiectiv', 'Sagrada Familia', 41.403600, 2.174400, 'Capodopera lui Gaudí'),
(8, 'hotel', 'Hotel Stephansplatz', 48.208200, 16.373800, 'Hotel lângă catedrală'),
(8, 'aeroport', 'Aeroportul Viena', 48.110300, 16.569700, 'VIE'),
(8, 'obiectiv', 'Palatul Schönbrunn', 48.185800, 16.312200, 'Reședința imperială'),
(11, 'hotel', 'Roma Trastevere Inn', 41.902800, 12.496400, 'Hotel în Trastevere'),
(11, 'aeroport', 'Fiumicino', 41.800300, 12.238900, 'Aeroport Roma'),
(11, 'obiectiv', 'Colosseum', 41.890200, 12.492200, 'Amfiteatrul antic'),
(13, 'hotel', 'Hotel Bran Castle View', 45.642700, 25.588700, 'Vedere spre Castelul Bran'),
(13, 'aeroport', 'Aeroportul Brașov', 45.702100, 25.524200, 'Aeroport regional'),
(13, 'obiectiv', 'Castelul Bran', 45.515300, 25.367200, 'Castelul lui Dracula'),
(16, 'hotel', 'Hotel Colosseo', 41.890200, 12.492200, 'Lângă Colosseum'),
(16, 'aeroport', 'Fiumicino', 41.800300, 12.238900, 'Aeroport Roma'),
(16, 'obiectiv', 'Vatican', 41.902900, 12.453400, 'Statul Vatican'),
(17, 'hotel', 'Hotel Duomo Firenze', 43.769600, 11.255800, 'Lângă Duomo'),
(17, 'aeroport', 'Aeroportul Florența', 43.810000, 11.205100, 'FLR'),
(17, 'obiectiv', 'Ponte Vecchio', 43.767900, 11.253100, 'Podul renascentist');

-- Imagini multiple (folosesc aceleași nume ca imaginea principală pentru demo)
INSERT INTO pachet_imagini (pachet_id, cale, ordine, alt_text)
SELECT id, imagine, 0, destinatie FROM pachete_turism WHERE imagine IS NOT NULL;

INSERT INTO pachet_imagini (pachet_id, cale, ordine, alt_text) VALUES
(1, 'paris.jpg', 1, 'Paris peisaj'),
(4, 'barcelona.jpg', 1, 'Barcelona'),
(11, 'italia.jpg', 1, 'Italia'),
(16, 'roma.jpg', 1, 'Roma'),
(17, 'florenta.jpg', 1, 'Florența');

-- Rezervări demo pentru recomandări
INSERT INTO rezervari (utilizator_id, pachet_id, perioada_id, numar_persoane, data_start, data_end, pret_total, status)
SELECT 3, 4, p.id, 2, p.data_start, p.data_end, 1140, 'confirmata'
FROM perioade_disponibile p WHERE p.pachet_id = 4 LIMIT 1;

INSERT INTO rezervari (utilizator_id, pachet_id, perioada_id, numar_persoane, data_start, data_end, pret_total, status)
SELECT 3, 16, p.id, 2, p.data_start, p.data_end, 1100, 'confirmata'
FROM perioade_disponibile p WHERE p.pachet_id = 16 LIMIT 1;

INSERT INTO rezervari (utilizator_id, pachet_id, perioada_id, numar_persoane, data_start, data_end, pret_total, status)
SELECT 4, 11, p.id, 2, p.data_start, p.data_end, 2640, 'confirmata'
FROM perioade_disponibile p WHERE p.pachet_id = 11 LIMIT 1;

INSERT INTO rezervari (utilizator_id, pachet_id, perioada_id, numar_persoane, data_start, data_end, pret_total, status)
SELECT 5, 13, p.id, 3, p.data_start, p.data_end, 4590, 'confirmata'
FROM perioade_disponibile p WHERE p.pachet_id = 13 LIMIT 1;

INSERT INTO plati (rezervare_id, suma, metoda, status, referinta)
SELECT id, pret_total, 'simulat', 'reusita', 'PAY-' || LPAD(id::text, 6, '0') FROM rezervari;

INSERT INTO recenzii (utilizator_id, pachet_id, rating, comentariu, status) VALUES
(3, 4, 5, 'Barcelona a fost absolut magic! Flamenco-ul de seară a fost highlight-ul.', 'aprobata'),
(3, 16, 4, 'Roma frumoasă, ghidul bun. Hotelul ok.', 'aprobata'),
(4, 11, 5, 'Turul gastronomic din Italia - cel mai bun din viața mea!', 'aprobata'),
(5, 13, 5, 'Transilvania merită 100%. Castelul Bran și mâncarea tradițională!', 'aprobata');

INSERT INTO wishlist (utilizator_id, pachet_id) VALUES (3, 6), (3, 11), (4, 1), (5, 3);

INSERT INTO notificari (utilizator_id, tip, subiect, mesaj, email_trimis) VALUES
(3, 'rezervare_confirmata', 'Rezervare confirmată', 'Rezervarea ta pentru City break Barcelona a fost confirmată.', TRUE),
(3, 'promotie', 'Ofertă specială Grecia', 'Reducere 20% la croaziera grecească!', FALSE);
