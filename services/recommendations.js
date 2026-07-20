const db = require('./db');

/**
 * Recomandări inteligente pe baza istoricului:
 * - același tip_turism
 * - aceeași țară / categorie
 * - filtrare colaborativă simplă (utilizatori cu rezervări similare)
 */
async function recomandaPentruUtilizator(utilizatorId, limita = 6) {
    // Istoric utilizator
    const istoric = await db.query(
        `SELECT p.tip_turism, p.categorie, p.tara, p.id AS pachet_id
         FROM rezervari r
         JOIN pachete_turism p ON p.id = r.pachet_id
         WHERE r.utilizator_id = $1 AND r.status IN ('confirmata','finalizata')`,
        [utilizatorId]
    );

    if (istoric.rows.length === 0) {
        // Fără istoric: cele mai populare
        const pop = await db.query(
            `SELECT p.*, COUNT(r.id) AS nr_rez,
                    COALESCE(AVG(rec.rating), 0) AS rating_mediu
             FROM pachete_turism p
             LEFT JOIN rezervari r ON r.pachet_id = p.id AND r.status IN ('confirmata','finalizata')
             LEFT JOIN recenzii rec ON rec.pachet_id = p.id AND rec.status='aprobata'
             WHERE p.activ = TRUE
             GROUP BY p.id
             ORDER BY nr_rez DESC, rating_mediu DESC
             LIMIT $1`,
            [limita]
        );
        return { tip: 'populare', mesaj: 'Recomandări populare pentru tine', pachete: pop.rows };
    }

    const tipuri = [...new Set(istoric.rows.map((r) => r.tip_turism).filter(Boolean))];
    const tari = [...new Set(istoric.rows.map((r) => r.tara).filter(Boolean))];
    const categorii = [...new Set(istoric.rows.map((r) => r.categorie).filter(Boolean))];
    const dejaRezervate = istoric.rows.map((r) => r.pachet_id);

    // Similaritate pe tip + țară + categorie
    const similare = await db.query(
        `SELECT p.*,
                (CASE WHEN p.tip_turism = ANY($1::tipuri_turism[]) THEN 3 ELSE 0 END +
                 CASE WHEN p.tara = ANY($2::text[]) THEN 2 ELSE 0 END +
                 CASE WHEN p.categorie = ANY($3::categorie_pachet[]) THEN 1 ELSE 0 END) AS scor,
                COALESCE(AVG(rec.rating), 0) AS rating_mediu
         FROM pachete_turism p
         LEFT JOIN recenzii rec ON rec.pachet_id = p.id AND rec.status='aprobata'
         WHERE p.activ = TRUE
           AND NOT (p.id = ANY($4::int[]))
         GROUP BY p.id
         HAVING (CASE WHEN p.tip_turism = ANY($1::tipuri_turism[]) THEN 3 ELSE 0 END +
                 CASE WHEN p.tara = ANY($2::text[]) THEN 2 ELSE 0 END +
                 CASE WHEN p.categorie = ANY($3::categorie_pachet[]) THEN 1 ELSE 0 END) > 0
         ORDER BY scor DESC, rating_mediu DESC
         LIMIT $5`,
        [tipuri, tari, categorii, dejaRezervate, limita]
    );

    // Filtrare colaborativă: pachete rezervate de useri cu gusturi similare
    const colab = await db.query(
        `SELECT p.*, COUNT(*) AS scor_colab
         FROM rezervari r1
         JOIN rezervari r2 ON r1.utilizator_id = r2.utilizator_id
           AND r2.pachet_id = ANY($1::int[])
           AND r1.pachet_id <> ALL($1::int[])
         JOIN pachete_turism p ON p.id = r1.pachet_id
         WHERE r1.status IN ('confirmata','finalizata')
           AND r2.status IN ('confirmata','finalizata')
           AND r1.utilizator_id <> $2
           AND p.activ = TRUE
         GROUP BY p.id
         ORDER BY scor_colab DESC
         LIMIT $3`,
        [dejaRezervate, utilizatorId, Math.ceil(limita / 2)]
    );

    const vazute = new Set();
    const pachete = [];
    for (const p of [...similare.rows, ...colab.rows]) {
        if (!vazute.has(p.id)) {
            vazute.add(p.id);
            pachete.push(p);
        }
        if (pachete.length >= limita) break;
    }

    let mesaj = 'Recomandări pe baza istoricului tău';
    if (tipuri.includes('urban') && tari.includes('Italia')) {
        mesaj = 'Ai rezervat city break-uri în Italia — iată alte city break-uri similare!';
    } else if (tipuri.length) {
        mesaj = `Pe baza interesului tău pentru vacanțe tip „${tipuri.join(', ')}”, îți recomandăm:`;
    }

    return { tip: 'personalizate', mesaj, pachete, tipuri, tari };
}

module.exports = { recomandaPentruUtilizator };
