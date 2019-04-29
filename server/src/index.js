/*********************************************************************************/
/* Use script `gen-jwt-keys.sh` to generate public and private keys in .env file */
/*********************************************************************************/

require("dotenv").config();
import express from "express";
//import { ApolloServer, gql } from "apollo-server";
import { graphqlExpress,
         grahpiqlExpress,
} from "apollo-server-express";
import bodyParser from "body-parser";
import cors from "cors";

import { execute, subscribe } from "graphql";
import { createServer } from "http";
import { SubscriptionServer } from 'subscriptions-transport-ws';

import { makeExecutableSchema } from "graphql-tools";
import jwt from "jsonwebtoken";
import { pool } from "./database";
import { typeDefs } from "./schema/schema";
import fakeProfiles from "./fake_profiles.json";
import { resolvers } from "./resolvers/resolvers";
import {
  attachUserToContext,
  OwnerDirective,
  AuthenticationDirective
} from"./auth-helpers/directives";
import { getUserByUsername } from "./controllers/userCalls";
import { sendMailToken } from "./auth-helpers/emailVerification";

//console.log("fake profile:", fakeProfiles[0]);

const PORT = 4000;
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

const attachToContext = funs => ({ req }) =>
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

app.use('/', bodyParser.json(), graphqlExpress({
  schema,
  context: async ({ req, connection }) => {
    if (connection) {
      return {
        ...connection.context,
      };
    } else {
      const token = req.header["authorization"] || null;
      return {
        user: getUserFromToken(token)
      }
    }
  },
}));

app.use('/graphiql', graphiqlExpress({
  endpointURL: '/',
  subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`
}));

const ws = createServer(app);
ws.listen(PORT, () => {
  console.log(`Apollo Server is now running on http://${process.env.HOST}:${PORT}/subscriptions`)
}

// TODO: check this => https://spectrum.chat/apollo/apollo-server/using-subscriptions-with-apollo-server-modules~b0f852c2-6134-48af-9ac1-63f95738970d
/*
const server = new ApolloServer({
  schema,
  context: async ({ req, connection }) => {
    if (connection) {
      return {
        ...connection.context,
      };
    } else {
      const token = req.header["authorization"] || null;
      return {
        user: getUserFromToken(token)
      }
    }
  },
//  attachToContext([attachUserToContext,
//                            ({ req, res }) => ({req, res, pubsub })])
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});

app.listen(4001, () => {
  console.log(`Server is running on PORT 4001`);
});

*/
