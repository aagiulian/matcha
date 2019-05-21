import { PUBSUB_NEW_MESSAGE, MESSAGE_NOTIFICATION } from "../shared/constants";
// import { PUBSUB_NEW_NOTIFICATION } from "../../notification/shared/constants";
import Message from "../../../models/Message";
import Notification from "../../../models/Notification";
import moment from "moment";

export const resolvers = {
  Mutation: {
    createMessage: async (_, { message }, { user, pubsub }) => {
      message.sendId = user.id;
      message.datetime = moment.now();
      const PUBSUB_NEW_NOTIFICATION = "PUBSUB_NEW_NOTIFICATION ";

      gqlMsg = await Message.save(message);
      gqlNotif = await Notification.save(message, MESSAGE_NOTIFICATION);

      pubsub.publish(PUBSUB_NEW_MESSAGE, {
        newMessage: gqlMsg
      });
      pubsub.publish(PUBSUB_NEW_NOTIFICATION, {
        newNotification: gqlNotif
      });

      return true;
    }
  }
};
