import { withFilter } from "apollo-server";
import {
  LIKE_NOTIFICATION,
  UNLIKE_NOTIFICATION,
  MATCH_NOTIFICATION,
  UNMATCH_NOTIFICATION
} from "./constants";
import Like from "../user/Like";
import Block from "../user/Block";
import Notification from "./Notification";

export const resolvers = {
  /*
  Mutation: {
    like: (_, { userId }, { user }) => {},
    unLike: (_, { userId }, { user }) => {},
    block: (_, { userId }, { user }) => {},
    unBlock: (_, { userId }, { user }) => {}
  },
  */
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
