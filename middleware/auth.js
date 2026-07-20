const jwt = require('jsonwebtoken');
const db = require('../services/db');

const JWT_SECRET = process.env.JWT_SECRET || 'aventura-travel-secret-dev-2026';
const COOKIE_NAME = 'aventura_token';

function signToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, rol: user.rol, nume: user.nume },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

function setAuthCookie(res, token) {
    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'lax',
    });
}

function clearAuthCookie(res) {
    res.clearCookie(COOKIE_NAME);
}

async function attachUser(req, res, next) {
    req.user = null;
    res.locals.user = null;
    try {
        const token = req.cookies?.[COOKIE_NAME] || extractBearer(req);
        if (token) {
            const payload = jwt.verify(token, JWT_SECRET);
            const rez = await db.query(
                'SELECT id, nume, email, rol, telefon, activ FROM utilizatori WHERE id=$1',
                [payload.id]
            );
            if (rez.rows[0] && rez.rows[0].activ) {
                req.user = rez.rows[0];
                res.locals.user = req.user;
            }
        }
    } catch (e) {
        // token invalid
    }
    next();
}

function extractBearer(req) {
    const h = req.headers.authorization;
    if (h && h.startsWith('Bearer ')) return h.slice(7);
    return null;
}

function requireAuth(req, res, next) {
    if (!req.user) {
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(401).json({ error: 'Autentificare necesară' });
        }
        return res.redirect('/login?redirect=' + encodeURIComponent(req.originalUrl));
    }
    next();
}

function requireRole(...roluri) {
    return (req, res, next) => {
        if (!req.user) {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(401).json({ error: 'Autentificare necesară' });
            }
            return res.redirect('/login');
        }
        if (!roluri.includes(req.user.rol)) {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(403).json({ error: 'Acces interzis' });
            }
            return res.status(403).render('pagini/eroare', {
                titlu: 'Acces interzis',
                text: 'Nu ai dreptul să accesezi această pagină.',
                imagine: '/resurse/imagini/erori/interzis.png',
            });
        }
        next();
    };
}

module.exports = {
    JWT_SECRET,
    COOKIE_NAME,
    signToken,
    setAuthCookie,
    clearAuthCookie,
    attachUser,
    requireAuth,
    requireRole,
};
