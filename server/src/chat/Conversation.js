import { pool } from "../utils/postgres";

const emptyMessage = {
  id: null,
  text: null,
  isRead: null,
  datetime: null,
  emitter: null,
  conversationId: null
};

export default class Conversation {
  // static notifyUser(text, sendId, recvId, convId, datetime) {
  //   this.prototype.save({ text, sendId, recvId, convId, datetime });
  //   //pubsub(sendId, recvId, datetime, notificationType);
  // }

  static async findOrCreate(userA, userB) {
    // ICI il faut verifier que les users peuvent se parler que le second existe
    let text = `
      SELECT 
        id
      FROM
        conversations
      WHERE
        (user_a = $1 AND user_b = $2) OR (user_a = $2 AND user_b = $1)`;
    let values = [userA, userB];
    let res = await pool.query(text, values);
    if (res.rowCount) {
      return res.rows[0].id;
    }
    text = `
      INSERT INTO
        conversations(
            user_a,
            user_b)
      VALUES($1, $2)
      RETURNING id;
     `;
    try {
      res = await pool.query(text, values);
      return res.rows[0].id;
    } catch {
      return null;
    }
  }

  static async list(userId) {
    let text = `
      SELECT
        id,
        user_a as "friend"
      FROM
        conversations
      WHERE
        user_b = $1
      AND NOT
        user_a IN (SELECT user_blocked FROM blocked WHERE user_id = $1)
      UNION
      SELECT
        id,
        user_b as "friend"
      FROM
        conversations
      WHERE
        user_a = $1
      AND NOT
        user_b IN (SELECT user_blocked FROM blocked WHERE user_id = $1)
      `;
    let values = [userId];
    let res = await pool.query(text, values);
    console.log("LIST CONVERSATIONS result ---> ", res.rows);
    return res.rows;
  }

  static async isParty(userId, convId) {
    let text = `
      SELECT
        1
      FROM
        conversations
      WHERE
        (id = $2 AND user_a = $1) 
        OR 
        (id = $2 AND user_b = $1)
      `;
    let values = [userId, convId];
    let res = await pool.query(text, values);
    console.log(res);
    if (res.rowCount) {
      return true;
    }
    return false;
  }
}
