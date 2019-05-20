import { UserInputError } from "apollo-server";
import { pool } from "../../postgres";
import { sendMailToken } from "../../../auth-helpers/emailVerification";
import bcrypt from "bcrypt";

export const resolvers = {
  Mutation: {
    signup: async (
      _,
      { input: { email, password, username, firstname, lastname } }
    ) => {
      email = email.toLowerCase();
      username = username.toLowerCase();
      const res = await newUser({
        email,
        password,
        username,
        firstname,
        lastname
      });
      if (res !== true) {
        throw new UserInputError("Duplicate", {
          invalidArgs: res
        });
      }
      sendMailToken(username, email);
      return { email: email };
    }
  }
};

async function newUser({ email, password, username, firstname, lastname }) {
  const available = {
    username: (await availUsername(username)) ? undefined : "Already exists",
    email: (await availEmail(email)) ? undefined : "Already exists"
  };
  if (available.username !== undefined || available.email !== undefined) {
    return available;
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const text = `
    INSERT INTO 
      users(email, 
            hashed_password, 
            username, firstname, 
            lastname, 
            sexual_orientation, 
            lookingfor, 
            verified) 
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8)`;
  const values = [
    email,
    hashedPassword,
    username,
    firstname,
    lastname,
    "bisexual",
    "{male, female}",
    true
  ]; // TRUE TO FALSE TO ENABLE VERIFICATION
  pool.query(text, values);
  return true;
}

async function availUsername(username) {
  const text = `
    SELECT 
      id 
    FROM 
      users 
    WHERE 
      username = $1`;
  const values = [username];
  const { rowCount: resultsCount } = await pool.query(text, values);
  if (resultsCount) {
    return false;
  }
  return true;
}

async function availEmail(email) {
  const text = `
    SELECT 
      id 
    FROM 
      users 
    WHERE 
      email = $1`;
  const values = [email];
  const { rowCount: resultsCount } = await pool.query(text, values);
  if (resultsCount) {
    return false;
  }
  return true;
}
