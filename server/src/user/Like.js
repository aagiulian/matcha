import { pool } from "../utils/postgres";
import Block from "../user";

import {
  LIKE_NOTIFICATION,
  UNLIKE_NOTIFICATION,
  MATCH_NOTIFICATION,
  UNMATCH_NOTIFICATION,
  LIKE_SCORE,
  MATCH_SCORE,
  addScore
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
    addScore([userA, userB], MATCH_SCORE);
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
      RETURNING id
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
      SELECT $1, $2
      WHERE NOT EXISTS (SELECT 1 FROM blocked WHERE user_id = $2 AND user_blocked = $1))
      ON CONFLICT DO NOTHING
    `;
    let values = [userId, userLiked, datetime];
    let res = await pool.query(text, values);
    let ret;
    if (res.rowCount) {
      addScore([userLiked], LIKE_SCORE);
      ret = isMatch(userId, userLiked) ? MATCH_NOTIFICATION : LIKE_NOTIFICATION;
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
    if (res.rowCount && !(userId in (await Block.list(userUnliked)))) {
      if (isMatch(userId, userUnliked)) {
        addScore([userId, userUnliked], -MATCH_SCORE);
        unMatch(userId, userUnliked);
        return UNMATCH_NOTIFICATION;
      }
      addScore([userUnliked], -LIKE_SCORE);
      return UNLIKE_NOTIFICATION;
    }
    return null;
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
