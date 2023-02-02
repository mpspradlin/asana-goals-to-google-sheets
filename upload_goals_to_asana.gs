const API_TOKEN = "API TOKEN" // Replace with your API TOKEN
const BASE_URL = "https://app.asana.com/api/1.0/"
const ORG_ID = "ORG ID" // Replace with your Org Id
const GOALS = "goals"
const STATUS = "status_updates"
const ORG_LEVEL = "?workspace="
const OPT_FIELDS = "?opt_fields=followers,due_on"

 var rows = [],
      data, 
      status, 
      statusColor, 
      statusDate, 
      lead, 
      name, 
      link;

const GET_HTTP_HEADER = {
    "contentType" : "application/json",
    "headers" : {
      "Authorization" : "Bearer " + API_TOKEN,
      "Accept" : "application/json"
    },
    "muteHttpExceptions" : true
  };

const POST_HTTP_HEADER = {
    "method": "post",
    "contentType" : "application/json",
    "headers" : {
      "Authorization" : "Bearer " + API_TOKEN
    }
  };

const doGet = (endpoint) => {
  var dataResponse = UrlFetchApp.fetch(endpoint, GET_HTTP_HEADER).getContentText();
  return JSON.parse(dataResponse);
}

const doPost = (endpoint, options) => {
  var dataResponse = UrlFetchApp.fetch(endpoint, options).getContentText();
  return JSON.parse(dataResponse);
}

function getRowsAsArray(sheet) {
  // Get the target sheet
  var sheet = SpreadsheetApp.getActive().getSheetByName(sheet);

  // Get the data range of the sheet
  var dataRange = sheet.getDataRange();

  // Get the values in the range as a 2D array
  var values = dataRange.getValues();

  // Get the keys from the first row
  var keys = values[0];

  // Create a dictionary for each row, using the keys from the first row
  var rowsAsDictionary = values.slice(1).map(function(row) {
    return row.reduce(function(acc, value, i) {
      acc[keys[i]] = value;
      return acc;
    }, {});
  });

  // Return the array of dictionaries
  return rowsAsDictionary;
}

const main = () => {
  var goal_api_endpoint = BASE_URL + GOALS;
  var goals_to_upload = getRowsAsArray('Sales Objectives'); // name of the tab with the Goal data as rows
  goals_to_upload.forEach(goal => {
    var data = {"data": {
      "name": goal["Key Result"],
      "due_on": goal["Due On"],
      "time_period": goal["Time Period"], 
      "start_on": goal["Start On"],
      "owner": goal["OwnerId"],
      "team": goal["Team"],
      "workspace": ORG_ID,
    }};
    var header = {
      "method": "post",
      "contentType" : "application/json",
      "headers" : {
      "Authorization" : "Bearer " + API_TOKEN
    },
      "payload": JSON.stringify(data)
    }
      doPost(goal_api_endpoint,header);
  })
}
