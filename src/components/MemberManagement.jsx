import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Edit3, 
  Trash2, 
  UserPlus, 
  Check, 
  X, 
  Landmark, 
  Phone, 
  Layers, 
  Award,
  Filter,
  ShieldCheck,
  Save,
  CheckCircle2,
  LayoutGrid,
  Grid3X3,
  List,
  Maximize2,
  Sliders,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { STANDING_COMMITTEES } from '../data/initialData';

export default function MemberManagement({ members, onAddMember, onUpdateMember, onDeleteMember, currentUser }) {
  const isAdmin = !currentUser || currentUser.role === 'admin';
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCommittee, setFilterCommittee] = useState('ALL');

  // View Options: 'medium' | 'large' | 'small' | 'tile' | 'one_by_one'
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('puduppady_members_view_mode') || 'medium';
  });

  useEffect(() => {
    localStorage.setItem('puduppady_members_view_mode', viewMode);
  }, [viewMode]);

  // One-by-One Focus Index
  const [focusIndex, setFocusIndex] = useState(0);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  // Calculate next ward number helper
  const nextWardNo = (members && members.length > 0)
    ? Math.max(...members.map(m => Number(m.wardNo) || 0)) + 1
    : 1;

  // Form state for adding new member
  const [newMemberForm, setNewMemberForm] = useState({
    wardNo: nextWardNo,
    wardName: '',
    name: '',
    englishName: '',
    designation: 'member',
    designationLabel: 'മെമ്പർ (Ward Member)',
    standingCommittee: 'development',
    phone: '',
    bankDetails: {
      accountNo: '',
      ifsc: 'SBIN0070554',
      bankName: 'State Bank of India',
      branch: 'Puduppady'
    }
  });

  // Keep newMemberForm.wardNo in sync if opened and empty
  const handleOpenAddModal = () => {
    setNewMemberForm(prev => ({
      ...prev,
      wardNo: (members && members.length > 0) ? Math.max(...members.map(m => Number(m.wardNo) || 0)) + 1 : 1
    }));
    setIsAddModalOpen(true);
  };

  // Designation change helper for Add/Edit
  const handleDesignationChange = (desig, formState, setFormState) => {
    let label = 'മെമ്പർ (Ward Member)';
    let comm = formState.standingCommittee || 'development';

    if (desig === 'president') {
      label = 'പ്രസിഡന്റ് (President)';
      comm = null;
    } else if (desig === 'vice_president') {
      label = 'വൈസ് പ്രസിഡന്റ് (Vice President)';
      comm = 'finance';
    } else if (desig === 'sc_chairperson') {
      label = 'സ്റ്റാൻഡിംഗ് കമ്മിറ്റി ചെയർപേഴ്സൺ';
    }

    setFormState({
      ...formState,
      designation: desig,
      designationLabel: label,
      standingCommittee: comm
    });
  };

  // Submit Add
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newMemberForm.name || !newMemberForm.name.trim()) return;

    const assignedWardNo = Number(newMemberForm.wardNo) || nextWardNo;
    const newId = `M${String(assignedWardNo).padStart(2, '0')}_${Date.now().toString().slice(-4)}`;
    
    const memberToAdd = {
      id: newId,
      wardNo: assignedWardNo,
      wardName: (newMemberForm.wardName || '').trim() || `വാർഡ് ${assignedWardNo}`,
      name: newMemberForm.name.trim(),
      englishName: (newMemberForm.englishName || '').trim() || newMemberForm.name.trim(),
      designation: newMemberForm.designation || 'member',
      designationLabel: newMemberForm.designationLabel || 'മെമ്പർ (Ward Member)',
      standingCommittee: newMemberForm.designation === 'president' ? null : (newMemberForm.standingCommittee || 'development'),
      phone: (newMemberForm.phone || '').trim() || '9447000000',
      bankDetails: {
        accountNo: (newMemberForm.bankDetails?.accountNo || '').trim() || '00000000000',
        ifsc: (newMemberForm.bankDetails?.ifsc || '').trim() || 'SBIN0070554',
        bankName: (newMemberForm.bankDetails?.bankName || '').trim() || 'State Bank of India',
        branch: (newMemberForm.bankDetails?.branch || '').trim() || 'Puduppady'
      }
    };

    onAddMember(memberToAdd);
    setIsAddModalOpen(false);
    
    // Reset form
    setNewMemberForm({
      wardNo: assignedWardNo + 1,
      wardName: '',
      name: '',
      englishName: '',
      designation: 'member',
      designationLabel: 'മെമ്പർ (Ward Member)',
      standingCommittee: 'development',
      phone: '',
      bankDetails: {
        accountNo: '',
        ifsc: 'SBIN0070554',
        bankName: 'State Bank of India',
        branch: 'Puduppady'
      }
    });
  };

  // Submit Edit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingMember || !editingMember.name.trim()) return;

    const normalizedEdit = {
      ...editingMember,
      wardNo: Number(editingMember.wardNo) || 1,
      name: editingMember.name.trim(),
      englishName: (editingMember.englishName || '').trim() || editingMember.name.trim(),
      wardName: (editingMember.wardName || '').trim() || `വാർഡ് ${editingMember.wardNo}`,
      standingCommittee: editingMember.designation === 'president' ? null : editingMember.standingCommittee,
      phone: (editingMember.phone || '').trim() || '9447000000',
      bankDetails: {
        accountNo: (editingMember.bankDetails?.accountNo || '').trim() || '00000000000',
        ifsc: (editingMember.bankDetails?.ifsc || '').trim() || 'SBIN0070554',
        bankName: (editingMember.bankDetails?.bankName || '').trim() || 'State Bank of India',
        branch: (editingMember.bankDetails?.branch || '').trim() || 'Puduppady'
      }
    };

    onUpdateMember(normalizedEdit);
    setEditingMember(null);
  };

  // Filter members safely
  const filteredMembers = useMemo(() => {
    return (members || []).filter(m => {
      if (!m) return false;
      const q = (searchQuery || '').toLowerCase().trim();
      if (!q) {
        if (filterCommittee === 'ALL') return true;
        if (m.designation === 'president') return true;
        return m.standingCommittee === filterCommittee;
      }

      const matchSearch = 
        (m.name || '').toLowerCase().includes(q) ||
        (m.englishName || '').toLowerCase().includes(q) ||
        String(m.wardNo || '').toLowerCase().includes(q) ||
        (m.wardName || '').toLowerCase().includes(q) ||
        (m.designationLabel || '').toLowerCase().includes(q);

      if (!matchSearch) return false;
      if (filterCommittee === 'ALL') return true;
      if (m.designation === 'president') return true;
      return m.standingCommittee === filterCommittee;
    }).sort((a, b) => (Number(a.wardNo) || 0) - (Number(b.wardNo) || 0));
  }, [members, searchQuery, filterCommittee]);

  // Ensure focusIndex remains valid
  useEffect(() => {
    if (focusIndex >= filteredMembers.length) {
      setFocusIndex(Math.max(0, filteredMembers.length - 1));
    }
  }, [filteredMembers.length, focusIndex]);

  const currentFocusMember = filteredMembers[focusIndex] || null;

  return (
    <div className="space-y-6">
      
      {/* Top Search, Filter, View Options & Add Member Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <span>ഭരണസമിതി അംഗങ്ങളുടെ ഡയറക്ടറി</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200">
                {members.length} അംഗങ്ങൾ
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              അംഗങ്ങളെ ചേർക്കാനും, എഡിറ്റ് ചെയ്യാനും, വിവരങ്ങൾ കാണാനും
            </p>
          </div>
        </div>

        {/* Toolbar: Search, Filter, View Options & Add Member */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Search Box */}
          <div className="relative flex-1 sm:w-52">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            <input
              type="text"
              placeholder="പേര് / വാർഡ് തിരയുക..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Committee Filter */}
          <select
            value={filterCommittee}
            onChange={(e) => setFilterCommittee(e.target.value)}
            className="text-xs rounded-xl border border-slate-300 p-2 bg-white text-slate-700"
          >
            <option value="ALL">എല്ലാ കമ്മിറ്റികളും</option>
            {STANDING_COMMITTEES.map(sc => (
              <option key={sc.id} value={sc.id}>{sc.name}</option>
            ))}
          </select>

          {/* View Option Selector Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-xs">
            {/* Large */}
            <button
              type="button"
              onClick={() => setViewMode('large')}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                viewMode === 'large'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200'
              }`}
              title="Large View: വലിയ പ്രൊഫൈൽ കാർഡുകൾ"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Large</span>
            </button>

            {/* Medium (Default) */}
            <button
              type="button"
              onClick={() => setViewMode('medium')}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                viewMode === 'medium'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200'
              }`}
              title="Medium View: സാധാരണ കാർഡുകൾ"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Medium</span>
            </button>

            {/* Tile */}
            <button
              type="button"
              onClick={() => setViewMode('tile')}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                viewMode === 'tile'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200'
              }`}
              title="Tile View: ഒതുങ്ങിയ ടൈലുകൾ"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tile</span>
            </button>

            {/* Small / List */}
            <button
              type="button"
              onClick={() => setViewMode('small')}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                viewMode === 'small'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200'
              }`}
              title="Small / List View: ടേബിൾ ലിസ്റ്റ്"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden md:inline">List</span>
            </button>

            {/* One by One */}
            <button
              type="button"
              onClick={() => setViewMode('one_by_one')}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                viewMode === 'one_by_one'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200'
              }`}
              title="One by One: ഓരോ അംഗങ്ങളുടെ വിശദമായ പ്രൊഫൈൽ"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Profile</span>
            </button>
          </div>

          {/* Add Member Button */}
          {isAdmin && (
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95 shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ പുതിയ മെമ്പർ</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: LARGE PROFILE CARDS (വലിയ കാർഡുകൾ) */}
      {viewMode === 'large' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMembers.map((member) => {
            const scObj = STANDING_COMMITTEES.find(c => c.id === member.standingCommittee);

            return (
              <div 
                key={member.id} 
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Header: Ward Number Badge, Name & Actions */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-900 text-emerald-100 font-mono font-black text-base flex flex-col items-center justify-center shrink-0 shadow-xs">
                        <span className="text-[9px] uppercase tracking-tighter opacity-80">വാർഡ്</span>
                        <span>{member.wardNo}</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-slate-900 text-base truncate">
                          {member.name}
                        </h4>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {member.englishName || member.name} • {member.wardName || `വാർഡ് ${member.wardNo}`}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    {isAdmin && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setEditingMember(JSON.parse(JSON.stringify(member)))}
                          className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition border border-slate-200"
                          title="Edit Member"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`വാർഡ് ${member.wardNo} - ${member.name} എന്ന മെമ്പറെ ഡിലീറ്റ് ചെയ്യണോ?`)) {
                              onDeleteMember(member.id);
                            }
                          }}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition border border-slate-200"
                          title="Delete Member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Body Details */}
                  <div className="py-4 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-600" />
                        പദവി:
                      </span>
                      <span className="font-bold text-slate-800 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                        {member.designationLabel || 'മെമ്പർ (Ward Member)'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-indigo-600" />
                        സ്ഥിരംസമിതി:
                      </span>
                      <span className="font-semibold text-indigo-800 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                        {member.designation === 'president' ? 'എല്ലാ സ്ഥിരംസമിതികളും (Ex-Officio)' : (scObj ? scObj.name : 'ഭരണ നേതൃത്വം')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-slate-400" />
                        ഫോൺ:
                      </span>
                      <span className="font-mono text-slate-800 font-semibold">{member.phone || '-'}</span>
                    </div>

                    {/* Bank Details Box */}
                    <div className="pt-2">
                      <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 mb-1.5">
                        <Landmark className="w-3.5 h-3.5 text-emerald-600" />
                        ഡയറക്ട് ബാങ്ക് ട്രാൻസ്ഫർ വിവരങ്ങൾ (DBT):
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl font-mono text-xs text-slate-700 space-y-1 border border-slate-200">
                        <div className="font-bold text-slate-900">{member.bankDetails?.bankName || 'State Bank of India'} ({member.bankDetails?.branch || 'Puduppady'})</div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">A/c No:</span>
                          <span className="font-bold text-slate-900">{member.bankDetails?.accountNo || '00000000000'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">IFSC Code:</span>
                          <span className="text-slate-700">{member.bankDetails?.ifsc || 'SBIN0070554'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100 font-mono">
                  <span>വാർഡ് #{member.wardNo}</span>
                  <span>പുതുപ്പാടി ഗ്രാമപഞ്ചായത്ത്</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: MEDIUM CARDS (സാധാരണ കാർഡുകൾ - Default) */}
      {viewMode === 'medium' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const scObj = STANDING_COMMITTEES.find(c => c.id === member.standingCommittee);

            return (
              <div 
                key={member.id} 
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Card Top: Ward No, Name & Action Buttons */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-9 h-9 rounded-xl bg-emerald-900 text-emerald-100 font-mono font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                        {member.wardNo}
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm truncate">
                          {member.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate">
                          {member.englishName || member.name} • {member.wardName || `വാർഡ് ${member.wardNo}`}
                        </p>
                      </div>
                    </div>

                    {/* Edit & Delete Action Buttons (Admin Only) */}
                    {isAdmin && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setEditingMember(JSON.parse(JSON.stringify(member)))}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition"
                          title="Edit Member Details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`വാർഡ് ${member.wardNo} - ${member.name} എന്ന മെമ്പറെ ഡിലീറ്റ് ചെയ്യണോ?`)) {
                              onDeleteMember(member.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Body Details */}
                  <div className="py-3 space-y-2 text-xs">
                    {/* Role */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        പദവി:
                      </span>
                      <span className="font-semibold text-slate-800">
                        {member.designationLabel || 'മെമ്പർ (Ward Member)'}
                      </span>
                    </div>

                    {/* Standing Committee */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-indigo-600" />
                        സ്ഥിരംസമിതി:
                      </span>
                      <span className="font-semibold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200 text-[11px]">
                        {member.designation === 'president' ? 'എല്ലാ സ്ഥിരംസമിതികളും (Ex-Officio)' : (scObj ? scObj.name : 'ഭരണ നേതൃത്വം')}
                      </span>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        ഫോൺ:
                      </span>
                      <span className="font-mono text-slate-700">{member.phone || '-'}</span>
                    </div>

                    {/* Bank Details */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1 mb-1">
                        <Landmark className="w-3 h-3 text-emerald-600" />
                        ബാങ്ക് വിവരങ്ങൾ (DBT):
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl font-mono text-[10px] text-slate-700 space-y-0.5">
                        <div className="font-semibold text-slate-900">{member.bankDetails?.bankName || 'State Bank of India'} ({member.bankDetails?.branch || 'Puduppady'})</div>
                        <div>A/c: {member.bankDetails?.accountNo || '00000000000'}</div>
                        <div className="text-slate-500">IFSC: {member.bankDetails?.ifsc || 'SBIN0070554'}</div>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-100">
                  <span>വാർഡ് #{member.wardNo}</span>
                  <span>Puduppady GP</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: TILE GRID (ഒതുങ്ങിയ ടൈലുകൾ) */}
      {viewMode === 'tile' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredMembers.map((member) => {
            const scObj = STANDING_COMMITTEES.find(c => c.id === member.standingCommittee);

            return (
              <div
                key={member.id}
                className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs hover:shadow-md transition flex flex-col justify-between text-left"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-7 h-7 rounded-xl bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">
                      {member.wardNo}
                    </span>
                    {isAdmin && (
                      <button
                        onClick={() => setEditingMember(JSON.parse(JSON.stringify(member)))}
                        className="text-slate-400 hover:text-emerald-700 p-1 rounded-lg"
                        title="Edit Member"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 truncate">
                    {member.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {member.wardName}
                  </p>
                  <div className="mt-2 text-[9px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-100 truncate">
                    {member.designation === 'president' ? 'Ex-Officio' : (scObj ? scObj.name : 'ഭരണനേതൃത്വം')}
                  </div>
                </div>

                <div className="pt-2 mt-2 border-t border-slate-100 text-[9px] text-slate-400 font-mono truncate">
                  {member.phone || '-'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 4: SMALL / COMPACT LIST (ടേബിൾ ലിസ്റ്റ്) */}
      {viewMode === 'small' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-3 text-center w-12">വാർഡ്</th>
                <th className="p-3 text-left">മെമ്പറുടെ പേര്</th>
                <th className="p-3 text-left hidden sm:table-cell">വാർഡ് പേര്</th>
                <th className="p-3 text-left">പദവി</th>
                <th className="p-3 text-left hidden md:table-cell">സ്ഥിരംസമിതി</th>
                <th className="p-3 text-left hidden lg:table-cell">ഫോൺ</th>
                <th className="p-3 text-left font-mono hidden xl:table-cell">ബാങ്ക് A/c & IFSC</th>
                {isAdmin && <th className="p-3 text-center w-24">പ്രവർത്തനങ്ങൾ</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredMembers.map((member) => {
                const scObj = STANDING_COMMITTEES.find(c => c.id === member.standingCommittee);

                return (
                  <tr key={member.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 text-center font-mono font-bold text-slate-900">
                      {member.wardNo}
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      <div>{member.name}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{member.englishName || ''}</div>
                    </td>
                    <td className="p-3 text-slate-600 hidden sm:table-cell">
                      {member.wardName}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-semibold text-[11px]">
                        {member.designationLabel}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 hidden md:table-cell">
                      {member.designation === 'president' ? 'എല്ലാ സമിതികളും (Ex-Officio)' : (scObj ? scObj.name : 'ഭരണ നേതൃത്വം')}
                    </td>
                    <td className="p-3 font-mono text-slate-600 hidden lg:table-cell">
                      {member.phone || '-'}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-600 hidden xl:table-cell">
                      <div>{member.bankDetails?.accountNo || '-'}</div>
                      <div className="text-[10px] text-slate-400">{member.bankDetails?.ifsc || ''}</div>
                    </td>
                    {isAdmin && (
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setEditingMember(JSON.parse(JSON.stringify(member)))}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition border border-slate-200"
                            title="Edit Member"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`വാർഡ് ${member.wardNo} - ${member.name} എന്ന മെമ്പറെ ഡിലീറ്റ് ചെയ്യണോ?`)) {
                                onDeleteMember(member.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition border border-slate-200"
                            title="Delete Member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 5: ONE BY ONE / PROFILE CAROUSEL (പ്രൊഫൈൽ ഫോക്കസ് മോഡ്) */}
      {viewMode === 'one_by_one' && currentFocusMember && (
        <div className="flex flex-col items-center space-y-6">
          {/* Stepper Header */}
          <div className="w-full max-w-lg flex items-center justify-between text-xs text-slate-600 font-bold">
            <span>പ്രൊഫൈൽ കാർഡ് മോഡ് (Profile View)</span>
            <span className="font-mono bg-slate-100 text-slate-800 px-3 py-1 rounded-full border border-slate-200">
              അംഗം {focusIndex + 1} / {filteredMembers.length}
            </span>
          </div>

          {/* Profile Card */}
          <div className="w-full max-w-lg bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-lg text-center space-y-5">
            {/* Big Ward Avatar */}
            <div className="flex justify-center">
              <span className="w-16 h-16 rounded-3xl bg-slate-900 text-white flex flex-col items-center justify-center font-black font-mono shadow-md">
                <span className="text-[10px] tracking-wider opacity-80 uppercase">വാർഡ്</span>
                <span className="text-xl leading-none">{currentFocusMember.wardNo}</span>
              </span>
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-900">
                {currentFocusMember.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {currentFocusMember.englishName || currentFocusMember.name} • {currentFocusMember.wardName}
              </p>
              <div className="flex items-center justify-center gap-2 mt-2.5 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
                  {currentFocusMember.designationLabel}
                </span>
                <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-900 border border-indigo-200 text-xs font-semibold">
                  {currentFocusMember.designation === 'president' ? 'എല്ലാ സ്ഥിരംസമിതികളും (Ex-Officio)' : (STANDING_COMMITTEES.find(c => c.id === currentFocusMember.standingCommittee)?.name || 'ഭരണ നേതൃത്വം')}
                </span>
              </div>
            </div>

            {/* Profile Contact & Bank Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-sans">ഫോൺ നമ്പർ:</span>
                <span className="font-bold text-slate-900">{currentFocusMember.phone || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">ബാങ്ക് & ശാഖ:</span>
                <span className="font-bold text-slate-900 text-right">{currentFocusMember.bankDetails?.bankName} ({currentFocusMember.bankDetails?.branch})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">അക്കൗണ്ട് നമ്പർ:</span>
                <span className="font-bold text-slate-900">{currentFocusMember.bankDetails?.accountNo || '00000000000'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">IFSC കോഡ്:</span>
                <span className="text-slate-700">{currentFocusMember.bankDetails?.ifsc || 'SBIN0070554'}</span>
              </div>
            </div>

            {/* Admin Edit & Delete Actions in Profile */}
            {isAdmin && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(JSON.parse(JSON.stringify(currentFocusMember)))}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>എഡിറ്റ് ചെയ്യുക (Edit)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`വാർഡ് ${currentFocusMember.wardNo} - ${currentFocusMember.name} എന്ന മെമ്പറെ ഡിലീറ്റ് ചെയ്യണോ?`)) {
                      onDeleteMember(currentFocusMember.id);
                    }
                  }}
                  className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>ഡിലീറ്റ് ചെയ്യുക</span>
                </button>
              </div>
            )}
          </div>

          {/* Stepper Navigation */}
          <div className="w-full max-w-lg flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setFocusIndex(Math.max(0, focusIndex - 1))}
              disabled={focusIndex === 0}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>മുമ്പത്തെ അംഗം</span>
            </button>

            <button
              type="button"
              onClick={() => setFocusIndex(Math.min(filteredMembers.length - 1, focusIndex + 1))}
              disabled={focusIndex === filteredMembers.length - 1}
              className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-xs"
            >
              <span>അടുത്ത അംഗം</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Jump Thumbnail Strip */}
          <div className="w-full max-w-lg pt-4 border-t border-slate-200">
            <div className="text-[11px] text-slate-500 font-bold mb-2 text-left">
              നേരിട്ട് തിരഞ്ഞെടുക്കുക (Quick Jump):
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {filteredMembers.map((mem, idx) => {
                const isSelected = idx === focusIndex;

                return (
                  <button
                    key={mem.id}
                    type="button"
                    onClick={() => setFocusIndex(idx)}
                    className={`w-7 h-7 rounded-lg font-mono font-bold text-[11px] transition ${
                      isSelected
                        ? 'bg-emerald-800 text-white font-black scale-110 shadow-sm ring-2 ring-emerald-500'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                    title={`വാർഡ് ${mem.wardNo} - ${mem.name}`}
                  >
                    {mem.wardNo}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Add New Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            
            <div className="bg-gradient-to-r from-emerald-800 to-slate-900 text-white p-5 px-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-6 h-6 text-emerald-300" />
                <div>
                  <h3 className="font-bold text-base">പുതിയ ഭരണസമിതി അംഗത്തെ ചേർക്കുക</h3>
                  <p className="text-xs text-emerald-200/80">Add New Council Member</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              
              {/* Ward No & Ward Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">വാർഡ് നമ്പർ *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={newMemberForm.wardNo}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, wardNo: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">വാർഡിന്റെ പേര്</label>
                  <input
                    type="text"
                    placeholder="e.g. ഈങ്ങാപ്പുഴ"
                    value={newMemberForm.wardName}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, wardName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Name Malayalam & English */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">മെമ്പറുടെ പേര് (മലയാളത്തിൽ) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. കെ. മൊയ്തീൻ കുട്ടി"
                    value={newMemberForm.name}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">പേര് (English - ബാങ്ക് റെക്കോർഡ്)</label>
                  <input
                    type="text"
                    placeholder="e.g. K Moideen Kutty"
                    value={newMemberForm.englishName}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, englishName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Designation & Committee */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">പദവി (Designation) *</label>
                  <select
                    value={newMemberForm.designation}
                    onChange={(e) => handleDesignationChange(e.target.value, newMemberForm, setNewMemberForm)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                  >
                    <option value="member">മെമ്പർ (Ward Member)</option>
                    <option value="president">പ്രസിഡന്റ് (President)</option>
                    <option value="vice_president">വൈസ് പ്രസിഡന്റ് (Vice President)</option>
                    <option value="sc_chairperson">സ്റ്റാൻഡിംഗ് കമ്മിറ്റി ചെയർപേഴ്സൺ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">സ്ഥിരംസമിതി (Standing Committee)</label>
                  {newMemberForm.designation === 'president' ? (
                    <input
                      type="text"
                      disabled
                      value="എല്ലാ സ്ഥിരംസമിതികളിലും അർഹത (Ex-Officio)"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-medium"
                    />
                  ) : newMemberForm.designation === 'vice_president' ? (
                    <input
                      type="text"
                      disabled
                      value="ധനകാര്യ സ്ഥിരംസമിതി (സ്ഥിരം അധ്യക്ഷൻ)"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-medium"
                    />
                  ) : (
                    <select
                      value={newMemberForm.standingCommittee || ''}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, standingCommittee: e.target.value || null })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                    >
                      {STANDING_COMMITTEES.map(sc => (
                        <option key={sc.id} value={sc.id}>{sc.name} ({sc.englishName})</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">ഫോൺ നമ്പർ</label>
                <input
                  type="tel"
                  placeholder="9447000000"
                  value={newMemberForm.phone}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              {/* Bank Details Section */}
              <div className="pt-2 border-t border-slate-200">
                <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-2">
                  <Landmark className="w-4 h-4 text-emerald-700" />
                  <span>ബാങ്ക് അക്കൗണ്ട് വിവരങ്ങൾ (Direct Benefit Transfer):</span>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5">ബാങ്കിന്റെ പേര്</label>
                    <input
                      type="text"
                      value={newMemberForm.bankDetails.bankName}
                      onChange={(e) => setNewMemberForm({
                        ...newMemberForm,
                        bankDetails: { ...newMemberForm.bankDetails, bankName: e.target.value }
                      })}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5">ശാഖ (Branch)</label>
                    <input
                      type="text"
                      value={newMemberForm.bankDetails.branch}
                      onChange={(e) => setNewMemberForm({
                        ...newMemberForm,
                        bankDetails: { ...newMemberForm.bankDetails, branch: e.target.value }
                      })}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5">അക്കൗണ്ട് നമ്പർ</label>
                    <input
                      type="text"
                      placeholder="00000000000"
                      value={newMemberForm.bankDetails.accountNo}
                      onChange={(e) => setNewMemberForm({
                        ...newMemberForm,
                        bankDetails: { ...newMemberForm.bankDetails, accountNo: e.target.value }
                      })}
                      className="w-full p-2 rounded-lg border border-slate-300 font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5">IFSC കോഡ്</label>
                    <input
                      type="text"
                      placeholder="SBIN0070554"
                      value={newMemberForm.bankDetails.ifsc}
                      onChange={(e) => setNewMemberForm({
                        ...newMemberForm,
                        bankDetails: { ...newMemberForm.bankDetails, ifsc: e.target.value }
                      })}
                      className="w-full p-2 rounded-lg border border-slate-300 font-mono bg-white uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  റദ്ദാക്കുക (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>അംഗത്തെ ചേർക്കുക (Add Member)</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            
            <div className="bg-gradient-to-r from-emerald-800 to-slate-900 text-white p-5 px-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-6 h-6 text-emerald-300" />
                <div>
                  <h3 className="font-bold text-base">മെമ്പർ വിവരങ്ങൾ തിരുത്തുക</h3>
                  <p className="text-xs text-emerald-200/80">Edit Member Details (Ward #{editingMember.wardNo})</p>
                </div>
              </div>
              <button onClick={() => setEditingMember(null)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              
              {/* Ward No & Ward Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">വാർഡ് നമ്പർ *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={editingMember.wardNo}
                    onChange={(e) => setEditingMember({ ...editingMember, wardNo: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">വാർഡിന്റെ പേര്</label>
                  <input
                    type="text"
                    value={editingMember.wardName || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, wardName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Name Malayalam & English */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">മെമ്പറുടെ പേര് (മലയാളത്തിൽ) *</label>
                  <input
                    type="text"
                    required
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">പേര് (English)</label>
                  <input
                    type="text"
                    value={editingMember.englishName || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, englishName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Designation & Committee */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">പദവി (Designation) *</label>
                  <select
                    value={editingMember.designation}
                    onChange={(e) => handleDesignationChange(e.target.value, editingMember, setEditingMember)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                  >
                    <option value="member">മെമ്പർ (Ward Member)</option>
                    <option value="president">പ്രസിഡന്റ് (President)</option>
                    <option value="vice_president">വൈസ് പ്രസിഡന്റ് (Vice President)</option>
                    <option value="sc_chairperson">സ്റ്റാൻഡിംഗ് കമ്മിറ്റി ചെയർപേഴ്സൺ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">സ്ഥിരംസമിതി (Standing Committee)</label>
                  {editingMember.designation === 'president' ? (
                    <input
                      type="text"
                      disabled
                      value="എല്ലാ സ്ഥിരംസമിതികളിലും അർഹത (Ex-Officio)"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-medium"
                    />
                  ) : editingMember.designation === 'vice_president' ? (
                    <input
                      type="text"
                      disabled
                      value="ധനകാര്യ സ്ഥിരംസമിതി (സ്ഥിരം അധ്യക്ഷൻ)"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-medium"
                    />
                  ) : (
                    <select
                      value={editingMember.standingCommittee || ''}
                      onChange={(e) => setEditingMember({ ...editingMember, standingCommittee: e.target.value || null })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                    >
                      {STANDING_COMMITTEES.map(sc => (
                        <option key={sc.id} value={sc.id}>{sc.name} ({sc.englishName})</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">ഫോൺ നമ്പർ</label>
                <input
                  type="tel"
                  value={editingMember.phone || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              {/* Bank Details Section */}
              <div className="pt-2 border-t border-slate-200">
                <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-2">
                  <Landmark className="w-4 h-4 text-emerald-700" />
                  <span>ബാങ്ക് അക്കൗണ്ട് വിവരങ്ങൾ (Direct Benefit Transfer):</span>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5">ബാങ്കിന്റെ പേര്</label>
                    <input
                      type="text"
                      value={editingMember.bankDetails.bankName}
                      onChange={(e) => setEditingMember({
                        ...editingMember,
                        bankDetails: { ...editingMember.bankDetails, bankName: e.target.value }
                      })}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5">ശാഖ (Branch)</label>
                    <input
                      type="text"
                      value={editingMember.bankDetails.branch}
                      onChange={(e) => setEditingMember({
                        ...editingMember,
                        bankDetails: { ...editingMember.bankDetails, branch: e.target.value }
                      })}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5">അക്കൗണ്ട് നമ്പർ</label>
                    <input
                      type="text"
                      value={editingMember.bankDetails.accountNo}
                      onChange={(e) => setEditingMember({
                        ...editingMember,
                        bankDetails: { ...editingMember.bankDetails, accountNo: e.target.value }
                      })}
                      className="w-full p-2 rounded-lg border border-slate-300 font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5">IFSC കോഡ്</label>
                    <input
                      type="text"
                      value={editingMember.bankDetails.ifsc}
                      onChange={(e) => setEditingMember({
                        ...editingMember,
                        bankDetails: { ...editingMember.bankDetails, ifsc: e.target.value }
                      })}
                      className="w-full p-2 rounded-lg border border-slate-300 font-mono bg-white uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  റദ്ദാക്കുക (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>സേവ് ചെയ്യുക (Save Changes)</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
