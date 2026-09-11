import React, { useState } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { STANDING_COMMITTEES } from '../data/initialData';

export default function MemberManagement({ members, onAddMember, onUpdateMember, onDeleteMember }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCommittee, setFilterCommittee] = useState('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  // Form state for adding new member
  const [newMemberForm, setNewMemberForm] = useState({
    wardNo: members.length + 1,
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

  // Designation change helper for Add
  const handleDesignationChange = (desig, formState, setFormState) => {
    let label = 'മെമ്പർ (Ward Member)';
    let comm = formState.standingCommittee;

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
    if (!newMemberForm.name.trim()) return;

    const newId = `M${String(newMemberForm.wardNo).padStart(2, '0')}_${Date.now().toString().slice(-4)}`;
    
    const memberToAdd = {
      id: newId,
      wardNo: Number(newMemberForm.wardNo),
      wardName: newMemberForm.wardName.trim() || `വാർഡ് ${newMemberForm.wardNo}`,
      name: newMemberForm.name.trim(),
      englishName: newMemberForm.englishName.trim() || newMemberForm.name.trim(),
      designation: newMemberForm.designation,
      designationLabel: newMemberForm.designationLabel,
      standingCommittee: newMemberForm.standingCommittee,
      phone: newMemberForm.phone.trim() || '9447000000',
      bankDetails: {
        accountNo: newMemberForm.bankDetails.accountNo.trim() || '00000000000',
        ifsc: newMemberForm.bankDetails.ifsc.trim() || 'SBIN0070554',
        bankName: newMemberForm.bankDetails.bankName.trim() || 'State Bank of India',
        branch: newMemberForm.bankDetails.branch.trim() || 'Puduppady'
      }
    };

    onAddMember(memberToAdd);
    setIsAddModalOpen(false);
    // Reset form
    setNewMemberForm({
      wardNo: members.length + 2,
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
    if (!editingMember) return;
    onUpdateMember(editingMember);
    setEditingMember(null);
  };

  // Filter members
  const filteredMembers = members.filter(m => {
    const q = searchQuery.toLowerCase();
    const matchSearch = 
      m.name.toLowerCase().includes(q) ||
      m.englishName.toLowerCase().includes(q) ||
      m.wardNo.toString().includes(q) ||
      m.wardName.toLowerCase().includes(q) ||
      m.designationLabel.toLowerCase().includes(q);

    if (!matchSearch) return false;
    if (filterCommittee === 'ALL') return true;
    return m.standingCommittee === filterCommittee;
  }).sort((a, b) => a.wardNo - b.wardNo);

  return (
    <div className="space-y-6">
      
      {/* Search, Filter & Add Member Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <span>ഭരണസമിതി അംഗങ്ങളുടെ ഡയറക്ടറി</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200">
                {members.length} അംഗങ്ങൾ
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              അംഗങ്ങളെ ചേർക്കാനും, എഡിറ്റ് ചെയ്യാനും, ഒഴിവാക്കാനും
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            <input
              type="text"
              placeholder="പേര് / വാർഡ് തിരയുക..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

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

          {/* Add Member Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ പുതിയ മെമ്പറെ ചേർക്കുക</span>
          </button>
        </div>
      </div>

      {/* Grid of Members with Edit & Delete */}
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
                        {member.englishName} • {member.wardName}
                      </p>
                    </div>
                  </div>

                  {/* Edit & Delete Action Buttons */}
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
                      {member.designationLabel}
                    </span>
                  </div>

                  {/* Standing Committee */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      സ്ഥിരംസമിതി:
                    </span>
                    <span className="font-semibold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200 text-[11px]">
                      {scObj ? scObj.name : 'ഭരണ നേതൃത്വം'}
                    </span>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      ഫോൺ:
                    </span>
                    <span className="font-mono text-slate-700">{member.phone}</span>
                  </div>

                  {/* Bank Details */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1 mb-1">
                      <Landmark className="w-3 h-3 text-emerald-600" />
                      ബാങ്ക് വിവരങ്ങൾ (DBT):
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl font-mono text-[10px] text-slate-700 space-y-0.5">
                      <div className="font-semibold text-slate-900">{member.bankDetails.bankName} ({member.bankDetails.branch})</div>
                      <div>A/c: {member.bankDetails.accountNo}</div>
                      <div className="text-slate-500">IFSC: {member.bankDetails.ifsc}</div>
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
                  <label className="block font-bold text-slate-700 mb-1">മെമ്പറുടെ പേര് (മലയാളം) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. സുബൈദ വി.എം."
                    value={newMemberForm.name}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">പേര് (English)</label>
                  <input
                    type="text"
                    placeholder="e.g. Subeida V.M."
                    value={newMemberForm.englishName}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, englishName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Designation & Committee */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">പദവി (Designation)</label>
                  <select
                    value={newMemberForm.designation}
                    onChange={(e) => handleDesignationChange(e.target.value, newMemberForm, setNewMemberForm)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="president">പ്രസിഡന്റ് (President)</option>
                    <option value="vice_president">വൈസ് പ്രസിഡന്റ് (Vice President)</option>
                    <option value="sc_chairperson">സ്റ്റാൻഡിംഗ് കമ്മിറ്റി ചെയർപേഴ്സൺ</option>
                    <option value="member">വാർഡ് മെമ്പർ (Ward Member)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">സ്ഥിരംസമിതി (Committee)</label>
                  <select
                    value={newMemberForm.standingCommittee || ''}
                    disabled={newMemberForm.designation === 'president'}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, standingCommittee: e.target.value || null })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white disabled:bg-slate-100"
                  >
                    <option value="">കമ്മിറ്റിയില്ല (Ex-officio / None)</option>
                    {STANDING_COMMITTEES.map(sc => (
                      <option key={sc.id} value={sc.id}>{sc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">ഫോൺ നമ്പർ</label>
                <input
                  type="text"
                  placeholder="9447000000"
                  value={newMemberForm.phone}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              {/* Bank Details */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ബാങ്ക് വിവരങ്ങൾ (Direct Benefit Transfer):</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5">ബാങ്കിന്റെ പേര്</label>
                    <input
                      type="text"
                      placeholder="State Bank of India"
                      value={newMemberForm.bankDetails.bankName}
                      onChange={(e) => setNewMemberForm({
                        ...newMemberForm,
                        bankDetails: { ...newMemberForm.bankDetails, bankName: e.target.value }
                      })}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5">ബ്രാഞ്ച്</label>
                    <input
                      type="text"
                      placeholder="Puduppady"
                      value={newMemberForm.bankDetails.branch}
                      onChange={(e) => setNewMemberForm({
                        ...newMemberForm,
                        bankDetails: { ...newMemberForm.bankDetails, branch: e.target.value }
                      })}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5">അക്കൗണ്ട് നമ്പർ</label>
                    <input
                      type="text"
                      placeholder="Account Number"
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
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>ലിസ്റ്റിൽ ചേർക്കുക (Save Member)</span>
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
            
            <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white p-5 px-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-base">മെമ്പറുടെ വിവരങ്ങൾ തിരുത്തുക (Edit Member)</h3>
                  <p className="text-xs text-slate-300">Ward #{editingMember.wardNo} • {editingMember.name}</p>
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
                  <label className="block font-bold text-slate-700 mb-1">വാർഡ് നമ്പർ</label>
                  <input
                    type="number"
                    value={editingMember.wardNo}
                    onChange={(e) => setEditingMember({ ...editingMember, wardNo: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">വാർഡിന്റെ പേര്</label>
                  <input
                    type="text"
                    value={editingMember.wardName}
                    onChange={(e) => setEditingMember({ ...editingMember, wardName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Name Malayalam & English */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">മെമ്പറുടെ പേര് (മലയാളം) *</label>
                  <input
                    type="text"
                    required
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">പേര് (English)</label>
                  <input
                    type="text"
                    value={editingMember.englishName}
                    onChange={(e) => setEditingMember({ ...editingMember, englishName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Designation & Committee */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">പദവി (Designation)</label>
                  <select
                    value={editingMember.designation}
                    onChange={(e) => handleDesignationChange(e.target.value, editingMember, setEditingMember)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="president">പ്രസിഡന്റ് (President)</option>
                    <option value="vice_president">വൈസ് പ്രസിഡന്റ് (Vice President)</option>
                    <option value="sc_chairperson">സ്റ്റാൻഡിംഗ് കമ്മിറ്റി ചെയർപേഴ്സൺ</option>
                    <option value="member">വാർഡ് മെമ്പർ (Ward Member)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">സ്ഥിരംസമിതി (Committee)</label>
                  <select
                    value={editingMember.standingCommittee || ''}
                    disabled={editingMember.designation === 'president'}
                    onChange={(e) => setEditingMember({ ...editingMember, standingCommittee: e.target.value || null })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white disabled:bg-slate-100"
                  >
                    <option value="">കമ്മിറ്റിയില്ല (None / Ex-officio)</option>
                    {STANDING_COMMITTEES.map(sc => (
                      <option key={sc.id} value={sc.id}>{sc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">ഫോൺ നമ്പർ</label>
                <input
                  type="text"
                  value={editingMember.phone}
                  onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              {/* Bank Details */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ബാങ്ക് വിവരങ്ങൾ (Direct Benefit Transfer):</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
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
                    <label className="block text-[10px] text-slate-600 mb-0.5">ബ്രാഞ്ച്</label>
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
                </div>

                <div className="grid grid-cols-2 gap-2">
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
