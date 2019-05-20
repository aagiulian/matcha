import bcrypt from "bcrypt";
import { pool } from "../modules/postgres";
import { AuthenticationError, UserInputError } from "apollo-server";
import { generateToken } from "../modules/auth-helpers/generateToken";
import { empty } from "apollo-link";
import { Hashtags } from "./Hashtags";

const emptyUser = {
  id: null,
  profileInfo: {
    username: null,
    firstname: null,
    lastname: null,
    gender: null,
    dateOfBirth: null,
    bio: null,
    numPics: null,
    urlPp: null,
    pictures: null,
    sexualOrientation: null,
    email: null,
    hashtags: null
  },
  position: null,
  isOnline: null,
  popularityScore: null,
  lastSeen: null,
  verified: null
  // protected: ProtectedInfo!,
};

export const User = {
  new: async ({ email, password, username, firstname, lastname }) => {
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
  },
  findById: async id => {
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
      return emptyUser;
    }
  },
  findByEmail: async email => {
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
        email = $1`;
    const values = [email];
    const { rows: results, rowCount: resultsCount } = await pool.query(
      text,
      values
    );
    if (resultsCount) {
      return results[0];
    } else {
      return emptyUser;
    }
  },
  getProfileInfo: async id => {
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
      return emptyUser;
    }
  },
  getHashtags: async id => {
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
  },
  updatePassword: async (id, newPassword) => {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const text = "UPDATE users SET hashed_password = $1 WHERE id = $2";
    const values = [hashedPassword, decoded.id];
    pool.query(text, values);
  },
  update: async (
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
  ) => {
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
    const lookingfor = gender
      ? dict[gender][sexualOrientation]
      : "{male,female}";
    let available = {};
    const user = await getUserById(id);
    if (user.username !== username) {
      available.username = (await availUsername(username))
        ? undefined
        : "Already exists";
    }
    if (user.email !== email) {
      available.email = (await availEmail(email))
        ? undefined
        : "Already exists";
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
    Hashtags.update(tags, id);
    return true;
  }
};

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
