import Conversation from "../../../models/Conversation";
import { UserInputError } from "apollo-server";

export const resolvers = {
  Mutation: {
    findOrCreateConv: (_, { userId }, { user }) => {
      if (userId == user.id) {
        throw new UserInputError("Can't start a conversation with yourself");
      }
      return Conversation.findOrCreate(userId, user.id);
    }
  }
};
