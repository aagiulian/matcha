export const resolvers = {
  view: (_, { userId }, { user: { id } }) => {
    return { id: userId };
  }
};
