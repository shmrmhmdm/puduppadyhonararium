/**
 * Google Sheets Database Service for Puduppady Panchayat Honorarium App
 * Uses Google Apps Script Web App as a REST API endpoint.
 */

export const DEFAULT_GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycby3l_BkJOlaK1Vva2QxNOOt4KjdbdNoa5SFTzgI9eApdsmKCdPs5CpVpz7X6Sub6kG-KA/exec';

/**
 * Normalizes a date string or Date object to YYYY-MM-DD
 */
export function normalizeDate(dateVal) {
  if (!dateVal) return '';
  if (typeof dateVal === 'string') {
    // If it's already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateVal.trim())) {
      return dateVal.trim();
    }
    // If it's ISO string like 2026-09-05T00:00:00.000Z
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
    return dateVal;
  }
  if (dateVal instanceof Date || typeof dateVal.getMonth === 'function') {
    const y = dateVal.getFullYear();
    const m = String(dateVal.getMonth() + 1).padStart(2, '0');
    const day = String(dateVal.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  return String(dateVal);
}

/**
 * Normalizes monthYear string (e.g. '2026-09')
 */
export function normalizeMonthYear(dateStr, monthYearStr) {
  if (monthYearStr && /^\d{4}-\d{2}$/.test(String(monthYearStr).trim())) {
    return String(monthYearStr).trim();
  }
  const cleanDate = normalizeDate(dateStr);
  if (cleanDate && cleanDate.length >= 7) {
    return cleanDate.slice(0, 7);
  }
  return '2026-09';
}

export const APPS_SCRIPT_TEMPLATE = `
/**
 * PUDUPPADY PANCHAYAT HONORARIUM & ATTENDANCE BACKEND (Google Apps Script)
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
`;

/**
 * Fetch live data from configured Google Sheet Web App URL with normalization
 */
export async function fetchGoogleSheetData(webAppUrl = DEFAULT_GOOGLE_SHEET_URL) {
  if (!webAppUrl || !webAppUrl.startsWith('http')) {
    throw new Error('Invalid Google Sheet Web App URL');
  }

  const response = await fetch(webAppUrl, { method: 'GET' });
  if (!response.ok) {
    throw new Error(`Google Sheets API responded with status ${response.status}`);
  }

  const result = await response.json();
  if (result.status !== 'success' || !result.data) {
    throw new Error(result.message || 'Failed to parse Google Sheet data');
  }

  const raw = result.data;
  
  // Normalize meetings dates so they never disappear from monthly filter
  const normalizedMeetings = (raw.meetings || []).map(m => {
    const cleanDate = normalizeDate(m.date);
    const cleanMonthYear = normalizeMonthYear(cleanDate, m.monthYear);
    const [y, mon, day] = cleanDate.split('-');
    const formattedDate = (y && mon && day) ? `${day}/${mon}/${y}` : (m.formattedDate || cleanDate);

    return {
      ...m,
      date: cleanDate,
      monthYear: cleanMonthYear,
      formattedDate
    };
  });

  // Normalize members so bankDetails is always safely structured
  const normalizedMembers = (raw.members || []).map(m => {
    return {
      id: String(m.id || `M${String(m.wardNo || 1).padStart(2, '0')}`),
      wardNo: Number(m.wardNo || 0),
      wardName: String(m.wardName || `വാർഡ് ${m.wardNo || ''}`).trim(),
      name: String(m.name || '').trim(),
      englishName: String(m.englishName || m.name || '').trim(),
      designation: String(m.designation || 'member'),
      designationLabel: String(m.designationLabel || 'മെമ്പർ (Ward Member)'),
      standingCommittee: m.standingCommittee || null,
      phone: String(m.phone || '9447000000'),
      bankDetails: {
        accountNo: String(m.bankDetails?.accountNo || m.accountNo || '').trim(),
        ifsc: String(m.bankDetails?.ifsc || m.ifsc || 'SBIN0070554').trim(),
        bankName: String(m.bankDetails?.bankName || m.bankName || 'State Bank of India').trim(),
        branch: String(m.bankDetails?.branch || m.branch || 'Puduppady').trim()
      }
    };
  });

  // Normalize rates
  const normalizedRates = raw.rates ? {
    sittingFee: {
      president: raw.rates.sittingFee?.president || raw.rates.sittingFee_president || 250,
      vice_president: raw.rates.sittingFee?.vice_president || raw.rates.sittingFee_vice_president || 250,
      sc_chairperson: raw.rates.sittingFee?.sc_chairperson || raw.rates.sittingFee_sc_chairperson || 250,
      member: raw.rates.sittingFee?.member || raw.rates.sittingFee_member || 200
    },
    monthlySittingFeeCeiling: {
      president: 1250,
      vice_president: 1250,
      sc_chairperson: 1250,
      member: 1000,
      ...(raw.rates.monthlySittingFeeCeiling && typeof raw.rates.monthlySittingFeeCeiling === 'object' ? raw.rates.monthlySittingFeeCeiling : {})
    },
    sittingFeePerMeeting: Number(raw.rates.sittingFeePerMeeting) || 200,
    honorarium: {
      president: 13200,
      vice_president: 10600,
      sc_chairperson: 9400,
      member: 8200,
      ...(raw.rates.honorarium || {})
    }
  } : null;

  // Normalize users from sheet
  const normalizedUsers = (raw.users || []).map(u => ({
    id: String(u.id || `USR_${Date.now()}`),
    username: String(u.username || '').trim().toLowerCase(),
    password: String(u.password || '').trim(),
    name: String(u.name || u.username || '').trim(),
    role: ['admin', 'clerk', 'viewer'].includes(String(u.role || '').toLowerCase()) ? String(u.role).toLowerCase() : 'viewer',
    status: String(u.status || 'active').toLowerCase() === 'inactive' ? 'inactive' : 'active',
    createdAt: String(u.createdAt || new Date().toISOString().split('T')[0])
  })).filter(u => u.username && u.password);

  return {
    members: normalizedMembers,
    meetings: normalizedMeetings,
    attendance: raw.attendance || {},
    rates: normalizedRates,
    users: normalizedUsers
  };
}

/**
 * Push full data payload to Google Sheet Web App
 */
export async function syncDataToGoogleSheet(webAppUrl = DEFAULT_GOOGLE_SHEET_URL, payload) {
  if (!webAppUrl || !webAppUrl.startsWith('http')) {
    throw new Error('Invalid Google Sheet Web App URL');
  }

  // Normalize outgoing meetings
  const payloadToSync = {
    ...payload,
    meetings: (payload.meetings || []).map(m => ({
      ...m,
      date: normalizeDate(m.date),
      monthYear: normalizeMonthYear(m.date, m.monthYear)
    }))
  };

  await fetch(webAppUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'SYNC_ALL',
      ...payloadToSync
    })
  });

  return { success: true };
}
