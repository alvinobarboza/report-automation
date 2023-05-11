const pkg = require('pg');
const { Pool } = pkg;

const IP = process.env.pgid;
const LOGIN = process.env.pglogin;
const PASSWORD = process.env.pgpassword;
const DB = process.env.pgdb;

const pool = new Pool({
    user: LOGIN,
    password: PASSWORD,
    database: DB,
    host: IP,
    port: 5432,
});

module.exports = {
    async query(text, params) {
        const start = Date.now();
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        return res;
    }
}