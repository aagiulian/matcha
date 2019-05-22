import "../../../models/Conversation";

export const resolvers = {
  Conversation: {
    // id: ({ id }) => Conversation.list(id),
    friend: ({ friend }) => ({ id: friend })
  }
};
