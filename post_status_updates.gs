const STATUS_UPDATES = "status_updates"

// Used to prompt Goal Owner for initial status update
// Your user will need write access to the Goal

function postInitialStatusUpdate() {
  goals_to_update = getRowsAsArray('Status Update Needed'); // name of the GSheet tab with the Goals and `gid` to post to.
  goals_to_update.forEach(goal => {
     var status_data = {"data": {
      "title": "Status Update Needed",
      "text": "We need an initial status update, so setting to At Risk until first update",
      "status_type": "at_risk",
      "parent": goal["gid"]
    }};
      var header = {
      "method": "post",
      "contentType" : "application/json",
      "headers" : {
      "Authorization" : "Bearer " + API_TOKEN
    },
      "payload": JSON.stringify(status_data),
      "muteHttpExceptions": false
    }
    var status_update_endpoint = BASE_URL + STATUS_UPDATES;
    try {
      var result = doPost(status_update_endpoint, header); 
    } catch (error) {
    }  
  })
};
