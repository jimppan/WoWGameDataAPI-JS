const path = require('path');


var LOG_PREFIX = "[WoWGameDataAPI]"

// Default data directory WoWGameDataAPI-JS/data/2.5.1.39170/dungeonencounter.csv


var DATA_FOLDER                 = path.join(__dirname, "./data"); //WoWGameDataAPI-JS/data by default
var DATA_PATCH                  = '2.5.1.39170';

var DATA_FILES = 
{
  ENCOUNTERDATA:     "encounterdata.json",

  DUNGEONENCOUNTERS: "dungeonencounter.csv",
  CHRCLASSES:        "chrclasses.csv",
  CHRSPEC:           "chrspecialization.csv", // by default, using patch 5.0.3.15882 file, since TBC patch file doesnt exist
  CHRRACES:          "chrraces.csv",
  MAPS:              "map.csv"
}

module.exports =
{
  LOG_PREFIX,

  DATA_FOLDER,
  DATA_PATCH,

  DATA_FILES,
};