import { PUBSUB_NEW_NOTIFICATION } from "../shared/constants";
import { withFilter } from "apollo-server";

export const resolvers = {
  Mutation: {
    like: (_, { userId }, { user }) => {},
    unLike: (_, { userId }, { user }) => {},
    block: (_, { userId }, { user }) => {},
    unBlock: (_, { userId }, { user }) => {}
  },
  Subscription: {
    newNotification: {
      subscribe: withFilter(
        (_, __, { pubsub }) => pubsub.asyncIterator(PUBSUB_NEW_NOTIFICATION),
        (payload, _, { user }) => {
          return user.id == payload.newNotification.recipient;
        }
        // peut etre qu'il faut ici verifier que la conversation appartient bien au user
      )
    },
    newUnseenCount: {
      subscribe: withFilter(
        (_, __, { pubsub }) => pubsub.asyncIterator(PUBSUB_NEW_UNSEEN_COUNT),
        (payload, _, { user }) => {
          return user.id == payload.newUnseenCount.recipient;
        }
        // peut etre qu'il faut ici verifier que la conversation appartient bien au user
      )
    }
  }
};
