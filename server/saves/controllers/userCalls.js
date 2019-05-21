/// * = id, username, hashed_password as "hashedPassword", firstname, lastname, date_of_birth as "dateOfBirth", gender, sexual_orientation as "sexualOrientation", bio, num_pics as "numPics", url_pp as "urlPp", email, last_seen as "lastSeen", position, popularity_score, verified
import { pool } from "../database";
import bcrypt from "bcrypt";
import moment from "moment";

async function getUserId(username) {
  const text = `
    SELECT 
      id 
    FROM 
      users 
    WHERE 
      username = $1`;
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
  const text = `
    SELECT 
      id, 
      username, 
      hashed_password as "hashedPassword", 
      firstname, 
      lastname, 
      date_of_birth as "dateOfBirth", 
      gender, 
      sexual_orientation as "sexualOrientation", 
      bio, 
      num_pics as "numPics", 
      url_pp as "urlPp", 
      email, 
      last_seen as "lastSeen", 
      position, 
      popularity_score, 
      verified 
    FROM 
      users 
    WHERE 
      id = $1`;
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
    'SELECT id, username, hashed_password as "hashedPassword", firstname, lastname, date_of_birth as "dateOfBirth", gender, sexual_orientation as "sexualOrientation", bio, num_pics as "numPics", url_pp as "urlPp", email, last_seen as "lastSeen", position, popularity_score, verified FROM users WHERE email = $1';
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
  const text = `
    SELECT 
      email 
    FROM 
      users 
    WHERE 
      username = $1 `;
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
  const text = `
    SELECT 
      verified 
    FROM 
      users 
    WHERE 
      username = $1`;
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
  let text = `
    SELECT 
      users.id, 
      users.username, 
      users.hashed_password as "hashedPassword", 
      users.firstname, 
      users.lastname, 
      users.date_of_birth as "dateOfBirth", 
      users.gender, 
      users.sexual_orientation as "sexualOrientation", 
      users.bio, 
      users.num_pics as "numPics", 
      users.url_pp as "urlPp", 
      users.email, 
      users.last_seen as "lastSeen", 
      users.position, 
      users.popularity_score, 
      users.verified,
      pics.url
    FROM 
      users 
    LEFT JOIN 
      pics 
    ON 
      pics.user_id = users.id 
    WHERE 
      users.id = $1`;
  let values = [id];
  let res = await pool.query(text, values);
  if (res.rowCount) {
    if (res.rows[0].dateOfBirth !== null) {
      res.rows[0].dateOfBirth = moment(res.rows[0].dateOfBirth).format(
        "YYYY-MM-DD"
      );
    }
    return res.rows[0];
  } else {
    return null;
  }
}

async function availEmail(email) {
  const text = `
    SELECT 
      id 
    FROM 
      users 
    WHERE 
      email = $1`;
  const values = [email];
  const { rowCount: resultsCount } = await pool.query(text, values);
  if (resultsCount) {
    return false;
  }
  return true;
}

async function availUsername(username) {
  const text = `
    SELECT 
      id 
    FROM 
      users 
    WHERE 
      username = $1`;
  const values = [username];
  const { rowCount: resultsCount } = await pool.query(text, values);
  if (resultsCount) {
    return false;
  }
  return true;
}

async function newUser({ email, password, username, firstname, lastname }) {
  const available = {
    username: (await availUsername(username)) ? undefined : "Already exists",
    email: (await availEmail(email)) ? undefined : "Already exists"
  };
  if (available.username !== undefined || available.email !== undefined) {
    return available;
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const text = `
    INSERT INTO 
      users(email, 
            hashed_password, 
            username, firstname, 
            lastname, 
            sexual_orientation, 
            lookingfor, 
            verified) 
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8)`;
  const values = [
    email,
    hashedPassword,
    username,
    firstname,
    lastname,
    "bisexual",
    "{male, female}",
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
    tags
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

  const text = `
    UPDATE 
      users 
    SET 
      email = $2, 
      username = $3, 
      firstname = $4, 
      lastname = $5, 
      gender = $6, 
      bio = $7, 
      date_of_birth = $8, 
      sexual_orientation = $9, 
      lookingfor = $10 
    WHERE 
      id = $1`;
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
    lookingfor
  ];
  pool.query(text, values);
  updateTag(tags, id);
  return true;
}

async function addVisit(userId, userVisitedId) {
  let text = `
    SELECT 
      id 
    FROM 
      visited 
    WHERE 
      user_id = $1 AND user_visited = $2`;
      2000-01-01 00:00:00 +05:00
  let values = [userId, userVisitedId, moment().format("YYYY-MM-DD hh:mm:ss Z")];
  let res = await pool.query(text, values);
  if (res.rowCount) {
    text = `
      UPDATE 
        visited 
      SET 
        datetime = $3 
      WHERE 
        user_id = $1 AND user_visited = $2`;
    pool.query(text, values);
  } else {
    text = `
      INSERT INTO 
        visited(user_id, user_visited, datetime) 
      VALUES 
        ($1, $2, $3)`;
    pool.query(text, values);
  }
}

async function getVisit(userVisitedId) {
  const text = `
    SELECT 
      datetime, 
      user_id 
    FROM 
      visited 
    WHERE 
      user_visited = $1`;
  const values = [userVisitedId];
  let res = await pool.query(text, values);
  if (res.rowCount) {
    console.log(res);
    return res;
  } else {
    return null;
  }
}

async function updateTag(tags, user_id) {
  // const text = "INSERT INTO users_hashtags(user_id, hashtag_id) SELECT u.unnest, h.name FROM unnest($1) u, hashtags h WHERE h.name = $2"
  const text = `
    INSERT INTO 
      users_hashtags(hashtag_name, user_id) 
    SELECT 
      unnest,
      $2 
    FROM 
      unnest($1::text[])`;

  const values = [tags, user_id];
  pool.query(text, values);
}

async function getUserHashtags(id) {
  const text = `
    SELECT 
      hashtag_name 
    FROM 
      users_hashtags 
    WHERE 
      user_id = $1`;
  const values = [id];
  let res = await pool.query(text, values);
  if (res.rowCount) {
    return { hashtags: res.rows.map(i => i.hashtag_name) };
  } else {
    return { hashtags: null };
  }
}

async function getHashtagsList() {
  const text = `
    SELECT 
      name 
    FROM 
      hashtags`;
  let res = await pool.query(text);
  if (res.rowCount) {
    return res.rows.map(i => i.name);
  } else {
    return null;
  }
}

async function addImage(images, userId) {
  const text = `
    INSERT INTO 
      pics(url, user_id) 
    VALUES 
      SELECT 
        unnest, 
        $2 
      FROM 
        unnest($1::text[])`;
  const values = [images, userId];
  pool.query(text, values);
}

async function deleteImage(imageId, userId) {
  const text = `
    DELETE FROM 
      pics 
    WHERE 
      pics.id = $1 AND pics.user_id = $2`;
  const values = [imageId, userId];
  pool.query(text, values);
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
  addVisit,
  getUserHashtags,
  getHashtagsList
};
