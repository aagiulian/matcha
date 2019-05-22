import { PUBSUB_NEW_MESSAGE, MESSAGE_NOTIFICATION } from "../shared/constants";
import { PUBSUB_NEW_NOTIFICATION } from "../../notification/shared/constants";
import Message from "../../../models/Message";
import Notification from "../../../models/Notification";
import moment from "moment";
import Conversation from "../../../models/Conversation";
import { ForbiddenError } from "apollo-server";

//pas sur qu'on ait besoin de l'id de l'autre dans les parametres la conv seul ca suffit
// ou alors il faut check que l'autre id correspond bien a la conv
export const resolvers = {
  Mutation: {
    createMessage: async (_, { message }, { user, pubsub }) => {
      message.sendId = user.id;
      message.datetime = moment().format("YYYY-MM-DD hh:mm:ss Z");

      if (!(await Conversation.isParty(user.id, message.convId))) {
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
