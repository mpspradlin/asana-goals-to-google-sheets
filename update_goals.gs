const update_goals = () => {
  goals_to_update = getRowsAsArray('Goal Update');
  goals_to_update.forEach(goal => {
     var goal_data = {"data": {
      "team": goal["team"], // in this example, we are setting the Team on an existing Goal
    }};
      var header = {
      "method": "put",
      "contentType" : "application/json",
      "headers" : {
      "Authorization" : "Bearer " + API_TOKEN
    },
      "payload": JSON.stringify(goal_data)
    }
    var goal_metric_endpoint = BASE_URL + GOALS + "/" + goal["gid"];
    try {
      var result = doPost(goal_metric_endpoint, header); 
    } catch (error) {
      Logger.log(error);
    } 
    
  })
};
