import { pool } from "../modules/postgres";

export default class Notification {
  // static notifyUser({sendId, recvId, datetime}, notificationType) {
  //   this.prototype.save({sendId, recvId, datetime, notificationType});
  //   //pubsub(sendId, recvId, datetime, notificationType);
  // }

  static async save({ sendId, recvId, datetime }, notificationType) {
    const query = `
      INSERT INTO
        notifications(datetime,
                      notification_type,
                      send_id,
                      recv_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id
      `;

    const values = [datetime, notificationType, sendId, recvId];

    let res = await pool.query(query, values);
    let id = res.rows[0].id;
    //TODO: use the return value for inserts ?
    // ----> return Gql Notification Object
    return {
      id,
      emitter: sendId,
      recipient: recvId,
      datetime: datetime,
      type: notificationType
    };
  }

  static async getLatest(recvId, limit = 10) {
    const query = `
      SELECT 
        notifications.id,
        notifications.datetime,
        notifications.notification_type as "notificationType",
        notifications.send_id as "sendId",
        send.username as "sendUsername",
        send.url_pp as "sendUrlPp",
        notifications.recv_id as "recvId",
        recv.username as "recvUsername",
      FROM 
        notifications
      WHERE 
        recv_id = $1
      ORDER BY
        datetime DESC
      LIMIT $2
      LEFT JOIN
        users recv ON notifications.recv_id = recv.id
      LEFT JOIN
        users send ON notifications.send_id = send.id`;

    const values = [recvId, limit];
    const { rows: results, rowCount: resultsCount } = await pool.query(
      query,
      values
    );

    if (resultsCount) {
      return results;
    } else {
      return null;
    }
  }
}
