import { AuthenticationError, UserInputError } from "apollo-server";
import { pool } from "../../postgres";

export const resolvers = {
  Mutation: {
    updateMe: async (_, { input }, { user: { id } }) => {
      if (!id) {
        throw new AuthenticationError(
          "You need to be logged in order to update your profile."
        );
      }
      const res = await updateUser(input, id);
      if (res !== true) {
        throw new UserInputError("Duplicate", {
          invalidArgs: res
        });
      }
      return await getUserById(id);
    }
  }
};

async function getUserById(id) {
  const text = `
    SELECT 
      id, 
      username, 
      hashed_password as "hashedPassword", 
      firstname, 
      lastname, 
      date_of_birth as "dateOfBirth", 
      gender, 
      sexual_orientation as "sexualOrientation", 
      bio, 
      num_pics as "numPics", 
      url_pp as "urlPp", 
      email, 
      last_seen as "lastSeen", 
      position, 
      popularity_score, 
      verified 
    FROM 
      users 
    WHERE 
      id = $1`;
  const values = [id];
  const { rows: results, rowCount: resultsCount } = await pool.query(
    text,
    values
  );
  if (resultsCount) {
    return results[0];
  } else {
    return null;
  }
}

async function updateUser(
  {
    username,
    firstname,
    lastname,
    email,
    gender,
    bio,
    dateOfBirth,
    sexualOrientation,
    tags
  },
  id
) {
  let dict = {
    male: {
      heterosexual: "{female}",
      homosexual: "{male}",
      bisexual: "{male,female}"
    },
    female: {
      heterosexual: "{male}",
      homosexual: "{female}",
      bisexual: "{male,female}"
    }
  };
  const lookingfor = gender ? dict[gender][sexualOrientation] : "{male,female}";
  let available = {};
  const user = await getUserById(id);
  if (user.username !== username) {
    available.username = (await availUsername(username))
      ? undefined
      : "Already exists";
  }
  if (user.email !== email) {
    available.email = (await availEmail(email)) ? undefined : "Already exists";
  }
  if (available.username !== undefined || available.email !== undefined) {
    return available;
  }
}

async function availUsername(username) {
  const text = `
    SELECT 
      id 
    FROM 
      users 
    WHERE 
      username = $1`;
  const values = [username];
  const { rowCount: resultsCount } = await pool.query(text, values);
  if (resultsCount) {
    return false;
  }
  return true;
}

async function availEmail(email) {
  const text = `
    SELECT 
      id 
    FROM 
      users 
    WHERE 
      email = $1`;
  const values = [email];
  const { rowCount: resultsCount } = await pool.query(text, values);
  if (resultsCount) {
    return false;
  }
  return true;
}
