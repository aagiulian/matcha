const { forEachField } = require('graphql-tools');
const { getArgumentValues } = require('graphql/execution/values');
const jwt = require('jsonwebtoken');
const { createError } = require('apollo-errors');

const AuthorizationError = createError('AuthorizationError', {
  message: 'You are not authorized.'
});


const directiveResolvers = {
  isAuthenticated(result, source, args, context) {
    const token = context.headers.authorization;
        
    if (!token) {
      throw new AuthorizationError({
        message: 'You must supply a JWT for authorization!'
      });
    }
    try {
      const decoded = jwt.verify(
        token.replace('Bearer ', ''),
        process.env.JWT_PUBLIC
      );
      return result;
    } catch (err) {
      throw new AuthorizationError({
        message: 'You are not authorized.'
      });
    }
  },
  hasScope(result, source, args, context) {
    const token = context.headers.authorization;
    const expectedScopes = args.scope;
    if (!token) {
      throw new AuthorizationError({
        message: 'You must supply a JWT for authorization!'
      });
    }
    try {
      const decoded = jwt.verify(
        token.replace('Bearer ', ''),
        process.env.JWT_PUBLIC
      );
      const scopes = decoded.scope.split(' ');
      if (expectedScopes.some(scope => scopes.indexOf(scope) !== -1)) {
        return result;
      }
    } catch (err) {
      return Promise.reject(
        new AuthorizationError({
          message: `You are not authorized. Expected scopes: ${expectedScopes.join(
            ', '
          )}`
        })
      );
    }
  }
};

// Credit: agonbina https://github.com/apollographql/graphql-tools/issues/212
const attachDirectives = schema => {
  forEachField(schema, field => {
    const directives = field.astNode.directives;
    directives.forEach(directive => {
      const directiveName = directive.name.value;
      const resolver = directiveResolvers[directiveName];

      if (resolver) {
        const oldResolve = field.resolve;
        const Directive = schema.getDirective(directiveName);
        const args = getArgumentValues(Directive, directive);

        field.resolve = function() {
          const [source, _, context, info] = arguments;
          let promise = oldResolve.call(field, ...arguments);

          const isPrimitive = !(promise instanceof Promise);
          if (isPrimitive) {
            promise = Promise.resolve(promise);
          }

          return promise.then(result =>
            resolver(result, source, args, context, info)
          );
        };
      }
    });
  });
};


const attachUserToContext = (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    const decoded = jwt.verify(
      token.replace('Bearer ', ''),
      process.env.JWT_PUBLIC
    );
    req.user = decoded;
    next();
  } else {
    res
      .status(401)
      .send({ message: 'You must supply a JWT for authorization!' });
  }
};


const checkAuthAndResolve = (context, controller) => {
  const token = context.headers.authorization;
  if (!token) {
    throw new AuthorizationError({
      message: `You must supply a JWT for authorization!`
    });
  }
  const decoded = jwt.verify(
    token.replace('Bearer ', ''),
    process.env.JWT_PUBLIC
  );
  return controller.apply(this, [decoded]);
};

const checkScopesAndResolve = (
  context,
  expectedScopes,
  controller,
  ...params
) => {
  const token = context.headers.authorization;
  if (!token) {
    throw new AuthorizationError({
      message: `You must supply a JWT for authorization!`
    });
  }
  const decoded = jwt.verify(
    token.replace('Bearer ', ''),
    process.env.JWT_PUBLIC
  );
  const scopes = decoded.scope;
  if (!scopes) {
    throw new AuthorizationError({ message: 'No scopes supplied!' });
  }
  if (scopes && expectedScopes.some(scope => scopes.indexOf(scope) !== -1)) {
    return controller.apply(this, params);
  } else {
    throw new AuthorizationError({
      message: `You are not authorized. Expected scopes: ${expectedScopes.join(
        ', '
      )}`
    });
  }
};


module.exports = {
	AuthorizationError,
	directiveResolvers,
	attachDirectives,
	attachUserToContext,
	checkAuthAndResolve,
	checkScopesAndResolve
};
