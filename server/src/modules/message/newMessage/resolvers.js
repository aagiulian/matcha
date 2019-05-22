import { PUBSUB_NEW_MESSAGE } from "../shared/constants";
import { withFilter } from "apollo-server";

export const resolvers = {
  Subscription: {
    newMessage: {
      subscribe: withFilter(
        (_, __, { pubsub }) => pubsub.asyncIterator(PUBSUB_NEW_MESSAGE),
        (payload, variables, { user }) => {
          // ici on check si l'user est soit l'emetteur soit le recepteur peut etre que recepteur ??
          if (
            user.id == payload.newMessage.recipient ||
            user.id == payload.newMessage.emitter
          ) {
            return (
              payload.newMessage.conversationId === variables.conversationId
            );
          }
        }
      )
    }
  }
};
