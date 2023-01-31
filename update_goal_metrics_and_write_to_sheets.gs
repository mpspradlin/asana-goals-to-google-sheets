// https://developers.asana.com/docs/get-goals

const API_TOKEN = "API TOKEN" // Add your API Token
const BASE_URL = "https://app.asana.com/api/1.0/"
const SENSE_ORG_ID = "ORG ID" // Add your API Token
const GOALS = "goals"
const STATUS = "status_updates"
const ORG_LEVEL = "?workspace="
const OPT_FIELDS = "?opt_fields=followers,due_on"
const TIME_PERIODS = "&?time_periods=" // optional, can return back a particular period

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
  Logger.log(endpoint)
  var dataResponse = UrlFetchApp.fetch(endpoint, GET_HTTP_HEADER).getContentText();
  // Logger.log(dataResponse)
  return JSON.parse(dataResponse);
}

const doPost = (endpoint, options) => {
  var dataResponse = UrlFetchApp.fetch(endpoint, options).getContentText();
  return JSON.parse(dataResponse);
}

const flattenObject = (obj) => {
  const flattened = {}

  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      Object.assign(flattened, flattenObject(obj[key]))
    } else {
      flattened[key] = obj[key]
    }
  })

  return flattened
}

function clear(sheet, headerSize = 0) {
  const nRows = sheet.getMaxRows();                   // rows in the sheet
  const nColumns = sheet.getMaxColumns();             // columns in the sheet
  const lastCell = sheet.getRange(nRows, nColumns);   // last cell in the sheet
  // get cells from the row just below the header from the first to the last column
  const data = sheet.getRange('A' + (headerSize + 1) + ':' + lastCell.getA1Notation());  
  data.clear(); // clear the sheet
}

function toStringFromHtml(html)
{
html = '<div>' + html + '</div>';
html = html.replace(/<br>/g,"");
var document = XmlService.parse(html);
var strText = XmlService.getPrettyFormat().format(document);
strText = strText.replace(/<[^>]*>/g,"");
return strText.trim();
}


const allGoalsToUpdate = () => {
   var sheet = SpreadsheetApp.getActive().getSheetByName('Update Metrics');
   var namedRanges = sheet.getNamedRanges();
   var goalNameArray = []; // array to store the name of each named range 

   for (var i = 0; i < namedRanges.length; i++) {
    goalNameArray[i] = [];
    goalNameArray[i].push(namedRanges[i].getName());    
    Logger.log(goalNameArray);
 }

  goalNameArray.forEach(goal => {
    var range = sheet.getRange(goal[0]);
    var col = range.getColumn();
    var row = range.getRow();
    var goal_id = sheet.getRange(row,col+1).getValue();
    var goal_metric_value = sheet.getRange(row,col+2).getValue();
    updateGoal(goal_id,goal_metric_value);
  })
 
}
const updateGoal = (goal_id, goal_metric_value) => {
  var endpoint = BASE_URL + GOALS + "/" + goal_id + "/setMetricCurrentValue";
  var data = {"data": {"current_number_value": goal_metric_value}};
  var header = {
      "method": "post",
      "contentType" : "application/json",
      "headers" : {
        "Authorization" : "Bearer " + API_TOKEN
      },
      "payload": JSON.stringify(data)
  }
  doPost(endpoint,header);
}

const getStatusUpdate = (status_gid) => 
{
  var result = doGet(BASE_URL + STATUS + "/" + status_gid + "?opt_fields=html_text");
  return result;
}

const main = () => {
  // https://developers.asana.com/docs/get-goals
  var goal_metric_updates = allGoalsToUpdate();
  var goal_data = [];
  var offset = 0;
  var limit = 100;
  var hasMore = true;

  while (hasMore) {
    Logger.log(offset)
    if (offset != 0) {
        Logger.log(offset)
        var result = doGet(BASE_URL + GOALS + ORG_LEVEL + SENSE_ORG_ID + "&offset=" + offset + "&limit=" + limit);
        var goals = result["data"];
    } else {
        var result = doGet(BASE_URL + GOALS + ORG_LEVEL + SENSE_ORG_ID + "&limit=" + limit);
        var goals = result["data"];
    }; 
    
    goals.forEach(goal => {
    get_goal_meta_data = doGet(BASE_URL + GOALS + "/" + goal["gid"]);
    goal_meta_data = get_goal_meta_data["data"];
    const flattenedStruct = flattenObject(goal_meta_data);
    const headers = new Set(Object.keys(flattenedStruct));
    get_parent_goal_data = doGet(BASE_URL + GOALS + "/" + goal["gid"] + "/parentGoals");
    parent_goal_data = get_parent_goal_data["data"]
    if (parent_goal_data.length != 0) {
      parent_goal_data = parent_goal_data["0"]
      var parent_goal_id = parent_goal_data["gid"] || "No Parent ID";
    } else {var parent_goal_id = "No Parent Link"}  
    var goal_name = goal_meta_data["name"] || "Unknown";
    const { name: team_name, gid: team_id} = goal_meta_data.team || {};
    var status = goal_meta_data["status"] || "No Logged Status";
    const { name: owner_name, gid: owner_gid} = goal_meta_data.owner || {};
    const { start_on, end_on, period, display_name } = goal_meta_data.time_period || {};   
    var gid = String(goal_meta_data["gid"]) || "No Goal ID";
    var current_status_update = goal_meta_data["current_status_update"] || "No Status Update";
    var status_gid = current_status_update["gid"] || "No goal status update, so no status Id";
    var status_title = current_status_update["title"] || "No Status Title";
    var status_update_content = getStatusUpdate(status_gid)
    var status_result = status_update_content["data"] || "No goal status update, so no status title";
    var status_text = status_result["text"] || "No goal update, so no text"
    var rich_status_text = status_result["html_text"] || "No rich status";
    var metric = goal_meta_data["metric"] || "No set Metric";
    const { target_number_value, 
            initial_number_value, 
            current_display_value, 
            current_number_value, 
            progress_source } = goal_meta_data.metric || {};
    var link = "=HYPERLINK(\"http://app.asana.com/0/" + goal_meta_data["gid"] + "\")";
    
    goal_data.push(
    [goal_name,
      team_name,
      status,
      owner_name,
      start_on,
      end_on,
      period,
      link,
      metric,
      target_number_value,
      initial_number_value,
      current_number_value,
      current_display_value,
      progress_source,
      gid,
      current_status_update,
      status_title,
      status_gid,
      status_text,
      rich_status_text,
      parent_goal_id
      ]);
    }) 
      // check for more pages to retrieve
    if (result["next_page"] != null) {
        var offset = result["next_page"]["offset"];
        Logger.log("HERE HERE");
      } else {
          hasMore = false;
      }
  };
    var rows = goal_data
    rows.sort();
    ss = SpreadsheetApp.getActiveSpreadsheet();
    sheet = ss.getSheetByName("Goals");
    var existingConditionalFormatRules = sheet.getConditionalFormatRules(); // gets rules, which will be cleared after the header 
    const headerSize = 1;
    clear(sheet, headerSize);  // cleans out everything but Row 1
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1,1,goal_data.length, goal_data[0].length).setValues(goal_data);
    sheet.setConditionalFormatRules(existingConditionalFormatRules);
}  
