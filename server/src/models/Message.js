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

  static async save({ text, sendId, convId, datetime }) {
    let query = `
    INSERT INTO
      messages(
        text,
        send_id,
        conversation_id,
        created_at,
        is_read,
        recv_id)
    SELECT $1, $2, $3, $4::TIMESTAMPTZ, $5::BOOLEAN, user_b FROM conversations WHERE user_a = $2 AND id = $3 
    UNION 
    SELECT $1, $2, $3, $4::TIMESTAMPTZ, $5::BOOLEAN, user_a FROM conversations WHERE user_b = $2 AND id = $3 
    RETURNING id, recv_id`;
    let values = [text, sendId, convId, datetime, false];
    let res = await pool.query(query, values);
    let msgId = res.rows[0].id;
    let recvId = res.rows[0].recv_id;
    return {
      id: msgId,
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
