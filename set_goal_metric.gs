const set_goal_metric = () => {
  metrics_to_upload = getRowsAsArray('Metric Upload');
  metrics_to_upload.forEach(metric => {
     var metric_data = {"data": {
      // "target_number_value": metric["Target Value"],
      // "current_number_value": metric["Starting Value"],
      "precision": metric["Precision"],
      "progress_source": metric["Progress Source"],
      "unit": metric["Unit"],
    }};
      var header = {
      "method": "post",
      "contentType" : "application/json",
      "headers" : {
      "Authorization" : "Bearer " + API_TOKEN
    },
      "payload": JSON.stringify(metric_data)
    }
    var goal_metric_endpoint = BASE_URL + GOALS + "/" + metric["gid"] + "/setMetric";
    var result = doPost(goal_metric_endpoint, header); 
  })
};set
