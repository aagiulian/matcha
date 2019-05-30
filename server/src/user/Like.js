import { pool } from "../utils/postgres";
import {
  LIKE_NOTIFICATION,
  UNLIKE_NOTIFICATION,
  MATCH_NOTIFICATION,
  UNMATCH_NOTIFICATION
} from "../notifications";


const isMatch = async (userA, userB) => {
  let text = `
      SELECT 
        1
      FROM
        likes
      WHERE user_a = $1 && user_b = $2
      UNION
      SELECT 
        1
      FROM
        likes
      WHERE user_a = $2 && user_b = $1
      `;
  let values = [userA, userB];
  let res = await pool.query(text, values);
  if (res.rowCount > 1) {
    match(userA, userB);
    return true;
  }
  return false;
};

const match = async (userA, userB) => {
  let swap = userA;
  if (userA > userB) {
    userA = userB;
    userB = swap;
  }
  let text = `
      INSERT INTO
        matchs(user_a, user_b)
      VALUES($1, $2)
      ON CONSTRAINT DO NOTHING
    `;
  let values = [userA, userB];
  pool.query(text, values);
};

const unMatch = async (userA, userB) => {
  let text = `
    DELETE FROM
      matchs
    WHERE 
    (userA = $1 AND userB = $2)
    OR
    (userA = $2 AND userB = $1)
      `;
  let values = [userA, userB];
  pool.query(text, values);
};

export default class Like {
  static async do(userId, userLiked) {
    let text = `
      INSERT INTO
        likes(user_a, user_b)
      VALUES($1, $2)
      ON CONSTRAINT DO NOTHING
    `;
    let values = [userId, userLiked, datetime];
    let res = await pool.query(text, values);
    let ret = { like: false, match: false };
    if (res) {
      ret.like = true;
      ret.match = isMatch(userId, userLiked) ? true : false;
    }
    return ret;
  }

  static async undo(userId, userUnliked) {
    let text = `
      DELETE FROM
        likes
      WHERE
        user_id = $1 AND user_liked = $2
      RETURNING *
    `;
    let values = [userId, userUnliked];
    let res = await pool.query(text, values);
    let ret = { unMike: false, unMatch: false };
    if (res.rowCount) {
      if (isMatch(userId, userUnliked)) {
        ret.unMatch = unMatch(userId, userUnliked) ? true : false;
      }
    }
    return ret;
  }

  static async list(userId) {
    let text = `
      SELECT
        user_liked as "id"
      FROM
        likes
      WHERE
        user_id = $1
      `;
    let values = [userId];
    let res = await pool.query(text, values);
    return res.rows;
  }

  static async matchList(userId) {
    let text = `
      SELECT
        user_a as "id"
      FROM
        matchs
      WHERE
        user_b = $1
      UNION
      SELECT
        user_b as "id"
      FROM
        matchs
      WHERE
        user_a = $1
      `;
    let values = [userId];
    let res = await pool.query(text, values);
    return res.rows;
  }
}
