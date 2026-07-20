const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const db = require('../services/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'fisiere_uploadate', 'pachete');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
        else cb(new Error('Doar imagini JPEG/PNG/WebP/GIF'));
    },
});

function pretFinal(p) {
    const r = parseFloat(p.reducere_procent) || 0;
    return Math.round(parseFloat(p.pret) * (1 - r / 100) * 100) / 100;
}

router.get('/produse', async (req, res) => {
    try {
        let clauzaWhere = ' WHERE activ=TRUE';
        const params = [];
        if (req.query.tip) {
            params.push(req.query.tip);
            clauzaWhere += ` AND tip_turism=$${params.length}`;
        }
        const rez = await db.query(`SELECT * FROM pachete_turism ${clauzaWhere} ORDER BY data_adaugare DESC`, params);
        const optiuni = await db.query('SELECT unnest(enum_range(NULL::categorie_pachet)) AS unnest');
        const tipuri = await db.query('SELECT unnest(enum_range(NULL::tipuri_turism)) AS unnest');
        res.render('pagini/produse', {
            produse: rez.rows.map((p) => ({ ...p, pret_final: pretFinal(p) })),
            optiuni: optiuni.rows,
            tipuri: tipuri.rows,
            filtruTip: req.query.tip || '',
        });
    } catch (e) {
        console.error(e);
        res.status(500).render('pagini/eroare', {
            titlu: 'Eroare',
            text: 'Nu s-au putut încărca pachetele.',
            imagine: '/resurse/imagini/erori/interzis.png',
        });
    }
});

router.get('/produs/:id', async (req, res) => {
    try {
        const rez = await db.query('SELECT * FROM pachete_turism WHERE id=$1 AND activ=TRUE', [req.params.id]);
        if (!rez.rows.length) {
            return res.status(404).render('pagini/eroare', {
                titlu: 'Pachet inexistent',
                text: 'Pachetul căutat nu există.',
                imagine: '/resurse/imagini/erori/interzis.png',
            });
        }
        const prod = { ...rez.rows[0], pret_final: pretFinal(rez.rows[0]) };
        const imagini = await db.query(
            'SELECT * FROM pachet_imagini WHERE pachet_id=$1 ORDER BY ordine',
            [prod.id]
        );
        const perioade = await db.query(
            `SELECT * FROM perioade_disponibile
             WHERE pachet_id=$1 AND data_start >= CURRENT_DATE AND locuri > 0
             ORDER BY data_start LIMIT 12`,
            [prod.id]
        );
        const recenzii = await db.query(
            `SELECT r.*, u.nume FROM recenzii r
             JOIN utilizatori u ON u.id=r.utilizator_id
             WHERE r.pachet_id=$1 AND r.status='aprobata'
             ORDER BY r.data_creare DESC`,
            [prod.id]
        );
        const rating = await db.query(
            `SELECT COALESCE(AVG(rating),0) AS medie, COUNT(*) AS total
             FROM recenzii WHERE pachet_id=$1 AND status='aprobata'`,
            [prod.id]
        );
        let inWishlist = false;
        if (req.user) {
            const w = await db.query(
                'SELECT id FROM wishlist WHERE utilizator_id=$1 AND pachet_id=$2',
                [req.user.id, prod.id]
            );
            inWishlist = w.rows.length > 0;
        }
        const poi = await db.query('SELECT * FROM destinatie_poi WHERE pachet_id=$1', [prod.id]);
        res.render('pagini/produs', {
            prod,
            imagini: imagini.rows,
            perioade: perioade.rows,
            recenzii: recenzii.rows,
            rating: rating.rows[0],
            inWishlist,
            poi: poi.rows,
        });
    } catch (e) {
        console.error(e);
        res.status(500).render('pagini/eroare', {
            titlu: 'Eroare',
            text: 'Eroare la încărcarea pachetului.',
            imagine: '/resurse/imagini/erori/interzis.png',
        });
    }
});

