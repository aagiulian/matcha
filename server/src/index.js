/*********************************************************************************/
/* Use script `gen-jwt-keys.sh` to generate public and private keys in .env file */
/*********************************************************************************/

require("dotenv").config();
import geoip from "geoip-lite";
import jwt from "jsonwebtoken";
import express from "express";
import { ApolloServer } from "apollo-server";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { genSchema } from "./utils/genSchema";

const { PubSub } = require("apollo-server");

const pubsub = new PubSub();
import { makeExecutableSchema } from "graphql-tools";
import {
  getUserFromToken,
  attachUserToContext,
  OwnerDirective,
  AuthenticationDirective
} from "./modules/auth-helpers/directives";

import { pool } from "./modules/postgres";

// import { getUserByUsername } from "./controllers/userCalls";
import { sendMailToken } from "./modules/auth-helpers/emailVerification";

//console.log("fake profile:", fakeProfiles[0]);

const app = express();
// const pubsub = RedisPubSub();
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

const schema = genSchema();

const attachToContext = funs => req =>
  funs.reduce((toAttach, fun) => Object.assign(toAttach, fun(req)), {});

//const pubsub = new PubSub();

//console.log("pubsub async:", pubsub.asyncIterator);

const clientIpAddress = headers => {
  if (headers) {
    const ipAddress = headers["x-forwarded-for"];
    if (ipAddress) return ipAddress;
  }
  return null;
};

const server = new ApolloServer({
  schema,
  context: ({ req, connection }) => {
    //console.log("server req:", util.inspect(req, {showHidden: false, depth:1}));
    //console.log("server req:", Object.keys(req));

    //console.log("server req headers:", util.inspect(req.headers,{showHidden: false, depth:null}));
    if (connection) {
      //console.log("connection:", util.inspect(connection, {showHidden: false, depth:null}));
      // console.log("connection context", connection.context);
      // console.log("req", req);
      return {
        ...connection.context,
        pubsub
      };
    } else {
      const token = req.headers["authorization"] || null;
      return {
        user: getUserFromToken(token),
        location: geoip.lookup(clientIpAddress(req.headers)),
        pubsub
      };
    }
  },
  subscriptions: {
    onConnect: (connectionParams, webSocket, context) => {
      console.log(
        `Subscription client connected using Apollo server's built-in SubscriptionServer.`
      );
      console.log("connectio params:", connectionParams);

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
