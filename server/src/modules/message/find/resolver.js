export const resolvers = {
  //   Message: {
  //     user: ({ userId }, _, { userLoader }) => userLoader.load(userId)
  //   },
  Query: {
    messages: async (_, { conversationId }, { user }) => {
      return Message.find({
        where: {
          conversationId,
          userId: user.id
        }
      });
    }
  }
};
