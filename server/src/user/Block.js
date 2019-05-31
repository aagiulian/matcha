import { pool } from "../utils/postgres";

export default class Block {
  static async do(userId, userBlocked) {
    let text = `
      INSERT INTO
        blocked(user_id, user_blocked)
      VALUES ($1, $2)
      ON CONSTRAINT DO NOTHING
    `;
    let values = [userId, userBlocked];
    pool.query(text, values);
  }

  static async undo(userId, userBlocked) {
    let text = `
      DELETE FROM
        blocked
      WHERE
        user_id = $1 AND user_blocked = $2
    `;
    let values = [userId, userBlocked];
    pool.query(text, values);
  }

  static async list(userId) {
    let text = `
      SELECT
        user_blocked as "id"
      FROM
        blocked
      WHERE
        user_blocked = $1
      `;
    let values = [userId];
    let res = await pool.query(text, values);
    return res.rows;
  }
}
