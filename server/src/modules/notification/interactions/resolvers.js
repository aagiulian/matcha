import Like from "../../../models/Like";
import Block from "../../../models/Block";
import Notification from "../../../models/Notification";

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
  }
};
