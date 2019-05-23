import { pool } from "../modules/postgres";

// export const Interaction = {
//   like: {},
//   visit: {},
//   block: {}
// };

export default class Interaction {
  static async visit(userId, userVisited) {
    let text = `
      INSERT INTO
        visited(user_id, user_visited, datetime)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    let values = [userId, userVisited, datetime];
    // let res = await
    pool.query(text, values);
    // let id = res.rows[0].id;
    // return true;
  }

  static async block(userId, userBlocked) {
    let text = `
      INSERT INTO
        blocked(user_id, user_blocked)
      VALUES ($1, $2)
      RETURNING id
    `;
    let values = [userId, userBlocked];
    let res = await pool.query(text, values);
    let id = res.rows[0].id;
  }

  static async unblock(userId, userBlocked) {
    let text = `
      DELETE FROM
        blocked
      WHERE
        user_id = $1 AND user_blocked = $2
    `;
    let values = [userId, userBlocked];
    pool.query(text, values);
  }
}
