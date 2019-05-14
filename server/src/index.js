/*********************************************************************************/
/* Use script `gen-jwt-keys.sh` to generate public and private keys in .env file */
/*********************************************************************************/

require("dotenv").config();
import util from "util";
import jwt from "jsonwebtoken";
import express from "express";
import { ApolloServer, gql } from "apollo-server";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { getUserLocation } from "./controllers/geolocation.js";

import { makeExecutableSchema } from "graphql-tools";
import {
  getUserFromToken,
  attachUserToContext,
  OwnerDirective,
  AuthenticationDirective
} from "./auth-helpers/directives";
import { typeDefs } from "./schema/schema";
import { resolvers } from "./resolvers/resolvers";

import fakeProfiles from "./fake_profiles.json";
import { pool } from "./database";

import { getUserByUsername } from "./controllers/userCalls";
import { sendMailToken } from "./auth-helpers/emailVerification";

//console.log("fake profile:", fakeProfiles[0]);

const app = express();

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

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  schemaDirectives: {
    isOwner: OwnerDirective,
    isAuthenticated: AuthenticationDirective
  }
});

const attachToContext = funs => req =>
  funs.reduce((toAttach, fun) => Object.assign(toAttach, fun(req)), {});

//const pubsub = new PubSub();

//console.log("pubsub async:", pubsub.asyncIterator);

const server = new ApolloServer({
  schema,
  context: async ({ req, connection }) => {
    //console.log("server req:", util.inspect(req, {showHidden: false, depth:1}));
    //console.log("server req:", Object.keys(req));

    //console.log("server req headers:", util.inspect(req.headers,{showHidden: false, depth:null}));
    if (connection) {
      //console.log("connection:", util.inspect(connection, {showHidden: false, depth:null}));
      return {
        ...connection.context
        //pubsub
      };
    } else {
      const token = req.headers["authorization"] || null;
      return {
        //pubsub,
        user: getUserFromToken(token),
        location: await getUserLocation(req.headers),
        //location: geoip.lookup(clientIpAddress(req.headers))
      };
    }
  },
  subscriptions: {
    onConnect: (connectionParams, webSocket, context) => {
      console.log(
        `Subscription client connected using Apollo server's built-in SubscriptionServer.`
      );
      //console.log("connectio params:", connectionParams);
      if (connectionParams.authToken) {
        const user = getUserFromToken(connectionParams.authToken);
        //console.log("user:", user);
        return {
          user
        };
      }
      console.log("Missing auth token for websocket");
      /*
      console.log("connection params:", connectionParams);
      console.log("websocket", webSocket);
      console.log("context", context);
      */
    },
    onDisconnect: (webSocket, context) => {
      console.log(`Subscription client disconnected.`);

      /*
      console.log("websocket", webSocket);
      console.log("context", context);
      */
    }
  }
  //  attachToContext([attachUserToContext,
  //                            ({ req, res }) => ({req, res, pubsub })])
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});

app.listen(4001, () => {
  console.log(`Server is running on PORT 4001`);
});
