import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  CheckSquare, 
  Square, 
  Trash2, 
  Info, 
  Layers, 
  UserCheck, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowUpDown,
  BookOpen,
  PlusCircle,
  Zap
} from 'lucide-react';
import { STANDING_COMMITTEES, STATUTORY_RATES } from '../data/initialData';
import { isMemberEligibleForMeeting, calculateMemberMonthlyFees, formatINR } from '../utils/calculations';

export default function AttendanceMatrix({
  members,
  meetings,
  attendance,
  onToggleAttendance,
  onBulkSetAttendance,
  onDeleteMeeting,
  selectedMonth,
  onOpenAddMeeting,
  onOpenQuickEntry,
  rates = STATUTORY_RATES
}) {
  // Filter state
  const [committeeFilter, setCommitteeFilter] = useState('ALL'); // 'ALL', 'BOARD_ONLY', 'finance', 'development', 'welfare', 'health_education'
  const [searchQuery, setSearchQuery] = useState('');
  const [groupByCommittee, setGroupByCommittee] = useState(true);
  const [collapsedGroups, setCollapsedGroups] = useState({});

  // Filter meetings belonging to the selected month
  const monthMeetings = useMemo(() => {
    return meetings
      .filter(m => m.monthYear === selectedMonth)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [meetings, selectedMonth]);

  // Filter meetings further if user selected a specific meeting type tab
  const displayedMeetings = useMemo(() => {
    if (committeeFilter === 'ALL') return monthMeetings;
    if (committeeFilter === 'BOARD_ONLY') {
      return monthMeetings.filter(m => m.type === 'Board Meeting');
    }
    return monthMeetings.filter(m => m.type === 'Standing Committee Meeting' && m.committee === committeeFilter);
  }, [monthMeetings, committeeFilter]);

  // Filter and sort members
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      // Search query filter (name, ward no, designation)
      const q = searchQuery.toLowerCase();
      const matchSearch = 
        m.name.toLowerCase().includes(q) ||
        m.englishName.toLowerCase().includes(q) ||
        m.wardNo.toString().includes(q) ||
        m.wardName.toLowerCase().includes(q) ||
        m.designationLabel.toLowerCase().includes(q);

      if (!matchSearch) return false;

      // Committee filter on members
      if (committeeFilter === 'ALL' || committeeFilter === 'BOARD_ONLY') {
        return true;
      }
      // If filtering by specific SC, show members belonging to that SC + Vice President (for Finance)
      if (committeeFilter === 'finance') {
        return m.standingCommittee === 'finance' || m.designation === 'vice_president';
      }
      return m.standingCommittee === committeeFilter;
    });
  }, [members, searchQuery, committeeFilter]);

  // Group members if groupByCommittee is active
  const memberGroups = useMemo(() => {
    if (!groupByCommittee) {
      return [{ id: 'all', title: 'എല്ലാ വാർഡ് അംഗങ്ങളും (All 24 Ward Members)', members: [...filteredMembers].sort((a, b) => a.wardNo - b.wardNo) }];
    }

    const groups = [
      {
        id: 'leadership',
        title: 'ഭരണ നേതൃത്വം (President & Ex-Officio)',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        members: filteredMembers.filter(m => m.designation === 'president')
      },
      {
        id: 'finance',
        title: 'ധനകാര്യ സ്ഥിരംസമിതി (Finance Standing Committee - Chaired by VP)',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
        members: filteredMembers.filter(m => m.standingCommittee === 'finance' || m.designation === 'vice_president')
      },
      {
        id: 'development',
        title: 'വികസനകാര്യ സ്ഥിരംസമിതി (Development Standing Committee)',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        members: filteredMembers.filter(m => m.standingCommittee === 'development' && m.designation !== 'president')
      },
      {
        id: 'welfare',
        title: 'ക്ഷേമകാര്യ സ്ഥിരംസമിതി (Welfare Standing Committee)',
        badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
        members: filteredMembers.filter(m => m.standingCommittee === 'welfare' && m.designation !== 'president')
      },
      {
        id: 'health_education',
        title: 'ആരോഗ്യ-വിദ്യാഭ്യാസ സ്ഥിരംസമിതി (Health & Education Standing Committee)',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
        members: filteredMembers.filter(m => m.standingCommittee === 'health_education' && m.designation !== 'president')
      }
    ];

    return groups.filter(g => g.members.length > 0);
  }, [filteredMembers, groupByCommittee]);

  const toggleGroupCollapse = (groupId) => {
    setCollapsedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // Helper for column "Check All / Uncheck All"
  const handleColumnQuickAction = (meeting, action) => {
    // action: 'ALL_PRESENT' or 'ALL_ABSENT'
    const newAttendanceObj = { ...(attendance[meeting.id] || {}) };
    
    members.forEach(member => {
      const isEligible = isMemberEligibleForMeeting(member, meeting);
      if (isEligible) {
        newAttendanceObj[member.id] = (action === 'ALL_PRESENT');
      }
    });

    onBulkSetAttendance(meeting.id, newAttendanceObj);
  };

  return (
    <div className="space-y-4">

      {/* Prominent Quick Entry Action Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-4 sm:p-5 rounded-3xl shadow-lg border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 shadow-inner">
            <Zap className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>ഭരണസമിതി മീറ്റിംഗ് സിറ്റിംഗ് ഫീ / ഹാജർ രേഖപ്പെടുത്തുക</span>
              <span className="text-[10px] bg-emerald-400 text-slate-950 font-extrabold px-2 py-0.5 rounded-full uppercase">
                എളുപ്പവഴി (Quick Entry)
              </span>
            </h3>
            <p className="text-xs text-emerald-200/90 mt-0.5">
              തീയതി നൽകി എല്ലാവരേയും ഒറ്റ ക്ലിക്കിൽ സെലക്ട് ചെയ്യാം, അവധിയുള്ളവരെ മാത്രം അൺചെക്ക് ചെയ്ത് എളുപ്പത്തിൽ രേഖപ്പെടുത്താം.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenQuickEntry}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-950/40 transition active:scale-95"
          >
            <CheckSquare className="w-4 h-4 text-slate-950" />
            <span>ഹാജർ രേഖപ്പെടുത്തുക (Open Attendance Sheet)</span>
          </button>
        </div>
      </div>

      {/* Control Bar & Filter Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-emerald-600" />
              ഫിൽട്ടർ (Filter):
            </span>

            <button
              onClick={() => setCommitteeFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                committeeFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              എല്ലാം (All Meetings)
            </button>

            <button
              onClick={() => setCommitteeFilter('BOARD_ONLY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                committeeFilter === 'BOARD_ONLY'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <BookOpen className="w-3 h-3" />
              <span>ഭരണസമിതി (Board Only)</span>
            </button>

            {STANDING_COMMITTEES.map(sc => (
              <button
                key={sc.id}
                onClick={() => setCommitteeFilter(sc.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  committeeFilter === sc.id
                    ? 'bg-indigo-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {sc.name} ({sc.englishName})
              </button>
            ))}
          </div>

          {/* Search and Grouping Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="അംഗം / വാർഡ് തിരയുക (Search)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
              />
            </div>

            <button
              onClick={() => setGroupByCommittee(!groupByCommittee)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                groupByCommittee
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
              title="Toggle Grouping by Standing Committee"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>കമ്മിറ്റി തിരിച്ചുള്ള ഗ്രൂപ്പിംഗ് ({groupByCommittee ? 'ON' : 'OFF'})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Attendance Matrix Grid */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        
        {/* Table Header Controls */}
        <div className="bg-slate-900 text-white px-5 py-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-sm sm:text-base">
              പ്രതിമാസ ഹാജർ പുസ്തക മാട്രിക്സ് (Date-Wise Attendance Register Grid)
            </h2>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              {displayedMeetings.length} യോഗങ്ങൾ കണ്ടെത്തി
            </span>
          </div>

          <div className="text-xs text-slate-300 flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              ബോർഡ് യോഗം (Board)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
              സ്റ്റാൻഡിംഗ് കമ്മിറ്റി (SC)
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>
              അനർഹം (Not in SC)
            </span>
          </div>
        </div>

        {/* The Matrix Table Container with Sticky Columns */}
        <div className="overflow-x-auto relative">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800 text-slate-200 border-b border-slate-700 sticky top-0 z-20">
                {/* Fixed Column: Ward & Member Information */}
                <th className="p-3 font-semibold text-slate-100 min-w-[240px] max-w-[280px] bg-slate-900/95 sticky left-0 z-30 shadow-[2px_0_5px_rgba(0,0,0,0.15)] border-r border-slate-700">
                  വാർഡ് & മെമ്പർ വിവരങ്ങൾ
                  <div className="text-[10px] text-slate-400 font-normal">Ward No, Member Name & Designation</div>
                </th>

                {/* Dynamic Columns for each meeting date */}
                {displayedMeetings.map((meeting, index) => {
                  const isSC = meeting.type === 'Standing Committee Meeting';
                  const scObj = STANDING_COMMITTEES.find(c => c.id === meeting.committee);
                  
                  // Calculate present count for this meeting
                  const presentCount = members.filter(m => 
                    isMemberEligibleForMeeting(m, meeting) && attendance[meeting.id]?.[m.id]
                  ).length;
                  const eligibleCount = members.filter(m => isMemberEligibleForMeeting(m, meeting)).length;

                  return (
                    <th 
                      key={meeting.id} 
                      className={`p-2.5 font-semibold text-center min-w-[135px] max-w-[155px] border-r border-slate-700 ${
                        isSC ? 'bg-indigo-950/70' : 'bg-slate-800/90'
                      }`}
                    >
                      {/* Date Badge */}
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-white bg-slate-700/80 px-1.5 py-0.5 rounded">
                          #{index + 1} • {meeting.formattedDate}
                        </span>
                        <button
                          onClick={() => {
                            if (confirm(`ഈ യോഗം ഒഴിവാക്കണോ? (${meeting.title} - ${meeting.formattedDate})`)) {
                              onDeleteMeeting(meeting.id);
                            }
                          }}
                          className="text-slate-400 hover:text-rose-400 p-0.5 rounded transition"
                          title="Delete this meeting"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Meeting Type & Committee Badge */}
                      <div className="mb-1.5">
                        {isSC ? (
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                            {scObj ? scObj.name : 'SC'}
                          </span>
                        ) : (
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                            ഭരണസമിതി (Board)
                          </span>
                        )}
                      </div>

                      {/* Present Tally */}
                      <div className="text-[10px] text-slate-300 font-mono mb-2">
                        ഹാജർ: <span className="text-emerald-400 font-bold">{presentCount}</span>/{eligibleCount}
                      </div>

                      {/* Column Check All / Uncheck All Buttons */}
                      <div className="flex items-center justify-center gap-1 bg-slate-900/60 p-1 rounded-md border border-slate-700/80">
                        <button
                          onClick={() => handleColumnQuickAction(meeting, 'ALL_PRESENT')}
                          title="Mark All Eligible Present"
                          className="px-1.5 py-0.5 text-[10px] bg-emerald-600/80 hover:bg-emerald-600 text-white rounded transition flex items-center gap-0.5"
                        >
                          <CheckSquare className="w-3 h-3" />
                          <span>All</span>
                        </button>
                        <button
                          onClick={() => handleColumnQuickAction(meeting, 'ALL_ABSENT')}
                          title="Mark All Absent"
                          className="px-1.5 py-0.5 text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition flex items-center gap-0.5"
                        >
                          <Square className="w-3 h-3" />
                          <span>None</span>
                        </button>
                      </div>
                    </th>
                  );
                })}

                {/* If no meetings in this month */}
                {displayedMeetings.length === 0 && (
                  <th className="p-8 text-center text-slate-400 font-normal">
                    ഈ മാസത്തിൽ യോഗങ്ങളൊന്നും ചേർത്തിട്ടില്ല. യോഗം ചേർക്കാൻ മുകളിലെ "ഹാജർ രേഖപ്പെടുത്തുക" ബട്ടൺ ക്ലിക്ക് ചെയ്യുക.
                  </th>
                )}

                {/* Calculation Summary Columns */}
                <th className="p-3 font-semibold text-center bg-slate-900/95 min-w-[70px] border-r border-slate-700">
                  ബോർഡ്
                  <div className="text-[10px] text-slate-400 font-normal">Board</div>
                </th>
                <th className="p-3 font-semibold text-center bg-slate-900/95 min-w-[70px] border-r border-slate-700">
                  സ്ഥിരംസമിതി
                  <div className="text-[10px] text-slate-400 font-normal">SC Mtg</div>
                </th>
                <th className="p-3 font-semibold text-center bg-slate-900/95 min-w-[85px] border-r border-slate-700">
                  ആകെ ഹാജർ
                  <div className="text-[10px] text-slate-400 font-normal">Total Days</div>
                </th>
                <th className="p-3 font-semibold text-center bg-emerald-950/90 text-emerald-200 min-w-[125px] border-r border-slate-700">
                  സിറ്റിംഗ് ഫീസ്
                  <div className="text-[10px] text-emerald-400 font-normal">Sitting Fee @ ₹{rates.sittingFeePerMeeting}</div>
                </th>
                <th className="p-3 font-semibold text-right bg-emerald-950 text-white min-w-[130px]">
                  ആകെ അർഹത
                  <div className="text-[10px] text-emerald-300 font-normal">Admissible Net</div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {memberGroups.map((group) => {
                const isCollapsed = Boolean(collapsedGroups[group.id]);

                return (
                  <React.Fragment key={group.id}>
                    {/* Group Header Row if Grouping is ON */}
                    {groupByCommittee && (
                      <tr className="bg-slate-100/95 hover:bg-slate-200/80 transition cursor-pointer" onClick={() => toggleGroupCollapse(group.id)}>
                        <td 
                          colSpan={displayedMeetings.length + 6}
                          className="p-2.5 px-4 font-bold text-slate-800 border-y border-slate-300"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {isCollapsed ? <ChevronDown className="w-4 h-4 text-slate-600" /> : <ChevronUp className="w-4 h-4 text-slate-600" />}
                              <span className="text-xs sm:text-sm">{group.title}</span>
                              <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${group.badgeColor || 'bg-slate-200 text-slate-700'}`}>
                                {group.members.length} അംഗങ്ങൾ
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 font-normal">
                              {isCollapsed ? 'വികസിപ്പിക്കാൻ ക്ലിക്ക് ചെയ്യുക (Click to expand)' : 'ചുരുക്കാൻ ക്ലിക്ക് ചെയ്യുക (Click to collapse)'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Member Rows */}
                    {!isCollapsed && group.members.map((member) => {
                      const feeStats = calculateMemberMonthlyFees(member, monthMeetings, attendance, rates);
                      const scObj = STANDING_COMMITTEES.find(c => c.id === member.standingCommittee);

                      return (
                        <tr 
                          key={member.id} 
                          className="hover:bg-emerald-50/40 transition duration-100 group"
                        >
                          {/* Sticky Left: Ward and Member Meta */}
                          <td className="p-3 bg-white group-hover:bg-emerald-50/60 sticky left-0 z-10 border-r border-slate-200 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="w-6 h-6 rounded-md bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                                    {member.wardNo}
                                  </span>
                                  <span className="font-bold text-slate-900 text-sm">
                                    {member.name}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-600 font-medium ml-7">
                                  {member.wardName}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1 ml-7 flex-wrap">
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-medium">
                                    {member.designationLabel}
                                  </span>
                                  {scObj && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                                      {scObj.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Dynamic Checkbox Matrix Cells */}
                          {displayedMeetings.map((meeting) => {
                            const isEligible = isMemberEligibleForMeeting(member, meeting);
                            const isChecked = Boolean(attendance[meeting.id]?.[member.id]);

                            if (!isEligible) {
                              return (
                                <td 
                                  key={meeting.id} 
                                  className="p-2 text-center border-r border-slate-200 bg-slate-50/80 cursor-not-allowed"
                                  title={`${member.name} ഈ സ്റ്റാൻഡിംഗ് കമ്മിറ്റിയിൽ അംഗമല്ല (Not eligible for ${meeting.title})`}
                                >
                                  <div className="flex flex-col items-center justify-center py-2 text-slate-300 group-hover:text-slate-400">
                                    <span className="text-[10px] font-mono tracking-wider font-semibold">N/A</span>
                                    <span className="text-[9px] text-slate-400">അനർഹം</span>
                                  </div>
                                </td>
                              );
                            }

                            return (
                              <td 
                                key={meeting.id} 
                                className={`p-2 text-center border-r border-slate-200 transition ${
                                  isChecked ? 'bg-emerald-50/70' : 'hover:bg-slate-100'
                                }`}
                              >
                                <label className="flex flex-col items-center justify-center p-1.5 cursor-pointer rounded-lg hover:bg-emerald-100/60 transition">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => onToggleAttendance(meeting.id, member.id)}
                                    className="matrix-checkbox"
                                    aria-label={`Attendance for ${member.name} on ${meeting.formattedDate}`}
                                  />
                                  <span className={`text-[10px] font-bold mt-1 ${isChecked ? 'text-emerald-700' : 'text-slate-400'}`}>
                                    {isChecked ? 'ഹാജർ (P)' : 'ഹാജരില്ല (A)'}
                                  </span>
                                </label>
                              </td>
                            );
                          })}

                          {/* If no meetings */}
                          {displayedMeetings.length === 0 && (
                            <td className="p-4 text-center text-slate-400">
                              -
                            </td>
                          )}

                          {/* Real-time Calculation Columns */}
                          <td className="p-2 text-center font-mono font-bold text-slate-700 border-r border-slate-200 bg-slate-50/50">
                            {feeStats.boardAttended}
                          </td>
                          <td className="p-2 text-center font-mono font-bold text-indigo-700 border-r border-slate-200 bg-slate-50/50">
                            {feeStats.scAttended}
                          </td>
                          <td className="p-2 text-center border-r border-slate-200 bg-slate-50/80">
                            <span className="font-mono font-bold text-slate-900 text-xs px-2 py-0.5 rounded-full bg-slate-200">
                              {feeStats.totalAttended}
                            </span>
                          </td>

                          {/* Sitting Fee & Statutory Ceiling Badge */}
                          <td className="p-2 text-center border-r border-slate-200 bg-emerald-50/30">
                            <div className="font-mono font-bold text-emerald-700 text-xs">
                              {formatINR(feeStats.admissibleSittingFee)}
                            </div>
                            {feeStats.excessCapped > 0 ? (
                              <div className="text-[9px] text-amber-700 bg-amber-100 px-1 py-0.5 rounded border border-amber-200 mt-0.5 inline-flex items-center gap-0.5">
                                <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
                                <span>Max Capped (₹{feeStats.monthlyCeiling})</span>
                              </div>
                            ) : (
                              <div className="text-[9px] text-slate-500 font-mono">
                                ({feeStats.totalAttended} × ₹{feeStats.sittingFeePerMeeting})
                              </div>
                            )}
                          </td>

                          {/* Total Net Payable */}
                          <td className="p-3 text-right bg-emerald-50/80">
                            <div className="font-mono font-bold text-emerald-900 text-sm">
                              {formatINR(feeStats.netPayable)}
                            </div>
                            <div className="text-[10px] text-slate-600">
                              (Hon ₹{feeStats.fixedHonorarium} + Fee)
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-600" />
            <span>
              <strong>സ്റ്റാറ്റ്യൂട്ടറി നിരക്ക് (Statutory Rule):</strong> സിറ്റിംഗ് ഫീസ് ₹{rates.sittingFeePerMeeting}/മീറ്റിംഗ് (പരമാവധി പ്രതിമാസ പരിധി: ₹{rates.monthlySittingFeeCeiling}).
            </span>
          </div>
          <button
            onClick={onOpenQuickEntry}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm transition"
          >
            <CheckSquare className="w-4 h-4" />
            <span>ഭരണസമിതി മീറ്റിംഗ് സിറ്റിംഗ് ഫീ രേഖപ്പെടുത്തുക</span>
          </button>
        </div>
      </div>
    </div>
  );
}