// Căutare avansată
router.get('/api/search', async (req, res) => {
    try {
        const { destinatie, buget_min, buget_max, tip, categorie, persoane, data_start, data_end, q } = req.query;
        const params = [];
        let where = ' WHERE p.activ=TRUE';

        if (q) {
            params.push('%' + q + '%');
            where += ` AND (p.destinatie ILIKE $${params.length} OR p.descriere ILIKE $${params.length} OR p.tara ILIKE $${params.length} OR p.oras ILIKE $${params.length})`;
        }
        if (destinatie) {
            params.push('%' + destinatie + '%');
            where += ` AND (p.destinatie ILIKE $${params.length} OR p.tara ILIKE $${params.length} OR p.oras ILIKE $${params.length})`;
        }
        if (tip) {
            params.push(tip);
            where += ` AND p.tip_turism=$${params.length}`;
        }
        if (categorie) {
            params.push(categorie);
            where += ` AND p.categorie=$${params.length}`;
        }
        if (buget_min) {
            params.push(parseFloat(buget_min));
            where += ` AND p.pret * (1 - COALESCE(p.reducere_procent,0)/100) >= $${params.length}`;
        }
        if (buget_max) {
            params.push(parseFloat(buget_max));
            where += ` AND p.pret * (1 - COALESCE(p.reducere_procent,0)/100) <= $${params.length}`;
        }
        if (persoane) {
            params.push(parseInt(persoane, 10));
            where += ` AND p.locuri_disponibile >= $${params.length}`;
        }

        let join = '';
        if (data_start || data_end) {
            join = ' JOIN perioade_disponibile pd ON pd.pachet_id=p.id AND pd.locuri>0';
            if (data_start) {
                params.push(data_start);
                where += ` AND pd.data_start >= $${params.length}`;
            }
            if (data_end) {
                params.push(data_end);
                where += ` AND pd.data_end <= $${params.length}`;
            }
        }

        const sql = `SELECT DISTINCT p.* FROM pachete_turism p ${join} ${where} ORDER BY p.pret ASC LIMIT 50`;
        const rez = await db.query(sql, params);
        res.json({
            results: rez.rows.map((p) => ({ ...p, pret_final: pretFinal(p) })),
            count: rez.rows.length,
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Eroare căutare' });
    }
});

router.get('/cautare', (req, res) => {
    res.render('pagini/cautare', { query: req.query });
});

// CRUD Admin/Angajat
router.get('/api/pachete', async (req, res) => {
    const rez = await db.query('SELECT * FROM pachete_turism ORDER BY id DESC');
    res.json(rez.rows);
});

router.post('/api/pachete', requireAuth, requireRole('administrator', 'angajat'), async (req, res) => {
    try {
        const b = req.body;
        const rez = await db.query(
            `INSERT INTO pachete_turism
             (destinatie, tara, oras, descriere, pret, reducere_procent, durata_zile, tip_turism, categorie,
              facilitati, locuri_disponibile, imagine, latitudine, longitudine, hotel_nume)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
            [
                b.destinatie, b.tara, b.oras, b.descriere, b.pret, b.reducere_procent || 0,
                b.durata_zile, b.tip_turism, b.categorie,
                Array.isArray(b.facilitati) ? b.facilitati : (b.facilitati || '').split(',').map((s) => s.trim()).filter(Boolean),
                b.locuri_disponibile || 20, b.imagine || null,
                b.latitudine || null, b.longitudine || null, b.hotel_nume || null,
            ]
        );
        res.json(rez.rows[0]);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

router.put('/api/pachete/:id', requireAuth, requireRole('administrator', 'angajat'), async (req, res) => {
    try {
        const b = req.body;
        const rez = await db.query(
            `UPDATE pachete_turism SET
             destinatie=$1, tara=$2, oras=$3, descriere=$4, pret=$5, reducere_procent=$6,
             durata_zile=$7, tip_turism=$8, categorie=$9, facilitati=$10, locuri_disponibile=$11,
             imagine=COALESCE($12, imagine), latitudine=$13, longitudine=$14, hotel_nume=$15,
             activ=COALESCE($16, activ)
             WHERE id=$17 RETURNING *`,
            [
                b.destinatie, b.tara, b.oras, b.descriere, b.pret, b.reducere_procent || 0,
                b.durata_zile, b.tip_turism, b.categorie,
                Array.isArray(b.facilitati) ? b.facilitati : (b.facilitati || '').split(',').map((s) => s.trim()).filter(Boolean),
                b.locuri_disponibile, b.imagine || null,
                b.latitudine || null, b.longitudine || null, b.hotel_nume || null,
                b.activ, req.params.id,
            ]
        );
        res.json(rez.rows[0]);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

router.delete('/api/pachete/:id', requireAuth, requireRole('administrator'), async (req, res) => {
    await db.query('UPDATE pachete_turism SET activ=FALSE WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
});

router.post(
    '/api/pachete/:id/imagini',
    requireAuth,
    requireRole('administrator', 'angajat'),
    upload.array('imagini', 8),
    async (req, res) => {
        try {
            const saved = [];
            for (let i = 0; i < (req.files || []).length; i++) {
                const file = req.files[i];
                const nume = `pachet_${req.params.id}_${Date.now()}_${i}.webp`;
                const cale = path.join(uploadDir, nume);
                // Compresie + preview
                await sharp(file.buffer)
                    .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toFile(cale);
                const preview = path.join(uploadDir, 'thumb_' + nume);
                await sharp(file.buffer).resize(300, 200, { fit: 'cover' }).webp({ quality: 70 }).toFile(preview);
                const rel = '/fisiere_uploadate/pachete/' + nume;
                const ins = await db.query(
                    `INSERT INTO pachet_imagini (pachet_id, cale, ordine, alt_text)
                     VALUES ($1,$2,$3,$4) RETURNING *`,
                    [req.params.id, rel, i, req.body.alt_text || file.originalname]
                );
                saved.push(ins.rows[0]);
            }
            if (saved[0]) {
                await db.query('UPDATE pachete_turism SET imagine=$1 WHERE id=$2 AND (imagine IS NULL OR imagine=\'\')', [
                    saved[0].cale,
                    req.params.id,
                ]);
            }
            res.json({ ok: true, imagini: saved });
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: e.message });
        }
    }
);

router.post('/api/pachete/:id/perioade', requireAuth, requireRole('administrator', 'angajat'), async (req, res) => {
    const { data_start, data_end, locuri, pret_special } = req.body;
    const rez = await db.query(
        `INSERT INTO perioade_disponibile (pachet_id, data_start, data_end, locuri, pret_special)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [req.params.id, data_start, data_end, locuri || 20, pret_special || null]
    );
    res.json(rez.rows[0]);
});

module.exports = router;
