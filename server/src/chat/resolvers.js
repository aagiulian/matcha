import { Conversation } from "../Conversation";
import { UserInputError } from "apollo-server";

export const resolvers = {
  Conversation: {
    // id: ({ id }) => Conversation.list(id),
    friend: ({ friend }) => ({ id: friend })
  },
  Mutation: {
    findOrCreateConv: (_, { userId }, { user }) => {
      if (userId == user.id) {
        throw new UserInputError("Can't start a conversation with yourself");
      }
      return Conversation.findOrCreate(userId, user.id);
    }
  }
};
