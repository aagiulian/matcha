import { Conversation } from "../../../models/Conversation";

export const resolvers = {
  Query: {
    listConversations: (_, __, { user }) => {
      return Conversation.list(user.id);
    }
  }
};
