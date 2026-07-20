/**
 * Chatbot AI pentru AventuraTravel.
 * Folosește OpenAI dacă OPENAI_API_KEY e setat, altfel răspunsuri rule-based.
 */

const db = require('./db');

const PROGRAM_AGENTIE = `
Program agenție Aventura Travel:
Luni–Vineri: 09:00–18:00
Sâmbătă: 10:00–14:00
Duminică: închis
Telefon: 021 123 4567
Email: contact@aventuratravel.ro
Adresă: Str. Călătoriilor nr. 10, București
`;

async function raspunsRuleBased(mesaj, userId) {
    const m = (mesaj || '').toLowerCase();

    if (/program|orar|deschis|când.*deschis|cand.*deschis/.test(m)) {
        return PROGRAM_AGENTIE.trim();
    }

    if (/salut|bună|buna|hello|hi|hey/.test(m)) {
        return 'Bună! Sunt asistentul Aventura Travel. Te pot ajuta cu destinații, recomandări, programul agenției sau informații despre pachete. Cu ce te pot ajuta?';
    }

    if (/recomand|sugest|ce.*vacan|unde.*merg|destina/.test(m)) {
        let tip = null;
        if (/city.?break|urban|oraș|oras/.test(m)) tip = 'urban';
        else if (/aventura|munte|safari|trek/.test(m)) tip = 'aventura';
        else if (/relax|plaj|mare|all.?inclusive/.test(m)) tip = 'relaxare';
        else if (/cultur|muzeu|istor/.test(m)) tip = 'cultural';

        let q = `SELECT destinatie, pret, durata_zile, tip_turism, reducere_procent
                 FROM pachete_turism WHERE activ=TRUE`;
        const params = [];
        if (tip) {
            params.push(tip);
            q += ` AND tip_turism=$${params.length}`;
        }
        if (/italia|rome|roma|florent|vene/.test(m)) {
            params.push('Italia');
            q += ` AND tara=$${params.length}`;
        }
        if (/ieftin|buget|sub\s*(\d+)/.test(m)) {
            const match = m.match(/sub\s*(\d+)/);
            const buget = match ? parseInt(match[1], 10) : 1500;
            params.push(buget);
            q += ` AND pret * (1 - COALESCE(reducere_procent,0)/100) <= $${params.length}`;
        }
        q += ' ORDER BY pret ASC LIMIT 5';
        const rez = await db.query(q, params);
        if (!rez.rows.length) {
            return 'Nu am găsit pachete pentru criteriile tale. Încearcă tipuri: cultural, aventura, relaxare, urban.';
        }
        const linii = rez.rows.map((p) => {
            const pretFinal = Math.round(p.pret * (1 - (p.reducere_procent || 0) / 100));
            return `• ${p.destinatie} — ${pretFinal} RON / ${p.durata_zile} zile (${p.tip_turism})`;
        });
        return 'Iată câteva recomandări:\n' + linii.join('\n') + '\n\nPoți vedea detalii pe pagina Destinații.';
    }

    if (/pret|preț|cost|cât cost|cat cost/.test(m)) {
        const rez = await db.query(
            `SELECT destinatie, pret, reducere_procent FROM pachete_turism WHERE activ=TRUE ORDER BY pret ASC LIMIT 8`
        );
        return (
            'Prețuri orientative (RON/pers):\n' +
            rez.rows
                .map((p) => {
                    const f = Math.round(p.pret * (1 - (p.reducere_procent || 0) / 100));
                    return `• ${p.destinatie}: ${f} RON${p.reducere_procent > 0 ? ` (−${p.reducere_procent}%)` : ''}`;
                })
                .join('\n')
        );
    }

    if (/anulare|anulez|cancel/.test(m)) {
        return 'Poți anula o rezervare din Contul meu → Rezervările mele, dacă statusul este „pending” sau „confirmata”. Vei primi confirmare pe email.';
    }

    if (/plata|plată|card|stripe|paypal|netopia/.test(m)) {
        return 'Acceptăm plăți simulate: card (Stripe-like), PayPal și Netopia. La checkout alegi metoda. Pentru test, folosește card 4242... (succes) sau 4000... (refuz).';
    }

    if (/wishlist|favorit|inimioar/.test(m)) {
        return 'Poți salva vacanțele favorite apăsând ❤️ pe pagina pachetului. Le găsești apoi în Cont → Wishlist.';
    }

    // Căutare după nume destinatie în mesaj
    const dest = await db.query(
        `SELECT destinatie, descriere, pret, durata_zile, tip_turism, hotel_nume
         FROM pachete_turism WHERE activ=TRUE
           AND (LOWER(destinatie) LIKE $1 OR LOWER(tara) LIKE $1 OR LOWER(oras) LIKE $1)
         LIMIT 3`,
        ['%' + m.slice(0, 40).replace(/[^a-zăâîșț ]/gi, '') + '%']
    );
    if (dest.rows.length && m.length > 3) {
        return dest.rows
            .map(
                (p) =>
                    `${p.destinatie}: ${p.descriere}\nPreț de la ${p.pret} RON, ${p.durata_zile} zile, tip ${p.tip_turism}. Hotel: ${p.hotel_nume || 'N/A'}.`
            )
            .join('\n\n');
    }

    return (
        'Pot răspunde la: program agenție, recomandări de vacanțe, prețuri, anulare rezervare, plăți, wishlist.\n' +
        'Exemple: „Recomandă un city break în Italia”, „Care e programul?”, „Pachete sub 2000 RON”.'
    );
}

async function chat(mesaj, userId) {
    if (process.env.OPENAI_API_KEY) {
        try {
            const pachete = await db.query(
                `SELECT destinatie, pret, tip_turism, durata_zile, tara FROM pachete_turism WHERE activ=TRUE LIMIT 20`
            );
            const context =
                'Ești asistentul agenției Aventura Travel (română). Date pachete:\n' +
                JSON.stringify(pachete.rows) +
                '\n' +
                PROGRAM_AGENTIE;

            const resp = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + process.env.OPENAI_API_KEY,
                },
                body: JSON.stringify({
                    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: context },
                        { role: 'user', content: mesaj },
                    ],
                    max_tokens: 500,
                }),
            });
            if (resp.ok) {
                const data = await resp.json();
                return data.choices?.[0]?.message?.content || (await raspunsRuleBased(mesaj, userId));
            }
        } catch (e) {
            console.error('OpenAI error:', e.message);
        }
    }
    return raspunsRuleBased(mesaj, userId);
}

module.exports = { chat, PROGRAM_AGENTIE };
