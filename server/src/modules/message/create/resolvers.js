import { PUBSUB_NEW_MESSAGE, MESSAGE_NOTIFICATION } from "../shared/constants";
// import { PUBSUB_NEW_NOTIFICATION } from "../../notification/shared/constants";
import Message from "../../../models/Message";
import Notification from "../../../models/Notification";
import moment from "moment";
import Conversation from "../../../models/Conversation";
import { ForbiddenError } from "apollo-server";

export const resolvers = {
  Mutation: {
    createMessage: async (_, { message }, { user, pubsub }) => {
      message.sendId = user.id;
      message.datetime = moment().format("YYYY-MM-DD hh:mm:ss Z");
      const PUBSUB_NEW_NOTIFICATION = "PUBSUB_NEW_NOTIFICATION ";

      if (!Conversation.isParty(user.id, message.convId)) {
        throw new ForbiddenError(
          "Not your conversation, get the fuck outta here !"
        );
      }

      const gqlMsg = await Message.save(message);
      const gqlNotif = await Notification.save(message, MESSAGE_NOTIFICATION);

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
