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

const fakeProfiles = require("./fake_profiles.json");

console.log("fake profile:", fakeProfiles[0]);

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


// TO CLEAN DB
var DatabaseCleaner = require("database-cleaner");
var databaseCleaner = new DatabaseCleaner("postgresql");
databaseCleaner.clean(pool, () => console.log("Database cleaned !"));
//


const resolvers = {
  Query: {
    me(_, args) {
      return database.users[0];
      const users = database.users.filter(user => user.id == args.userID);

      if (users.length) return users[0];
    },
    async allUsers() {
      let text = "SELECT username, email FROM users";
      let res = await pool.query(text);
      if (res.rowCount) {
        console.log(res.rows);
        return res.rows;
      } else {
        return null;
      }
    }
  },
  Mutation: {
    signup: async (_, { input }) => {
      let hashedPassword = await bcrypt.hash(input.password, 10);
      let text =
        "INSERT INTO users(email, hashed_password, username) VALUES($1, $2, $3)";
      let values = [input.email, hashedPassword, input.username];
      // try {
      pool.query(text, values);
      // } catch (e) {
      //   console.log("ERRORSIGNUP: ", e);
      // }
      // Database.users.push({
      //  id,
      //  email: input.email,
      //  hashedPassword,
      //  username: input.username
      // );
      // console.log(database);
      return { email: input.email };
    },
    login: async (_, { input }) => {
      let text =
        "SELECT id, hashed_password, username FROM users WHERE username = $1";
      let values = [input.username];
      let res = await pool.query(text, values);
      console.log("res: ");
      console.log(res);
      // let users = database.users.filter(
      //   user => user.username === input.username
      // );
      console.log("");
      if (
        res.rowCount &&
        (await bcrypt.compare(input.password, res.rows[0].hashed_password))
      ) {
        // let user = users[0];
        let token = generateToken(res.rows[0]);
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
