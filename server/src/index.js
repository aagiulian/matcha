
/*********************************************************************************/
/* Use script `gen-jwt-keys.sh` to generate public and private keys in .env file */
/*********************************************************************************/

require('dotenv').config()
const { ApolloServer, gql } = require('apollo-server');
const { makeExecutableSchema } = require('graphql-tools');
const { attachDirectives } = require('./auth-helpers/directives');
const bcrypt = require('bcrypt');
const { generateToken } = require('./auth-helpers/generateToken')


let database = {
  users: []
}

const typeDefs = gql`

  directive @isAuthenticated on QUERY | FIELD_DEFINITION

  type User {
    id: ID!
    email: String!,
    hashedPassword: String!
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
    signup(email: String!, password: String!): SignupResponse! @isAuthenticated
    login(email: String!, password: String!): AuthPayload!
  }

  type Query {
    allUsers: [User] @isAuthenticated
  }
`;

const resolvers = {
  Query: {
    allUsers: () => database.users
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
      if (0 < users.length && await bcrypt.compare(args.password, users[0].hashedPassword)) {
        let user = users[0];
        let token = generateToken(user);
        return { success: true, token }
      } else {
        return { success: false }
      }
    }
  }
}

const schema = makeExecutableSchema({ typeDefs, resolvers });

attachDirectives(schema);

const server = new ApolloServer({
  schema,
  context: ({ req }) => {
    return req;
  }
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
