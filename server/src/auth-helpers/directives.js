const { forEachField } = require('graphql-tools');
const { defaultFieldResolver } = require('graphql');
const { getArgumentValues } = require('graphql/execution/values');
const jwt = require('jsonwebtoken');
const { createError, ForbiddenError} = require('apollo-errors');
const { SchemaDirectiveVisitor } = require("apollo-server");


const AuthError = createError('AuthorizationError', {
  message: 'You are not authorized.'
});



class AuthenticationDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    // destructuring the `resolve` property off of `field`, while providing a default value `defaultFieldResolver` in case `field.resolve` is undefined.
    // destructuring the field's `name` to use in the Error message
    const { resolver = defaultFieldResolver, name } = field

    //field.resolve = async function (source, args, context, info) {
    field.resolve = async function (...args) {
      //console.log("context in resolver:", context.user);
      console.log("args:", args)
      const context = args[2];

      /*
      console.log("source:", source)
      console.log("context:", context)
      console.log("info:", info)
      */

      //console.log("context:",context);
      console.log("useruaieauie:",context.user);
      if (context.user == null)
      {
        console.log("on est dans le if");
        throw new AuthError(`You must authenticate to access ${name}`);
      }

      // runs if the condition above passes


      const result = await resolver.apply(this, args);
      console.log("result:", result);
      return result
    }
  }
}

class OwnerDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    // destructuring the `resolve` property off of `field`, while providing a default value `defaultFieldResolver` in case `field.resolve` is undefined.
    // destructuring the field's `name` to use in the Error message
    const { resolver = defaultFieldResolver, name } = field

    field.resolve = async function (source, args, context, info) {
      
      // the query variables are available at info.variableValues
      const {
        variableValues: { userID }
      } = info

      console.log("owner directive");
      console.log("\nuserID:", userID);

      console.log("\ncontext.user:", context.user);
      console.log("userID:", userID);
      console.log("user.id:", context.user.id);
      console.log("typeof userID:", typeof userID);
      console.log("typeof user.id:", typeof context.user.id);
      console.log("-----------------");
      

      // checks that the logged in user is the same as the one in the query variable `userID`
      if (context.user.id !== userID)
        throw new AuthError(`Unauthorized field ${name}`)


      // runs if the condition above passes
      const result = await resolver.call(this, source, args, context, info)
      console.log("result:", result);

      return result
    }
  }
}


/***********************************************************************/

const attachUserToContext = ({ req }) => {
  const token = req.headers.authorization;
  if (token) {
    const user = jwt.verify(
      token.replace('Bearer ', ''),
      process.env.JWT_PUBLIC
    );
    console.log("user:uieauie", user);
    return { user };
  }
  else
    return {user: null};
};

module.exports = {
  attachUserToContext,
  OwnerDirective,
  AuthenticationDirective
};
