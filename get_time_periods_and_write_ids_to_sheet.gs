function clear(sheet, headerSize = 0) {
  const nRows = sheet.getMaxRows();                   // rows in the sheet
  const nColumns = sheet.getMaxColumns();             // columns in the sheet
  const lastCell = sheet.getRange(nRows, nColumns);   // last cell in the sheet
  // get cells from the row just below the header from the first to the last column
  const data = sheet.getRange('A' + (headerSize + 1) + ':' + lastCell.getA1Notation());  
  data.clear(); // clear the sheet
}

const get_org_time_periods = () => {
  var time_periods_endpoint = BASE_URL + "time_periods?workspace=" + ORG_ID;
  var result = doGet(time_periods_endpoint);
  const time_periods = result["data"];
  var time_period_data = [];
   time_periods.forEach(time_period => {
     var gid = time_period["gid"] || "Unknown";
     var end_on = time_period["end_on"] || "Unknown end_on";
     var start_on = time_period["start_on"] || "Unknown start_on";
     var period = time_period["period"] || "Unknown period";
     var display_name = time_period["display_name"] || "Unknown time period";
     time_period_data.push(
       [gid,
       period,
       end_on,
       start_on,
       display_name]
     )
});
  var rows = time_period_data
  Logger.log(rows);
  ss = SpreadsheetApp.getActiveSpreadsheet();
  sheet = ss.getSheetByName("Time Periods");
  const headerSize = 1;
  clear(sheet, headerSize);
  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1,1,time_period_data.length, time_period_data[0].length).setValues(time_period_data);
}
