import Conversation from "../../../models/Conversation";

export const resolvers = {
  Mutation: {
    findOrCreateConv: (_, { userId }, { user }) => {
      // ici il faut donc check que l'user existe et que l'autre a le droit de lui parler
      return Conversation.findOrCreate(userId, user.id);
    }
  }
};
