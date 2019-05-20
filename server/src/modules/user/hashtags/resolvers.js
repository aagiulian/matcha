import { pool } from "../../postgres";

export const resolvers = {
  Query: {
    hashtags: async () => await getHashtagsList()
  }
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
