import { Pool } from "pg";

const pool = new Pool({
  host: "user-db-service",
  port: 5432,
  user: "admin",
  password: "password",
  database: "matcha"
});

export default pool;

// TO CLEAN DB
// var DatabaseCleaner = require("database-cleaner");
// var databaseCleaner = new DatabaseCleaner("postgresql");
// databaseCleaner.clean(pool, () => console.log("Database cleaned !"));
//
//
const hashtags = ["Beachbody", "McDo", "Diet", "AssToMouth", "JustHereForFun"];
const text =
  "INSERT INTO hashtags(name) SELECT unnest FROM unnest($1::text[]) ON CONFLICT DO NOTHING";
const values = [hashtags];
pool.query(text, values);

/*
module.exports = {
  pool
};
*/
