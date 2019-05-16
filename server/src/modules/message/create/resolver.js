import { PUBSUB_NEW_MESSAGE } from "../shared/constants";
import { pool } from "../../../database";
import moment from "moment";

function createMessage(message) {
  let text = `
  INSERT INTO
    messages(
      text,
      emitter,
      recipient,
      conversation_id,
      created_at,
      is_read,
    )
  VALUES($1, $2, $3, $4, $5, $6)`;
  let values = [text, emitter, receiver];
}

export const resolvers = {
  Mutation: {
    createMessage: async (_, { message }, { user, pubsub }) => {
      const time = moment.now();
      console.log(time);
      const dbMessage = "TODO";

      const gqlMessage = {
        text: message.text,
        emitter: user.id,
        recipient: message.recipientId,
        conversationId: message.conversationId,
        datetime: time,
        isRead: false
      };

      pool.query();
      // create message en db

      pubsub.publish(PUBSUB_NEW_MESSAGE, {
        newMessage: {
          message: dbMessage
        }
      });
      return true;
    }
  }
};
