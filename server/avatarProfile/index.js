const { default: axios } = require("axios");
const cheerio = require("cheerio");

const SL_RESIDENT_URL = "http://world.secondlife.com/resident/";

function getAvatarProfile(userId) {
  return axios
    .get(SL_RESIDENT_URL + userId)
    .then((res) => {
      const $ = cheerio.load(res.data);
      return $("img.parcelimg").attr("src");
    })
    .catch((err) => {
      console.log("Error getting user avatar from SecondLife", err);
    });
}

module.exports = getAvatarProfile;
