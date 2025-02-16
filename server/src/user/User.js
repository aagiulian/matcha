import bcrypt from "bcrypt";
import moment from "moment";
import { AuthenticationError, UserInputError } from "apollo-server";
import { empty } from "apollo-link";
import { pool } from "../utils/postgres";
import { generateToken } from "../utils/auth";
import Hashtags from "./Hashtags";
import { getLocation, getDateOfBirth } from "./utils";

const setLocationValue = location =>
  "(" + location.lng + "," + location.lat + ")";

const emptyUser = {
  id: null,
  profile: {
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
  location: null,
  isOnline: null,
  popularityScore: null,
  lastSeen: null,
  verified: null
  // protected: ProtectedInfo!,
};

export default class User {
  static async hasExtendedProfile(id) {
    const query = `
      SELECT
        gender
      FROM
        users
      WHERE
        id = $1`;
    const values = [userA, userB];
    const { rows: results, rowCount: resultsCount } = await pool.query(
      query,
      values
    );
    if (resultsCount && results[0].gender) {
      return true;
    }
    return false;
  }

  static async blocked(userA, userB) {
    const query = `
      SELECT
        id
      FROM
        blocked
      WHERE
        (user_a = $1 AND user_b = $2)
      OR
        (user_a = $2 AND user_b = $1)`;
    const values = [userA, userB];
    const { rowCount: resultsCount } = await pool.query(query, values);
    if (resultsCount) {
      return true;
    }
    return false;
  }

  static async new({
    email,
    password,
    username,
    firstname,
    lastname,
    location
  }) {
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
        popularity_score, 
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
      0,
      true
    ]; // TRUE TO FALSE TO ENABLE VERIFICATION
    console.log(values);
    try {
      pool.query(text, values);
    } catch (e) {
      console.log("NEW USER Error :", e, "--- END NEW USER Error");
      return false;
    }
    return true;
  }

  static async findById(id) {
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
        location, 
        popularity_score, 
        location,
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
      console.log("find by id:", results[0]);
      /*
      const ret = pipe(
        getDateOfBirth,
        getLocation
      )(results[0]);
      */
      const ret = getDateOfBirth(getLocation(results[0]));
      console.log("ret", ret);
      return ret;
    } else {
      return emptyUser;
    }
  }

  static async findByEmail(email) {
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
      location, 
      popularity_score, 
      location,
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
      console.log("find by id:", results[0]);
      const ret = getDateOfBirth(getLocation(results[0]));
      console.log("ret", ret);
      return ret;
      /*
      return pipe(
        getDateOfBirth,
        getLocation
      )(results[0]);
      */
    } else {
      return emptyUser;
    }
  }

  static async getProfileById(id) {
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
        users.location, 
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
      console.log("profile info:", res.rows[0]);
      return getDateOfBirth(getLocation(res.rows[0]));
    } else {
      return emptyUser;
    }
  }

  static async getProfileByIds(ids) {
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
        users.location, 
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
        users.id IN (SELECT unnest (($1)::INTEGER[]))`;
    let values = [ids];
    let res = await pool.query(text, values);
    if (res.rowCount) {
      return res.rows.map(u => getDateOfBirth(getLocation(u)));
    } else {
      return [];
    }
  }

  static async getHashtags(id) {
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

  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const text = "UPDATE users SET hashed_password = $1 WHERE id = $2";
    const values = [hashedPassword, decoded.id];
    pool.query(text, values);
  }

  static async update(
    {
      username,
      firstname,
      lastname,
      email,
      gender,
      bio,
      dateOfBirth,
      sexualOrientation,
      location,
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
    const lookingfor = gender
      ? dict[gender][sexualOrientation]
      : "{male,female}";
    let available = {};
    const user = await User.findById(id);
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
      lookingfor = $10,
      location = $11
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
      lookingfor,
      setLocationValue(location)
    ];
    pool.query(text, values);
    Hashtags.update(tags, id);
    return true;
  }
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
