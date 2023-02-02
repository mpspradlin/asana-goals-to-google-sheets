function clear(sheet, headerSize = 0) {
  const nRows = sheet.getMaxRows();                   // rows in the sheet
  const nColumns = sheet.getMaxColumns();             // columns in the sheet
  const lastCell = sheet.getRange(nRows, nColumns);   // last cell in the sheet
  // get cells from the row just below the header from the first to the last column
  const data = sheet.getRange('A' + (headerSize + 1) + ':' + lastCell.getA1Notation());  
  data.clear(); // clear the sheet
}

const get_org_users = () => {
  var org_users_endpoint = BASE_URL + "users?workspace=" + SENSE_ORG_ID;
  var result = doGet(org_users_endpoint);
  const org_users = result["data"];
  var org_user_data = [];
   org_users.forEach(org_user => {
    var user_endpoint = BASE_URL + "users/" + org_user["gid"];
    var user_result = doGet(user_endpoint);
    var email = user_result["data"]["email"];
    if (org_user["gid"] != null) {
    var gid = org_user["gid"]
    } else { var gid = "Unknown"};
    if (org_user["name"] != null) {
      var name = org_user["name"]
    } else { var end_on = "Unknown"};
    org_user_data.push([gid,name,email])
  });
  var rows = org_user_data
  ss = SpreadsheetApp.getActiveSpreadsheet();
  sheet = ss.getSheetByName("Users");
  const headerSize = 1;
  clear(sheet, headerSize);
  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1,1,org_user_data.length, org_user_data[0].length).setValues(org_user_data);
  }
