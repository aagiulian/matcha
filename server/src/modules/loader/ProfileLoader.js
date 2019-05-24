import { User } from "../../models/User";
import DataLoader from "dataloader";

const batchProfiles = async ids => {
  const profiles = await User.getProfileByIds(ids);

  let profileMap = {};
  profiles.forEach(u => {
    profileMap[u.id] = u;
  });
  return ids.map(id => profileMap[id]);
};

export const profileLoader = () => new DataLoader(batchProfiles);
