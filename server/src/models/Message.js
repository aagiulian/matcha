import { pool } from "../database";

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
    let text = `
    INSERT INTO
      messages(
        text,
        emitter,
        recipient,
        conversation_id,
        created_at,
        is_read,
      )
    VALUES($1, $2, $3, $4, $5, $6);
    SELECT SCOPE_IDENTITY()`;
    let values = [text, sendId, recvId, convId, datetime, false];
    let id = await pool.query(text, values);
    return {
      id,
      text,
      isRead: false,
      datetime,
      emitter: sendId,
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
        is_read = $2 AND recv_id = $3`;

    const values = [true, false, recvId];
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
