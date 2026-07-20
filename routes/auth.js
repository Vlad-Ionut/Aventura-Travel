const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../services/db');
const {
    signToken,
    setAuthCookie,
    clearAuthCookie,
    requireAuth,
} = require('../middleware/auth');

const router = express.Router();

router.get('/login', (req, res) => {
    if (req.user) return res.redirect('/');
    res.render('pagini/login', {
        eroare: null,
        redirect: req.query.redirect || '/',
    });
});

router.get('/register', (req, res) => {
    if (req.user) return res.redirect('/');
    res.render('pagini/register', { eroare: null });
});

router.post('/api/auth/register', async (req, res) => {
    try {
        const { nume, email, parola, telefon } = req.body;
        if (!nume || !email || !parola || parola.length < 6) {
            return res.status(400).json({ error: 'Completează toate câmpurile (parolă min. 6 caractere).' });
        }
        const exista = await db.query('SELECT id FROM utilizatori WHERE email=$1', [email.toLowerCase()]);
        if (exista.rows.length) {
            return res.status(400).json({ error: 'Email-ul este deja înregistrat.' });
        }
        const hash = await bcrypt.hash(parola, 10);
        const rez = await db.query(
            `INSERT INTO utilizatori (nume, email, parola_hash, telefon, rol)
             VALUES ($1, $2, $3, $4, 'client') RETURNING id, nume, email, rol`,
            [nume.trim(), email.toLowerCase().trim(), hash, telefon || null]
        );
        const user = rez.rows[0];
        const token = signToken(user);
        setAuthCookie(res, token);
        res.json({ ok: true, user, token });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Eroare la înregistrare.' });
    }
});

router.post('/api/auth/login', async (req, res) => {
    try {
        const { email, parola } = req.body;
        const rez = await db.query(
            'SELECT * FROM utilizatori WHERE email=$1 AND activ=TRUE',
            [(email || '').toLowerCase().trim()]
        );
        const user = rez.rows[0];
        if (!user || !(await bcrypt.compare(parola || '', user.parola_hash))) {
            return res.status(401).json({ error: 'Email sau parolă greșită.' });
        }
        const token = signToken(user);
        setAuthCookie(res, token);
        res.json({
            ok: true,
            user: { id: user.id, nume: user.nume, email: user.email, rol: user.rol },
            token,
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Eroare la autentificare.' });
    }
});

router.post('/api/auth/logout', (req, res) => {
    clearAuthCookie(res);
    res.json({ ok: true });
});

router.get('/api/auth/me', requireAuth, (req, res) => {
    res.json({ user: req.user });
});

router.get('/logout', (req, res) => {
    clearAuthCookie(res);
    res.redirect('/');
});

module.exports = router;
