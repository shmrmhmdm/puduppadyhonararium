import React, { useState } from 'react';
import { X, Calendar, Clock, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { STANDING_COMMITTEES } from '../data/initialData';

export default function AddMeetingModal({ isOpen, onClose, onAddMeeting, selectedMonth }) {
  const [meetingDate, setMeetingDate] = useState(() => {
    // Default to 1st of selectedMonth or today's day in that month
    return `${selectedMonth}-10`;
  });
  const [type, setType] = useState('Board Meeting'); // 'Board Meeting' or 'Standing Committee Meeting'
  const [committee, setCommittee] = useState('development');
  const [title, setTitle] = useState('പഞ്ചായത്ത് ഭരണസമിതി യോഗം (Board Meeting)');
  const [agenda, setAgenda] = useState('');
  const [time, setTime] = useState('11:00 AM');

  if (!isOpen) return null;

  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'Board Meeting') {
      setTitle('പഞ്ചായത്ത് ഭരണസമിതി യോഗം (General Board Meeting)');
    } else {
      const commObj = STANDING_COMMITTEES.find(c => c.id === committee);
      setTitle(`${commObj ? commObj.name : ''} സ്റ്റാൻഡിംഗ് കമ്മിറ്റി യോഗം (${commObj ? commObj.englishName : ''} SC Meeting)`);
    }
  };

  const handleCommitteeChange = (newCommittee) => {
    setCommittee(newCommittee);
    const commObj = STANDING_COMMITTEES.find(c => c.id === newCommittee);
    setTitle(`${commObj ? commObj.name : ''} സ്റ്റാൻഡിംഗ് കമ്മിറ്റി യോഗം (${commObj ? commObj.englishName : ''} SC Meeting)`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!meetingDate) return;

    // Generate readable formatted date DD/MM/YYYY
    const [y, m, d] = meetingDate.split('-');
    const formattedDate = `${d}/${m}/${y}`;
    const monthYear = `${y}-${m}`;

    const newMeeting = {
      id: `MTG-${meetingDate}-${type === 'Board Meeting' ? 'BM' : `SC-${committee.toUpperCase()}`}-${Date.now().toString().slice(-4)}`,
      monthYear,
      date: meetingDate,
      formattedDate,
      type,
      committee: type === 'Standing Committee Meeting' ? committee : null,
      title,
      agenda: agenda.trim() || (type === 'Board Meeting' ? 'സാധാരണ അജണ്ടകളും ഭരണപരമായ വിഷയങ്ങളും' : 'സ്റ്റാൻഡിംഗ് കമ്മിറ്റി വിഷയങ്ങൾ'),
      time
    };

    onAddMeeting(newMeeting);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-700/50 border border-emerald-500/40">
              <Calendar className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg">പുതിയ യോഗ തീയതി ചേർക്കുക</h3>
              <p className="text-xs text-emerald-200">Add Meeting Session to Register</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Meeting Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              യോഗ തരം (Meeting Type)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('Board Meeting')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition ${
                  type === 'Board Meeting'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>ഭരണസമിതി (Board)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('Standing Committee Meeting')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition ${
                  type === 'Standing Committee Meeting'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-800 shadow-sm ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>സ്ഥിരംസമിതി (SC)</span>
              </button>
            </div>
          </div>

          {/* Standing Committee Dropdown if SC is selected */}
          {type === 'Standing Committee Meeting' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-150">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                ഏത് സ്ഥിരം സമിതി? (Standing Committee)
              </label>
              <select
                value={committee}
                onChange={(e) => handleCommitteeChange(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {STANDING_COMMITTEES.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.name} ({sc.englishName}) - {sc.chairTitle}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                യോഗ തീയതി (Date) *
              </label>
              <input
                type="date"
                required
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                സമയം (Time)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. 11:00 AM"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <Clock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>
          </div>

          {/* Title / Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              യോഗ വിവരണം (Meeting Title / Header)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Agenda / Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              പ്രധാന അജണ്ട / കുറിപ്പ് (Agenda / Notes)
            </label>
            <textarea
              rows={2}
              placeholder="അജണ്ട അല്ലെങ്കിൽ യോഗത്തിന്റെ പ്രധാന ലക്ഷ്യം രേഖപ്പെടുത്തുക..."
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            >
              റദ്ദാക്കുക (Cancel)
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-950/20 transition active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>രജിസ്റ്ററിൽ ചേർക്കുക (Save Meeting)</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
