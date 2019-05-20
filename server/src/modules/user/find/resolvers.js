import { pool } from "../../postgres";

export const resolvers = {
  async findUsers() {
    const text = "SELECT id FROM users";
    const res = await pool.query(text);
    if (res.rowCount) {
      return res.rows;
    } else {
      return null;
    }
  }
};
