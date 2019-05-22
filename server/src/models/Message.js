import { pool } from "../modules/postgres";

const emptyMessage = {
  id: null,
  text: null,
  isRead: null,
  datetime: null,
  emitter: null,
  conversationId: null
};

export default class Message {
  // static notifyUser(text, sendId, recvId, convId, datetime) {
  //   this.prototype.save({ text, sendId, recvId, convId, datetime });
  //   //pubsub(sendId, recvId, datetime, notificationType);
  // }

  static async save({ text, sendId, recvId, convId, datetime }) {
    let query = `
    INSERT INTO
      messages(
        text,
        send_id,
        recv_id,
        conversation_id,
        created_at,
        is_read)
    VALUES($1, $2, $3, $4, $5, $6)
    RETURNING id`;
    let values = [text, sendId, recvId, convId, datetime, false];
    let id = await pool.query(query, values);
    return {
      id,
      text,
      isRead: false,
      datetime,
      emitter: sendId,
      recipient: recvId,
      conversationId: convId
    };
  }

  static markRead(recvId, convId) {
    const text = `
      UPDATE 
        messages
      SET 
        is_read = $1
      FROM ( 
        SELECT
          recv_id, conversation_id, is_read
        FROM
          messages
        INNER JOIN
          conversations conv ON messages.conversation_id = conv.id
        )
      WHERE
        is_read = $2 AND recv_id = $3 AND conversation_id = $4`;

    const values = [true, false, recvId, convId];
    pool.query(text, values);
  }

  static async find(conversationId) {
    let text = `
      SELECT
        id,
        text,
        is_read as "isRead",
        created_at as "createdAt",
        conversation_id as "conversationId",
        send_id as "emitter",
        recv_id as "recipient"
      FROM
        messages
      WHERE
        conversation_id = $1
    `;

    let values = [conversationId];
    let result = await pool.query(text, values);
    console.log("FIND MESSAGES result ---> ", result);
    return result;
    // return [null]
  }
}
