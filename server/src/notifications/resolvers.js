import { withFilter } from "apollo-server";
import Like from "../user/Like";
import Block from "../user/Block";
import Notification from "./Notification";
import { PUBSUB_NEW_NOTIFICATION, PUBSUB_NEW_UNSEEN_COUNT } from "./constants";

export const resolvers = {
  Mutation: {
    like: (_, { userId }, { user, pubsub }) => {
      const gqlInteract = Like.do(user.id, userId);
      const gqlNotif = Notification.save(gqlInteract);
      pubsub.publish(PUBSUB_NEW_NOTIFICATION, {
        newNotification: gqlNotif
      });
      return true;
    },
    unLike: (_, { userId }, { user, pubsub }) => {
      const gqlInteract = Like.undo(user.id, userId);
      const gqlNotif = Notification.save(gqlInteract);
      pubsub.publish(PUBSUB_NEW_NOTIFICATION, {
        newNotification: gqlNotif
      });
      return true;
    },
    block: (_, { userId }, { user }) => {
      Block.do(user.id, userId);
      return true;
    },
    unBlock: (_, { userId }, { user }) => {
      Block.undo(user.id, userId);
      return true;
    }
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
