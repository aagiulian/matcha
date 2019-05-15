import { PubSub, AuthenticationError, UserInputError } from "apollo-server";
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
  getUserByUsername,
  getUserHashtags,
  getHashtagsList,
  newUser,
  updateUser
} from "../controllers/userCalls";
import { storeUpload } from "../controllers/imageUtils";
import { readdirSync } from "fs";

const pubsub = new PubSub();

const USER_LOGGED = "USER_LOGGED";

const resolvers = {
  User: {
    profileInfo: async ({ id }) => ({ id })
  },
  ProfileInfo: {
    username: async ({ id }) => {
      const { username } = await getProfileInfo(id);
      return username;
    },
    firstname: async ({ id }) => {
      const { firstname } = await getProfileInfo(id);
      return firstname;
    },
    lastname: async ({ id }) => {
      const { lastname } = await getProfileInfo(id);
      return lastname;
    },
    gender: async ({ id }) => {
      const { gender } = await getProfileInfo(id);
      return gender;
    },
    dateOfBirth: async ({ id }) => {
      const { dateOfBirth } = await getProfileInfo(id);
      return dateOfBirth;
    },
    bio: async ({ id }) => {
      const { bio } = await getProfileInfo(id);
      return bio;
    },
    sexualOrientation: async ({ id }) => {
      const { sexualOrientation } = await getProfileInfo(id);
      return sexualOrientation;
    },
    email: async ({ id }) => {
      const { email } = await getProfileInfo(id);
      return email;
    },
    hashtags: async ({ id }) => {
      const { hashtags } = await getUserHashtags(id);
      return hashtags;
    }
  },
  Query: {
    user: (_, { id }) => ({ id }),
    me: (_, args, { user: { id } }) => ({ id }),
    async allUsers(obj, args, context, info) {
      const text = "SELECT id FROM users";
      const res = await pool.query(text);
      if (res.rowCount) {
        console.log(res.rows);
        return res.rows;
      } else {
        return null;
      }
    },
    // NE FAIRE QU'UNE SEULE QUERY POSTGRE
    suggestions: async (_, args, { user: { id } }) => {
      let text = "SELECT gender, lookingfor FROM users WHERE id = $1";
      let values = [id];
      var res = await pool.query(text, values);
      if (res.rowCount) {
        const { gender, lookingfor } = res.rows[0];
        if (lookingfor.length == 1) {
          text =
            "SELECT id FROM users WHERE id != $1 AND $2 = ANY (lookingfor) AND gender = $3 ";
          values = [id, gender, lookingfor[0]];
        } else {
          text =
            "SELECT id FROM users WHERE id != $1 AND $2 = ANY (lookingfor)";
          values = [id, gender];
        }
        let suggestions = await pool.query(text, values);
        console.log(suggestions);
        return suggestions.rows;
      }
      return null;
    },
    hashtags: async () => await getHashtagsList()
  },
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
    },
    login: async (_, { input: { username, password } }) => {
      const text =
        'SELECT id, hashed_password as "hashedPassword", username, verified FROM users WHERE username = $1';
      const values = [username];
      const { rows: results, rowCount: resultsCount } = await pool.query(
        text,
        values
      );
      console.log(results);
      if (resultsCount) {
        if (await bcrypt.compare(password, results[0].hashedPassword)) {
          if (results[0].verified === false) {
            throw new AuthenticationError(
              "Your email hasn't been verified yet."
            );
          } else {
            const token = generateToken(results[0]);
            pubsub.publish(USER_LOGGED, {
              userLogged: username
            });
            return { success: true, token: token };
          }
        } else {
          throw new UserInputError("Wrong password", {
            //Only a POC, we are not supposed to specify which field failed in this case
            invalidArgs: {
              password: "Wrong password"
            }
          });
        }
      } else {
        throw new UserInputError("Bad username", {
          invalidArgs: {
            username: "Bad username"
          }
        });
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
    },
    updateMe: async (_, { input }, { user: { id } }) => {
      if (!id) {
        throw new AuthenticationError(
          "You need to be logged in order to update your profile."
        );
      }
      const res = await updateUser(input, id);
      if (res !== true) {
        throw new UserInputError("Duplicate", {
          invalidArgs: res
        });
      }
      return await getUserById(id);
    },
    view: (_, { userId }, { user: { id } }) => {
      return { id: userId };
    },
    uploadFile: async (_, { file: [file] }) => {
      const { createReadStream, filename } = await file;
      const stream = createReadStream();
      await storeUpload({ stream, filename });
      return true;
    }
  },
  Subscription: {
    userLogged: {
      subscribe: (parent, args) => {
        console.log("pubsub:", pubsub);
        return pubsub.asyncIterator(USER_LOGGED);
      }
    }
  }
};

module.exports = {
  resolvers
};
