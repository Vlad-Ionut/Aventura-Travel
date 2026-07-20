const { v4: uuidv4 } = require('uuid');
const db = require('./db');

/**
 * Sistem de plată simulat (Stripe/Netopia/PayPal-like).
 * Acceptă metoda: simulat | stripe | netopia | paypal
 */
async function proceseazaPlata({ rezervareId, suma, metoda = 'simulat', cardInfo = {} }) {
    const referinta = 'PAY-' + uuidv4().slice(0, 8).toUpperCase();
    const metodaNorm = ['simulat', 'stripe', 'netopia', 'paypal'].includes(metoda)
        ? metoda
        : 'simulat';

    // Simulare: carduri care încep cu 4000 eșuează
    let status = 'reusita';
    let detalii = {
        metoda: metodaNorm,
        procesat_la: new Date().toISOString(),
        simulat: true,
    };

    if (metodaNorm === 'simulat' || metodaNorm === 'stripe') {
        if (cardInfo.numar && String(cardInfo.numar).replace(/\s/g, '').startsWith('4000')) {
            status = 'esuata';
            detalii.motiv = 'Card refuzat (simulare)';
        } else {
            detalii.ultimele4 = cardInfo.numar
                ? String(cardInfo.numar).slice(-4)
                : '4242';
        }
    }

    // Delay scurt pentru realism
    await new Promise((r) => setTimeout(r, 400));

    const rez = await db.query(
        `INSERT INTO plati (rezervare_id, suma, metoda, status, referinta, detalii)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [rezervareId, suma, metodaNorm, status, referinta, JSON.stringify(detalii)]
    );

    if (status === 'reusita') {
        await db.query(
            `UPDATE rezervari SET status='confirmata' WHERE id=$1 AND status='pending'`,
            [rezervareId]
        );
    }

    return rez.rows[0];
}

module.exports = { proceseazaPlata };
