import React, { useState, useMemo } from 'react';
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
  ShieldCheck
} from 'lucide-react';
import { STANDING_COMMITTEES, STATUTORY_RATES } from '../data/initialData';
import { isMemberEligibleForMeeting, formatMonthYearMalayalam, formatINR } from '../utils/calculations';

export default function AttendanceEntryStep({
  members,
  meetings,
  attendance,
  onSaveMeeting,
  onDeleteMeeting,
  onToggleAttendance,
  onBulkSetAttendance,
  selectedMonth,
  rates = STATUTORY_RATES
}) {
  // Active meeting type tab: 'BOARD' or 'SC'
  const [activeCategory, setActiveCategory] = useState('BOARD'); // 'BOARD' or 'SC'
  const [selectedCommittee, setSelectedCommittee] = useState('development');

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
        if (selectedCommittee === 'finance') return m.standingCommittee === 'finance' || m.designation === 'vice_president';
        return m.standingCommittee === selectedCommittee;
      });
    }
    return members.filter(m => isMemberEligibleForMeeting(m, currentMeeting));
  }, [members, currentMeeting, activeCategory, selectedCommittee]);

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

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ പുതിയ യോഗ തീയതി ചേർക്കുക</span>
          </button>
        </div>

        {/* Inline Add Meeting Form - Only Date Required */}
        {showAddForm && (
          <form onSubmit={handleAddNewMeeting} className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-3 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 max-w-sm">
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  യോഗ തീയതി തിരഞ്ഞെടുക്കുക (Meeting Date) *
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 shadow-inner"
                />
              </div>

              <div className="flex items-center gap-2 sm:self-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
                >
                  റദ്ദാക്കുക (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>യോഗം ചേർക്കുക (Add Meeting)</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Meeting Date Tabs */}
        {categoryMeetings.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {categoryMeetings.map((m, idx) => {
              const isSelected = currentMeeting?.id === m.id;
              const presentInThis = eligibleMembers.filter(mem => Boolean(attendance[m.id]?.[mem.id])).length;

              return (
                <div
                  key={m.id}
                  onClick={() => setActiveMeetingId(m.id)}
                  className={`cursor-pointer px-4 py-2.5 rounded-xl border-2 transition flex items-center gap-3 ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${
                      isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-xs text-slate-900">{m.formattedDate}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        ഹാജർ: <strong className="text-emerald-700">{presentInThis}</strong> / {eligibleMembers.length}
                      </div>
                    </div>
                  </div>

                  {/* Delete meeting button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`ഈ യോഗം (${m.formattedDate}) ഡിലീറ്റ് ചെയ്യണോ?`)) {
                        onDeleteMeeting(m.id);
                      }
                    }}
                    className="text-slate-400 hover:text-rose-500 p-1 rounded transition ml-1"
                    title="Delete meeting"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
            <p className="text-xs text-slate-600 font-medium">
              ഈ വിഭാഗത്തിൽ {formatMonthYearMalayalam(selectedMonth)} മാസത്തിൽ യോഗങ്ങളൊന്നും ചേർത്തിട്ടില്ല.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              + ആദ്യ യോഗ തീയതി ചേർക്കുക
            </button>
          </div>
        )}
      </div>

      {/* Main Clean Attendance Sheet for the Selected Meeting */}
      {currentMeeting && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
          
          {/* Header of Active Meeting */}
          <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                  തീയതി: {currentMeeting.formattedDate} ({currentMeeting.time || '11:00 AM'})
                </span>
                <span className="text-xs text-slate-300">
                  {currentMeeting.title}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                ഹാജരായവരെ മാത്രം ടിക്ക് ചെയ്യുക. അവധിയുള്ളവരെ അൺചെക്ക് ചെയ്യുക.
              </p>
            </div>

            {/* 1-Click Select All and Clear Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-sm transition active:scale-95"
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
          </div>

          {/* Live Attendance Tally Bar */}
          <div className="bg-emerald-50/80 px-6 py-2.5 border-b border-emerald-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-emerald-900">
                ഹാജർ: <span className="text-sm font-black font-mono">{currentPresentCount}</span> / {eligibleMembers.length} അംഗങ്ങൾ
              </span>
              <span className="text-slate-500">
                (ലീവ് / ഹാജരില്ലാത്തവർ: <strong>{eligibleMembers.length - currentPresentCount}</strong>)
              </span>
            </div>

            <div className="text-[11px] text-emerald-800 font-medium">
              സിറ്റിംഗ് ഫീസ് നിരക്ക്: <strong>₹{rates.sittingFeePerMeeting}</strong> / മീറ്റിംഗ്
            </div>
          </div>

          {/* Simple, Clean 24 Members Checklist */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {eligibleMembers.map((member) => {
                const isChecked = Boolean(attendance[currentMeeting.id]?.[member.id]);

                return (
                  <div
                    key={member.id}
                    onClick={() => onToggleAttendance(currentMeeting.id, member.id)}
                    className={`p-3.5 rounded-2xl border-2 transition cursor-pointer select-none flex items-center justify-between gap-3 ${
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
                        onChange={() => {}} // Handled by row click
                        className="matrix-checkbox pointer-events-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Confirmation Footer */}
          <div className="bg-slate-50 p-4 px-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                മാറ്റങ്ങൾ തത്സമയം സേവ് ചെയ്യപ്പെടുന്നു. (അക്വിറ്റൻസ് റോളിലും മാട്രിക്സിലും അപ്ഡേറ്റ് ആയിട്ടുണ്ട്).
              </span>
            </div>

            <div className="font-mono text-xs font-bold text-emerald-800">
              ഈ യോഗത്തിലെ ആകെ സിറ്റിംഗ് ഫീസ് തുക: {formatINR(currentPresentCount * rates.sittingFeePerMeeting)}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
