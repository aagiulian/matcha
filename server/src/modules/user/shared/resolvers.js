import { User } from "../../../models/User";
import Like from "../../../models/Like";
import Block from "../../../models/Block";
import Visit from "../../../models/Visit";

export const resolvers = {
  User: {
    profile: ({ id }) => ({ id }),
    conversations: ({ id }) => ({ id }),
    likes: async ({ id }) => await Like.list(id),
    matchs: async ({ id }) => await Like.matchList(id),
    visits: async ({ id }) => await Visit.list(id),
    blocked: async ({ id }) => await Block.list(id)
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
    },
    location: async ({ id }) => {
      const { location } = await User.getProfile(id);
      return location;
    }
  },
  Query: {
    user: (_, { id }) => ({ id })
  }
};
