import { PUBSUB_NEW_NOTIFICATION } from "../shared/constants";
import { withFilter } from "apollo-server";

export const resolvers = {
  Subscription: {
    newNotification: {
      subscribe: withFilter(
        (_, __, { pubsub }) => pubsub.asyncIterator(PUBSUB_NEW_NOTIFICATION),
        (payload, variables) => {
          console.log(...payload);
          return (
            payload.newNotification.conversationId === variables.conversationId
          );
        }
        // peut etre qu'il faut ici verifier que la conversation appartient bien au user
      )
    }
  }
};
