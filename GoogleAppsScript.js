/**
 * =========================================================================
 * PUDUPPADY GRAMA PANCHAYAT - GOOGLE APPS SCRIPT BACKEND
 * പുതുപ്പാടി ഗ്രാമപഞ്ചായത്ത് - ഓണറേറിയം & ഹാജർ ഗൂഗിൾ ഷീറ്റ് ബാക്ക്-എൻഡ് സ്ക്രിപ്റ്റ്
 * =========================================================================
 */

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var membersSheet = ss.getSheetByName('Members');
  var meetingsSheet = ss.getSheetByName('Meetings');
  var attendanceSheet = ss.getSheetByName('Attendance');
  var ratesSheet = ss.getSheetByName('Rates');
  var usersSheet = ss.getSheetByName('Users');
  
  var data = {
    members: membersSheet ? getSheetData(membersSheet) : [],
    meetings: meetingsSheet ? getMeetingsData(meetingsSheet) : [],
    attendance: attendanceSheet ? getAttendanceMap(attendanceSheet) : {},
    rates: ratesSheet ? getRatesData(ratesSheet) : null,
    users: usersSheet ? getSheetData(usersSheet) : []
  };
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;
    
    if (action === 'SYNC_ALL' || action === 'SAVE_ATTENDANCE' || action === 'SAVE_USERS') {
      if (payload.members) saveMembersSheet(ss, payload.members);
      if (payload.meetings) saveMeetingsSheet(ss, payload.meetings);
      if (payload.attendance) saveAttendanceSheet(ss, payload.attendance);
      if (payload.rates) saveRatesSheet(ss, payload.rates);
      if (payload.users) saveUsersSheet(ss, payload.users);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Data saved to Google Sheet' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function getMeetingsData(sheet) {
  var rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return [];
  var data = [];
  for (var i = 1; i < rows.length; i++) {
    var rawDate = rows[i][2];
    var dateStr = '';
    if (rawDate instanceof Date) {
      dateStr = Utilities.formatDate(rawDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    } else {
      dateStr = String(rawDate).trim();
    }
    
    var parts = dateStr.split('-');
    var monthYear = (parts.length >= 2) ? (parts[0] + '-' + parts[1]) : String(rows[i][1]);
    var formattedDate = (parts.length === 3) ? (parts[2] + '/' + parts[1] + '/' + parts[0]) : String(rows[i][3]);

    data.push({
      id: String(rows[i][0]),
      monthYear: monthYear,
      date: dateStr,
      formattedDate: formattedDate,
      type: String(rows[i][4]),
      committee: rows[i][5] ? String(rows[i][5]) : null,
      title: String(rows[i][6]),
      time: String(rows[i][7] || ''),
      agenda: String(rows[i][8] || '')
    });
  }
  return data;
}

function getSheetData(sheet) {
  var rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return [];
  var headers = rows[0];
  var data = [];
  for (var i = 1; i < rows.length; i++) {
    var item = {};
    for (var j = 0; j < headers.length; j++) {
      item[headers[j]] = rows[i][j];
    }
    data.push(item);
  }
  return data;
}

function getAttendanceMap(sheet) {
  var rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return {};
  var headers = rows[0];
  var map = {};
  for (var j = 1; j < headers.length; j++) {
    var meetingId = headers[j];
    map[meetingId] = {};
    for (var i = 1; i < rows.length; i++) {
      var memberId = rows[i][0];
      map[meetingId][memberId] = (rows[i][j] === true || rows[i][j] === 'TRUE' || rows[i][j] === 'P');
    }
  }
  return map;
}

function saveMeetingsSheet(ss, meetings) {
  var sheet = ss.getSheetByName('Meetings') || ss.insertSheet('Meetings');
  sheet.clear();
  sheet.appendRow(['id', 'monthYear', 'date', 'formattedDate', 'type', 'committee', 'title', 'time', 'agenda']);
  meetings.forEach(function(m) {
    sheet.appendRow([
      "'" + m.id, 
      "'" + m.monthYear, 
      "'" + m.date, 
      "'" + m.formattedDate, 
      m.type, 
      m.committee || '', 
      m.title, 
      m.time || '', 
      m.agenda || ''
    ]);
  });
}

function saveAttendanceSheet(ss, attendanceMap) {
  var sheet = ss.getSheetByName('Attendance') || ss.insertSheet('Attendance');
  sheet.clear();
  var meetingIds = Object.keys(attendanceMap);
  if (meetingIds.length === 0) return;
  
  var header = ['memberId'].concat(meetingIds);
  sheet.appendRow(header);
  
  for (var i = 1; i <= 50; i++) {
    var memId = 'M' + (i < 10 ? '0' + i : i);
    var row = [memId];
    meetingIds.forEach(function(mtgId) {
      row.push(attendanceMap[mtgId] && attendanceMap[mtgId][memId] ? 'P' : 'A');
    });
    sheet.appendRow(row);
  }
}

function saveMembersSheet(ss, members) {
  var sheet = ss.getSheetByName('Members') || ss.insertSheet('Members');
  sheet.clear();
  sheet.appendRow(['id', 'wardNo', 'wardName', 'name', 'englishName', 'designation', 'designationLabel', 'standingCommittee', 'phone', 'accountNo', 'ifsc', 'bankName', 'branch']);
  members.forEach(function(m) {
    sheet.appendRow([
      m.id, 
      m.wardNo, 
      m.wardName, 
      m.name, 
      m.englishName, 
      m.designation, 
      m.designationLabel, 
      m.standingCommittee || '', 
      "'" + m.phone, 
      "'" + (m.bankDetails ? m.bankDetails.accountNo : ''), 
      m.bankDetails ? m.bankDetails.ifsc : '', 
      m.bankDetails ? m.bankDetails.bankName : '', 
      m.bankDetails ? m.bankDetails.branch : ''
    ]);
  });
}

function saveRatesSheet(ss, rates) {
  var sheet = ss.getSheetByName('Rates') || ss.insertSheet('Rates');
  sheet.clear();
  sheet.appendRow(['Key', 'Value']);
  var sMember = (rates.sittingFee && rates.sittingFee.member) ? rates.sittingFee.member : 200;
  var sPresident = (rates.sittingFee && rates.sittingFee.president) ? rates.sittingFee.president : 250;
  var sVP = (rates.sittingFee && rates.sittingFee.vice_president) ? rates.sittingFee.vice_president : 250;
  var sSC = (rates.sittingFee && rates.sittingFee.sc_chairperson) ? rates.sittingFee.sc_chairperson : 250;
  
  sheet.appendRow(['sittingFee_member', sMember]);
  sheet.appendRow(['sittingFee_president', sPresident]);
  sheet.appendRow(['sittingFee_vice_president', sVP]);
  sheet.appendRow(['sittingFee_sc_chairperson', sSC]);
  sheet.appendRow(['sittingFeePerMeeting', rates.sittingFeePerMeeting || 200]);
  sheet.appendRow(['monthlySittingFeeCeiling', rates.monthlySittingFeeCeiling || 1250]);
}

function getRatesData(sheet) {
  var rows = sheet.getDataRange().getValues();
  var rates = {
    sittingFee: {
      president: 250,
      vice_president: 250,
      sc_chairperson: 250,
      member: 200
    },
    monthlySittingFeeCeiling: {
      president: 1250,
      vice_president: 1250,
      sc_chairperson: 1250,
      member: 1000
    },
    sittingFeePerMeeting: 200,
    honorarium: {
      president: 13200,
      vice_president: 10600,
      sc_chairperson: 9400,
      member: 8200
    }
  };
  for (var i = 1; i < rows.length; i++) {
    var k = String(rows[i][0]);
    var v = Number(rows[i][1]);
    if (k === 'sittingFee_member') rates.sittingFee.member = v;
    else if (k === 'sittingFee_president') rates.sittingFee.president = v;
    else if (k === 'sittingFee_vice_president') rates.sittingFee.vice_president = v;
    else if (k === 'sittingFee_sc_chairperson') rates.sittingFee.sc_chairperson = v;
    else rates[k] = v;
  }
  return rates;
}

function saveUsersSheet(ss, users) {
  var sheet = ss.getSheetByName('Users') || ss.insertSheet('Users');
  sheet.clear();
  sheet.appendRow(['id', 'username', 'password', 'name', 'role', 'status', 'createdAt']);
  users.forEach(function(u) {
    sheet.appendRow([
      "'" + (u.id || ''),
      "'" + (u.username || ''),
      "'" + (u.password || ''),
      u.name || '',
      u.role || 'viewer',
      u.status || 'active',
      "'" + (u.createdAt || '')
    ]);
  });
}
