const nodemailer = require('nodemailer');
const db = require('./db');

let transporter = null;

function getTransporter() {
    if (transporter) return transporter;
    if (process.env.SMTP_HOST) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    } else {
        // Mod simulare: loghează emailurile în consolă
        transporter = {
            sendMail: async (opts) => {
                console.log('\n========== EMAIL SIMULAT ==========');
                console.log('Către:', opts.to);
                console.log('Subiect:', opts.subject);
                console.log('Conținut:', opts.text || opts.html);
                console.log('===================================\n');
                return { messageId: 'sim-' + Date.now() };
            },
        };
    }
    return transporter;
}

async function trimiteEmail(to, subject, text) {
    const t = getTransporter();
    await t.sendMail({
        from: process.env.SMTP_FROM || 'noreply@aventuratravel.ro',
        to,
        subject,
        text,
    });
}

async function notificaUtilizator(utilizatorId, tip, subiect, mesaj, trimiteMail = true) {
    await db.query(
        `INSERT INTO notificari (utilizator_id, tip, subiect, mesaj, email_trimis)
         VALUES ($1, $2, $3, $4, $5)`,
        [utilizatorId, tip, subiect, mesaj, false]
    );

    if (trimiteMail) {
        const u = await db.query('SELECT email FROM utilizatori WHERE id=$1', [utilizatorId]);
        if (u.rows[0]) {
            await trimiteEmail(u.rows[0].email, subiect, mesaj);
            await db.query(
                `UPDATE notificari SET email_trimis=TRUE
                 WHERE utilizator_id=$1 AND tip=$2 AND subiect=$3
                 AND id=(SELECT id FROM notificari WHERE utilizator_id=$1 ORDER BY id DESC LIMIT 1)`,
                [utilizatorId, tip, subiect]
            );
        }
    }
}

module.exports = { trimiteEmail, notificaUtilizator };
