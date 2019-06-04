import { pool } from "../utils/postgres";

export const addScore = (ids, score) => {
  const values = [ids, score];
  const text = `
        UPDATE 
            users 
        SET 
            popularity_score = popularity_score + $2
        WHERE
            id = (SELECT unnest (($1)::INTEGER[]))
        `;
  pool.query(text, values);
};
