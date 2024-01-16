const Pool = require("pg").Pool;

const pool = new Pool({
    user: "postgres",
    password: "Wotalotigot1!",
    host: "localhost",
    port: 5432,
    database: "homicides"
});

module.exports = pool;