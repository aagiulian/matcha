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

const SEARCH_ORDER_BY = {
  distance: "distance ASC",
  popularity_score: "users.popularity_score DESC"
};

const MATCH_ORDER_BY = {
  distance: "distance ASC",
  popularity_score: "users.popularity_score DESC",
  hashtags: "num_common_hashtags DESC"
};

const capitalize = string => string.chatAt(0).toUpperCase() + string.slice(1);

const snakeToCapitalized = string =>
  string
    .split("_")
    .map(capitalize)
    .join(" ");

const makeChoices = dict => {
  const values = Object.keys(dict);
  let ret = {};
  values.forEach(val => {
    ret[snakeToCapitalized(val)] = val;
  });
  return ret;
};

export default class Search {
  static choicesSearchOrderBy() {
    return makeChoices(SEARCH_ORDER_BY);
  }

  static choicesMatchOrderBy() {
    return makeChoices(MATCH_ORDER_BY);
  }

  static async search(input, context) {
    const userId = context.user.id;
    //location
    const myLocation = context.location ? context.location : "me.location";
    const near = Geolocation.locationToSqlPoint(
      input.near ? input.near : myLocation
    );
    //age
    const ageMin = input.ageMin || DEFAULT_AGE_MIN;
    const ageMax = input.ageMax || DEFAULT_AGE_MAX;
    //popularity
    const popularityMin = input.popularityMin || DEFAULT_POPULARITY_MIN;
    const popularityMax = input.popularityMax || DEFAULT_POPULARITY_MAX;
    //column to order by given by user
    const inputOrderBy = input.orderBy || DEFAULT_ORDER_BY;
    const orderBy = inputOrderBy.map(e => ORDER_BY_DICT[e]).join(" , ");
    //pagnation
    const limit = DEFAULT_LIMIT;
    const offset = input.offset || DEFAULT_OFFSET;
    //hashtags + values in query
    const hashtags = input.hashtags || [];
    let values = [
      userId,
      near,
      ageMin,
      ageMax,
      popularityMin,
      popularityMax,
      orderBy,
      limit,
      offset,
      hashtags];
    let hashtagSelect = "";
    let hashtagJoin = "";
    let hashtagWhere = "";
    let hashtagGroupBy = "";
    if (hashtags.length > 1) {
      values.append(hashtags);
      const hashtagIndex = values.length;
      hashtagSelect = ",ARRAY_AGG (hashtag_name) hashtag_name";
      hashtagJoin = `LEFT JOIN users_hashtags ON users_hashtags.user_id = users.id`
      hashtagWhere = `AND (users_hashtags.hashtag_name::text = ANY ($${hashtagIndex}::text[]))`
    }

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
        round((users.location <@> $2)::numeric, 3) as "distance",
        ARRAY_AGG (blocked.user_blocked) as "blocked"
        ${hashtagSelect}
      FROM 
        users
      LEFT JOIN users as me ON
        me.id = $1
      LEFT JOIN blocked ON
        blocked.user_id = users.id
      ${hashtagJoin}
      WHERE
        (users.id != $1)
        AND
        (users.id NOT IN (SELECT user_blocked FROM blocked WHERE blocked.user_id = me.id))
        AND
        (blocked.user_blocked IS NULL)
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
        ${hashtagWhere}
      GROUP BY users.id
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
