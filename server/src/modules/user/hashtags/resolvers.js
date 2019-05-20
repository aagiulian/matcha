import { pool } from "../database";

export const resolvers = {
  hashtags: async () => await getHashtagsList()
};

async function getHashtagsList() {
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
}
