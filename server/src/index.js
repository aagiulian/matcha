/*********************************************************************************/
/* Use script `gen-jwt-keys.sh` to generate public and private keys in .env file */
/*********************************************************************************/

import express from "express";
import nodemailer from "nodemailer";
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

console.log("fake profile:", fakeProfiles[0]);

const app = express();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "giuliano.arthur@gmail.com",
    pass: "fyrquvpgysozpyip"
  }
});

app.get("/verify/:token", async (req, res) => {
  const user = await jwt.verify(
    req.params.token,
    process.env.JWT_PUBLIC,
    (err, decoded) => {
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
        const values = [true, user.username];
        pool.query(text, values);
      }
    }
  );
  // res.redirect("http://localhost:3000/login"); // le redirect ne fonctionne pas
});

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  schemaDirectives: {
    isOwner: OwnerDirective,
    isAuthenticated: AuthenticationDirective
  }
});

const server = new ApolloServer({
  schema,
  context: { attachUserToContext, transporter }
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});

app.listen(4001, () => {
  console.log(`Server is running on PORT 4001`);
});
