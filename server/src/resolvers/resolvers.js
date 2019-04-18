import { AuthenticationError } from "apollo-server";
const bcrypt = require("bcrypt");
const { generateToken } = require("../auth-helpers/generateToken");
const { pool } = require("../database");
import { getProfileInfo } from "../controllers/userCalls";

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
    async allUsers() {
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
    signup: async (
      _,
      { input: { email, password, username } },
      { transporter }
    ) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const text =
        "INSERT INTO users(email, hashed_password, username, verified) VALUES($1, $2, $3, $4)";
      const values = [email, hashedPassword, username, false];
      pool.query(text, values);
      sendMailToken(transporter, username, email);
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
    }
  }
};

module.exports = {
  resolvers
};
