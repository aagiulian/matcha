import { pool } from "../utils/postgres";

const Hashtags = {
  getList: async () => {
    const text = `
      SELECT 
        name 
      FROM 
        hashtags`;

    let res = await pool.query(text);
    if (res.rowCount) {
      return res.rows.map(i => i.name);
    } else {
      return null;
    }
  },
  update: async (tags, user_id) => {
    const text = `
      INSERT INTO 
        users_hashtags(hashtag_name, user_id) 
      SELECT 
        unnest,
        $2 
      FROM 
        unnest($1::text[])`;

    const values = [tags, user_id];
    pool.query(text, values);
  }
};
export default Hashtags;
