import React, { useRef } from 'react';
import { 
  Printer, 
  Download, 
  FileText, 
  ShieldCheck, 
  CalendarCheck, 
  Building,
  CheckCircle2
} from 'lucide-react';
import { STANDING_COMMITTEES, STATUTORY_RATES } from '../data/initialData';
import { calculateMemberMonthlyFees, formatINR, formatMonthYearMalayalam, isMemberEligibleForMeeting } from '../utils/calculations';
import logoImg from '../assets/logo.png';

export default function AcquittanceRoll({
  members,
  meetings,
  attendance,
  selectedMonth,
  rates = STATUTORY_RATES
}) {
  const monthMeetings = meetings
    .filter(m => m.monthYear === selectedMonth)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Calculate grand totals across all 24 members
  const memberRows = members.map((member, idx) => {
    const stats = calculateMemberMonthlyFees(member, monthMeetings, attendance, rates);
    const scObj = STANDING_COMMITTEES.find(c => c.id === member.standingCommittee);
    return {
      slNo: idx + 1,
      member,
      scObj,
      ...stats
    };
  });

  const grandTotalHonorarium = memberRows.reduce((sum, r) => sum + r.fixedHonorarium, 0);
  const grandTotalSittingFee = memberRows.reduce((sum, r) => sum + r.admissibleSittingFee, 0);
  const grandTotalPhone = memberRows.reduce((sum, r) => sum + r.phoneAllowance, 0);
  const grandTotalNet = memberRows.reduce((sum, r) => sum + r.netPayable, 0);

  // CSV Export handler
  const handleExportCSV = () => {
    const headers = [
      'Sl No',
      'Ward No',
      'Ward Name',
      'Member Name',
      'Designation',
      'Standing Committee',
      'Board Mtgs Attended',
      'SC Mtgs Attended',
      'Total Attended',
      'Fixed Honorarium (Rs)',
      'Admissible Sitting Fee (Rs)',
      'Phone Allowance (Rs)',
      'Net Payable (Rs)',
      'Bank Account Number',
      'IFSC Code',
      'Bank & Branch'
    ];

    const rows = memberRows.map(r => [
      r.slNo,
      r.member.wardNo,
      `"${r.member.wardName}"`,
      `"${r.member.name} (${r.member.englishName})"`,
      `"${r.member.designationLabel}"`,
      `"${r.scObj ? r.scObj.name : 'None'}"`,
      r.boardAttended,
      r.scAttended,
      r.totalAttended,
      r.fixedHonorarium,
      r.admissibleSittingFee,
      r.phoneAllowance,
      r.netPayable,
      `"${r.member.bankDetails.accountNo}"`,
      r.member.bankDetails.ifsc,
      `"${r.member.bankDetails.bankName} - ${r.member.bankDetails.branch}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Puduppady_Panchayat_Acquittance_Roll_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Action Header in Browser view */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              പ്രതിമാസ അക്വിറ്റൻസ് റോൾ & ഓഡിറ്റ് ട്രയൽ (Monthly Acquittance Roll)
            </h2>
            <p className="text-xs text-slate-500">
              കേരള പഞ്ചായത്ത് രാജ് ചട്ടങ്ങൾ അനുസരിച്ചുള്ള ഔദ്യോഗിക ഫോർമാറ്റ് ({formatMonthYearMalayalam(selectedMonth)})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>എക്സൽ / CSV ഡൗൺലോഡ്</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-md transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>അക്വിറ്റൻസ് റോൾ പ്രിന്റ് ചെയ്യുക (Print Roll)</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200 print:shadow-none print:border-none print:p-0">
        
        {/* Government Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900 mb-4 gap-4">
          <div className="w-16 h-16 rounded-xl bg-white p-1 border border-slate-300 flex items-center justify-center shrink-0 shadow-xs">
            <img 
              src={logoImg} 
              alt="Kerala Panchayat Emblem" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div className="text-center flex-1">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-600">
              ഗവൺമെന്റ് ഓഫ് കേരള • തദ്ദേശ സ്വയംഭരണ വകുപ്പ് (LSGD KERALA)
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 mt-0.5">
              പുതുപ്പാടി ഗ്രാമപഞ്ചായത്ത് കാര്യാലയം (PUDUPPADY GRAMA PANCHAYAT)
            </h1>
            <p className="text-xs text-slate-700 font-medium">
              പുതുപ്പാടി പി.ഒ., കോഴിക്കോട് - 673586
            </p>
            <div className="mt-2 inline-block px-4 py-1 rounded-md bg-slate-100 border border-slate-300 text-xs font-bold text-slate-900">
              ഭരണസമിതി അംഗങ്ങളുടെ പ്രതിമാസ ഓണറേറിയം & സിറ്റിംഗ് ഫീസ് അക്വിറ്റൻസ് റോൾ
              <br />
              <span className="font-mono text-emerald-800">
                ACQUITTANCE ROLL FOR THE MONTH OF {formatMonthYearMalayalam(selectedMonth).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="w-16 shrink-0 hidden sm:block"></div>
        </div>

        {/* Meta summary row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200 mb-4 print:bg-transparent print:border-slate-400">
          <div>
            <span className="text-slate-500 font-semibold block">ആകെ വാർഡുകൾ / മെമ്പർമാർ:</span>
            <span className="font-bold text-slate-800">{members.length} വാർഡുകൾ ({members.length} Members)</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">നടന്ന യോഗങ്ങൾ (Meetings):</span>
            <span className="font-bold text-slate-800">{monthMeetings.length} യോഗങ്ങൾ</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">ആകെ അനുവദിച്ച തുക (Total Outlay):</span>
            <span className="font-bold text-emerald-800 font-mono text-xs">{formatINR(grandTotalNet)}</span>
          </div>
        </div>

        {/* Acquittance Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px] print:text-[8pt] print-table">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-y-2 border-slate-900 font-bold">
                <th className="p-2 text-center w-8 border border-slate-300">ക്രം.</th>
                <th className="p-2 w-10 text-center border border-slate-300">വാർഡ്</th>
                <th className="p-2 border border-slate-300">അംഗത്തിന്റെ പേര് & പദവി (Member Name & Designation)</th>
                <th className="p-2 border border-slate-300">സ്ഥിരംസമിതി (SC)</th>
                <th className="p-2 text-right border border-slate-300">ഓണറേറിയം (Honorarium)</th>
                <th className="p-2 text-center border border-slate-300">ഹാജർ (Mtg Attended)</th>
                <th className="p-2 text-right border border-slate-300">സിറ്റിംഗ് ഫീസ് (Sitting Fee)</th>
                <th className="p-2 text-right border border-slate-300">ഫോൺ അലവൻസ് (Phone)</th>
                <th className="p-2 text-right font-bold bg-slate-200/80 border border-slate-300">അർഹമായ തുക (Net Payable)</th>
                <th className="p-2 border border-slate-300">ബാങ്ക് അക്കൗണ്ട് & IFSC</th>
                <th className="p-2 text-center w-28 border border-slate-300">കൈപ്പറ്റിയ ഒപ്പ് (Signature)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {memberRows.map((r) => (
                <tr key={r.member.id} className="hover:bg-slate-50 print:hover:bg-transparent">
                  <td className="p-1.5 text-center font-mono border border-slate-300">{r.slNo}</td>
                  <td className="p-1.5 text-center font-mono font-bold border border-slate-300">{r.member.wardNo}</td>
                  <td className="p-1.5 border border-slate-300">
                    <div className="font-bold text-slate-900">{r.member.name}</div>
                    <div className="text-[10px] text-slate-600 print:text-[7pt]">{r.member.designationLabel}</div>
                  </td>
                  <td className="p-1.5 border border-slate-300 text-[10px] print:text-[7pt]">
                    {r.scObj ? r.scObj.name : 'ബാധകമല്ല'}
                  </td>
                  <td className="p-1.5 text-right font-mono border border-slate-300">₹{r.fixedHonorarium.toLocaleString('en-IN')}</td>
                  <td className="p-1.5 text-center font-mono border border-slate-300">
                    <span title={`Board: ${r.boardAttended}, SC: ${r.scAttended}`}>
                      {r.totalAttended} യോഗം
                    </span>
                  </td>
                  <td className="p-1.5 text-right font-mono border border-slate-300">₹{r.admissibleSittingFee.toLocaleString('en-IN')}</td>
                  <td className="p-1.5 text-right font-mono border border-slate-300">₹{r.phoneAllowance.toLocaleString('en-IN')}</td>
                  <td className="p-1.5 text-right font-mono font-bold bg-slate-50 border border-slate-300 text-slate-950">
                    ₹{r.netPayable.toLocaleString('en-IN')}
                  </td>
                  <td className="p-1.5 border border-slate-300 font-mono text-[9px] print:text-[7pt]">
                    <div>{r.member.bankDetails.bankName}</div>
                    <div>A/c: {r.member.bankDetails.accountNo}</div>
                    <div className="text-slate-500">IFSC: {r.member.bankDetails.ifsc}</div>
                  </td>
                  <td className="p-1.5 text-center border border-slate-300 text-slate-300 print:text-slate-800">
                    {/* Placeholder for physical signature / NEFT transfer reference */}
                    <div className="h-6 flex items-end justify-center border-b border-dashed border-slate-300 print:border-slate-500">
                      <span className="text-[8px] text-slate-400 print:hidden">ബാങ്ക് ട്രാൻസ്ഫർ / ഒപ്പ്</span>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Grand Total Row */}
              <tr className="bg-slate-200 font-bold border-t-2 border-b-2 border-slate-900 text-slate-950">
                <td colSpan={4} className="p-2 text-right border border-slate-400 uppercase">
                  ആകെ തുക (GRAND TOTAL):
                </td>
                <td className="p-2 text-right font-mono border border-slate-400">
                  ₹{grandTotalHonorarium.toLocaleString('en-IN')}
                </td>
                <td className="p-2 text-center font-mono border border-slate-400">
                  -
                </td>
                <td className="p-2 text-right font-mono border border-slate-400">
                  ₹{grandTotalSittingFee.toLocaleString('en-IN')}
                </td>
                <td className="p-2 text-right font-mono border border-slate-400">
                  ₹{grandTotalPhone.toLocaleString('en-IN')}
                </td>
                <td className="p-2 text-right font-mono font-black text-xs border border-slate-400 text-emerald-950">
                  {formatINR(grandTotalNet)}
                </td>
                <td colSpan={2} className="p-2 text-xs border border-slate-400 font-normal">
                  24 വാർഡ് മെമ്പർമാർക്ക് ബാങ്ക് വഴി വിതരണം ചെയ്യേണ്ടത്
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Date-Wise Attendance Audit Appendix */}
        <div className="mt-8 pt-6 border-t-2 border-slate-400 print-page-break">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-emerald-700" />
              <span>അനുബന്ധം: തീയതി തിരിച്ചുള്ള ഹാജർ ഓഡിറ്റ് ട്രയൽ (Date-Wise Attendance Audit Appendix)</span>
            </h3>
            <span className="text-[10px] text-slate-500">
              റെക്കോർഡുകൾ പഞ്ചായത്ത് രജിസ്റ്റർ പ്രകാരം സാക്ഷ്യപ്പെടുത്തിയത്
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[10px] print:text-[7.5pt] print-table">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border border-slate-400">
                  <th className="p-1.5 border border-slate-300 w-12 text-center">വാർഡ്</th>
                  <th className="p-1.5 border border-slate-300">മെമ്പറുടെ പേര് (Member Name)</th>
                  <th className="p-1.5 border border-slate-300">സ്ഥിരംസമിതി (SC)</th>
                  {monthMeetings.map((mtg, idx) => (
                    <th key={mtg.id} className="p-1.5 border border-slate-300 text-center">
                      <div>{mtg.formattedDate}</div>
                      <div className="text-[8px] font-normal text-slate-600">
                        {mtg.type === 'Board Meeting' ? 'ബോർഡ്' : `SC (${mtg.committee})`}
                      </div>
                    </th>
                  ))}
                  <th className="p-1.5 border border-slate-300 text-center font-bold">ആകെ ഹാജർ</th>
                </tr>
              </thead>
              <tbody>
                {memberRows.map((r) => (
                  <tr key={r.member.id} className="hover:bg-slate-50">
                    <td className="p-1 text-center font-mono font-bold border border-slate-300">{r.member.wardNo}</td>
                    <td className="p-1 font-medium border border-slate-300">{r.member.name} ({r.member.englishName})</td>
                    <td className="p-1 border border-slate-300">{r.scObj ? r.scObj.name : 'ഭരണനേതൃത്വം'}</td>
                    {monthMeetings.map((mtg) => {
                      const isEligible = isMemberEligibleForMeeting(r.member, mtg);
                      const isPresent = Boolean(attendance[mtg.id]?.[r.member.id]);

                      return (
                        <td key={mtg.id} className="p-1 text-center font-mono border border-slate-300">
                          {!isEligible ? (
                            <span className="text-slate-300">-</span>
                          ) : isPresent ? (
                            <span className="font-bold text-emerald-700">P (ഹാജർ)</span>
                          ) : (
                            <span className="font-bold text-rose-600">A (ലീവ്)</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="p-1 text-center font-bold font-mono border border-slate-300 bg-slate-50">
                      {r.totalAttended} / {r.totalBoardEligible + r.totalScEligible}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Verification Certificate & Official Signatures */}
        <div className="mt-10 pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs text-slate-800">
          <div className="space-y-12">
            <p className="leading-relaxed">
              <strong>സാക്ഷ്യപത്രം:</strong> മുകളിൽ ചേർത്ത 24 അംഗങ്ങൾ {formatMonthYearMalayalam(selectedMonth)} മാസത്തിൽ പങ്കെടുത്ത പഞ്ചായത്ത് ഭരണസമിതി / സ്റ്റാൻഡിംഗ് കമ്മിറ്റി യോഗങ്ങളുടെ ഹാജർ പുസ്തകവും മിനിറ്റ്സും പരിശോധിച്ച് തുക ശരിയാണെന്ന് സാക്ഷ്യപ്പെടുത്തുന്നു.
            </p>
            <div className="pt-8">
              <div className="font-bold text-slate-900">ജൂനിയർ സൂപ്രണ്ട് / ഹെഡ് ക്ലർക്ക് (Establishment)</div>
              <div className="text-[11px] text-slate-600">പുതുപ്പാടി ഗ്രാമപഞ്ചായത്ത്</div>
            </div>
          </div>

          <div className="space-y-12 text-right">
            <p className="text-slate-600">
              തുക അംഗങ്ങളുടെ ബന്ധപ്പെട്ട ബാങ്ക് അക്കൗണ്ടുകളിലേക്ക് ട്രഷറി / ബാങ്ക് മുഖേന നേരിട്ട് ക്രെഡിറ്റ് ചെയ്യുന്നതിന് അംഗീകരിക്കുന്നു.
            </p>
            <div className="pt-8 flex justify-end gap-12">
              <div className="text-center">
                <div className="font-bold text-slate-900">പഞ്ചായത്ത് സെക്രട്ടറി (Secretary)</div>
                <div className="text-[11px] text-slate-600">പുതുപ്പാടി ഗ്രാമപഞ്ചായത്ത്</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-slate-900">പഞ്ചായത്ത് പ്രസിഡന്റ് (President)</div>
                <div className="text-[11px] text-slate-600">പുതുപ്പാടി ഗ്രാമപഞ്ചായത്ത്</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
