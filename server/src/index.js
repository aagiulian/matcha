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

const initTables = fs.readFileSync("./tables.sql").toString();

let database = {
  users: []
};

//console.log("jwtprivate:", process.env.JWT_PRIVATE);
//console.log("jwtpublic :", process.env.JWT_PUBLIC);

const typeDefs = gql`
  directive @isAuthenticated on FIELD_DEFINITION
  directive @isOwner on FIELD_DEFINITION

  scalar DateTime
  enum SexualOrientation {
    HETEROSEXUAL
    HOMOSEXUAL
    BISEXUAL
  }
  enum Gender {
    MALE
    FEMALE
    FTM
    MTF
  }
  enum ConnectionType {
    CONNECTED
    DISCONNECTED
  }

  type Node {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type User {
    id: ID!
    profileInfo: ProfileInfo!
    position: String!
    hashtags: [Hashtag]
    isOnline: Boolean!
    popularity_score: String!
    lastSeen: String!
    protected: ProtectedInfo!
  }

  type ProtectedInfo {
    hashedPassword: String! @isAuthenticated
  }

  type ProfileInfo {
    username: String!
    firstname: String!
    lastName: String!
    gender: Gender!
    dob: String!
    bio: String!
    numPics: Int!
    urlPp: String!
    pictures: [Picture]
    sexualOrientation: SexualOrientation!
    email: String!
  }

  type Relation {
    visitedBy: [User]
    likes: [User]
    matches: [User]
    blocks: [User]
    conversation: [Conversation]
  }

  type Hashtag {
    id: ID!
    name: String!
    users: [User]
  }

  type Picture {
    id: ID!
    user: User!
    url: String!
    # ismain: Boolean!
  }

  type Conversation {
    id: ID!
    messages: [Message]
    # userA: User
    # userB: User
  }

  type Message {
    id: ID!
    text: String!
    isRead: Boolean!
    datetime: String!
    emitter: User!
    # conversation: Conversation!
  }

  type SignupResponse {
    id: ID!
    email: String!
  }

  type AuthPayload {
    success: Boolean!
    token: String
  }

  input SignupInput {
    email: String!
    username: String!
    # name: String!
    # surname: String!
    password: String!
  }

  input LoginInput {
    username: String!
    password: String!
  }

  type Mutation {
    signup(input: SignupInput!): SignupResponse!
    login(input: LoginInput!): AuthPayload!
    visitedBy(userId: Int!): [User]!
  }

  type Query {
    me(userID: Int!): User @isOwner
    allUsers: [User]
    node(
      """
      The ID of the object
      """
      id: ID!
    ): Node
  }
`;

const pool = new Pool({
  host: "user-db-service",
  port: 5432,
  user: "admin",
  password: "password",
  database: "matcha"
});

pool.query("SELECT * FROM pg_catalog.pg_tables", (err, res) => {
  console.log(err, res);
});

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
    signup: async (_, { input }) => {
      let hashedPassword = await bcrypt.hash(input.password, 10);
      let id = database.users.length;
      database.users.push({
        id,
        email: input.email,
        hashedPassword,
        username: input.username
      });
      console.log(database);
      return { id, email: input.email };
    },
    login: async (_, { input }) => {
      let users = database.users.filter(
        user => user.username === input.username
      );
      if (
        0 < users.length &&
        (await bcrypt.compare(input.password, users[0].hashedPassword))
      ) {
        let user = users[0];
        let token = generateToken(user);
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
