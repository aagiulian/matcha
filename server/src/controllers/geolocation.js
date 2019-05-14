import axios from "axios";
import geoip from "geoip-lite";


const geolocationFromApi = async (ip) => {
  const truc = process.env.IPGEOLOCATION_IO_API_KEY;
  //console.log("truc:", truc);
  const url = `https://api.ipgeolocation.io/ipgeo?apiKey=${truc}&ip=${ip}`;
  //console.log("url:", url);
  let response = null;
  try {
    response = await axios.get(url);
  } catch (e) {
    //console.log("error");
    console.log("error from ipgeolocation.io:", e);
    response = null;
  }
  //console.log("response:", response);
  if (response) {
    const { longitude, latitude } = response.data;
    return { longitude, latitude }
  }
  return null;
}


const geolocFromipapi = async (ip) => {
  const url = `http://ip-api.com/json/${ip}`;
  let response = null;
  try {
    response = await axios.get(url);
  } catch (e) {
    console.log("error from ip-api.com:", e);
    response = null;
  }
  if (response) {
    //return response;
    const { lon:longitude, lat:latitude } = response.data;
    return { longitude, latitude }
  }
  return null;
}

const geolocFromipstack = async (ip) => {
  const IPSTACK_API_KEY = process.env.IPSTACK_API_KEY;
  const url = `http://api.ipstack.com/${ip}?access_key=${IPSTACK_API_KEY}`;
  let response = null;
  try {
    response = await axios.get(url);
  } catch (e) {
    console.log("error from ipstack.com:", e);
    response = null;
  }
  if (response) {
    //return response;
    const { longitude, latitude } = response.data;
    return { longitude, latitude }
  }
  return null;
}

const geolocFromipdata = async (ip) => {
  const IPDATA_API_KEY = process.env.IPDATA_API_KEY;

  const url = `https://api.ipdata.co/${ip}?api-key=${IPDATA_API_KEY}`; let response = null;
  try {
    response = await axios.get(url);
  } catch (e) {
    console.log("error from ipdata.com:", e);
    response = null;
  }
  if (response) {
    //return response;
    const { longitude, latitude } = response.data;
    return { longitude, latitude }
  }
  return null;
}

const geolocationFromGeoIpLite = (ip) => {
  const locationIp = geoip.lookup(ip);
  //console.log("geoloc ip:", locationIp);
  const {ll:[latitude, longitude]} = locationIp;

  return { longitude, latitude }
}

const clientIpAddress = headers => {
  if (headers) {
    const ipAddress = headers["x-forwarded-for"];
    if (ipAddress) return ipAddress;
  }
  return null;
}

const getUserLocation = async (headers) => {
  const clientIp = clientIpAddress(headers);

  /*
  console.log("looking up geoloc for ip:", clientIp);

  const locationIpApi = await geolocationFromApi(clientIp);
  const locationipapi = await geolocFromipapi(clientIp);
  const locationipstack = await geolocFromipstack(clientIp);
  const locationipdata = await geolocFromipdata(clientIp);

  if (locationIpApi) {
    console.log("ipgeolocation.io", Object.keys(locationIpApi));
  }
  if (locationipapi) {
    console.log("ip-api.com:", Object.keys(locationipapi.data));
  }
  if (locationipstack) {
    console.log("ipstack:", Object.keys(locationipstack.data));
  }
  if (locationipdata) {
    console.log("ipdata:", Object.keys(locationipdata.data));
  }

  if (locationIpApi) {
    console.log("ipgeolocation.io", `${locationIpApi.latitude},${locationIpApi.longitude}`);
  }
  if (locationipapi) {
    console.log("ip-api.com:", `${locationipapi.latitude},${locationipapi.longitude}`);
  }
  if (locationipstack) {
    console.log("ipstack:", `${locationipstack.latitude},${locationipstack.longitude}`);
  }
  if (locationipdata) {
    console.log("ipdata:", `${locationipdata.latitude},${locationipdata.longitude}`);
  }

  */
  const locationIp = geolocationFromGeoIpLite(clientIp);
  console.log("geoloc ip:", locationIp);
  return locationIp;
}


module.exports = {
  getUserLocation
};
