import { pool } from "../../postgres";

export const resolvers = {
  Query: {
    async findUsers() {
      const text = "SELECT id FROM users";
      const res = await pool.query(text);
      if (res.rowCount) {
        return res.rows;
      } else {
        return null;
      }
    }
  }
};
