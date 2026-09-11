import React from 'react';
import { 
  Building2, 
  CalendarCheck2, 
  FileSpreadsheet, 
  Users, 
  DollarSign, 
  CheckSquare, 
  Printer, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  TableProperties
} from 'lucide-react';
import { formatMonthYearMalayalam, formatINR } from '../utils/calculations';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  selectedMonth, 
  setSelectedMonth, 
  onOpenSettings,
  totalNetPayable,
  totalMeetingsCount
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

  return (
    <header className="bg-slate-900 text-white shadow-lg border-b border-slate-800 sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 border-b border-slate-800 gap-3">
          
          {/* Logo & Panchayat Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span>പുതുപ്പാടി ഗ്രാമപഞ്ചായത്ത്</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                    24 വാർഡുകൾ
                  </span>
                </h1>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                PUDUPPADY GRAMA PANCHAYAT • അംഗങ്ങളുടെ ഓണറേറിയം & ഹാജർ പോർട്ടൽ
              </p>
            </div>
          </div>

          {/* Month Selector & Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
              <button 
                onClick={handlePrevMonth}
                title="മുമ്പത്തെ മാസം"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="px-3 py-0.5 text-center min-w-[160px]">
                <span className="block text-xs font-bold text-emerald-400">
                  {formatMonthYearMalayalam(selectedMonth)}
                </span>
                <input 
                  type="month" 
                  value={selectedMonth} 
                  onChange={(e) => e.target.value && setSelectedMonth(e.target.value)}
                  className="bg-transparent text-[10px] text-slate-300 cursor-pointer focus:outline-none text-center"
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

            <button
              onClick={() => {
                setActiveTab('acquittance');
                setTimeout(() => window.print(), 200);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
              title="Print Acquittance Roll"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>പ്രിന്റ് (Print Roll)</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Statutory Settings"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Clear 5 Step Tabs */}
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar py-2">
          <nav className="flex space-x-2">
            
            {/* Step 1: Attendance Entry */}
            <button
              onClick={() => setActiveTab('entry')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'entry'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-emerald-300" />
              <span>1. ഹാജർ രേഖപ്പെടുത്തുക (Attendance Entry)</span>
            </button>

            {/* Step 2: Full Matrix Table */}
            <button
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'matrix'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <TableProperties className="w-4 h-4" />
              <span>2. സമ്പൂർണ്ണ മാട്രിക്സ് (Full Matrix Grid)</span>
            </button>

            {/* Step 3: Acquittance Roll */}
            <button
              onClick={() => setActiveTab('acquittance')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'acquittance'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>3. അക്വിറ്റൻസ് റോൾ (Acquittance Roll)</span>
            </button>

            {/* Step 4: Payroll Financial Summary */}
            <button
              onClick={() => setActiveTab('payroll')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'payroll'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>4. സാമ്പത്തിക സംഗ്രഹം (Summary)</span>
            </button>

            {/* Step 5: 24 Ward Members */}
            <button
              onClick={() => setActiveTab('members')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'members'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>5. മെമ്പർമാർ (24 Members)</span>
            </button>
          </nav>

          {/* Quick Pay Metric */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs">
            <span className="text-slate-400">ആകെ തുക:</span>
            <span className="font-bold text-emerald-400 font-mono">
              {formatINR(totalNetPayable)}
            </span>
          </div>
        </div>

      </div>
    </header>
  );
}
