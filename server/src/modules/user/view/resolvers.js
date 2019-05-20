export const resolvers = {
  Mutation: {
    view: (_, { userId }, { user: { id } }) => {
      return { id: userId };
    }
  }
};
