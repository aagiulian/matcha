import { AuthenticationError } from "apollo-server";
import jwt from "jsonwebtoken";
const bcrypt = require("bcrypt");
const { generateToken } = require("../auth-helpers/generateToken");
const { pool } = require("../database");
import { getProfileInfo } from "../controllers/userCalls";
import { resetPasswordMail } from "../auth-helpers/passwordReset";
import { sendMailToken } from "../auth-helpers/emailVerification";
import {
  getUserByEmail,
  getUserById,
  getUserByUsername
} from "../controllers/userCalls";

const resolvers = {
  User: {
    profileInfo: async ({ id }) => ({ id })
  },
  ProfileInfo: {
    username: async ({ id }) => {
      const { username } = await getProfileInfo(id);
      return username;
    },
    email: async ({ id }) => {
      const { email } = await getProfileInfo(id);
      return email;
    }
  },
  Query: {
    user: (_, { id }) => ({ id }),
    me(_, args) {
      return database.users[0];
      const users = database.users.filter(user => user.id == args.userID);

      if (users.length) return users[0];
    },
    async allUsers(obj, args, context, info) {
      const text = "SELECT username, email FROM users";
      const res = await pool.query(text);
      if (res.rowCount) {
        console.log(res.rows);
        return res.rows;
      } else {
        return null;
      }
    }
  },
  Mutation: {
    signup: async (_, { input: { email, password, username } }, context) => {
      //const transporter = context.transporter;
      console.log("contexttttttttttt:", context);
      const hashedPassword = await bcrypt.hash(password, 10);
      const text =
        "INSERT INTO users(email, hashed_password, username, verified) VALUES($1, $2, $3, $4)";
      const values = [email, hashedPassword, username, false];
      pool.query(text, values);
      sendMailToken(username, email);
      return { email: email };
    },
    login: async (_, { input: { username, password } }) => {
      const text =
        "SELECT id, hashed_password, username, verified FROM users WHERE username = $1";
      const values = [username];
      const { rows: results, rowCount: resultsCount } = await pool.query(
        text,
        values
      );
      console.log(results);
      if (resultsCount) {
        if (await bcrypt.compare(password, results[0].hashed_password)) {
          if (results[0].verified === false) {
            throw new AuthenticationError(
              "Your email hasn't been verified yet."
            );
          } else {
            const token = generateToken(results[0]);
            return { success: true, token: token };
          }
        } else {
          throw new AuthenticationError("Bad username or password.");
        }
      } else {
        throw new AuthenticationError("Bad username or password.");
      }
    },
    resetPasswordRequest: async (_, { email }) => {
      try {
        const { username, id } = await getUserByEmail(email);
        const token = generateToken({ username, id });
        resetPasswordMail({ token, email });
        return true;
      } catch (e) {
        console.log(e);
        // si le user n'existe pas
        return false;
      }
    },
    resetPassword: (_, { input: { token, password } }) => {
      jwt.verify(token, process.env.JWT_PUBLIC, async (err, decoded) => {
        if (err) {
          console.log(err);
        } else {
          const hashedPassword = await bcrypt.hash(password, 10);
          const text = "UPDATE users SET hashed_password = $1 WHERE id = $2";
          const values = [hashedPassword, decoded.id];
          pool.query(text, values);
        }
      });
      return true;
    }
  }
};

module.exports = {
  resolvers
};
