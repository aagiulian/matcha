export const resolvers = {
  Query: {
    me: (_, args, { user: { id } }) => ({ id })
  }
};
