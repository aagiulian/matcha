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

let database = {
  users: []
};

const typeDefs = gql`
  directive @isAuthenticated on FIELD_DEFINITION
  directive @isOwner on FIELD_DEFINITION

  type User {
    id: ID!
    email: String! 
    hashedPassword: String! @isAuthenticated
  }

  type SignupResponse {
    id: ID!
    email: String!
  }

  type AuthPayload {
    success: Boolean!
    token: String
  }

  type Mutation {
    signup(email: String!, password: String!): SignupResponse!
    login(email: String!, password: String!): AuthPayload!
  }

  type Query {
    me(userID: Int!): User @isOwner
    allUsers: [User]
  }
`;

const resolvers = {
  Query: {
    me(_, args) {
      console.log("args:");
      return database.users[0];
      const users = database.users.filter(user => user.id == args.userID);

      if (users.length) return users[0];
    },
    allUsers() {
      console.log("allusers");
      return database.users;
    }
  },
  Mutation: {
    signup: async (_, args) => {
      let hashedPassword = await bcrypt.hash(args.password, 10);
      let id = database.users.length;
      database.users.push({ id, email: args.email, hashedPassword });
      return { id, email: args.email };
    },
    login: async (_, args) => {
      let users = database.users.filter(user => user.email === args.email);
      if (
        0 < users.length &&
        (await bcrypt.compare(args.password, users[0].hashedPassword))
      ) {
        let user = users[0];
        let token = generateToken(user);
        return { success: true, token: token }
      } else {
        return { success: false, token: null }
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
