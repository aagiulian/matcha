import { User } from "../../../models/User";

export const resolvers = {
  User: {
    profile: ({ id }) => ({ id }),
    conversations: ({ id }) => ({ id })
    // likes: ({ id }) => ({ id }),
    // matchs: ({ id }) => ({ id }),
    // visits: ({ id }) => ({ id }),
    // blocked: ({ id }) => ({ id })
  },
  Profile: {
    username: async ({ id }) => {
      const { username } = await User.getProfile(id);
      return username;
    },
    firstname: async ({ id }) => {
      const { firstname } = await User.getProfile(id);
      return firstname;
    },
    lastname: async ({ id }) => {
      const { lastname } = await User.getProfile(id);
      return lastname;
    },
    gender: async ({ id }) => {
      const { gender } = await User.getProfile(id);
      return gender;
    },
    dateOfBirth: async ({ id }) => {
      const { dateOfBirth } = await User.getProfile(id);
      return dateOfBirth;
    },
    bio: async ({ id }) => {
      const { bio } = await User.getProfile(id);
      return bio;
    },
    sexualOrientation: async ({ id }) => {
      const { sexualOrientation } = await User.getProfile(id);
      return sexualOrientation;
    },
    email: async ({ id }) => {
      const { email } = await User.getProfile(id);
      return email;
    },
    hashtags: async ({ id }) => {
      const { hashtags } = await User.getHashtags(id);
      return hashtags;
    }
  },
  Query: {
    user: (_, { id }) => ({ id })
  }
};
