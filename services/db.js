require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    database: process.env.DB_NAME || 'aventuratravel',
    user: process.env.DB_USER || 'vlad1',
    password: process.env.DB_PASSWORD || 'vlad1',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

pool.on('error', (err) => {
    console.error('Eroare neașteptată pe clientul idle PostgreSQL', err);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
};
