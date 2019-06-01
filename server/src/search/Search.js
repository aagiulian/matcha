import { pool } from "../utils/postgres";
import { Geolocation } from "../utils/geolocation";
import { getLocation, getDateOfBirth } from "../user";
import { AuthenticationError, UserInputError } from "apollo-server";


//TODO: use cursor
const DEFAULT_LIMIT = 20;
const DEFAULT_OFFSET = 0;

const DEFAULT_AGE_MIN = 18;
const DEFAULT_AGE_MAX = Number.MAX_SAFE_INTEGER;
const DEFAULT_POPULARITY_MIN = 0;
const DEFAULT_POPULARITY_MAX = Number.MAX_SAFE_INTEGER;
const DEFAULT_ORDER_BY = ["distance"];

const ORDER_BY_DICT = {distance : "distance ASC",
                       popularity_score : "users.popularity_score DESC",
                       hashtags: "num_common_hashtags DESC"};


const capitalize = (string) => string.chatAt(0).toUpperCase() + string.slice(1);

const snakeToCapitalized = (string) => string.split('_').map(capitalize).join(' ');


export default class Search {

  static choicesOrderBy() {
    const values = Object.keys(ORDER_BY_DICT);
    let ret = {};
    values.forEach(val => {
      ret[snakeToCapitalized(val)] = val;
    });
    return ret;
  }

  static async search(input, context) {
    const userId = context.user.id;

    const myLocation = context.location ? context.location : "me.location";
    const near = Geolocation.locationToSqlPoint(input.near ? input.near : myLocation);

    const ageMin = input.ageMin || DEFAULT_AGE_MIN;
    const ageMax = input.ageMax || DEFAULT_AGE_MAX;
    const popularityMin = input.popularityMin || DEFAULT_POPULARITY_MIN;
    const popularityMax = input.popularityMax || DEFAULT_POPULARITY_MAX;

    const inputOrderBy = input.orderBy || DEFAULT_ORDER_BY;
    const orderBy = inputOrderBy.map(e => ORDER_BY_DICT[e]).join(" , ");

    const limit = DEFAULT_LIMIT;
    const offset = input.offset || DEFAULT_OFFSET;
    //TODO: const cursor = input.cursor;

    const hashtags = input.hashtags || [];
    
    const values = hashtags.length > 1
          ? [userId, near, ageMin, ageMax, popularityMin, popularityMax, orderBy, limit, offset, hashtags]
          : [userId, near, ageMin, ageMax, popularityMin, popularityMax, orderBy, limit, offset];

    const withHashtags = hashtags.length > 1
          ? ` AND (users_hashtags.hashtag_name::text = ANY ($${values.length}::text[])) `
          : "";
  
    const query = `
      SELECT 
        users.id, 
        users.username, 
        users.firstname, 
        users.lastname, 
        users.date_of_birth,
        users.gender, 
        users.sexual_orientation as "sexualOrientation", 
        users.url_pp as "urlPp", 
        users.last_seen as "lastSeen", 
        users.location, 
        users.popularity_score,
        users.lookingfor,
        users.bio,
        users_hashtags.hashtag_name,
        date_part('year', age(users.date_of_birth)) as "age",
        round((users.location <@> $2)::numeric, 3) as "distance"
      FROM 
        users
      LEFT JOIN users_hashtags ON
        users_hashtags.user_id = users.id
      LEFT JOIN users as me ON
        me.id = $1
      WHERE
        (users.id != $1)
        AND
        (users.gender::text = ANY (me.lookingfor::text[]))
        AND
        (me.gender::text = ANY (users.lookingfor::text[]))
        AND
        (date_part('year', age(users.date_of_birth)) >= $3)
        AND
        (date_part('year', age(users.date_of_birth)) <= $4)
        AND
        (users.popularity_score >= $5)
        AND
        (users.popularity_score <= $6)
        ${withHashtags}
      ORDER BY $7
      LIMIT $8
      OFFSET $9`;

    const res = await pool.query(query, values);
    if (res.rowCount) {
      return res.rows.map(u => getDateOfBirth(getLocation(u)));
    } else {
      return [];
    }
  }
}
