import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  Layers, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  LayoutGrid,
  Grid3X3,
  List,
  Maximize2,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Search,
  Check,
  X,
  Phone,
  Award
} from 'lucide-react';
import { STANDING_COMMITTEES, STATUTORY_RATES } from '../data/initialData';
import { isMemberEligibleForMeeting, formatMonthYearMalayalam, formatINR, getMemberSittingFeeRate } from '../utils/calculations';

export default function AttendanceEntryStep({
  members,
  meetings,
  attendance,
  onSaveMeeting,
  onDeleteMeeting,
  onToggleAttendance,
  onBulkSetAttendance,
  selectedMonth,
  rates = STATUTORY_RATES,
  currentUser
}) {
  const isReadOnly = currentUser?.role === 'viewer';
  
  // Active meeting type tab: 'BOARD' or 'SC'
  const [activeCategory, setActiveCategory] = useState('BOARD'); // 'BOARD' or 'SC'
  const [selectedCommittee, setSelectedCommittee] = useState('development');

  // View Options: 'medium' | 'large' | 'small' | 'tile' | 'one_by_one'
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('puduppady_attendance_view_mode') || 'medium';
  });

  useEffect(() => {
    localStorage.setItem('puduppady_attendance_view_mode', viewMode);
  }, [viewMode]);

  // Search & Status Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PRESENT' | 'ABSENT'

  // One-by-One Focus Index
  const [focusIndex, setFocusIndex] = useState(0);

  // Filter meetings for this month based on active category
  const monthMeetings = useMemo(() => {
    return meetings
      .filter(m => m.monthYear === selectedMonth)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [meetings, selectedMonth]);

  const categoryMeetings = useMemo(() => {
    if (activeCategory === 'BOARD') {
      return monthMeetings.filter(m => m.type === 'Board Meeting');
    }
    return monthMeetings.filter(m => m.type === 'Standing Committee Meeting' && m.committee === selectedCommittee);
  }, [monthMeetings, activeCategory, selectedCommittee]);

  // Active selected meeting inside category (default to first or null)
  const [activeMeetingId, setActiveMeetingId] = useState(null);

  // Keep activeMeetingId valid
  const currentMeeting = useMemo(() => {
    if (categoryMeetings.length === 0) return null;
    const found = categoryMeetings.find(m => m.id === activeMeetingId);
    return found || categoryMeetings[0];
  }, [categoryMeetings, activeMeetingId]);

  // Form state for adding a new meeting
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDate, setNewDate] = useState(`${selectedMonth}-10`);
  const [newTime, setNewTime] = useState('11:00 AM');
  const [newTitle, setNewTitle] = useState('');

  // Members eligible for current meeting
  const eligibleMembers = useMemo(() => {
    if (!currentMeeting) {
      if (activeCategory === 'BOARD') return members;
      return members.filter(m => {
        if (m.designation === 'president') return true;
        if (selectedCommittee === 'finance') return m.standingCommittee === 'finance' || m.designation === 'vice_president';
        return m.standingCommittee === selectedCommittee;
      });
    }
    return members.filter(m => isMemberEligibleForMeeting(m, currentMeeting));
  }, [members, currentMeeting, activeCategory, selectedCommittee]);

  // Filtered members by search query and present/absent status
  const displayedMembers = useMemo(() => {
    return eligibleMembers.filter(m => {
      // 1. Search filter
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchName = (m.name || '').toLowerCase().includes(q) ||
          (m.englishName || '').toLowerCase().includes(q) ||
          String(m.wardNo || '').toLowerCase().includes(q) ||
          (m.wardName || '').toLowerCase().includes(q) ||
          (m.designationLabel || '').toLowerCase().includes(q);
        if (!matchName) return false;
      }

      // 2. Status filter
      if (currentMeeting) {
        const isPresent = Boolean(attendance[currentMeeting.id]?.[m.id]);
        if (statusFilter === 'PRESENT' && !isPresent) return false;
        if (statusFilter === 'ABSENT' && isPresent) return false;
      }

      return true;
    });
  }, [eligibleMembers, searchQuery, statusFilter, currentMeeting, attendance]);

  // Reset focus index when eligible members change or out of bounds
  useEffect(() => {
    if (focusIndex >= eligibleMembers.length) {
      setFocusIndex(Math.max(0, eligibleMembers.length - 1));
    }
  }, [eligibleMembers.length, focusIndex]);

  // Handle Add New Meeting
  const handleAddNewMeeting = (e) => {
    e.preventDefault();
    if (!newDate) return;

    const [y, m, d] = newDate.split('-');
    const formattedDate = `${d}/${m}/${y}`;
    const isBoard = activeCategory === 'BOARD';

    const meetingId = `MTG-${newDate}-${isBoard ? 'BM' : `SC-${selectedCommittee.toUpperCase()}`}-${Date.now().toString().slice(-4)}`;
    
    let defaultTitle = isBoard 
      ? 'പഞ്ചായത്ത് ഭരണസമിതി യോഗം'
      : `${STANDING_COMMITTEES.find(c => c.id === selectedCommittee)?.name || ''} സ്റ്റാൻഡിംഗ് കമ്മിറ്റി യോഗം`;

    const newMeeting = {
      id: meetingId,
      monthYear: `${y}-${m}`,
      date: newDate,
      formattedDate,
      type: isBoard ? 'Board Meeting' : 'Standing Committee Meeting',
      committee: isBoard ? null : selectedCommittee,
      title: newTitle.trim() || defaultTitle,
      time: newTime,
      agenda: 'സാധാരണ അജണ്ടകളും തീരുമാനങ്ങളും'
    };

    // Initialize attendance with ALL eligible members present (True)
    const initialAttendanceMap = {};
    members.forEach(m => {
      if (isMemberEligibleForMeeting(m, newMeeting)) {
        initialAttendanceMap[m.id] = true;
      }
    });

    onSaveMeeting(newMeeting, initialAttendanceMap);
    setActiveMeetingId(meetingId);
    setShowAddForm(false);
    setNewTitle('');
  };

  // Helper: Select All Present for current meeting
  const handleSelectAll = () => {
    if (!currentMeeting) return;
    const updated = { ...(attendance[currentMeeting.id] || {}) };
    eligibleMembers.forEach(m => {
      updated[m.id] = true;
    });
    onBulkSetAttendance(currentMeeting.id, updated);
  };

  // Helper: Mark All Absent for current meeting
  const handleDeselectAll = () => {
    if (!currentMeeting) return;
    const updated = { ...(attendance[currentMeeting.id] || {}) };
    eligibleMembers.forEach(m => {
      updated[m.id] = false;
    });
    onBulkSetAttendance(currentMeeting.id, updated);
  };

  // Present count for current meeting
  const currentPresentCount = useMemo(() => {
    if (!currentMeeting) return 0;
    return eligibleMembers.filter(m => Boolean(attendance[currentMeeting.id]?.[m.id])).length;
  }, [eligibleMembers, attendance, currentMeeting]);

  // Total sitting fee calculated for current meeting
  const meetingTotalSittingFee = useMemo(() => {
    if (!currentMeeting) return 0;
    return eligibleMembers.reduce((sum, mem) => {
      const isPresent = Boolean(attendance[currentMeeting.id]?.[mem.id]);
      if (isPresent) {
        return sum + getMemberSittingFeeRate(mem, rates);
      }
      return sum;
    }, 0);
  }, [eligibleMembers, attendance, currentMeeting, rates]);

  // One-by-one actions
  const currentFocusMember = eligibleMembers[focusIndex] || null;
  const isFocusMemberPresent = currentFocusMember && currentMeeting ? Boolean(attendance[currentMeeting.id]?.[currentFocusMember.id]) : false;

  const handleFocusMark = (present) => {
    if (!currentMeeting || !currentFocusMember || isReadOnly) return;
    if (isFocusMemberPresent !== present) {
      onToggleAttendance(currentMeeting.id, currentFocusMember.id);
    }
    // Automatically advance to next member
    if (focusIndex < eligibleMembers.length - 1) {
      setFocusIndex(focusIndex + 1);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Simple 2-Way Tab Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveCategory('BOARD');
              setShowAddForm(false);
            }}
            className={`w-full py-3 px-4 rounded-lg text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
              activeCategory === 'BOARD'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/80'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>1. ഭരണസമിതി യോഗങ്ങൾ (Board Meetings)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveCategory('SC');
              setShowAddForm(false);
            }}
            className={`w-full py-3 px-4 rounded-lg text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
              activeCategory === 'SC'
                ? 'bg-indigo-700 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/80'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span>2. സ്ഥിരംസമിതി യോഗങ്ങൾ (Standing Committees)</span>
          </button>
        </div>
      </div>

      {/* If Standing Committee is chosen, clean Committee Selector Bar */}
      {activeCategory === 'SC' && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-indigo-950 px-2">കമ്മിറ്റി തിരഞ്ഞെടുക്കുക:</span>
          {STANDING_COMMITTEES.map(sc => (
            <button
              key={sc.id}
              onClick={() => {
                setSelectedCommittee(sc.id);
                setShowAddForm(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedCommittee === sc.id
                  ? 'bg-indigo-700 text-white shadow-sm'
                  : 'bg-white text-indigo-900 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              {sc.name} ({sc.englishName})
            </button>
          ))}
        </div>
      )}

      {/* Meeting Date Selector Pills & Add Button */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              {activeCategory === 'BOARD' ? 'ഭരണസമിതി യോഗ തീയതികൾ' : `${STANDING_COMMITTEES.find(c => c.id === selectedCommittee)?.name} യോഗ തീയതികൾ`}
            </h3>
            <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">
              {categoryMeetings.length} യോഗങ്ങൾ
            </span>
          </div>

          {!isReadOnly && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ പുതിയ യോഗ തീയതി ചേർക്കുക</span>
            </button>
          )}
        </div>

        {/* Inline Add Meeting Form - Only Date Required */}
        {showAddForm && (
          <form onSubmit={handleAddNewMeeting} className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-3 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 max-w-sm">
                <label className="block text-xs font-bold text-emerald-950 mb-1">
                  യോഗം ചേർന്ന തീയതി (Meeting Date) *
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-emerald-300 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 font-bold"
                  required
                />
              </div>

              <div className="w-full sm:w-40">
                <label className="block text-xs font-bold text-emerald-950 mb-1">
                  സമയം (Time)
                </label>
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="11:00 AM"
                  className="w-full px-3 py-2 text-sm bg-white border border-emerald-300 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex-1">
                <label className="block text-xs font-bold text-emerald-950 mb-1">
                  മീറ്റിംഗ് വിവരണം (Optional Title)
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={activeCategory === 'BOARD' ? 'പഞ്ചായത്ത് ഭരണസമിതി യോഗം' : 'സ്റ്റാൻഡിംഗ് കമ്മിറ്റി യോഗം'}
                  className="w-full px-3 py-2 text-sm bg-white border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-200/60">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold"
              >
                റദ്ദാക്കുക
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                തീയതി സേവ് ചെയ്ത് ഹാജർ രേഖപ്പെടുത്തുക
              </button>
            </div>
          </form>
        )}

        {/* Meeting Date Horizontal Selector Pills */}
        {categoryMeetings.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {categoryMeetings.map((m, idx) => {
              const isActive = currentMeeting?.id === m.id;
              const meetingAtt = attendance[m.id] || {};
              const attendedCount = eligibleMembers.filter(mem => Boolean(meetingAtt[mem.id])).length;

              return (
                <div
                  key={m.id}
                  className={`group relative flex items-center rounded-2xl border transition-all ${
                    isActive 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500/40' 
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMeetingId(m.id);
                      setFocusIndex(0);
                    }}
                    className="py-2.5 px-4 text-left flex items-center gap-2.5"
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                      isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-200 text-slate-700'
                    }`}>
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-mono font-bold text-xs">
                        {m.formattedDate}
                      </div>
                      <div className={`text-[10px] ${isActive ? 'text-emerald-300' : 'text-slate-500'}`}>
                        {attendedCount} / {eligibleMembers.length} ഹാജർ
                      </div>
                    </div>
                  </button>

                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`ഈ മീറ്റിംഗ് ഒഴിവാക്കണോ? (${m.formattedDate})`)) {
                          onDeleteMeeting(m.id);
                        }
                      }}
                      className="text-slate-400 hover:text-rose-500 p-1.5 mr-1.5 rounded-lg hover:bg-rose-50/20 transition"
                      title="Delete meeting"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
            <p className="text-xs text-slate-600 font-medium">
              ഈ വിഭാഗത്തിൽ {formatMonthYearMalayalam(selectedMonth)} മാസത്തിൽ യോഗങ്ങളൊന്നും ചേർത്തിട്ടില്ല.
            </p>
            {!isReadOnly && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                + ആദ്യ യോഗ തീയതി ചേർക്കുക
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Attendance Sheet for the Selected Meeting */}
      {currentMeeting && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
          
          {/* Header of Active Meeting */}
          <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                  തീയതി: {currentMeeting.formattedDate} ({currentMeeting.time || '11:00 AM'})
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {currentMeeting.title}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isReadOnly 
                  ? 'വ്യൂവർ മോഡ് (Read Only): ഹാജർ വിവരങ്ങൾ കാണാൻ മാത്രമേ സാധിക്കൂ.'
                  : 'ഹാജരായവരെ മാത്രം ടിക്ക് ചെയ്യുക. അവധിയുള്ളവരെ അൺചെക്ക് ചെയ്യുക.'}
              </p>
            </div>

            {/* 1-Click Select All and Clear Buttons */}
            {!isReadOnly && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-sm transition active:scale-95"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>എല്ലാവരേയും തിരഞ്ഞെടുക്കുക (Select All)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition"
                >
                  <Square className="w-4 h-4" />
                  <span>എല്ലാം ഒഴിവാക്കുക</span>
                </button>
              </div>
            )}
          </div>

          {/* Live Attendance Tally Bar & View Options Header */}
          <div className="bg-emerald-50/90 px-4 sm:px-6 py-3 border-b border-emerald-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-bold text-emerald-950 text-sm">
                ഹാജർ: <span className="font-black font-mono text-emerald-700 text-base">{currentPresentCount}</span> / {eligibleMembers.length}
              </span>
              <span className="text-slate-600 bg-white/70 px-2 py-0.5 rounded-lg border border-emerald-200">
                ലീവ്: <strong className="text-rose-700">{eligibleMembers.length - currentPresentCount}</strong>
              </span>
              <span className="text-[11px] text-emerald-800 font-medium hidden sm:inline">
                (സിറ്റിംഗ് ഫീസ്: <strong>₹{rates?.sittingFee?.member ?? 200}</strong> / <strong>₹{rates?.sittingFee?.president ?? 250}</strong>)
              </span>
            </div>

            {/* View Option Selector Buttons (Large, Medium, Small, Tile, One by One) */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-emerald-200 shadow-xs overflow-x-auto">
              <span className="text-[10px] font-bold text-slate-500 px-2 hidden sm:inline">വ്യൂ മോഡ്:</span>

              {/* Large */}
              <button
                type="button"
                onClick={() => setViewMode('large')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  viewMode === 'large'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                }`}
                title="Large View: വലിയ കാർഡുകൾ"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Large</span>
              </button>

              {/* Medium (Default) */}
              <button
                type="button"
                onClick={() => setViewMode('medium')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  viewMode === 'medium'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                }`}
                title="Medium View: സാധാരണ കാർഡുകൾ"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Medium</span>
              </button>

              {/* Tile */}
              <button
                type="button"
                onClick={() => setViewMode('tile')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  viewMode === 'tile'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                }`}
                title="Tile View: ഒതുങ്ങിയ ടൈൽ ഗ്രിഡ്"
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                <span>Tile</span>
              </button>

              {/* Small / List */}
              <button
                type="button"
                onClick={() => setViewMode('small')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  viewMode === 'small'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                }`}
                title="Small / List View: കോംപാക്റ്റ് ലിസ്റ്റ്"
              >
                <List className="w-3.5 h-3.5" />
                <span>Small</span>
              </button>

              {/* One by One */}
              <button
                type="button"
                onClick={() => setViewMode('one_by_one')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  viewMode === 'one_by_one'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                }`}
                title="One by One: ഓരോരുത്തരായി റോൾ-കോൾ രീതിയിൽ"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>One by One</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Toolbar (Available in grid/list modes) */}
          {viewMode !== 'one_by_one' && (
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="മെമ്പറുടെ പേരോ വാർഡ് നമ്പറോ സെർച്ച് ചെയ്യുക..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 text-[11px] font-medium">ഫിൽട്ടർ:</span>
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    statusFilter === 'ALL'
                      ? 'bg-slate-800 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  എല്ലാവരും ({eligibleMembers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('PRESENT')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    statusFilter === 'PRESENT'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  ഹാജർ ({currentPresentCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('ABSENT')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    statusFilter === 'ABSENT'
                      ? 'bg-rose-700 text-white'
                      : 'bg-white border border-slate-200 text-rose-700 hover:bg-rose-50'
                  }`}
                >
                  ലീവ് ({eligibleMembers.length - currentPresentCount})
                </button>
              </div>
            </div>
          )}

          {/* VIEW 1: LARGE CARDS (വലിയ കാർഡുകൾ) */}
          {viewMode === 'large' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedMembers.map((member) => {
                  const isChecked = Boolean(attendance[currentMeeting.id]?.[member.id]);

                  return (
                    <div
                      key={member.id}
                      onClick={() => !isReadOnly && onToggleAttendance(currentMeeting.id, member.id)}
                      className={`p-4 sm:p-5 rounded-2xl border-2 transition ${isReadOnly ? 'cursor-default' : 'cursor-pointer'} select-none flex flex-col justify-between gap-3 shadow-xs hover:shadow-md ${
                        isChecked
                          ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-bold font-mono text-sm shrink-0 shadow-xs ${
                            isChecked ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            <span className="text-[9px] uppercase tracking-tighter opacity-80">വാർഡ്</span>
                            <span>{member.wardNo}</span>
                          </div>

                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-slate-900 truncate">
                              {member.name}
                            </h4>
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {member.englishName || member.name} • {member.wardName}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                                <Award className="w-3 h-3 text-amber-600" />
                                {member.designationLabel}
                              </span>
                              {member.phone && member.phone !== '9447000000' && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-500 px-1.5 py-0.5">
                                  <Phone className="w-2.5 h-2.5" />
                                  {member.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Large Present/Absent Toggle Switch */}
                        <div className="shrink-0 flex flex-col items-end gap-1">
                          <span className={`text-xs font-black px-3 py-1 rounded-xl uppercase tracking-wider flex items-center gap-1 shadow-xs ${
                            isChecked
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}>
                            {isChecked ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                            <span>{isChecked ? 'ഹാജർ' : 'ലീവ്'}</span>
                          </span>
                        </div>
                      </div>

                      {/* Bottom Sitting Fee indicator */}
                      <div className="pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                        <span>സിറ്റിംഗ് ഫീസ്: <strong>₹{getMemberSittingFeeRate(member, rates)}</strong></span>
                        <span className={`font-semibold ${isChecked ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                          {isChecked ? 'തുക അർഹതയുണ്ട്' : 'തുകയില്ല'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 2: MEDIUM CARDS (സാധാരണ കാർഡുകൾ - Default) */}
          {viewMode === 'medium' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {displayedMembers.map((member) => {
                  const isChecked = Boolean(attendance[currentMeeting.id]?.[member.id]);

                  return (
                    <div
                      key={member.id}
                      onClick={() => !isReadOnly && onToggleAttendance(currentMeeting.id, member.id)}
                      className={`p-3.5 rounded-2xl border-2 transition ${isReadOnly ? 'cursor-default' : 'cursor-pointer'} select-none flex items-center justify-between gap-3 ${
                        isChecked
                          ? 'bg-emerald-50/90 border-emerald-500 shadow-xs ring-1 ring-emerald-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isChecked ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {member.wardNo}
                        </div>

                        <div className="min-w-0">
                          <div className="font-bold text-xs text-slate-900 truncate">
                            {member.name}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {member.wardName}
                          </div>
                          <div className="text-[9px] text-slate-600 font-medium truncate mt-0.5">
                            {member.designationLabel}
                          </div>
                        </div>
                      </div>

                      {/* Checkbox and Malayalam status badge */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isChecked
                            ? 'bg-emerald-200 text-emerald-900'
                            : 'bg-slate-100 text-slate-400'
                        }`}>
                          {isChecked ? 'ഹാജർ' : 'ലീവ്'}
                        </span>

                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="matrix-checkbox pointer-events-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 3: TILE GRID (ഒതുങ്ങിയ ടൈൽ ഗ്രിഡ്) */}
          {viewMode === 'tile' && (
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {displayedMembers.map((member) => {
                  const isChecked = Boolean(attendance[currentMeeting.id]?.[member.id]);

                  return (
                    <button
                      type="button"
                      key={member.id}
                      onClick={() => !isReadOnly && onToggleAttendance(currentMeeting.id, member.id)}
                      className={`p-3 rounded-2xl border-2 text-left transition flex flex-col justify-between select-none active:scale-95 ${
                        isChecked
                          ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-black text-xs ${
                          isChecked ? 'bg-emerald-900 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {member.wardNo}
                        </span>
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                          isChecked ? 'bg-emerald-500 text-slate-950' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {isChecked ? 'P' : 'A'}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="font-bold text-xs truncate leading-tight">
                          {member.name}
                        </div>
                        <div className={`text-[9px] truncate mt-0.5 ${isChecked ? 'text-emerald-200' : 'text-slate-500'}`}>
                          വാർഡ് {member.wardNo}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 4: SMALL / COMPACT LIST (കോംപാക്റ്റ് ലിസ്റ്റ്) */}
          {viewMode === 'small' && (
            <div className="p-4 sm:p-6 overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-2.5 text-center w-12">വാർഡ്</th>
                    <th className="p-2.5 text-left">മെമ്പറുടെ പേര്</th>
                    <th className="p-2.5 text-left hidden sm:table-cell">വാർഡ് പേര്</th>
                    <th className="p-2.5 text-left hidden md:table-cell">പദവി</th>
                    <th className="p-2.5 text-center w-28">ഹാജർ നില</th>
                    <th className="p-2.5 text-center w-16">ടിക്ക്</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {displayedMembers.map((member) => {
                    const isChecked = Boolean(attendance[currentMeeting.id]?.[member.id]);

                    return (
                      <tr
                        key={member.id}
                        onClick={() => !isReadOnly && onToggleAttendance(currentMeeting.id, member.id)}
                        className={`hover:bg-slate-50/80 transition cursor-pointer select-none ${
                          isChecked ? 'bg-emerald-50/50 font-semibold' : ''
                        }`}
                      >
                        <td className="p-2.5 text-center font-mono font-bold text-slate-800">
                          {member.wardNo}
                        </td>
                        <td className="p-2.5 font-bold text-slate-900">
                          {member.name}
                        </td>
                        <td className="p-2.5 text-slate-500 hidden sm:table-cell">
                          {member.wardName}
                        </td>
                        <td className="p-2.5 text-slate-600 text-[11px] hidden md:table-cell">
                          {member.designationLabel}
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            isChecked
                              ? 'bg-emerald-200 text-emerald-900 font-bold'
                              : 'bg-slate-100 text-slate-400'
                          }`}>
                            {isChecked ? 'ഹാജർ' : 'ലീവ്'}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="matrix-checkbox pointer-events-none"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* VIEW 5: ONE BY ONE / FOCUS MODE (വൺ ബൈ വൺ കാർഡുകൾ) */}
          {viewMode === 'one_by_one' && currentFocusMember && (
            <div className="p-6 sm:p-10 flex flex-col items-center space-y-6">
              {/* Stepper Header */}
              <div className="w-full max-w-lg flex items-center justify-between text-xs text-slate-600 font-bold">
                <span>റോൾ-കോൾ ഫോക്കസ് മോഡ് (One-by-One)</span>
                <span className="font-mono bg-slate-100 text-slate-800 px-3 py-1 rounded-full border border-slate-200">
                  അംഗം {focusIndex + 1} / {eligibleMembers.length}
                </span>
              </div>

              {/* Focus Main Card */}
              <div className={`w-full max-w-lg p-6 sm:p-8 rounded-3xl border-2 transition shadow-lg text-center space-y-4 ${
                isFocusMemberPresent
                  ? 'bg-emerald-50/95 border-emerald-500 ring-4 ring-emerald-500/20'
                  : 'bg-white border-slate-300'
              }`}>
                {/* Large Ward Badge */}
                <div className="flex justify-center">
                  <span className={`w-16 h-16 rounded-3xl flex flex-col items-center justify-center font-black font-mono shadow-md ${
                    isFocusMemberPresent ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-white'
                  }`}>
                    <span className="text-[10px] tracking-wider opacity-80 uppercase">വാർഡ്</span>
                    <span className="text-xl leading-none">{currentFocusMember.wardNo}</span>
                  </span>
                </div>

                {/* Member Details */}
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                    {currentFocusMember.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {currentFocusMember.englishName || currentFocusMember.name} • {currentFocusMember.wardName}
                  </p>
                  <div className="inline-block mt-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                    {currentFocusMember.designationLabel}
                  </div>
                </div>

                {/* Big Present / Absent Toggle Buttons */}
                {!isReadOnly ? (
                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => handleFocusMark(true)}
                      className={`py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition active:scale-95 shadow-sm ${
                        isFocusMemberPresent
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-600'
                          : 'bg-slate-100 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      <Check className="w-5 h-5" />
                      <span>ഹാജർ (Present)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFocusMark(false)}
                      className={`py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition active:scale-95 shadow-sm ${
                        !isFocusMemberPresent
                          ? 'bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-600'
                          : 'bg-slate-100 hover:bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      <X className="w-5 h-5" />
                      <span>ലീവ് (Absent)</span>
                    </button>
                  </div>
                ) : (
                  <div className={`py-3 rounded-2xl text-sm font-black ${
                    isFocusMemberPresent ? 'bg-emerald-200 text-emerald-950' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {isFocusMemberPresent ? 'ഹാജർ രേഖപ്പെടുത്തിയിട്ടുണ്ട്' : 'ലീവ് ആണ്'}
                  </div>
                )}
              </div>

              {/* Prev / Next Stepper Controls */}
              <div className="w-full max-w-lg flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setFocusIndex(Math.max(0, focusIndex - 1))}
                  disabled={focusIndex === 0}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>മുമ്പത്തെ മെമ്പർ</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFocusIndex(Math.min(eligibleMembers.length - 1, focusIndex + 1))}
                  disabled={focusIndex === eligibleMembers.length - 1}
                  className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-xs"
                >
                  <span>അടുത്ത മെമ്പർ</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Jump Thumbnail Strip */}
              <div className="w-full max-w-lg pt-4 border-t border-slate-200">
                <div className="text-[11px] text-slate-500 font-bold mb-2 text-left">
                  നേരിട്ട് തെരഞ്ഞെടുക്കുക (Quick Jump):
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {eligibleMembers.map((mem, idx) => {
                    const isMemPresent = Boolean(attendance[currentMeeting.id]?.[mem.id]);
                    const isSelected = idx === focusIndex;

                    return (
                      <button
                        key={mem.id}
                        type="button"
                        onClick={() => setFocusIndex(idx)}
                        className={`w-7 h-7 rounded-lg font-mono font-bold text-[11px] transition ${
                          isSelected
                            ? 'ring-2 ring-emerald-600 font-black scale-110'
                            : ''
                        } ${
                          isMemPresent
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                        title={`വാർഡ് ${mem.wardNo} - ${mem.name} (${isMemPresent ? 'ഹാജർ' : 'ലീവ്'})`}
                      >
                        {mem.wardNo}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Confirmation Footer */}
          <div className="bg-slate-50 p-4 px-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                മാറ്റങ്ങൾ തത്സമയം സേവ് ചെയ്യപ്പെടുന്നു. (അക്വിറ്റൻസ് റോളിലും മാട്രിക്സിലും അപ്ഡേറ്റ് ആയിട്ടുണ്ട്).
              </span>
            </div>

            <div className="font-mono text-xs font-bold text-emerald-800">
              ഈ യോഗത്തിലെ ആകെ സിറ്റിംഗ് ഫീസ് തുക: {formatINR(meetingTotalSittingFee)}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
