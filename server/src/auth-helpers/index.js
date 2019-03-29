const jwt = require('jsonwebtoken');
const { createError } = require('apollo-errors');

const AuthorizationError = createError('AuthorizationError', {
  message: 'You are not authorized.'
});

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
	attachUserToContext,
	checkAuthAndResolve,
	checkScopesAndResolve
};