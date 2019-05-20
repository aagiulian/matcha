import { pool } from "../database";

export default Class Notification{
  const types = [
  'liked',
  'visited',
  'messaged',
  'match',
  'unmatch'];

  static notifyUser({sendId, recvId, datetime, notificationType}) {
    this.prototype.save({sendId, recvId, datetime, notificationType});
    //pubsub(sendId, recvId, datetime, notificationType);
  }

  static save({datetime, notifictationType, sendId, recvId}) {
    const query = `
      INSERT INTO
        notifications(datetime,
                      notification_type,
                      send_id,
                      recv_id)
      VALUES ($1, $2, $3, $4)`;

    const values = [datetime, notificationType, sendId, recvId];


    const params = [recvId, limit];
    const { rows: results, rowCount: resultsCount } = await pool.query(
      query,
      values
    );

    pool.query(text, values);
    //TODO: use the return value for inserts ?
    return true;
  }

  static async getLatest(recvId, limit = 10) {
    const query = `
      SELECT 
        id,
        datetime,
        notification_type as "notificationType",
        send_id as "sendId",
        recv_id as "recvId",
      FROM 
        notifications
      WHERE 
        recv_id = $1
      LIMIT $2`;

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
