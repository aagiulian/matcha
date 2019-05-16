/// * = id, username, hashed_password as "hashedPassword", firstname, lastname, date_of_birth as "dateOfBirth", gender, sexual_orientation as "sexualOrientation", bio, num_pics as "numPics", url_pp as "urlPp", email, last_seen as "lastSeen", location, popularity_score, verified
import { pool } from "../database";
import bcrypt from "bcrypt";
import moment from "moment";

const formatLocation = (location) => "(" + location.lng + "," + location.lat + ")";

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
    `SELECT id, username, hashed_password as "hashedPassword", firstname, lastname, date_of_birth as "dateOfBirth", gender, sexual_orientation as "sexualOrientation", bio, num_pics as "numPics", url_pp as "urlPp", email, last_seen as "lastSeen", location, popularity_score, verified FROM users WHERE id = $1`;
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
    'SELECT  id, username, hashed_password as "hashedPassword", firstname, lastname, date_of_birth as "dateOfBirth", gender, sexual_orientation as "sexualOrientation", bio, num_pics as "numPics", url_pp as "urlPp", email, last_seen as "lastSeen", location, popularity_score, verified FROM users WHERE username = $1';
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
    'SELECT id, username, hashed_password as "hashedPassword", firstname, lastname, date_of_birth as "dateOfBirth", gender, sexual_orientation as "sexualOrientation", bio, num_pics as "numPics", url_pp as "urlPp", email, last_seen as "lastSeen", location, popularity_score, verified FROM users WHERE email = $1';
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
  let text =
    'SELECT id, username, hashed_password as "hashedPassword", firstname, lastname, date_of_birth as "dateOfBirth", gender, sexual_orientation as "sexualOrientation", bio, num_pics as "numPics", url_pp as "urlPp", email, last_seen as "lastSeen", location, popularity_score, verified FROM users WHERE id = $1';
  let values = [id];
  let res = await pool.query(text, values);
  if (res.rowCount) {
    let ret = res.rows[0];
    if (ret.dateOfBirth !== null) {
      ret.dateOfBirth = moment(ret.dateOfBirth).format(
        "YYYY-MM-DD"
      );
    }
    if (ret.location) {
      ret.location = {lng: ret.location.x,
                    lat: ret.location.y};
    } else {
      ret.location = {lng: null,
                      lat: null};
    }
    console.log("res query:", ret);

    return ret;
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

async function newUser({ email, password, username, firstname, lastname, location }) {
  const available = {
    username: (await availUsername(username)) ? undefined : "Already exists",
    email: (await availEmail(email)) ? undefined : "Already exists"
  };
  if (available.username !== undefined || available.email !== undefined) {
    return available;
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const text =
    "INSERT INTO users(email, hashed_password, username, firstname, lastname, sexual_orientation, lookingfor, location, verified) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)";
  const values = [
    email,
    hashedPassword,
    username,
    firstname,
    lastname,
    "bisexual",
    "{male, female}",
    formatLocation(location),
    true
  ]; // TRUE TO FALSE TO ENABLE VERIFICATION
  pool.query(text, values);
  return true;
}

// missing images, hashtagslj
async function updateUser(
  {
    username,
    firstname,
    lastname,
    email,
    gender,
    bio,
    dateOfBirth,
    sexualOrientation,
    location
  },
  id
) {
  let dict = {
    male: {
      heterosexual: "{female}",
      homosexual: "{male}",
      bisexual: "{male,female}"
    },
    female: {
      heterosexual: "{male}",
      homosexual: "{female}",
      bisexual: "{male,female}"
    }
  };
  const lookingfor = gender ? dict[gender][sexualOrientation] : "{male,female}";
  let available = {};
  const user = await getUserById(id);
  if (user.username !== username) {
    available.username = (await availUsername(username))
      ? undefined
      : "Already exists";
  }
  if (user.email !== email) {
    available.email = (await availEmail(email)) ? undefined : "Already exists";
  }
  if (available.username !== undefined || available.email !== undefined) {
    return available;
  }

  const text =
    "UPDATE users SET email = $2, username = $3, firstname = $4, lastname = $5, gender = $6, bio = $7, date_of_birth = $8, sexual_orientation = $9, lookingfor = $10, location = $11 WHERE id = $1";
  const values = [
    id,
    email,
    username,
    firstname,
    lastname,
    gender,
    bio,
    dateOfBirth,
    sexualOrientation,
    lookingfor,
    formatLocation(location)
  ];
  pool.query(text, values)
    .then(res => console.log("updatedMe", res.rows[0]))
    .catch(err => console.log("error executing query", err.stack));
  return true;
}

async function addVisit(userId, userVisitedId) {
  let text = "SELECT id FROM visited WHERE user_id = $1 AND user_visited = $2";
  let values = [userId, userVisitedId, moment.now()];
  let res = await pool.query(text, values);
  if (res.rowCount) {
    text =
      "UPDATE visited SET datetime = $3 WHERE user_id = $1 AND user_visited = $2";
    pool.query(text, values);
  } else {
    text =
      "INSERT INTO visited(user_id, user_visited, datetime) VALUES ($1, $2, $3)";
    pool.query(text, values);
  }
}

async function getVisit(userVisitedId) {
  const text = "SELECT datetime, user_id FROM visited WHERE user_visited = $1";
  const values = [userVisitedId];
  let res = await pool.query(text, values);
  if (res.rowCount) {
    console.log(res);
    return res;
  } else {
    return null;
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
  newUser,
  updateUser,
  getVisit,
  addVisit
};
