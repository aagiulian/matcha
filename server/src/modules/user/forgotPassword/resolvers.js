import jwt from "jsonwebtoken";
import { generateToken } from "../../auth-helpers/generateToken";
import { resetPasswordEmail } from "../../auth-helpers/passwordReset";
import { User } from "../../../models/User";

export const resolvers = {
  Mutation: {
    sendForgotPasswordEmail: async (_, { email }) => {
      try {
        const { username, id } = await User.findByEmail(email);
        const token = generateToken({ username, id });
        resetPasswordEmail({ token, email });
        return true;
      } catch (e) {
        console.log(e);
        // si le user n'existe pas
        return false;
      }
    },
    forgotPasswordChange: (_, { input: { token, newPassword } }) => {
      jwt.verify(token, process.env.JWT_PUBLIC, async (err, decoded) => {
        if (err) {
          console.log(err);
        } else {
          User.updatePassword(id, newPassword);
        }
      });
      return true;
    }
  }
};
