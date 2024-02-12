const Pool = require("pg").Pool;

const pool = new Pool({
  user: "postgres",
  password: "Wotalotigot1!", // OR IF YOU ALREADY HAVE POSTGRESQL SET UP ON YOUR MACHINE, REPLACE WITH YOUR ACTUAL PASSWORD
  host: "localhost",
  port: 5432,
  database: "Homicide_main",
  ssl: false, 
});

module.exports = pool;