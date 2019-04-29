/*********************************************************************************/
/* Use script `gen-jwt-keys.sh` to generate public and private keys in .env file */
/*********************************************************************************/

import express from "express";
require("dotenv").config();
const { ApolloServer, gql } = require("apollo-server");
const { makeExecutableSchema } = require("graphql-tools");
const {
  attachUserToContext,
  OwnerDirective,
  AuthenticationDirective
} = require("./auth-helpers/directives");
const { typeDefs } = require("./schema/schema");
const { resolvers } = require("./resolvers/resolvers");

const fakeProfiles = require("./fake_profiles.json");
const { pool } = require("./database");
const jwt = require("jsonwebtoken");

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

const getUserFromToken = (token) => {
  if (token) {
    const user = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_PUBLIC
    );
    return user;
  } else {
    return null;
  }
}


// TODO: check this => https://spectrum.chat/apollo/apollo-server/using-subscriptions-with-apollo-server-modules~b0f852c2-6134-48af-9ac1-63f95738970d
const server = new ApolloServer({
  schema,
  context: ({ req, connection }) => {
    if (connection) {
      return {
        ...connection.context,
        //pubsub
      };
    } else {
      const token = req.header["authorization"] || null;
      return {
        //pubsub,
        user: getUserFromToken(token)
      }
    }
  },
  onConnect: async (connectionParams, webSocket, context) => {
    console.log(`Subscription client connected using Apollo server's built-in SubscriptionServer.`)
  },
  onDisconnect: async (webSocket, context) => {
    console.log(`Subscription client disconnected.`)
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
