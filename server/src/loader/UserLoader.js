import { User } from "../../models/User";
import DataLoader from "dataloader";

const batchUsers = async ids => {
  const users = await User.findByIds(ids);
  const userMap = {};
  users.forEach(u => {
    userMap[u.id] = u;
  });
  return ids.map(id => userMap[id]);
};

export const userLoader = () => new DataLoader(batchUsers);
