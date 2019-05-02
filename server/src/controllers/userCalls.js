/// * = id, username, hashed_password as "hashedPassword", firstname, lastname, date_of_birth as "dateOfBirth", gender, sexual_orientation as "sexualOrientation", bio, num_pics as "numPics", url_pp as "urlPp", email, last_seen as "lastSeen", position, popularity_score, verified
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
  const text =
    'SELECT id, username, hashed_password as "hashedPassword", firstname, lastname, date_of_birth as "dateOfBirth", gender, sexual_orientation as "sexualOrientation", bio, num_pics as "numPics", url_pp as "urlPp", email, last_seen as "lastSeen", position, popularity_score, verified FROM users WHERE id = $1';
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
  const text =
    'SELECT  id, username, hashed_password as "hashedPassword", firstname, lastname, date_of_birth as "dateOfBirth", gender, sexual_orientation as "sexualOrientation", bio, num_pics as "numPics", url_pp as "urlPp", email, last_seen as "lastSeen", position, popularity_score, verified FROM users WHERE username = $1';
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
  const text =
    'SELECT  id, username, hashed_password as "hashedPassword", firstname, lastname, date_of_birth as "dateOfBirth", gender, sexual_orientation as "sexualOrientation", bio, num_pics as "numPics", url_pp as "urlPp", email, last_seen as "lastSeen", position, popularity_score, verified FROM users WHERE email = $1';
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

async function availEmail(email) {
  const text = "SELECT id FROM users WHERE email = $1";
  const values = [email];
  const { rowCount: resultsCount } = await pool.query(text, values);
  if (resultsCount) {
    return false;
  }
  return true;
}

async function availUsername(username) {
  const text = "SELECT id FROM users WHERE username = $1";
  const values = [username];
  const { rowCount: resultsCount } = await pool.query(text, values);
  if (resultsCount) {
    return false;
  }
  return true;
}

async function newUser({ email, password, username, name, surname }) {
  const available = {
    username: (await availUsername(username)) ? undefined : "Already exists",
    email: (await availEmail(email)) ? undefined : "Already exists"
  };
  if (available.username !== undefined || available.email !== undefined) {
    return available;
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const text =
    "INSERT INTO users(email, hashed_password, username, firstname, lastname, verified) VALUES($1, $2, $3, $4, $5, $6)";
  const values = [email, hashedPassword, username, name, surname, true]; // TRUE TO FALSE TO ENABLE VERIFICATION
  pool.query(text, values);
  return true;
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
