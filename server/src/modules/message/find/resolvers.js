import Message from "../../../models/Message";
import Conversation from "../../../models/Conversation";
import { ForbiddenError } from "apollo-server";

//   Message: {
//     user: ({ userId }, _, { userLoader }) => userLoader.load(userId)
//   },
export const resolvers = {
  Query: {
    messages: async (_, { conversationId }, { user }) => {
      if (Conversation.isParty(user.id, conversationId) === false) {
        throw new ForbiddenError(
          "Not your conversation, get the fuck outta here !"
        );
      }

      return Message.find(conversationId);
    }
  }
};
