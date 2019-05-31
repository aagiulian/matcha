import Conversation from "./Conversation";
import { withFilter, UserInputError } from "apollo-server";

export const resolvers = {
  Conversation: {
    // id: ({ id }) => Conversation.list(id),
    friend: ({ friend }) => ({ id: friend })
  },
  Message: {
    emitter: ({ emitter }) => ({ id: emitter }),
    recipient: ({ recipient }) => ({ id: recipient })
  },
  Query: {
    messages: async (_, { conversationId }, { user }) => {
      if (Conversation.isParty(user.id, conversationId) === false) {
        throw new ForbiddenError(
          "Not your conversation, get the fuck outta here !"
        );
      }

      return Message.find(conversationId);
    }
  },
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
    },
    findOrCreateConv: (_, { userId }, { user }) => {
      if (userId == user.id) {
        throw new UserInputError("Can't start a conversation with yourself");
      }
      return Conversation.findOrCreate(userId, user.id);
    }
  },
  Subscription: {
    newMessage: {
      subscribe: withFilter(
        (_, __, { pubsub }) => pubsub.asyncIterator(PUBSUB_NEW_MESSAGE),
        (payload, _, { user }) => {
          // ici on check si l'user est soit l'emetteur soit le recepteur peut etre que recepteur ??
          return (
            user.id === payload.newMessage.recipient ||
            user.id === payload.newMessage.emitter
          );
        }
      )
    }
  }
};
