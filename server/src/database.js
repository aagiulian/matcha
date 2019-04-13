const { Pool } = require("pg");

const pool = new Pool({
  host: "user-db-service",
  port: 5432,
  user: "admin",
  password: "password",
  database: "matcha"
});

// TO CLEAN DB
var DatabaseCleaner = require("database-cleaner");
var databaseCleaner = new DatabaseCleaner("postgresql");
databaseCleaner.clean(pool, () => console.log("Database cleaned !"));
//

module.exports = {
  pool
};
