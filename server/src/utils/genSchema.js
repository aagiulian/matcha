import { mergeTypes, mergeResolvers } from "merge-graphql-schemas";
import * as path from "path";
import * as fs from "fs";
import { makeExecutableSchema } from "graphql-tools";
import * as glob from "glob";
import {
  OwnerDirective,
  AuthenticationDirective
} from "../modules/auth-helpers/directives";

export const genSchema = () => {
  const pathToModules = path.join(__dirname, "..");
  const graphqlTypes = glob
    .sync(`${pathToModules}/**/*.graphql`)
    .map(x => fs.readFileSync(x, { encoding: "utf8" }));

  const resolvers = glob
    .sync(`${pathToModules}/**/resolvers.?s`)
    .map(resolver => require(resolver).resolvers);

  return makeExecutableSchema({
    typeDefs: mergeTypes(graphqlTypes),
    resolvers: mergeResolvers(resolvers),
    schemaDirectives: {
      isOwner: OwnerDirective,
      isAuthenticated: AuthenticationDirective
    }
  });
};
