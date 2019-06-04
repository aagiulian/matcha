import moment from "moment";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { AuthenticationError, UserInputError } from "apollo-server";

import User from "./User";
import Like from "./Like";
import Hashtags from "./Hashtags";
import Block from "./Block";
import Visit from "./Visit";

import { pool } from "../utils/postgres";
import {
  generateToken,
  sendMailToken,
  resetPasswordEmail
} from "../utils/auth";
import { profileLoader, userLoader, likeLoader } from "./loaders";

import {
  Notification,
  USER_LOGGED,
  VISIT_NOTIFICATION,
  PUBSUB_NEW_NOTIFICATION
} from "../notifications";

export const resolvers = {
  User: {
    profile: ({ id }) => ({ id }),
    conversations: ({ id }) => ({ id }),
    likes: async ({ id }) => Like.list(id),
    matchs: async ({ id }) => Like.matchList(id),
    visits: async ({ id }) => Visit.list(id),
    blocked: async ({ id }) => Block.list(id)
  },

  Profile: {
    username: async ({ id }, _, { profileLoader }) => {
      const { username } = await profileLoader.load(id);
      return username;
    },
    firstname: async ({ id }, _, { profileLoader }) => {
      const { firstname } = await profileLoader.load(id);
      return firstname;
    },
    lastname: async ({ id }, _, { profileLoader }) => {
      const { lastname } = await profileLoader.load(id);
      return lastname;
    },
    gender: async ({ id }, _, { profileLoader }) => {
      const { gender } = await profileLoader.load(id);
      return gender;
    },
    dateOfBirth: async ({ id }, _, { profileLoader }) => {
      const { dateOfBirth } = await profileLoader.load(id);
      return dateOfBirth;
    },
    bio: async ({ id }, _, { profileLoader }) => {
      const { bio } = await profileLoader.load(id);
      return bio;
    },
    sexualOrientation: async ({ id }, _, { profileLoader }) => {
      const { sexualOrientation } = await profileLoader.load(id);
      return sexualOrientation;
    },
    email: async ({ id }, _, { profileLoader }) => {
      const { email } = await profileLoader.load(id);
      return email;
    },
    hashtags: async ({ id }) => {
      const { hashtags } = await User.getHashtags(id);
      return hashtags;
    },
    location: async ({ id }, _, { profileLoader }) => {
      const { location } = await profileLoader.load(id);
      return location;
    }
  },

  Query: {
    user: (_, { id }) => ({ id }),
    me: (_, args, { user: { id } }) => ({ id }),
    hashtags: async () => await Hashtags.getList(),
    async findUsers() {
      const text = "SELECT id FROM users";
      const res = await pool.query(text);
      if (res.rowCount) {
        return res.rows;
      } else {
        return null;
      }
    }
  },

  Mutation: {
    sendForgotPasswordEmail: async (_, { email }) => {
      try {
        const { username, id } = await User.findByEmail(email);
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
          User.updatePassword(id, newPassword);
        }
      });
      return true;
    },

    login: async (_, { input: { username, password } }, { pubsub }) => {
      const text = `
       SELECT 
        id, 
        hashed_password as "hashedPassword",
        username, 
        verified 
       FROM 
        users 
       WHERE 
        username = $1`;
      const values = [username];
      const { rows: results, rowCount: resultsCount } = await pool.query(
        text,
        values
      );
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

    signup: async (
      _,
      { input: { email, password, username, firstname, lastname } },
      { location }
    ) => {
      email = email.toLowerCase();
      username = username.toLowerCase();
      const res = await User.new({
        email,
        password,
        username,
        firstname,
        lastname,
        location
      });
      if (res !== true) {
        throw new UserInputError("Duplicate", {
          invalidArgs: res
        });
      }
      sendMailToken(username, email);
      return { email: email };
    },

    updateMe: async (_, { input }, { user: { id } }) => {
      if (!id) {
        throw new AuthenticationError(
          "You need to be logged in order to update your profile."
        );
      }
      const res = await User.update(input, id);
      if (res !== true) {
        throw new UserInputError("Duplicate", {
          invalidArgs: res
        });
      }
      return await User.findById(id);
    },

    view: async (_, { userId }, { user, pubsub }) => {
      const datetime = await moment().format("YYYY-MM-DD hh:mm:ss Z");
      if (await Visit.do(user.id, userId, datetime)) {
        const gqlNotif = await Notification.save(
          { sendId: user.id, recvId: userId, datetime },
          VISIT_NOTIFICATION
        );
        pubsub.publish(PUBSUB_NEW_NOTIFICATION, {
          newNotification: gqlNotif
        });
      }
      return { id: userId };
    }
  }
};
