import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckSquare, 
  Square, 
  Calendar, 
  Clock, 
  BookOpen, 
  Layers, 
  Users, 
  CheckCircle2, 
  UserCheck, 
  UserX,
  Plus,
  Trash2,
  Sparkles,
  Info,
  ShieldCheck
} from 'lucide-react';
import { STANDING_COMMITTEES, STATUTORY_RATES } from '../data/initialData';
import { isMemberEligibleForMeeting, formatINR } from '../utils/calculations';

export default function MeetingAttendanceEntryModal({
  isOpen,
  onClose,
  members,
  meetings,
  attendance,
  selectedMonth,
  onSaveMeetingWithAttendance,
  onDeleteMeeting,
  rates = STATUTORY_RATES
}) {
  // Filter meetings for the selected month
  const monthMeetings = meetings
    .filter(m => m.monthYear === selectedMonth)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Mode: 'EDIT_EXISTING' or 'NEW_MEETING'
  const [selectedMeetingId, setSelectedMeetingId] = useState(() => {
    return monthMeetings.length > 0 ? monthMeetings[0].id : 'NEW';
  });

  // Form states for new/editing meeting
  const [meetingDate, setMeetingDate] = useState(`${selectedMonth}-05`);
  const [meetingType, setMeetingType] = useState('Board Meeting'); // 'Board Meeting' or 'Standing Committee Meeting'
  const [committee, setCommittee] = useState('development');
  const [title, setTitle] = useState('പഞ്ചായത്ത് ഭരണസമിതി യോഗം (Board Meeting)');
  const [time, setTime] = useState('11:00 AM');
  const [agenda, setAgenda] = useState('');

  // Attendance state map for the active meeting: { [memberId]: boolean }
  const [currentAttendance, setCurrentAttendance] = useState({});

  // When selectedMeetingId changes, load its data
  useEffect(() => {
    if (selectedMeetingId && selectedMeetingId !== 'NEW') {
      const existingMeeting = monthMeetings.find(m => m.id === selectedMeetingId);
      if (existingMeeting) {
        setMeetingDate(existingMeeting.date);
        setMeetingType(existingMeeting.type);
        setCommittee(existingMeeting.committee || 'development');
        setTitle(existingMeeting.title);
        setTime(existingMeeting.time || '11:00 AM');
        setAgenda(existingMeeting.agenda || '');
        // Load attendance map
        const existingAtt = attendance[existingMeeting.id] || {};
        setCurrentAttendance(existingAtt);
        return;
      }
    }

    // If NEW meeting: default to all eligible members SELECTED (True)
    if (selectedMeetingId === 'NEW') {
      const defaultDate = `${selectedMonth}-20`;
      setMeetingDate(defaultDate);
      setMeetingType('Board Meeting');
      setTitle('പഞ്ചായത്ത് ഭരണസമിതി യോഗം (General Board Meeting)');
      setAgenda('');
      
      // Default: All 24 members selected as PRESENT by default
      const defaultAtt = {};
      members.forEach(m => {
        defaultAtt[m.id] = true; // All present by default
      });
      setCurrentAttendance(defaultAtt);
    }
  }, [selectedMeetingId, selectedMonth, isOpen]);

  if (!isOpen) return null;

  // Active meeting mock object for eligibility checks
  const currentMeetingObj = {
    id: selectedMeetingId,
    type: meetingType,
    committee: meetingType === 'Standing Committee Meeting' ? committee : null,
    date: meetingDate
  };

  // Filter members eligible for this meeting
  const eligibleMembers = members.filter(m => isMemberEligibleForMeeting(m, currentMeetingObj));
  const ineligibleMembers = members.filter(m => !isMemberEligibleForMeeting(m, currentMeetingObj));

  // Present count
  const presentCount = eligibleMembers.filter(m => Boolean(currentAttendance[m.id])).length;
  const absentCount = eligibleMembers.length - presentCount;

  // Handle Select All
  const handleSelectAll = () => {
    const updated = { ...currentAttendance };
    eligibleMembers.forEach(m => {
      updated[m.id] = true;
    });
    setCurrentAttendance(updated);
  };

  // Handle Deselect All
  const handleDeselectAll = () => {
    const updated = { ...currentAttendance };
    eligibleMembers.forEach(m => {
      updated[m.id] = false;
    });
    setCurrentAttendance(updated);
  };

  // Toggle single member
  const handleToggleMember = (memberId) => {
    setCurrentAttendance(prev => ({
      ...prev,
      [memberId]: !prev[memberId]
    }));
  };

  // Change meeting type
  const handleTypeChange = (type) => {
    setMeetingType(type);
    if (type === 'Board Meeting') {
      setTitle('പഞ്ചായത്ത് ഭരണസമിതി യോഗം (General Board Meeting)');
    } else {
      const commObj = STANDING_COMMITTEES.find(c => c.id === committee);
      setTitle(`${commObj ? commObj.name : ''} സ്റ്റാൻഡിംഗ് കമ്മിറ്റി യോഗം (${commObj ? commObj.englishName : ''} SC Meeting)`);
    }

    // Re-initialize attendance for eligible members
    const testMeeting = {
      type,
      committee: type === 'Standing Committee Meeting' ? committee : null
    };
    const updated = {};
    members.forEach(m => {
      if (isMemberEligibleForMeeting(m, testMeeting)) {
        updated[m.id] = true; // Default all eligible present
      }
    });
    setCurrentAttendance(updated);
  };

  // Change committee
  const handleCommitteeChange = (newComm) => {
    setCommittee(newComm);
    const commObj = STANDING_COMMITTEES.find(c => c.id === newComm);
    setTitle(`${commObj ? commObj.name : ''} സ്റ്റാൻഡിംഗ് കമ്മിറ്റി യോഗം (${commObj ? commObj.englishName : ''} SC Meeting)`);

    const testMeeting = {
      type: 'Standing Committee Meeting',
      committee: newComm
    };
    const updated = {};
    members.forEach(m => {
      if (isMemberEligibleForMeeting(m, testMeeting)) {
        updated[m.id] = true;
      }
    });
    setCurrentAttendance(updated);
  };

  // Save current meeting and attendance
  const handleSave = (createAnother = false) => {
    if (!meetingDate) return;

    const [y, m, d] = meetingDate.split('-');
    const formattedDate = `${d}/${m}/${y}`;
    const monthYear = `${y}-${m}`;

    const isNew = selectedMeetingId === 'NEW';
    const meetingId = isNew 
      ? `MTG-${meetingDate}-${meetingType === 'Board Meeting' ? 'BM' : `SC-${committee.toUpperCase()}`}-${Date.now().toString().slice(-4)}`
      : selectedMeetingId;

    const meetingToSave = {
      id: meetingId,
      monthYear,
      date: meetingDate,
      formattedDate,
      type: meetingType,
      committee: meetingType === 'Standing Committee Meeting' ? committee : null,
      title,
      agenda: agenda.trim() || (meetingType === 'Board Meeting' ? 'സാധാരണ അജണ്ടകളും ഭരണപരമായ വിഷയങ്ങളും' : 'സ്റ്റാൻഡിംഗ് കമ്മിറ്റി വിഷയങ്ങൾ'),
      time
    };

    onSaveMeetingWithAttendance(meetingToSave, currentAttendance);

    if (createAnother) {
      setSelectedMeetingId('NEW');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600/30 border border-emerald-400/30">
              <CheckSquare className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-white">
                  ഭരണസമിതി മീറ്റിംഗ് സിറ്റിംഗ് ഫീ & ഹാജർ രേഖപ്പെടുത്തുക
                </h3>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Quick Attendance Entry
                </span>
              </div>
              <p className="text-xs text-emerald-200/80">
                പുതുപ്പാടി ഗ്രാമപഞ്ചായത്ത് • എസ്റ്റാബ്ലിഷ്മെന്റ് ഹാജർ പുസ്തക രജിസ്ട്രേഷൻ
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Meeting Sessions Selector Bar */}
        <div className="bg-slate-100 p-3 px-6 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 shrink-0">
              ഈ മാസത്തിലെ യോഗങ്ങൾ:
            </span>
            <div className="flex items-center gap-1.5">
              {monthMeetings.map((m, idx) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMeetingId(m.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedMeetingId === m.id
                      ? 'bg-slate-900 text-white shadow-sm ring-2 ring-emerald-500/50'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  <Calendar className="w-3 h-3 text-emerald-500" />
                  <span>#{idx + 1} {m.formattedDate}</span>
                  <span className="text-[10px] opacity-75">
                    ({m.type === 'Board Meeting' ? 'ബോർഡ്' : 'SC'})
                  </span>
                </button>
              ))}

              <button
                onClick={() => setSelectedMeetingId('NEW')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedMeetingId === 'NEW'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ പുതിയ യോഗം ചേർക്കുക</span>
              </button>
            </div>
          </div>

          {selectedMeetingId !== 'NEW' && (
            <button
              onClick={() => {
                if (confirm('ഈ യോഗത്തിന്റെ വിവരങ്ങളും ഹാജറും ഡിലീറ്റ് ചെയ്യണോ?')) {
                  onDeleteMeeting(selectedMeetingId);
                  setSelectedMeetingId('NEW');
                }
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ഡിലീറ്റ്</span>
            </button>
          )}
        </div>

        {/* Main Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Section 1: Meeting Details & Type */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              
              {/* Meeting Type Radio Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTypeChange('Board Meeting')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    meetingType === 'Board Meeting'
                      ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-500/30'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>ഭരണസമിതി യോഗം (General Board - 24 Members)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeChange('Standing Committee Meeting')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    meetingType === 'Standing Committee Meeting'
                      ? 'bg-indigo-700 text-white shadow-sm ring-2 ring-indigo-500/30'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>സ്റ്റാൻഡിംഗ് കമ്മിറ്റി യോഗം (SC Meeting)</span>
                </button>
              </div>

              {/* Standing Committee Selection if SC */}
              {meetingType === 'Standing Committee Meeting' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">കമ്മിറ്റി:</span>
                  <select
                    value={committee}
                    onChange={(e) => handleCommitteeChange(e.target.value)}
                    className="text-xs font-semibold p-2 rounded-xl border border-indigo-300 bg-indigo-50 text-indigo-900 focus:ring-2 focus:ring-indigo-500"
                  >
                    {STANDING_COMMITTEES.map(sc => (
                      <option key={sc.id} value={sc.id}>{sc.name} ({sc.englishName})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Date, Time & Agenda Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  യോഗ തീയതി (Meeting Date) *
                </label>
                <input
                  type="date"
                  required
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  സമയം (Time)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 11:00 AM"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                  <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  പ്രധാന അജണ്ട / വിവരണം
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="യോഗത്തിന്റെ വിവരണം..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Attendance Controls Bar with 1-Click Select All */}
          <div className="bg-emerald-900 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div>
              <h4 className="font-black text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-300" />
                <span>അംഗങ്ങളുടെ ഹാജർ രേഖപ്പെടുത്തുക (Mark Attendance)</span>
              </h4>
              <p className="text-xs text-emerald-200 mt-0.5">
                ഹാജരായവരെ സെലക്ട് ചെയ്യുക. അവധിയുള്ളവരെ മാത്രം അൺചെക്ക് ചെയ്യുക.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition active:scale-95"
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
                <span>എല്ലാം ഒഴിവാക്കുക (Deselect All)</span>
              </button>
            </div>
          </div>

          {/* Tally Pill */}
          <div className="flex items-center justify-between text-xs px-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <UserCheck className="w-3.5 h-3.5" />
                ഹാജർ (Present): {presentCount} പേർ
              </span>
              <span className="flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                <UserX className="w-3.5 h-3.5" />
                ഹാജരില്ല / ലീവ് (Absent): {absentCount} പേർ
              </span>
            </div>

            <span className="text-slate-500 font-medium">
              ആകെ യോഗ്യതയുള്ള അംഗങ്ങൾ: <strong>{eligibleMembers.length}</strong>
            </span>
          </div>

          {/* Section 3: Interactive Card Grid for All Members */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {eligibleMembers.map((member) => {
              const isChecked = Boolean(currentAttendance[member.id]);
              const scObj = STANDING_COMMITTEES.find(c => c.id === member.standingCommittee);

              return (
                <div
                  key={member.id}
                  onClick={() => handleToggleMember(member.id)}
                  className={`p-3.5 rounded-2xl border-2 transition cursor-pointer select-none flex items-center justify-between gap-3 ${
                    isChecked
                      ? 'bg-emerald-50/90 border-emerald-500 shadow-sm ring-1 ring-emerald-500/30'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isChecked ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
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

                  {/* Status Indicator Badge & Big Checkbox */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isChecked
                        ? 'bg-emerald-200 text-emerald-900 font-mono'
                        : 'bg-slate-100 text-slate-400 font-mono'
                    }`}>
                      {isChecked ? 'P (ഹാജർ)' : 'A (ലീവ്)'}
                    </span>

                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // Handled by parent container click
                      className="matrix-checkbox pointer-events-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ineligible Members Note if SC */}
          {ineligibleMembers.length > 0 && (
            <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600 flex items-center gap-2 border border-slate-200">
              <Info className="w-4 h-4 text-slate-500 shrink-0" />
              <span>
                ഈ യോഗത്തിൽ ഉൾപ്പെടാത്ത {ineligibleMembers.length} അംഗങ്ങൾ ചട്ടപ്രകാരം ഈ സ്റ്റാൻഡിംഗ് കമ്മിറ്റിയിൽ അല്ലാത്തതിനാൽ സ്വമേധയാ ഒഴിവാക്കപ്പെട്ടിരിക്കുന്നു.
              </span>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-600 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>സിറ്റിംഗ് ഫീസ്: ഹാജരായ ഓരോ അംഗത്തിനും <strong>₹{rates.sittingFeePerMeeting}</strong> നിരക്കിൽ അനുവദിക്കപ്പെടും.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition"
            >
              ക്ലോസ് (Close)
            </button>

            <button
              type="button"
              onClick={() => handleSave(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
            >
              സേവ് & അടുത്ത യോഗം ചേർക്കുക
            </button>

            <button
              type="button"
              onClick={() => handleSave(false)}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-md shadow-emerald-950/20 transition active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ഹാജർ രജിസ്റ്ററിൽ രേഖപ്പെടുത്തുക (Save Attendance)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
