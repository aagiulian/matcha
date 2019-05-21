import { User } from "../../../models/User";

export const resolvers = {
  User: {
    profileInfo: async ({ id }) => ({ id })
  },
  ProfileInfo: {
    username: async ({ id }) => {
      const { username } = await User.getProfileInfo(id);
      return username;
    },
    firstname: async ({ id }) => {
      const { firstname } = await User.getProfileInfo(id);
      return firstname;
    },
    lastname: async ({ id }) => {
      const { lastname } = await User.getProfileInfo(id);
      return lastname;
    },
    gender: async ({ id }) => {
      const { gender } = await User.getProfileInfo(id);
      return gender;
    },
    dateOfBirth: async ({ id }) => {
      const { dateOfBirth } = await User.getProfileInfo(id);
      return dateOfBirth;
    },
    bio: async ({ id }) => {
      const { bio } = await User.getProfileInfo(id);
      return bio;
    },
    sexualOrientation: async ({ id }) => {
      const { sexualOrientation } = await User.getProfileInfo(id);
      return sexualOrientation;
    },
    email: async ({ id }) => {
      const { email } = await User.getProfileInfo(id);
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
