import { pool } from "../database";
import bcrypt from "bcrypt";

async function getUserId(username) {
  const text = "SELECT id FROM users WHERE username = $1";
  const values = [username];
  const { rows: results, rowCount: resultsCount } = await pool.query(
    text,
    values
  );
  if (resultsCount) {
    return results[0].id;
  } else {
    return null;
  }
}

async function getUserById(id) {
  const text = "SELECT * FROM users WHERE id = $1";
  const values = [id];
  const { rows: results, rowCount: resultsCount } = await pool.query(
    text,
    values
  );
  if (resultsCount) {
    return results[0];
  } else {
    return null;
  }
}

async function getUserByUsername(username) {
  const text = "SELECT * FROM users WHERE username = $1";
  const values = [username];
  const { rows: results, rowCount: resultsCount } = await pool.query(
    text,
    values
  );
  if (resultsCount) {
    return results[0];
  } else {
    return null;
  }
}

async function getUserByEmail(email) {
  const text = "SELECT * FROM users WHERE email = $1";
  const values = [email];
  const { rows: results, rowCount: resultsCount } = await pool.query(
    text,
    values
  );
  if (resultsCount) {
    return results[0];
  } else {
    return null;
  }
}

async function getUserEmail(username) {
  const text = "SELECT email FROM users WHERE username = $1";
  const values = [username];
  const { rows: results, rowCount: resultsCount } = await pool.query(
    text,
    values
  );
  if (resultsCount) {
    return results[0].email;
  } else {
    return null;
  }
}

async function isUserVerified(username) {
  // doesn't check if user actually exists
  const text = "SELECT verified FROM users WHERE username = $1";
  const values = [username];
  const { rows: results, rowCount: resultsCount } = await pool.query(
    text,
    values
  );
  if (resultsCount && results[0].verified === true) {
    return true;
  } else {
    return false;
  }
}

async function getProfileInfo(id) {
  let text = "SELECT username, email FROM users WHERE id = $1";
  let values = [id];
  console.log("ID", id);
  let res = await pool.query(text, values);
  if (res.rowCount) {
    return res.rows[0];
  } else {
    return null;
  }
}

async function newUser({ email, password, username, name, surname }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const text =
    "INSERT INTO users(email, hashed_password, username, first_name, last_name, verified) VALUES($1, $2, $3, $4, $5, $6)";
  const values = [email, hashedPassword, username, name, surname, false];
  try {
    await pool.query(text, values);
    return true;
  } catch (e) {
    console.log("new user catch:", e);
    return {
      routine: e.routine,
      field: e.constraint.split("_")[1]
    };
  }
}

module.exports = {
  getUserId,
  getUserEmail,
  isUserVerified,
  getProfileInfo,
  getUserById,
  getUserByUsername,
  getUserByEmail,
  newUser
};
