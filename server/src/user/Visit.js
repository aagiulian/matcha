import { pool } from "../utils/postgres";
import { addScore, VISIT_SCORE } from "../notifications";

export default class Visit {
  static async do(userId, userVisited, datetime) {
    let text = `
      INSERT INTO
        visited(user_id, user_visited, datetime)
      (SELECT $1, $2, $3
      WHERE NOT EXISTS (SELECT 1 FROM blocked WHERE user_id = $2 AND user_blocked = $1))
      ON CONFLICT DO NOTHING
      RETURNING user_id
    `;
    let values = [userId, userVisited, datetime];
    let res = await pool.query(text, values);
    if (res.rowCount) {
      addScore([userVisited], VISIT_SCORE);
      return true;
    }
    return false;
  }

  static async list(userId) {
    let text = `
      SELECT
        user_id as "id"
      FROM
        likes
      WHERE
        user_id = $1
      `;
    let values = [userId];
    let res = await pool.query(text, values);
    return res.rows;
  }
}
