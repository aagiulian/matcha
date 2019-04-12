/*********************************************************************************/
/* Use script `gen-jwt-keys.sh` to generate public and private keys in .env file */
/*********************************************************************************/

require("dotenv").config();
const { ApolloServer, gql } = require("apollo-server");
const { makeExecutableSchema } = require("graphql-tools");
const bcrypt = require("bcrypt");
const { generateToken } = require("./auth-helpers/generateToken");
const {
  attachUserToContext,
  OwnerDirective,
  AuthenticationDirective
} = require("./auth-helpers/directives");

const fs = require("fs");
const { Pool, Client } = require("pg");

const { typeDefs } = require("./schema/schema");

let database = {
  users: []
};

const pool = new Pool({
  host: "user-db-service",
  port: 5432,
  user: "admin",
  password: "password",
  database: "matcha"
});

/*
pool.query("SELECT * FROM pg_catalog.pg_tables", (err, res) => {
  console.log(err, res);
});
*/

const resolvers = {
  Query: {
    me(_, args) {
      return database.users[0];
      const users = database.users.filter(user => user.id == args.userID);

      if (users.length) return users[0];
    },
    allUsers() {
      return database.users;
    }
  },
  Mutation: {
    signup: async (_, { input }) => {
      let hashedPassword = await bcrypt.hash(input.password, 10);
      let id = database.users.length;
      pool.query(
        `INSERT INTO users(email, hashed_password, username) VALUES(
          ${input.email}, ${hashedPassword}, ${input.username})`
      );
      // Database.users.push({
      //  id,
      //  email: input.email,
      //  hashedPassword,
      //  username: input.username
      // );
      // console.log(database);
      return { id, email: input.email };
    },
    login: async (_, { input }) => {
      let text = "SELECT id, hashed_password FROM users WHERE username = $1";
      let values = [input.username];
      let user = await pool.query(text, values);
      // let users = database.users.filter(
      //   user => user.username === input.username
      // );
      if (
        0 < user.rows.length &&
        (await bcrypt.compare(input.password, user.rows[0].hashedPassword))
      ) {
        // let user = users[0];
        let token = generateToken(user.rows[0]);
        return { success: true, token: token };
      } else {
        return { success: false, token: null };
      }
    }
  }
};

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
  context: attachUserToContext
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
