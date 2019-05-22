import { PUBSUB_NEW_MESSAGE } from "../shared/constants";
import { withFilter } from "apollo-server";

export const resolvers = {
  Subscription: {
    newMessage: {
      subscribe: withFilter(
        (_, __, { pubsub }) => pubsub.asyncIterator(PUBSUB_NEW_MESSAGE),
        (payload, variables) => {
          return payload.newMessage.conversationId === variables.conversationId;
        }
        // peut etre qu'il faut ici verifier que la conversation appartient bien au user
      )
    }
  }
};
