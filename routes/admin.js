const express = require('express');
const db = require('../services/db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { notificaUtilizator } = require('../services/email');

const router = express.Router();

router.get('/admin', requireAuth, requireRole('administrator', 'angajat'), async (req, res) => {
    res.render('pagini/admin', { sectiune: req.query.sectiune || 'dashboard' });
});

router.get('/api/admin/stats', requireAuth, requireRole('administrator', 'angajat'), async (req, res) => {
    try {
        const clienti = await db.query(`SELECT COUNT(*)::int AS n FROM utilizatori WHERE rol='client'`);
        const pachete = await db.query(`SELECT COUNT(*)::int AS n FROM pachete_turism WHERE activ=TRUE`);
        const rezervari = await db.query(`SELECT COUNT(*)::int AS n FROM rezervari`);
        const venituri = await db.query(
            `SELECT COALESCE(SUM(suma),0)::float AS total FROM plati WHERE status='reusita'`
        );
        const peLuna = await db.query(
            `SELECT TO_CHAR(data_creare, 'YYYY-MM') AS luna, COUNT(*)::int AS nr
             FROM rezervari
             WHERE data_creare >= CURRENT_DATE - INTERVAL '12 months'
             GROUP BY 1 ORDER BY 1`
        );
        const venituriLuna = await db.query(
            `SELECT TO_CHAR(data_plata, 'YYYY-MM') AS luna, COALESCE(SUM(suma),0)::float AS total
             FROM plati WHERE status='reusita' AND data_plata >= CURRENT_DATE - INTERVAL '12 months'
             GROUP BY 1 ORDER BY 1`
        );
        const populare = await db.query(
            `SELECT p.destinatie, COUNT(r.id)::int AS nr
             FROM rezervari r JOIN pachete_turism p ON p.id=r.pachet_id
             WHERE r.status IN ('confirmata','finalizata','pending')
             GROUP BY p.destinatie ORDER BY nr DESC LIMIT 8`
        );
        const peStatus = await db.query(
            `SELECT status::text, COUNT(*)::int AS nr FROM rezervari GROUP BY status`
        );

        res.json({
            clienti: clienti.rows[0].n,
            pachete: pachete.rows[0].n,
            rezervari: rezervari.rows[0].n,
            venituri: venituri.rows[0].total,
            rezervariPeLuna: peLuna.rows,
            venituriPeLuna: venituriLuna.rows,
            destinatiiPopulare: populare.rows,
            peStatus: peStatus.rows,
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

router.get('/api/admin/utilizatori', requireAuth, requireRole('administrator'), async (req, res) => {
    const rez = await db.query(
        `SELECT id, nume, email, rol, telefon, activ, data_creare FROM utilizatori ORDER BY id`
    );
    res.json(rez.rows);
});

router.patch('/api/admin/utilizatori/:id', requireAuth, requireRole('administrator'), async (req, res) => {
    const { rol, activ } = req.body;
    const rez = await db.query(
        `UPDATE utilizatori SET
           rol = COALESCE($1::rol_utilizator, rol),
           activ = COALESCE($2, activ)
         WHERE id=$3
         RETURNING id, nume, email, rol, activ`,
        [rol || null, typeof activ === 'boolean' ? activ : null, req.params.id]
    );
    res.json(rez.rows[0]);
});

router.get('/api/admin/rezervari', requireAuth, requireRole('administrator', 'angajat'), async (req, res) => {
    const rez = await db.query(
        `SELECT r.*, u.nume AS client, u.email, p.destinatie
         FROM rezervari r
         JOIN utilizatori u ON u.id=r.utilizator_id
         JOIN pachete_turism p ON p.id=r.pachet_id
         ORDER BY r.data_creare DESC
         LIMIT 200`
    );
    res.json(rez.rows);
});

router.patch('/api/admin/rezervari/:id', requireAuth, requireRole('administrator', 'angajat'), async (req, res) => {
    const { status } = req.body;
    const rez = await db.query(
        `UPDATE rezervari SET status=$1::status_rezervare WHERE id=$2 RETURNING *`,
        [status, req.params.id]
    );
    if (rez.rows[0]) {
        await notificaUtilizator(
            rez.rows[0].utilizator_id,
            'status_rezervare',
            'Actualizare rezervare',
            `Rezervarea #${rez.rows[0].id} are acum statusul: ${status}.`
        );
    }
    res.json(rez.rows[0]);
});

router.get('/api/admin/raport', requireAuth, requireRole('administrator'), async (req, res) => {
    const rez = await db.query(
        `SELECT p.destinatie, p.tip_turism, p.tara,
                COUNT(r.id)::int AS nr_rezervari,
                COALESCE(SUM(CASE WHEN pl.status='reusita' THEN pl.suma END),0)::float AS venituri,
                COALESCE(AVG(rec.rating),0)::float AS rating
         FROM pachete_turism p
         LEFT JOIN rezervari r ON r.pachet_id=p.id
         LEFT JOIN plati pl ON pl.rezervare_id=r.id
         LEFT JOIN recenzii rec ON rec.pachet_id=p.id AND rec.status='aprobata'
         GROUP BY p.id
         ORDER BY venituri DESC`
    );
    res.json(rez.rows);
});

router.get('/api/admin/recenzii', requireAuth, requireRole('administrator', 'angajat'), async (req, res) => {
    const rez = await db.query(
        `SELECT r.*, u.nume, p.destinatie
         FROM recenzii r
         JOIN utilizatori u ON u.id=r.utilizator_id
         JOIN pachete_turism p ON p.id=r.pachet_id
         ORDER BY r.data_creare DESC`
    );
    res.json(rez.rows);
});

router.patch('/api/admin/recenzii/:id', requireAuth, requireRole('administrator', 'angajat'), async (req, res) => {
    const rez = await db.query(
        `UPDATE recenzii SET status=$1::status_recenzie WHERE id=$2 RETURNING *`,
        [req.body.status, req.params.id]
    );
    res.json(rez.rows[0]);
});

module.exports = router;
