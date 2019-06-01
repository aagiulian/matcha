import Search from "./Search"

export const resolvers = {
  Query: {
    search: async (_, args, context) => await Search.search(args.input, context),
    //match: (_, args, context) => Search.match(args.input, context)
  }
}
