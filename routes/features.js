const express = require('express');
const db = require('../services/db');
const { requireAuth } = require('../middleware/auth');
const { recomandaPentruUtilizator } = require('../services/recommendations');
const { chat } = require('../services/chatbot');

const router = express.Router();

// --- Recenzii ---
router.post('/api/recenzii', requireAuth, async (req, res) => {
    try {
        const { pachet_id, rating, comentariu } = req.body;
        const r = parseInt(rating, 10);
        if (!pachet_id || !(r >= 1 && r <= 5)) {
            return res.status(400).json({ error: 'Rating 1-5 obligatoriu' });
        }
        const rez = await db.query(
            `INSERT INTO recenzii (utilizator_id, pachet_id, rating, comentariu, status)
             VALUES ($1,$2,$3,$4,'pending')
             ON CONFLICT (utilizator_id, pachet_id)
             DO UPDATE SET rating=$3, comentariu=$4, status='pending', data_creare=CURRENT_TIMESTAMP
             RETURNING *`,
            [req.user.id, pachet_id, r, comentariu || null]
        );
        res.json({ ok: true, recenzie: rez.rows[0], mesaj: 'Recenzia așteaptă moderare.' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- Wishlist ---
router.get('/api/wishlist', requireAuth, async (req, res) => {
    const rez = await db.query(
        `SELECT w.id AS wishlist_id, p.*,
                ROUND(p.pret * (1 - COALESCE(p.reducere_procent,0)/100), 2) AS pret_final
         FROM wishlist w
         JOIN pachete_turism p ON p.id=w.pachet_id
         WHERE w.utilizator_id=$1
         ORDER BY w.data_adaugare DESC`,
        [req.user.id]
    );
    res.json(rez.rows);
});

router.post('/api/wishlist/:pachetId', requireAuth, async (req, res) => {
    await db.query(
        `INSERT INTO wishlist (utilizator_id, pachet_id) VALUES ($1,$2)
         ON CONFLICT DO NOTHING`,
        [req.user.id, req.params.pachetId]
    );
    res.json({ ok: true, inWishlist: true });
});

router.delete('/api/wishlist/:pachetId', requireAuth, async (req, res) => {
    await db.query('DELETE FROM wishlist WHERE utilizator_id=$1 AND pachet_id=$2', [
        req.user.id,
        req.params.pachetId,
    ]);
    res.json({ ok: true, inWishlist: false });
});

router.get('/wishlist', requireAuth, async (req, res) => {
    const rez = await db.query(
        `SELECT w.id AS wishlist_id, p.*,
                ROUND(p.pret * (1 - COALESCE(p.reducere_procent,0)/100), 2) AS pret_final
         FROM wishlist w JOIN pachete_turism p ON p.id=w.pachet_id
         WHERE w.utilizator_id=$1 ORDER BY w.data_adaugare DESC`,
        [req.user.id]
    );
    res.render('pagini/wishlist', { items: rez.rows });
});

// --- Notificări ---
router.get('/notificari', requireAuth, (req, res) => {
    res.render('pagini/notificari');
});

router.get('/api/notificari', requireAuth, async (req, res) => {
    const rez = await db.query(
        `SELECT * FROM notificari WHERE utilizator_id=$1 ORDER BY data_creare DESC LIMIT 50`,
        [req.user.id]
    );
    res.json(rez.rows);
});

router.post('/api/notificari/:id/citita', requireAuth, async (req, res) => {
    await db.query('UPDATE notificari SET citita=TRUE WHERE id=$1 AND utilizator_id=$2', [
        req.params.id,
        req.user.id,
    ]);
    res.json({ ok: true });
});

// --- Recomandări ---
router.get('/api/recomandari', async (req, res) => {
    try {
        if (!req.user) {
            const pop = await db.query(
                `SELECT p.*, COUNT(r.id) AS nr_rez
                 FROM pachete_turism p
                 LEFT JOIN rezervari r ON r.pachet_id=p.id AND r.status IN ('confirmata','finalizata')
                 WHERE p.activ=TRUE
                 GROUP BY p.id ORDER BY nr_rez DESC LIMIT 6`
            );
            return res.json({ tip: 'populare', mesaj: 'Destinații populare', pachete: pop.rows });
        }
        const data = await recomandaPentruUtilizator(req.user.id);
        res.json(data);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

router.get('/recomandari', async (req, res) => {
    let data;
    if (req.user) data = await recomandaPentruUtilizator(req.user.id);
    else {
        const pop = await db.query(
            `SELECT p.* FROM pachete_turism p WHERE p.activ=TRUE ORDER BY data_adaugare DESC LIMIT 6`
        );
        data = { tip: 'populare', mesaj: 'Destinații populare', pachete: pop.rows };
    }
    res.render('pagini/recomandari', data);
});

// --- Chatbot ---
router.post('/api/chat', async (req, res) => {
    try {
        const { mesaj } = req.body;
        if (!mesaj || !String(mesaj).trim()) {
            return res.status(400).json({ error: 'Mesaj gol' });
        }
        const raspuns = await chat(String(mesaj).trim(), req.user?.id);
        res.json({ raspuns });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/chat', (req, res) => {
    res.render('pagini/chat');
});

// --- Hartă ---
router.get('/api/harta', async (req, res) => {
    const pachete = await db.query(
        `SELECT id, destinatie, tara, oras, tip_turism, pret, imagine, latitudine, longitudine, hotel_nume
         FROM pachete_turism WHERE activ=TRUE AND latitudine IS NOT NULL`
    );
    const poi = await db.query('SELECT * FROM destinatie_poi');
    res.json({ pachete: pachete.rows, poi: poi.rows });
});

router.get('/harta', (req, res) => {
    res.render('pagini/harta');
});

module.exports = router;
