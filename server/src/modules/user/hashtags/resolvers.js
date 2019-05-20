import Hashtags from "../../../models/Hashtags";

export const resolvers = {
  Query: {
    hashtags: async () => await Hashtags.getList()
  }
};
