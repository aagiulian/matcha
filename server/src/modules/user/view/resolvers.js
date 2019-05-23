import Notification from "../../../models/Notification";
import Visit from "../../../models/Visit";
import {
  VISIT_NOTIFICATION,
  PUBSUB_NEW_NOTIFICATION
} from "../../notification/shared/constants";
import moment from "moment";

export const resolvers = {
  Mutation: {
    view: async (_, { userId }, { user, pubsub }) => {
      const datetime = await moment().format("YYYY-MM-DD hh:mm:ss Z");
      if (await Visit.do(user.id, userId, datetime)) {
        const gqlNotif = await Notification.save(
          { sendId: user.id, recvId: userId, datetime },
          VISIT_NOTIFICATION
        );
        pubsub.publish(PUBSUB_NEW_NOTIFICATION, {
          newNotification: gqlNotif
        });
      }
      return { id: userId };
    }
  }
};
