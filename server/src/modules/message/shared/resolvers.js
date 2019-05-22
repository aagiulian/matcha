export const resolvers = {
  Message: {
    emitter: ({ emitter }) => ({ id: emitter }),
    recipient: ({ recipient }) => ({ id: recipient })
  }
};
