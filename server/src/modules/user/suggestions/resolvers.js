import { pool } from "../../postgres";
import { AuthenticationError, UserInputError } from "apollo-server";

export const resolvers = {};
/*
export const resolvers = {
  Query: {
    suggestions: async (_, __, { user: { id } }) => {
      const text = `
       SELECT 
        id, 
        hashed_password as "hashedPassword",
        username, 
        verified 
       FROM 
        users 
       WHERE 
        username = $1`;
      const values = [username];
      const { rows: results, rowCount: resultsCount } = await pool.query(
        text,
        values
      );
      console.log(results);
      if (resultsCount) {
        if (await bcrypt.compare(password, results[0].hashedPassword)) {
          if (results[0].verified === false) {
            throw new AuthenticationError(
              "Your email hasn't been verified yet."
            );
          } else {
            const token = generateToken(results[0]);
            pubsub.publish(USER_LOGGED, {
              userLogged: username
            });
            return { success: true, token: token };
          }
        } else {
          throw new UserInputError("Wrong password", {
            //Only a POC, we are not supposed to specify which field failed in this case
            invalidArgs: {
              password: "Wrong password"
            }
          });
        }
      } else {
        throw new UserInputError("Bad username", {
          invalidArgs: {
            username: "Bad username"
          }
        });
      }
    }
  }
};

*/
