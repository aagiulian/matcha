import { UserInputError } from "apollo-server";
import { sendMailToken } from "../../auth-helpers/emailVerification";
import { User } from "../../../models/User";

export const resolvers = {
  Mutation: {
    signup: async (
      _,
      { input: { email, password, username, firstname, lastname } },
      { location }
    ) => {
      email = email.toLowerCase();
      username = username.toLowerCase();
      const res = await User.new({
        email,
        password,
        username,
        firstname,
        lastname,
        location
      });
      if (res !== true) {
        throw new UserInputError("Duplicate", {
          invalidArgs: res
        });
      }
      sendMailToken(username, email);
      return { email: email };
    }
  }
};
