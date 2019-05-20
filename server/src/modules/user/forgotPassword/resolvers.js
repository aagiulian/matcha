import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { generateToken } from "../../auth-helpers/generateToken";
import { resetPasswordEmail } from "../../auth-helpers/passwordReset";
import { pool } from "../../postgres";

export const resolvers = {
  Mutation: {
    sendForgotPasswordEmail: async (_, { email }) => {
      try {
        const { username, id } = await getUserByEmail(email);
        const token = generateToken({ username, id });
        resetPasswordEmail({ token, email });
        return true;
      } catch (e) {
        console.log(e);
        // si le user n'existe pas
        return false;
      }
    },
    forgotPasswordChange: (_, { input: { token, newPassword } }) => {
      jwt.verify(token, process.env.JWT_PUBLIC, async (err, decoded) => {
        if (err) {
          console.log(err);
        } else {
          const hashedPassword = await bcrypt.hash(newPassword, 10);
          const text = "UPDATE users SET hashed_password = $1 WHERE id = $2";
          const values = [hashedPassword, decoded.id];
          pool.query(text, values);
        }
      });
      return true;
    }
  }
};

async function getUserByEmail(email) {
  const text = `
    SELECT 
        id, 
        username, 
        hashed_password as "hashedPassword", 
        firstname, 
        lastname, 
        date_of_birth as "dateOfBirth", 
        gender, 
        sexual_orientation as "sexualOrientation", 
        bio, 
        num_pics as "numPics", 
        url_pp as "urlPp", 
        email, 
        last_seen as "lastSeen", 
        position, 
        popularity_score, 
        verified 
    FROM 
        users 
    WHERE 
        email = $1`;
  const values = [email];
  const { rows: results, rowCount: resultsCount } = await pool.query(
    text,
    values
  );
  if (resultsCount) {
    return results[0];
  } else {
    return null;
  }
}
