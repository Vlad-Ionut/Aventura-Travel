# Aventura Travel

Agenție de turism online (proiect universitar) — Express + EJS + PostgreSQL.

## Funcționalități

1. **Autentificare & roluri** — Login/Register cu JWT (cookie), roluri: `administrator`, `angajat`, `client`
2. **Management pachete** — CRUD, categorii, destinații, imagini multiple (upload + comprimare Sharp), prețuri, reduceri, perioade & locuri
3. **Rezervări online** — verificare disponibilitate, anulare, istoric, confirmare email (simulat/SMTP)
4. **Panou Admin** — dashboard, statistici, utilizatori, rezervări, pachete, rapoarte, moderare recenzii
5. **Plăți online** — simulare Stripe / PayPal / Netopia / card (4242=succes, 4000=refuz)
6. **Motor de căutare** — destinație, buget, perioadă, tip vacanță, nr. persoane
7. **Recomandări inteligente** — pe baza istoricului + filtrare colaborativă
8. **Chatbot AI** — rule-based + OpenAI (opțional, `OPENAI_API_KEY`)
9. **Hartă interactivă** — Leaflet (hoteluri, aeroporturi, obiective)
10. **Galerie imagini** — upload, comprimare WebP, preview
11. **Recenzii** — rating, comentarii, moderare
12. **Wishlist** — vacanțe favorite
13. **Notificări** — in-app + email (rezervare confirmată/anulată, promoții)
14. **Dashboard cu grafice** — Chart.js (rezervări/lună, venituri, destinații populare)
15. **Responsive** — desktop / tablet / telefon

## Pornire rapidă

```bash
# PostgreSQL: user vlad1 / parola vlad1 / DB aventuratravel
npm install
npm run db:init
npm start
```

Aplicația rulează pe [http://localhost:8080](http://localhost:8080).

## Conturi demo

| Rol | Email | Parolă |
|-----|-------|--------|
| Administrator | admin@aventuratravel.ro | admin123 |
| Angajat | angajat@aventuratravel.ro | angajat123 |
| Client | client@aventuratravel.ro | client123 |

## Structură

```
index.js              # server Express
routes/               # auth, packages, bookings, admin, features
services/             # db, email, payment, recommendations, chatbot
middleware/auth.js    # JWT
sql/schema.sql        # schema DB
sql/seed.sql          # date demo
views/pagini/         # pagini EJS
resurse/js|css/       # client
```

## Variabile de mediu (`.env`)

- `DB_*` — conexiune PostgreSQL
- `JWT_SECRET` — secret token
- `OPENAI_API_KEY` — opțional, chatbot GPT
- `SMTP_*` — opțional, email real (altfel se loghează în consolă)

## Teste

```bash
npm start   # într-un terminal
npm test    # smoke test API
```
