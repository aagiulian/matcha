import { AuthenticationError, UserInputError } from "apollo-server";
import { User } from "../../../models/User";

export const resolvers = {
  Mutation: {
    updateMe: async (_, { input }, { user: { id } }) => {
      if (!id) {
        throw new AuthenticationError(
          "You need to be logged in order to update your profile."
        );
      }
      const res = await User.update(input, id);
      if (res !== true) {
        throw new UserInputError("Duplicate", {
          invalidArgs: res
        });
      }
      return await User.findById(id);
    }
  }
};
