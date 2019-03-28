const { ApolloServer, gql } = require('apollo-server');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


//Use script `gen-jwt-keys.sh` to generate public and private keys
let privateKEY = fs.readFileSync('./assets/keys/jwtRS256.key');
let publicKEY = fs.readFileSync('./assets/keys/jwtRS256.key.pub');

let issuer = "matcha";
let audience = "localost";

let database = {
  users: []
}

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
    signup: async (parent, args) => {
      let hashedPassword = await bcrypt.hash(args.password, 10);
      let id = database.users.length;
      database.users.push({id, email: args.emal, hashedPassword});

      let jwtPayload = {
        id: id,
        role: 0
      };
      let signOptions = {
        issuer,
        subject: args.email,
        audience,
        expiresIn: "12h",
        algorithm: "RS256"
      }
      let token = jwt.sign(jwtPayload, privateKEY, signOptions);
      console.log("token:", token);

      let verifyOptions = {
        issuer,
        subject:  args.email,
        audience ,
        expiresIn:  "12h",
        algorithm:  ["RS256"]
      };
      let legit = jwt.verify(token, publicKEY, verifyOptions);
      console.log("\nJWT verification result: " + JSON.stringify(legit));
      
      return {token, user: args.email};
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
