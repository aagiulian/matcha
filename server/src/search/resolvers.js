import { Search } from "../user"

export const resolvers = {
  Query: {
    search: (_, args, context) => Search.search(args.input, context)
  }
}
