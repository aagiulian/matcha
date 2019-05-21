import { Conversation } from "../../../models/Conversation";

export const resolvers = {
  Mutation: {
    findOrCreateConv: (_, { userId }, { user }) => {
      return Conversation.findOrCreate(userId, user.id);
    }
  }
};
