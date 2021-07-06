const path = require('path');


var LOG_PREFIX = "[WoWGameDataAPI]"

// Default data directory WoWGameDataAPI-JS/data/2.5.1.39170/dungeonencounter.csv
// Format DATA_FOLDER/DATA_PATCH/DATA_FILE_X

var DATA_FOLDER                 = path.join(__dirname, "./data"); //WoWGameDataAPI-JS/data by default
var DATA_PATCH                  = '2.5.1.39170';
var DATA_FILE_DUNGEONENCOUNTERS = "dungeonencounter.csv"


module.exports =
{
  LOG_PREFIX: LOG_PREFIX,

  DATA_FOLDER: DATA_FOLDER,
  DATA_PATCH: DATA_PATCH,

  DATA_FILE_DUNGEONENCOUNTERS: DATA_FILE_DUNGEONENCOUNTERS,
};