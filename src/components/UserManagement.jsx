import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  UserCheck, 
  Edit3, 
  Trash2, 
  Lock, 
  KeyRound, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  Shield, 
  AlertCircle,
  FileCheck2,
  Building
} from 'lucide-react';

export default function UserManagement({ 
  users, 
  currentUser, 
  onAddUser, 
  onUpdateUser, 
  onDeleteUser 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // New User Form State
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    username: '',
    password: '',
    role: 'clerk', // 'admin' | 'clerk' | 'viewer'
    status: 'active'
  });
  const [formError, setFormError] = useState('');

  // Add User Submit
  const handleAddSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    const cleanUsername = newUserForm.username.trim().toLowerCase();
    const cleanPassword = newUserForm.password.trim();
    const cleanName = newUserForm.name.trim();

    if (!cleanUsername || !cleanPassword || !cleanName) {
      setFormError('എല്ലാ കോളങ്ങളും പൂരിപ്പിക്കുക.');
      return;
    }

    // Check if username already exists
    const exists = (users || []).some(u => u.username.toLowerCase() === cleanUsername);
    if (exists) {
      setFormError('ഈ യൂസർനെയിം ഇതിനകം ഉപയോഗത്തിലുണ്ട്. മറ്റൊന്ന് നൽകുക.');
      return;
    }

    const newUserObj = {
      id: `USR_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: cleanName,
      username: cleanUsername,
      password: cleanPassword,
      role: newUserForm.role,
      status: newUserForm.status,
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddUser(newUserObj);
    setIsAddModalOpen(false);
    setNewUserForm({
      name: '',
      username: '',
      password: '',
      role: 'clerk',
      status: 'active'
    });
  };

  // Edit User Submit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingUser) return;
    
    const cleanName = editingUser.name.trim();
    const cleanPassword = editingUser.password.trim();

    if (!cleanName || !cleanPassword) {
      alert('പേരും പാസ്‌വേഡും രേഖപ്പെടുത്തുക.');
      return;
    }

    onUpdateUser({
      ...editingUser,
      name: cleanName,
      password: cleanPassword
    });
    setEditingUser(null);
  };

  // Filtered users
  const filteredUsers = (users || []).filter(u => {
    if (!u) return false;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = 
      (u.name || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q);

    if (!matchSearch) return false;
    if (filterRole === 'ALL') return true;
    return u.role === filterRole;
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 w-fit">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin (പൂർണ്ണ അനുമതി)</span>
          </span>
        );
      case 'clerk':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1 w-fit">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Clerk (ഹാജർ എൻട്രി)</span>
          </span>
        );
      case 'viewer':
      default:
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1 w-fit">
            <Eye className="w-3.5 h-3.5" />
            <span>Viewer (കാണാൻ മാത്രം)</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 shadow-xl border border-slate-700/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest">
              <Shield className="w-4 h-4" />
              <span>അഡ്മിനിസ്ട്രേഷൻ സെന്റർ (Access Control)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black mt-1">
              ഉപയോക്താക്കളുടെ നിയന്ത്രണം (User Management)
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              ക്ലർക്ക്, വ്യൂവർ, അഡ്മിൻ പ്രിവിലേജുകളുള്ള പുതിയ യൂസർമാരെ ചേർക്കാനും നിയന്ത്രിക്കാനും
            </p>
          </div>

          <button
            onClick={() => {
              setFormError('');
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-xl shadow-lg transition text-xs shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ പുതിയ ഉപയോക്താവിനെ ചേർക്കുക</span>
          </button>
        </div>

        {/* Roles Distribution Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-700/60 text-xs">
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block font-semibold">ആകെ യൂസർമാർ:</span>
            <span className="text-xl font-bold font-mono text-emerald-400 mt-0.5 block">{users.length}</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block font-semibold">അഡ്മിൻമാർ:</span>
            <span className="text-xl font-bold font-mono text-emerald-300 mt-0.5 block">
              {users.filter(u => u.role === 'admin').length}
            </span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block font-semibold">ക്ലർക്കുമാർ:</span>
            <span className="text-xl font-bold font-mono text-blue-400 mt-0.5 block">
              {users.filter(u => u.role === 'clerk').length}
            </span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block font-semibold">വ്യൂവർമാർ:</span>
            <span className="text-xl font-bold font-mono text-slate-300 mt-0.5 block">
              {users.filter(u => u.role === 'viewer').length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Header */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-sm text-slate-900">
            രജിസ്റ്റർ ചെയ്ത ഉപയോക്താക്കൾ ({filteredUsers.length})
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="പേര് / യൂസർനെയിം തിരയുക..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="text-xs rounded-xl border border-slate-300 p-2 bg-white text-slate-700"
          >
            <option value="ALL">എല്ലാ റോളുകളും (All Roles)</option>
            <option value="admin">Admin (അഡ്മിൻ)</option>
            <option value="clerk">Clerk (ക്ലർക്ക്)</option>
            <option value="viewer">Viewer (വ്യൂവർ)</option>
          </select>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => {
          const isSelf = currentUser && currentUser.id === user.id;

          return (
            <div
              key={user.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header: User Info & Actions */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 font-bold text-sm flex items-center justify-center shrink-0 uppercase">
                      {user.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-slate-900 text-sm truncate">
                          {user.name}
                        </h4>
                        {isSelf && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-slate-500 truncate">
                        @{user.username}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEditingUser(JSON.parse(JSON.stringify(user)))}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                      title="Edit User"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      disabled={isSelf || user.username === 'admin'}
                      onClick={() => {
                        if (confirm(`'${user.name}' (@${user.username}) എന്ന ഉപയോക്താവിനെ നീക്കം ചെയ്യണോ?`)) {
                          onDeleteUser(user.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      title={isSelf ? 'Cannot delete your own logged-in account' : 'Delete User'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">റോളും അധികാരവും:</span>
                    {getRoleBadge(user.role)}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">സ്റ്റാറ്റസ്:</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      user.status === 'active' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {user.status === 'active' ? 'Active (സജീവം)' : 'Inactive (നിർജ്ജീവം)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-slate-500">പാസ്‌വേഡ്:</span>
                    <span className="font-mono text-slate-700">••••••••</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 mt-3 text-[10px] text-slate-400 flex items-center justify-between">
                <span>ചേർത്ത തീയതി: {user.createdAt || '-'}</span>
                <span>Puduppady GP</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal 1: Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="bg-gradient-to-r from-emerald-800 to-slate-900 text-white p-5 px-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-6 h-6 text-emerald-300" />
                <div>
                  <h3 className="font-bold text-base">പുതിയ ഉപയോക്താവിനെ ചേർക്കുക</h3>
                  <p className="text-xs text-emerald-200/80">Create New User Account</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="m-4 mb-0 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-xs">
              
              {/* Full Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">പൂർണ്ണമായ പേര് (Full Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. സുരേഷ് കുമാർ (Senior Clerk)"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">യൂസർനെയിം (Username) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. clerk1, audit_officer"
                    value={newUserForm.username}
                    onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">പാസ്‌വേഡ് (Password) *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-mono pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Role & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">റോൾ / പ്രിവിലേജ് (Role) *</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold"
                  >
                    <option value="clerk">Clerk (ഹാജർ & യോഗങ്ങൾ ചേർക്കാം)</option>
                    <option value="viewer">Viewer (റിപ്പോർട്ടുകൾ കാണാൻ മാത്രം)</option>
                    <option value="admin">Admin (പൂർണ്ണ അധികാരം)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">അക്കൗണ്ട് സ്റ്റാറ്റസ്</label>
                  <select
                    value={newUserForm.status}
                    onChange={(e) => setNewUserForm({ ...newUserForm, status: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="active">Active (സജീവം)</option>
                    <option value="inactive">Inactive (നിർജ്ജീവം)</option>
                  </select>
                </div>
              </div>

              {/* Role description hint */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <span className="font-bold block text-slate-800">തിരഞ്ഞെടുത്ത റോളിന്റെ അനുമതികൾ:</span>
                {newUserForm.role === 'admin' && <p>• മുഴുവൻ ഡാറ്റയും എഡിറ്റ് ചെയ്യാം, നിരക്കുകൾ മാറ്റാം, മറ്റ് യൂസർമാരെ ഉണ്ടാക്കാം.</p>}
                {newUserForm.role === 'clerk' && <p>• യോഗങ്ങൾ ചേർക്കാനും ഹാജർ രേഖപ്പെടുത്താനും റോൾ/റിപ്പോർട്ട് പ്രിന്റ് ചെയ്യാനും സാധിക്കും.</p>}
                {newUserForm.role === 'viewer' && <p>• അക്വിറ്റൻസ് റോൾ, റിപ്പോർട്ടുകൾ തുടങ്ങിയവ കാണാനും പ്രിന്റ് ചെയ്യാനും മാത്രം സാധിക്കും (Read-only).</p>}
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  റദ്ദാക്കുക (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>യൂസറെ സേവ് ചെയ്യുക</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white p-5 px-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-base">ഉപയോക്താവിന്റെ വിവരങ്ങൾ തിരുത്തുക</h3>
                  <p className="text-xs text-slate-300">Edit User: @{editingUser.username}</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingUser(null)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">പൂർണ്ണമായ പേര് *</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">യൂസർനെയിം (മാറ്റാൻ കഴിയില്ല)</label>
                  <input
                    type="text"
                    disabled
                    value={editingUser.username}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 font-mono text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">പുതിയ പാസ്‌വേഡ് *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={editingUser.password}
                      onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-mono pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">റോൾ / അധികാരം</label>
                  <select
                    disabled={editingUser.username === 'admin'}
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed font-semibold"
                  >
                    <option value="clerk">Clerk (ഹാജർ & യോഗങ്ങൾ)</option>
                    <option value="viewer">Viewer (കാണാൻ മാത്രം)</option>
                    <option value="admin">Admin (പൂർണ്ണ അധികാരം)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">സ്റ്റാറ്റസ്</label>
                  <select
                    disabled={editingUser.username === 'admin'}
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
                  >
                    <option value="active">Active (സജീവം)</option>
                    <option value="inactive">Inactive (നിർജ്ജീവം)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  റദ്ദാക്കുക (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>മാറ്റങ്ങൾ സേവ് ചെയ്യുക</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
