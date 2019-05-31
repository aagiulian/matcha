import { pool } from "../utils/postgres";
import { getLocation, getDateOfBirth } from "./user";
import { AuthenticationError, UserInputError } from "apollo-server";


const DEFAULT_RADIUS = 42;
const DEFAULT_AGE_MIN = 18;
const DEFAULT_AGE_MAX = Number.MAX_SAFE_INTEGER;
const DEFAULT_POPULARITY_MIN = 0;
const DEFAULT_POPULARITY_MAX = Number.MAX_SAFE_INTEGER;

export default class Search {
  search(input, context) {
    const userId = context.user.id;
    const radius = input.radius || DEFAULT_RADIUS;
    const ageMin = input.ageMin || DEFAULT_AGE_MIN;
    const ageMax = input.ageMax || DEFAULT_AGE_MAX;
    const popularityMin = input.popularityMin || DEFAULT_POPULARITY_MIN;
    const popularityMax = input.popularityMax || DEFAULT_POPULARITY_MAX;

    const query = `
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
        popularity_score
      FROM 
        users 
      WHERE 
        (users.id != $1)
      LIMIT 10
    `;

    const values = [userId, radius, ageMin, ageMax, popularityMin, popularityMax];
    const res = await pool.query(query, values);
    if (res.rowCount) {
      return res.rows.map(u => getDateOfBirth(getLocation(u)));
    } else {
      return [];
    }
  }
}
