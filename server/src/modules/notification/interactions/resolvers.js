import Like from "../../../models/Like";
import Block from "../../../models/Block";
import Notification from "../../../models/Notification";

export const resolvers = {
  Mutation: {
    like: (_, { userId }, { user }) => {},
    unLike: (_, { userId }, { user }) => {},
    block: (_, { userId }, { user }) => {},
    unBlock: (_, { userId }, { user }) => {}
  }
};
