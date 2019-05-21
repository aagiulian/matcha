import { pool } from "../database";

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
    let text = `
      INSERT INTO
        conversations(
            user_a,
            user_b)
      VALUES($1, $2);
      SELECT SCOPE_IDENTITY()`;
    let res = await pool.query(text, values);
    return res;
  }

  static async list(userId) {
    let text = `
      SELECT
        id,
        user_a as "friend",
      FROM
        conversations
      WHERE
        user_b = $1
      UNION
      SELECT
        id,
        user_b as "friend",
      FROM
        conversations
      WHERE
        user_a = $1
      `;
    let values = [userId];
    let res = await pool.query(text, values);
    console.log("LIST CONVERSATIONS result ---> ", res);
    return res;
    //WHAT IF NO CONVERSATION
  }
}
