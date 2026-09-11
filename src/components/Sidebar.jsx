import React from 'react';
import { 
  Building2, 
  CheckSquare, 
  FileSpreadsheet, 
  FileText,
  DollarSign, 
  Users, 
  Printer, 
  SlidersHorizontal, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Database,
  RefreshCw,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { formatMonthYearMalayalam, formatINR } from '../utils/calculations';

export default function Sidebar({
  activeTab,
  setActiveTab,
  selectedMonth,
  setSelectedMonth,
  onOpenSettings,
  onOpenSheetSync,
  sheetUrl,
  isSyncing,
  syncStatus,
  lastSyncTime,
  autoSyncEnabled,
  onToggleAutoSync,
  totalNetPayable,
  totalMeetingsCount,
  onResetData
}) {
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${y}-${m}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month, 1);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${y}-${m}`);
  };

  const menuItems = [
    {
      id: 'entry',
      title: '1. ഹാജർ രേഖപ്പെടുത്തുക',
      subtitle: 'Attendance Entry',
      icon: CheckSquare,
      badge: `${totalMeetingsCount} യോഗം`
    },
    {
      id: 'acquittance',
      title: '2. അക്വിറ്റൻസ് റോൾ',
      subtitle: 'Acquittance Roll (Print)',
      icon: FileSpreadsheet
    },
    {
      id: 'reports',
      title: '3. റിപ്പോർട്ടുകൾ',
      subtitle: 'Official Reports & Audit',
      icon: FileText
    },
    {
      id: 'payroll',
      title: '4. സാമ്പത്തിക സംഗ്രഹം',
      subtitle: 'Financial Summary',
      icon: DollarSign
    },
    {
      id: 'members',
      title: '5. മെമ്പർമാർ (24 വാർഡുകൾ)',
      subtitle: 'Council Directory',
      icon: Users
    }
  ];

  return (
    <aside className="w-80 min-w-[280px] bg-slate-900 text-white flex flex-col shrink-0 border-r border-slate-800 h-screen sticky top-0 no-print">
      
      {/* Brand & Panchayat Header */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-white p-1 shadow-md border border-slate-700/50 flex items-center justify-center shrink-0">
            <img 
              src="/logo.png" 
              alt="Puduppady Grama Panchayat Emblem" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm sm:text-base font-black tracking-tight text-white leading-tight whitespace-normal break-words">
              പുതുപ്പാടി ഗ്രാമപഞ്ചായത്ത്
            </h1>
            <p className="text-[11px] text-emerald-400 font-bold mt-0.5">
              24 വാർഡുകൾ • ഓണറേറിയം
            </p>
          </div>
        </div>

        {/* Month Switcher inside Sidebar */}
        <div className="mt-4 bg-slate-800/90 rounded-2xl p-2 border border-slate-700/80">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-1 mb-1">
            മാസം തിരഞ്ഞെടുക്കുക (Month):
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevMonth}
              title="മുമ്പത്തെ മാസം"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-center px-1">
              <span className="block text-xs font-black text-emerald-300">
                {formatMonthYearMalayalam(selectedMonth)}
              </span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => e.target.value && setSelectedMonth(e.target.value)}
                className="bg-transparent text-[10px] text-slate-400 cursor-pointer focus:outline-none text-center"
              />
            </div>

            <button
              onClick={handleNextMonth}
              title="അടുത്ത മാസം"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Left Vertical Menu Items */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-3 py-1">
          പ്രധാന മെനു (Main Menu)
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left p-3 rounded-2xl transition flex items-center justify-between gap-3 ${
                isActive
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 rounded-xl shrink-0 ${
                  isActive ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">
                    {item.title}
                  </div>
                  <div className={`text-[10px] truncate ${isActive ? 'text-emerald-100' : 'text-slate-500'}`}>
                    {item.subtitle}
                  </div>
                </div>
              </div>

              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold shrink-0 ${
                  isActive ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Automatic Google Sheets Sync Status Card */}
      <div className="p-3 mx-3 bg-slate-800/90 rounded-2xl border border-slate-700/80 mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200">ഗൂഗിൾ ഷീറ്റ് DB</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${
              isSyncing 
                ? 'bg-amber-400 animate-spin' 
                : sheetUrl 
                  ? 'bg-emerald-400 animate-pulse' 
                  : 'bg-slate-500'
            }`} />
            <span className="text-[10px] font-bold text-emerald-300">
              {isSyncing ? 'Syncing...' : 'Live'}
            </span>
          </div>
        </div>

        {/* Live Auto Sync Subtitle */}
        <div className="text-[10px] text-slate-300 mt-1 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>ഓട്ടോ-സിങ്ക്: <strong>ഓൺ</strong></span>
          </span>
          <span className="font-mono text-slate-400">{lastSyncTime}</span>
        </div>

        <button
          onClick={onOpenSheetSync}
          className="mt-2 w-full py-1.5 px-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-bold transition flex items-center justify-center gap-1.5"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'സിങ്ക് ചെയ്യുന്നു...' : 'സിങ്ക് ക്രമീകരണങ്ങൾ'}</span>
        </button>
      </div>

      {/* Sidebar Footer with Outlay Card & Settings */}
      <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/60">
        
        {/* Outlay Metric Card */}
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>പ്രതിമാസ ആകെ തുക:</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-black font-mono text-emerald-400 mt-1">
            {formatINR(totalNetPayable)}
          </div>
          <div className="text-[10px] text-slate-400">
            24 വാർഡ് അംഗങ്ങൾ
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setActiveTab('acquittance');
              setTimeout(() => window.print(), 200);
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
            title="Print Acquittance Roll"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>പ്രിന്റ്</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
            title="Statutory Settings"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
            <span>നിരക്കുകൾ</span>
          </button>
        </div>

        <button
          onClick={onResetData}
          className="w-full text-center text-[10px] text-slate-400 hover:text-emerald-400 py-1 flex items-center justify-center gap-1 transition"
        >
          <RotateCcw className="w-3 h-3" />
          <span>ഡെമോ ഡാറ്റ റീസെറ്റ് ചെയ്യുക</span>
        </button>

      </div>

    </aside>
  );
}
