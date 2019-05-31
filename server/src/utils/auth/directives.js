import { defaultFieldResolver } from "graphql";
import jwt from "jsonwebtoken";
import { createError, ForbiddenError } from "apollo-errors";
import { SchemaDirectiveVisitor } from "apollo-server";


const AuthError = createError("AuthorizationError", {
  message: "You are not authorized."
});

class AuthenticationDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    // destructuring the `resolve` property off of `field`, while providing a default value `defaultFieldResolver` in case `field.resolve` is undefined.
    // destructuring the field's `name` to use in the Error message
    const { resolver = defaultFieldResolver, name } = field;

    field.resolve = async function(...args) {
      console.log("args:", args);
      const context = args[2];

      if (context.user == null)
        throw new AuthError(`You must authenticate to access ${name}`);

      const result = await resolver.apply(this, args);
      console.log("result:", result);
      return result;
    };
  }
}

class OwnerDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    // destructuring the `resolve` property off of `field`, while providing a default value `defaultFieldResolver` in case `field.resolve` is undefined.
    // destructuring the field's `name` to use in the Error message
    const { resolver = defaultFieldResolver, name } = field;

    field.resolve = async function(source, args, context, info) {
      // the query variables are available at info.variableValues
      const {
        variableValues: { userID }
      } = info;

      // checks that the logged in user is the same as the one in the query variable `userID`
      if (context.user.id !== userID)
        throw new AuthError(`Unauthorized field ${name}`);

      // runs if the condition above passes
      const result = await resolver.call(this, source, args, context, info);
      return result;
    };
  }
}

const getUserFromToken = token => {
  if (token) {
    const user = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_PUBLIC
    );
    return user;
  } else {
    return null;
  }
};

export {
  OwnerDirective,
  AuthenticationDirective,
  getUserFromToken
};
