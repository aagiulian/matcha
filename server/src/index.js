/*********************************************************************************/
/* Use script `gen-jwt-keys.sh` to generate public and private keys in .env file */
/*********************************************************************************/

require("dotenv").config();
import geoip from "geoip-lite";
import jwt from "jsonwebtoken";
import express from "express";
import { ApolloServer } from "apollo-server";
import { makeExecutableSchema } from "graphql-tools";

import { PubSub } from "apollo-server";
import { RedisPubSub } from "graphql-redis-subscriptions";

import { Geolocation } from "./utils/geolocation";
import { genSchema } from "./utils/genSchema";

import { profileLoader } from "./user";

import {
  OwnerDirective,
  AuthenticationDirective,
  getUserFromToken,
  sendMailToken
} from "./utils/auth";

import { pool } from "./utils/postgres";

const app = express();
// const pubsub = RedisPubSub();
const pubsub = new PubSub();

app.get("/verify/:token", async (req, res) => {
  console.log("express verify token");
  jwt.verify(req.params.token, process.env.JWT_PUBLIC, (err, decoded) => {
    if (err) {
      /// name: 'TokenExpiredError'
      // message: 'jwt expired'
      // expiredAt: [ExpDate]
      //         //
      //         name: 'JsonWebTokenError'
      // message:
      // 'jwt malformed'
      // 'jwt signature is required'
      // 'invalid signature'
      // 'jwt audience invalid. expected: [OPTIONS AUDIENCE]'
      // 'jwt issuer invalid. expected: [OPTIONS ISSUER]'
      // 'jwt id invalid. expected: [OPTIONS JWT ID]'
      // 'jwt subject invalid. expected: [OPTIONS SUBJECT]'

      console.log(err.name);
    } else {
      const text = "UPDATE users SET verified = $1 WHERE username = $2";
      const values = [true, decoded.username];
      pool.query(text, values);
    }
  });
  // res.redirect("http://localhost:3000/login"); // le redirect ne fonctionne pas
});

app.get("/sendVerification/:username", async (req, res) => {
  const username = req.params.username;
  const { email } = await getUserByUsername(username);
  if (email) {
    sendMailToken(username, email);
    // res.send(200);
  } //else {
  //   res.send(404);
  // }
});

const server = new ApolloServer({
  schema : genSchema(),
  context: async ({ req, connection }) => {
    if (connection) {
      return {
        ...connection.context,
        pubsub
      };
    } else {
      const token = req.headers["authorization"] || null;
      return {
        user: getUserFromToken(token),
        location: await Geolocation.getUserLocation(req.headers),
        pubsub,
        profileLoader: profileLoader()
      };
    }
  },
  subscriptions: {
    onConnect: (connectionParams, webSocket, context) => {
      console.log(
        `Subscription client connected using Apollo server's built-in SubscriptionServer.`
      );
      console.log("Subscription connection params:", connectionParams);

      if (connectionParams.Authorization) {
        // ici faire un try catch au cas ou le user soit mauvais mais du coup on check
        // au moment d'une subscription si l'user est auth et on peut throw une error
        // si ce n'est pas le cas
        try {
          const user = getUserFromToken(
            connectionParams.Authorization.replace("Bearer ", "")
          );
          return { user };
        } catch (e) {
          return;
        }
      }
      if (connectionParams.authToken) {
        const user = getUserFromToken(connectionParams.authToken);
        return {
          user
        };
      }
      console.log("Missing auth token for websocket");
    },
    onDisconnect: (webSocket, context) => {
      console.log(`Subscription client disconnected.`);
    }
  }
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});

app.listen(4001, () => {
  console.log(`Server is running on PORT 4001`);
});
