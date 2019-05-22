export const resolvers = {
  Message: {
    emitter: ({ id }) => ({ id }),
    recipient: ({ id }) => ({ id })
  }
};
