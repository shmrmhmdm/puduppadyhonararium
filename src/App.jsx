import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import AttendanceEntryStep from './components/AttendanceEntryStep';
import AcquittanceRoll from './components/AcquittanceRoll';
import ReportsModule from './components/ReportsModule';
import PayrollSummary from './components/PayrollSummary';
import MemberManagement from './components/MemberManagement';
import SettingsModal from './components/SettingsModal';
import GoogleSheetSyncModal from './components/GoogleSheetSyncModal';
import { 
  INITIAL_MEMBERS, 
  INITIAL_MEETINGS, 
  INITIAL_ATTENDANCE, 
  STATUTORY_RATES 
} from './data/initialData';
import { calculateMemberMonthlyFees } from './utils/calculations';
import { fetchGoogleSheetData, syncDataToGoogleSheet, DEFAULT_GOOGLE_SHEET_URL } from './services/googleSheetsService';

export default function App() {
  // LocalStorage keys
  const LS_MEMBERS_KEY = 'puduppady_members_v11';
  const LS_MEETINGS_KEY = 'puduppady_meetings_v11';
  const LS_ATTENDANCE_KEY = 'puduppady_attendance_v11';
  const LS_RATES_KEY = 'puduppady_rates_v11';
  const LS_SHEET_URL_KEY = 'puduppady_google_sheet_url_v4';
  const LS_LAST_SYNC_KEY = 'puduppady_last_sync_time_v4';

  // State
  // State with safe normalization
  const [members, setMembers] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_MEMBERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(m => ({
            id: String(m.id || `M${String(m.wardNo || 1).padStart(2, '0')}`),
            wardNo: Number(m.wardNo) || 1,
            wardName: String(m.wardName || `വാർഡ് ${m.wardNo || 1}`),
            name: String(m.name || ''),
            englishName: String(m.englishName || m.name || ''),
            designation: String(m.designation || 'member'),
            designationLabel: String(m.designationLabel || 'മെമ്പർ (Ward Member)'),
            standingCommittee: m.standingCommittee || null,
            phone: String(m.phone || '9447000000'),
            bankDetails: {
              accountNo: String(m.bankDetails?.accountNo || m.accountNo || ''),
              ifsc: String(m.bankDetails?.ifsc || m.ifsc || 'SBIN0070554'),
              bankName: String(m.bankDetails?.bankName || m.bankName || 'State Bank of India'),
              branch: String(m.bankDetails?.branch || m.branch || 'Puduppady')
            }
          }));
        }
      }
    } catch (e) {
      console.warn('Error reading saved members:', e);
    }
    return INITIAL_MEMBERS;
  });

  const [meetings, setMeetings] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_MEETINGS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_MEETINGS;
    } catch (e) {
      return INITIAL_MEETINGS;
    }
  });

  const [attendance, setAttendance] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_ATTENDANCE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
    } catch (e) {
      return INITIAL_ATTENDANCE;
    }
  });

  const [rates, setRates] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_RATES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...STATUTORY_RATES,
          ...parsed,
          honorarium: {
            ...STATUTORY_RATES.honorarium,
            ...(parsed.honorarium || {})
          },
          phoneAllowance: {
            ...STATUTORY_RATES.phoneAllowance,
            ...(parsed.phoneAllowance || {})
          }
        };
      }
    } catch (e) {
      console.warn('Error reading saved rates:', e);
    }
    return STATUTORY_RATES;
  });

  const [sheetUrl, setSheetUrl] = useState(() => {
    return localStorage.getItem(LS_SHEET_URL_KEY) || DEFAULT_GOOGLE_SHEET_URL;
  });

  const [lastSyncTime, setLastSyncTime] = useState(() => {
    return localStorage.getItem(LS_LAST_SYNC_KEY) || 'ഇപ്പോൾ (Auto)';
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('SYNCED'); // 'SYNCED' | 'SYNCING' | 'ERROR'
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  });
  const [activeTab, setActiveTab] = useState('entry'); // 'entry' | 'acquittance' | 'reports' | 'payroll' | 'members'
  
  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSheetSyncOpen, setIsSheetSyncOpen] = useState(false);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(LS_MEMBERS_KEY, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(LS_MEETINGS_KEY, JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem(LS_ATTENDANCE_KEY, JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem(LS_RATES_KEY, JSON.stringify(rates));
  }, [rates]);

  useEffect(() => {
    localStorage.setItem(LS_SHEET_URL_KEY, sheetUrl);
  }, [sheetUrl]);

  useEffect(() => {
    localStorage.setItem(LS_LAST_SYNC_KEY, lastSyncTime);
  }, [lastSyncTime]);

  // Push to Google Sheets
  const triggerGoogleSheetPush = useCallback(async (customUrl = sheetUrl, payloadOverride = null) => {
    if (!customUrl) return;
    setIsSyncing(true);
    setSyncStatus('SYNCING');
    try {
      const payload = payloadOverride || {
        members,
        meetings,
        attendance,
        rates
      };
      await syncDataToGoogleSheet(customUrl, payload);
      const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSyncTime(nowStr);
      setSyncStatus('SYNCED');
    } catch (err) {
      console.warn('Google Sheet auto-sync notice:', err);
      setSyncStatus('ERROR');
    } finally {
      setIsSyncing(false);
    }
  }, [sheetUrl, members, meetings, attendance, rates]);

  // Pull from Google Sheets (only updates if sheet has content)
  const triggerGoogleSheetPull = useCallback(async (customUrl = sheetUrl) => {
    if (!customUrl) return;
    setIsSyncing(true);
    setSyncStatus('SYNCING');
    try {
      const data = await fetchGoogleSheetData(customUrl);
      if (data.members && data.members.length > 0) {
        setMembers(data.members);
      }
      if (data.meetings && data.meetings.length > 0) {
        setMeetings(data.meetings);
      }
      if (data.attendance && Object.keys(data.attendance).length > 0) {
        setAttendance(data.attendance);
      }
      if (data.rates && Object.keys(data.rates).length > 0) {
        setRates(data.rates);
      }
      const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSyncTime(nowStr);
      setSyncStatus('SYNCED');
    } catch (err) {
      console.warn('Google Sheet pull notice:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [sheetUrl]);

  // 1. Initial Boot: If local state is completely empty, try pulling once from Google Sheet
  const initialLoadDone = useRef(false);
  useEffect(() => {
    if (!initialLoadDone.current && sheetUrl && meetings.length === 0 && members.length === 0) {
      initialLoadDone.current = true;
      triggerGoogleSheetPull(sheetUrl);
    }
  }, [sheetUrl, meetings.length, members.length, triggerGoogleSheetPull]);

  // 2. Debounced Auto-Push on state changes (Push only to avoid overwriting user input)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!autoSyncEnabled || !sheetUrl) return;

    setSyncStatus('SYNCING');
    const timer = setTimeout(() => {
      triggerGoogleSheetPush(sheetUrl, { members, meetings, attendance, rates });
    }, 700);

    return () => clearTimeout(timer);
  }, [members, meetings, attendance, rates, autoSyncEnabled, sheetUrl, triggerGoogleSheetPush]);

  // Attendance Handlers
  const handleToggleAttendance = (meetingId, memberId) => {
    setAttendance(prev => {
      const meetingMap = prev[meetingId] || {};
      const currentVal = Boolean(meetingMap[memberId]);
      const updated = {
        ...prev,
        [meetingId]: {
          ...meetingMap,
          [memberId]: !currentVal
        }
      };
      return updated;
    });
  };

  const handleBulkSetAttendance = (meetingId, newMeetingAttendance) => {
    setAttendance(prev => ({
      ...prev,
      [meetingId]: newMeetingAttendance
    }));
  };

  const handleSaveMeeting = (meetingObj, attendanceMap) => {
    // 1. If meeting date month is different from selectedMonth, switch view to that month so it never disappears
    if (meetingObj.monthYear && meetingObj.monthYear !== selectedMonth) {
      setSelectedMonth(meetingObj.monthYear);
    }

    // 2. Update meetings list
    setMeetings(prev => {
      const exists = prev.some(m => m.id === meetingObj.id);
      return exists ? prev.map(m => m.id === meetingObj.id ? meetingObj : m) : [...prev, meetingObj];
    });

    // 3. Update attendance
    if (attendanceMap) {
      setAttendance(prev => ({
        ...prev,
        [meetingObj.id]: attendanceMap
      }));
    }
  };

  const handleDeleteMeeting = (meetingId) => {
    setMeetings(prev => prev.filter(m => m.id !== meetingId));
    setAttendance(prevAtt => {
      const updatedAtt = { ...prevAtt };
      delete updatedAtt[meetingId];
      return updatedAtt;
    });
  };

  const handleAddMember = (newMember) => {
    setMembers(prev => [...prev, newMember].sort((a, b) => a.wardNo - b.wardNo));
  };

  const handleUpdateMember = (updatedMember) => {
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m).sort((a, b) => a.wardNo - b.wardNo));
  };

  const handleDeleteMember = (memberId) => {
    setMembers(prev => prev.filter(m => m.id !== memberId));
  };

  const handleClearAllData = () => {
    if (confirm('മുഴുവൻ ഡാറ്റയും ക്ലിയർ ചെയ്യണോ? (Clear all members, meetings & attendance?)')) {
      setMembers([]);
      setMeetings([]);
      setAttendance({});
      triggerGoogleSheetPush(sheetUrl, { members: [], meetings: [], attendance: {}, rates });
    }
  };

  // Calculations for active month
  const monthMeetings = useMemo(() => {
    return meetings.filter(m => m.monthYear === selectedMonth);
  }, [meetings, selectedMonth]);

  const totalNetPayable = useMemo(() => {
    return members.reduce((sum, member) => {
      const stats = calculateMemberMonthlyFees(member, monthMeetings, attendance, rates);
      return sum + stats.netPayable;
    }, 0);
  }, [members, monthMeetings, attendance, rates]);

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900 selection:bg-emerald-500 selection:text-white">
      
      {/* Left Sidebar Menu */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSheetSync={() => setIsSheetSyncOpen(true)}
        sheetUrl={sheetUrl}
        isSyncing={isSyncing}
        syncStatus={syncStatus}
        lastSyncTime={lastSyncTime}
        autoSyncEnabled={autoSyncEnabled}
        onToggleAutoSync={() => setAutoSyncEnabled(!autoSyncEnabled)}
        totalNetPayable={totalNetPayable}
        totalMeetingsCount={monthMeetings.length}
        onResetData={handleClearAllData}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen">
        
        {/* Top Header */}
        <TopHeader
          activeTab={activeTab}
          selectedMonth={selectedMonth}
          onPrint={() => window.print()}
        />

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          
          {/* Tab 1: Attendance Entry */}
          {activeTab === 'entry' && (
            <AttendanceEntryStep
              members={members}
              meetings={meetings}
              attendance={attendance}
              onSaveMeeting={handleSaveMeeting}
              onDeleteMeeting={handleDeleteMeeting}
              onToggleAttendance={handleToggleAttendance}
              onBulkSetAttendance={handleBulkSetAttendance}
              selectedMonth={selectedMonth}
              rates={rates}
            />
          )}

          {/* Tab 2: Acquittance Roll */}
          {activeTab === 'acquittance' && (
            <AcquittanceRoll
              members={members}
              meetings={meetings}
              attendance={attendance}
              selectedMonth={selectedMonth}
              rates={rates}
            />
          )}

          {/* Tab 3: Official Reports Module */}
          {activeTab === 'reports' && (
            <ReportsModule
              members={members}
              meetings={meetings}
              attendance={attendance}
              selectedMonth={selectedMonth}
              rates={rates}
            />
          )}

          {/* Tab 4: Financial Summary */}
          {activeTab === 'payroll' && (
            <PayrollSummary
              members={members}
              meetings={meetings}
              attendance={attendance}
              selectedMonth={selectedMonth}
              rates={rates}
            />
          )}

          {/* Tab 5: 24 Members */}
          {activeTab === 'members' && (
            <MemberManagement
              members={members}
              onAddMember={handleAddMember}
              onUpdateMember={handleUpdateMember}
              onDeleteMember={handleDeleteMember}
            />
          )}

        </main>
      </div>

      {/* Google Sheets Sync Modal */}
      <GoogleSheetSyncModal
        isOpen={isSheetSyncOpen}
        onClose={() => setIsSheetSyncOpen(false)}
        sheetUrl={sheetUrl}
        onSaveSheetUrl={setSheetUrl}
        onSyncToSheet={triggerGoogleSheetPush}
        onFetchFromSheet={triggerGoogleSheetPull}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        rates={rates}
        onSaveRates={setRates}
      />

    </div>
  );
}
