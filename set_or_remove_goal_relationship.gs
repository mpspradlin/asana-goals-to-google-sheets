const set_goal_relationship = () => {
  goal_relationships_to_create = getRowsAsArray('Sales Objectives'); // this is the Google Sheet tab
  goal_relationships_to_create.forEach(goal_relationship => {
     var goal_relationship_data = {"data": {
      "supporting_resource": goal_relationship["supporting_goal_gid"], // this is the Sub Goal
      "resource_type": "goal_relationship",
      "resource_subtype": "subgoal",
      "precision": 0,
    }};
      var header = {
      "method": "post",
      "contentType" : "application/json",
      "headers" : {
      "Authorization" : "Bearer " + API_TOKEN
    },
      "payload": JSON.stringify(goal_relationship_data)
    }
   // depending on what you want to do, uncomment the different variables to add or remove supporting relationships.
    var add_supporting_relationship_endpoint = BASE_URL + GOALS + "/" + goal_relationship["gid"] + "/addSupportingRelationship";
    // var remove_supporting_relationship_endpoint = BASE_URL + GOALS + "/" + goal_relationship["gid"] + "/removeSupportingRelationship";
    var result = doPost(add_supporting_relationship_endpoint, header); 
    // var result = doPost(remove_supporting_relationship_endpoint, header); 
  })
};
