import pool from "../postgres";

export default class Visit {
  static async do(userId, userVisited, datetime) {
    let text = `
      INSERT INTO
        visited(user_id, user_visited, datetime)
      VALUES ($1, $2, $3)
      ON CONSTRAINT DO NOTHING
      RETURNING user_id
    `;
    let values = [userId, userVisited, datetime];
    return await pool.query(text, values);
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
