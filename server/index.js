const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`

type Query {
  token: String
}

type AuthPayload {
  token: String
  user: String
}

type Mutation {
  signup(email: String!, password: String!): AuthPayload!
}
`;

const resolvers = {
  Mutation: {
    signup: (parent, args) => {
      console.log(args)
      return {token: "toto", user: "bar"}
    }
  }
}

const server = new ApolloServer({
   typeDefs,
   resolvers,
   });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});