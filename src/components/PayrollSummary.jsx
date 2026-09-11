import React from 'react';
import { 
  DollarSign, 
  Wallet, 
  Landmark, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  FileCheck,
  Building2,
  CalendarCheck2
} from 'lucide-react';
import { calculateMemberMonthlyFees, formatINR, formatMonthYearMalayalam } from '../utils/calculations';
import { STATUTORY_RATES, STANDING_COMMITTEES } from '../data/initialData';

export default function PayrollSummary({
  members,
  meetings,
  attendance,
  selectedMonth,
  rates = STATUTORY_RATES
}) {
  const monthMeetings = meetings
    .filter(m => m.monthYear === selectedMonth)
    .sort((a, b) => a.date.localeCompare(b.date));

  const memberStats = (members || []).map(m => ({
    member: m,
    ...calculateMemberMonthlyFees(m, monthMeetings, attendance, rates)
  }));

  const totalFixedHonorarium = memberStats.reduce((sum, m) => sum + (m.fixedHonorarium || 0), 0);
  const totalSittingFee = memberStats.reduce((sum, m) => sum + (m.admissibleSittingFee || 0), 0);
  const totalEarnedSittingFee = memberStats.reduce((sum, m) => sum + (m.earnedSittingFee || 0), 0);
  const totalExcessCapped = memberStats.reduce((sum, m) => sum + (m.excessCapped || 0), 0);
  const totalPhoneAllowance = memberStats.reduce((sum, m) => sum + (m.phoneAllowance || 0), 0);
  const grandTotalPayable = memberStats.reduce((sum, m) => sum + (m.netPayable || 0), 0);

  // Group by Bank for disbursement batching
  const bankDisbursement = memberStats.reduce((acc, curr) => {
    const bank = curr.member?.bankDetails?.bankName || 'State Bank of India';
    if (!acc[bank]) {
      acc[bank] = { count: 0, total: 0, members: [] };
    }
    acc[bank].count += 1;
    acc[bank].total += curr.netPayable;
    acc[bank].members.push(curr);
    return acc;
  }, {});

  const totalBanksCount = Object.keys(bankDisbursement).length;

  return (
    <div className="space-y-6">
      
      {/* Month Overview Banner */}
      <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 text-white p-6 rounded-3xl shadow-xl border border-emerald-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              പ്രതിമാസ ബാധ്യതാ സംഗ്രഹം (Monthly Financial Summary)
            </span>
            <h2 className="text-2xl font-black mt-1">
              {formatMonthYearMalayalam(selectedMonth)}
            </h2>
            <p className="text-xs text-emerald-200/80 mt-1">
              പുതുപ്പാടി ഗ്രാമപഞ്ചായത്ത് {members.length} ഭരണസമിതി അംഗങ്ങളുടെ ഓണറേറിയം സ്റ്റേറ്റ്മെന്റ്
            </p>
          </div>

          <div className="bg-emerald-950/80 border border-emerald-500/40 p-4 rounded-2xl">
            <span className="text-xs text-emerald-300 block font-medium">ആകെ വിതരണം ചെയ്യേണ്ട തുക (Total Net Outlay)</span>
            <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
              {formatINR(grandTotalPayable)}
            </div>
            <span className="text-[11px] text-emerald-200/70">
              {members.length} വാർഡ് അംഗങ്ങൾ • {monthMeetings.length} യോഗങ്ങൾ
            </span>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">സ്ഥിര ഓണറേറിയം</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-2">
            {formatINR(totalFixedHonorarium)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            പ്രസിഡന്റ്, വൈസ് പ്രസിഡന്റ്, ചെയർപേഴ്സൺസ് & അംഗങ്ങൾ
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">സിറ്റിംഗ് ഫീസ് (അനുവദിച്ചത്)</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-2">
            {formatINR(totalSittingFee)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>ആകെ യോഗങ്ങൾ: {monthMeetings.length}</span>
            {totalExcessCapped > 0 && (
              <span className="text-amber-600 font-medium">₹{totalExcessCapped} സീലിംഗ് പരിധി</span>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ടെലിഫോൺ അലവൻസ്</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-purple-800 mt-2">
            {formatINR(totalPhoneAllowance)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {members.length} അംഗങ്ങൾക്കുള്ള ഔദ്യോഗിക ഫോൺ ചിലവ്
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ബാങ്ക് അക്കൗണ്ടുകൾ</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 mt-2">
            {totalBanksCount} ബാങ്കുകൾ
          </div>
          <p className="text-xs text-slate-500 mt-1">
            SBI, Kerala Gramin Bank, Canara Bank
          </p>
        </div>

      </div>

      {/* Bank Disbursement Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
          <Building2 className="w-4 h-4 text-emerald-600" />
          <span>ബാങ്ക് തിരിച്ചുള്ള തുക കൈമാറ്റ ഷെഡ്യൂൾ (Bank-Wise Electronic Transfer Schedule)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(bankDisbursement).map(([bankName, info]) => (
            <div key={bankName} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-sm">{bankName}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
                  {info.count} അംഗങ്ങൾ
                </span>
              </div>
              <div className="text-lg font-bold font-mono text-emerald-800 mt-2">
                {formatINR(info.total)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                ഡയറക്ട് NEFT / ട്രഷറി ബാങ്ക് ക്രഡിറ്റ് ലിസ്റ്റ്
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
