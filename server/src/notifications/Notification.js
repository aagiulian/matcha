import { pool } from "../utils/postgres";

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
                      recv_id,
                      seen)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
      `;

    const values = [datetime, notificationType, sendId, recvId, false];

    let res = await pool.query(query, values);
    let id = res.rows[0].id;
    return {
      id,
      emitter: sendId,
      recipient: recvId,
      datetime: datetime,
      type: notificationType,
      seen: false
    };
  }

  static async getAll(recvId, limit = 10, latestNotificationId = 0) {
    const query = `
      SELECT 
        notifications.id,
        notifications.datetime,
        notifications.notification_type as "notificationType",
        notifications.send_id as "sendId",
        notifications.seen,
        send.username as "sendUsername",
        send.url_pp as "sendUrlPp",
        notifications.recv_id as "recvId",
        recv.username as "recvUsername",
      FROM 
        notifications
      WHERE 
        recv_id = $1 AND notifications.id > $3
      ORDER BY
        datetime DESC
      LIMIT $2
      LEFT JOIN
        users recv ON notifications.recv_id = recv.id
      LEFT JOIN
        users send ON notifications.send_id = send.id`;

    const values = [recvId, limit, latestNotificationId];
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


  static async getLatest(recvId, limit = 10) {
    const query = `
      SELECT 
        notifications.id,
        notifications.datetime,
        notifications.notification_type as "notificationType",
        notifications.send_id as "sendId",
        notifications.seen,
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

  static async markAsSeen(id) {
    const query = `
      UPDATE
        notifications
      SET
        seen = true
      WHERE
        id = $1`;
    const values = [id];
    pool.query(text, values);
    return true;
  }

  static async getUnseenCount(id) {
    const query = `
      SELECT
        count(*)
      FROM 
        notifications
      WHERE 
        (recv_id = $1 AND seen = false)`;
    const values = [id];
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
