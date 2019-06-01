import moment from "moment";

export const getLocation = ret => {
  if (ret.location) {
    ret.location = { lng: ret.location.x, lat: ret.location.y };
  } else {
    ret.location = { lng: null, lat: null };
  }
  return ret;
};

export const getDateOfBirth = ret => {
  if (ret.dateOfBirth !== null) {
    ret.dateOfBirth = moment(ret.dateOfBirth).format("YYYY-MM-DD");
  }
  return ret;
};
