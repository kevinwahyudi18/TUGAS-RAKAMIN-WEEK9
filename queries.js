const Pool = require("pg").Pool;
const pool = new Pool({
    user:"postgres",
    host:"localhost",
    database:"rakamin_week9_assignment",
    password:"181217",
    port:5432,
})

module.exports = pool; 