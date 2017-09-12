function appendData() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var start;
  // Start looking for empty cells at `startColumn`. Change as necessary
  var startColumn = 5
  for (var i = startColumn; ; i++) {
    var cell = sheet.getRange(i,1);
    if (cell.getValue() == "") {
      start = i;
      break;
    }
  }
  Logger.log("starting at %s", start.toFixed());
  
  writeRows(sheet, start);
}

function fmtdate(s) {
  var ret = s.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (ret) {
    return ret[1] + "/" + ret[2] + "/" + ret[3];
  }
  return s
}

function writeRows(sheet, startRow) {
  // Bad bad, hardcoded values.
  // Where your convert lives, including the path
  var converterURL = "https://path-to-your-converter/convert";
  // URL of the ics file to convert to JSON
  var targetURL = "https://opensource.com/resources/conferences-and-events-monthly/ical.ics";
  var srcUrl = converterURL + "?url=" + targetURL;

  var response = UrlFetchApp.fetch(srcUrl);
  var payload = JSON.parse(response.getContentText());
  var eventCount = 0;
  for (i in payload.entries) {
    var entry = payload.entries[i];
    if (entry.type != "VEVENT") {
      continue;
    }
    var title;
    var start;
    var end;
    var url;
    for (propname in entry.properties) {
      var propvalue = entry.properties[propname][0].value;
      switch (propname) {
        case "summary":
          title = propvalue;
          break;
        case "dtstart":
          start = fmtdate(propvalue);
          break;
        case "dtend":
          end = fmtdate(propvalue);
          break;
        case "url":
          url = propvalue;
          break;
      } 
    }
    if (url) {
      // The URL in question points to opensource.com, but we want the
      // real URL, damnit
      var response = UrlFetchApp.fetch(url);
      var lines = response.getContentText().split("\n");
      for (j in lines) {
        var line = lines[j];
        if (! line.match(/field-name-field-event-website/)) {
          continue
        }
        var ret = line.match(/href="([^"]+)"/);
        if (ret) {
          url = ret[1];
        }
      }
    }
    Logger.log("i = %s, startRow + i = %s, %s (%s to %s) %s",eventCount,startRow+eventCount, title, start, end, url);
    sheet.getRange(startRow + eventCount, 1, 1, 8).setValues([[start, end, "", "", title, "", url, "automatically scraped from https://opensource.com/resources/conferences-and-events-monthly/ical.ics"]]);
    eventCount++;
  }
}