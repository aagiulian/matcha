import DataLoader from "dataloader";
import { User } from "../User";
import { Like } from "../Like";

const batchUsers = async ids => {
  const users = await User.findByIds(ids);
  const userMap = {};
  users.forEach(u => {
    userMap[u.id] = u;
  });
  return ids.map(id => userMap[id]);
};

const batchLike = async ids => {
  const users = await User.findByIds(ids);
  const userMap = {};
  users.forEach(u => {
    userMap[u.id] = u;
  });
  return ids.map(id => userMap[id]);
};

const batchProfiles = async ids => {
  const profiles = await User.getProfileByIds(ids);

  let profileMap = {};
  profiles.forEach(u => {
    profileMap[u.id] = u;
  });
  return ids.map(id => profileMap[id]);
};

const profileLoader = () => new DataLoader(batchProfiles);
const userLoader = () => new DataLoader(batchUsers);
const likeLoader = () => new DataLoader(batchLike);

export {
 profileLoader,
 userLoader,
 likeLoader 
};
