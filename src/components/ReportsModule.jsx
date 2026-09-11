import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Landmark, 
  Layers, 
  FileCheck,
  Table,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { STANDING_COMMITTEES, STATUTORY_RATES } from '../data/initialData';
import { calculateMemberMonthlyFees, formatINR, formatMonthYearMalayalam, isMemberEligibleForMeeting } from '../utils/calculations';

export default function ReportsModule({
  members,
  meetings,
  attendance,
  selectedMonth,
  rates = STATUTORY_RATES
}) {
  // Report Types:
  // 'DESIGNATION_SUMMARY' | 'AUDIT_ATTENDANCE' | 'BANK_TRANSFER' | 'COMMITTEE_BREAKDOWN'
  const [activeReport, setActiveReport] = useState('DESIGNATION_SUMMARY');
  const [bankFilter, setBankFilter] = useState('ALL');

  // Month meetings
  const monthMeetings = useMemo(() => {
    return meetings
      .filter(m => m.monthYear === selectedMonth)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [meetings, selectedMonth]);

  // Calculations for all members
  const memberData = useMemo(() => {
    return members.map((member, idx) => {
      const stats = calculateMemberMonthlyFees(member, monthMeetings, attendance, rates);
      const scObj = STANDING_COMMITTEES.find(c => c.id === member.standingCommittee);
      return {
        slNo: idx + 1,
        member,
        scObj,
        ...stats
      };
    });
  }, [members, monthMeetings, attendance, rates]);

  // Designation Summary calculations (matching the requested format)
  const designationSummary = useMemo(() => {
    // 1. President
    const presidentList = memberData.filter(d => d.member.designation === 'president');
    const presSitting = presidentList.reduce((sum, d) => sum + d.admissibleSittingFee, 0);
    const presHon = presidentList.reduce((sum, d) => sum + (d.fixedHonorarium + d.phoneAllowance), 0);

    // 2. Vice President
    const vpList = memberData.filter(d => d.member.designation === 'vice_president');
    const vpSitting = vpList.reduce((sum, d) => sum + d.admissibleSittingFee, 0);
    const vpHon = vpList.reduce((sum, d) => sum + (d.fixedHonorarium + d.phoneAllowance), 0);

    // 3. Development SC Chairman
    const devList = memberData.filter(d => d.member.designation === 'sc_chairperson' && d.member.standingCommittee === 'development');
    const devSitting = devList.reduce((sum, d) => sum + d.admissibleSittingFee, 0);
    const devHon = devList.reduce((sum, d) => sum + (d.fixedHonorarium + d.phoneAllowance), 0);

    // 4. Health & Education SC Chairman
    const healthList = memberData.filter(d => d.member.designation === 'sc_chairperson' && d.member.standingCommittee === 'health_education');
    const healthSitting = healthList.reduce((sum, d) => sum + d.admissibleSittingFee, 0);
    const healthHon = healthList.reduce((sum, d) => sum + (d.fixedHonorarium + d.phoneAllowance), 0);

    // 5. Welfare SC Chairman
    const welfareList = memberData.filter(d => d.member.designation === 'sc_chairperson' && d.member.standingCommittee === 'welfare');
    const welfareSitting = welfareList.reduce((sum, d) => sum + d.admissibleSittingFee, 0);
    const welfareHon = welfareList.reduce((sum, d) => sum + (d.fixedHonorarium + d.phoneAllowance), 0);

    // 6. Ward Members (All members with designation === 'member')
    const membersList = memberData.filter(d => d.member.designation === 'member');
    const memSitting = membersList.reduce((sum, d) => sum + d.admissibleSittingFee, 0);
    const memHon = membersList.reduce((sum, d) => sum + (d.fixedHonorarium + d.phoneAllowance), 0);

    const rows = [
      {
        designation: 'President',
        sittingFee: presSitting,
        honorarium: presHon,
        total: presSitting + presHon,
        count: presidentList.length
      },
      {
        designation: 'Vice President',
        sittingFee: vpSitting,
        honorarium: vpHon,
        total: vpSitting + vpHon,
        count: vpList.length
      },
      {
        designation: 'Development SC Chairman',
        sittingFee: devSitting,
        honorarium: devHon,
        total: devSitting + devHon,
        count: devList.length
      },
      {
        designation: 'Health & Education SC Chairman',
        sittingFee: healthSitting,
        honorarium: healthHon,
        total: healthSitting + healthHon,
        count: healthList.length
      },
      {
        designation: 'Welfare SC Chairman',
        sittingFee: welfareSitting,
        honorarium: welfareHon,
        total: welfareSitting + welfareHon,
        count: welfareList.length
      },
      {
        designation: 'Member',
        sittingFee: memSitting,
        honorarium: memHon,
        total: memSitting + memHon,
        count: membersList.length
      }
    ];

    const grandSitting = rows.reduce((sum, r) => sum + r.sittingFee, 0);
    const grandHon = rows.reduce((sum, r) => sum + r.honorarium, 0);
    const grandTotal = grandSitting + grandHon;

    return {
      rows,
      grandSitting,
      grandHon,
      grandTotal
    };
  }, [memberData]);

  // Filtered members for other reports
  const filteredMemberData = useMemo(() => {
    return memberData.filter(d => {
      if (bankFilter !== 'ALL' && d.member.bankDetails.bankName !== bankFilter) {
        return false;
      }
      return true;
    });
  }, [memberData, bankFilter]);

  const totalNet = filteredMemberData.reduce((sum, d) => sum + d.netPayable, 0);
  const totalSitting = filteredMemberData.reduce((sum, d) => sum + d.admissibleSittingFee, 0);

  // CSV Exporter
  const handleExportCSV = () => {
    let headers = [];
    let rows = [];
    let filename = `Puthuppady_Report_${activeReport}_${selectedMonth}.csv`;

    if (activeReport === 'DESIGNATION_SUMMARY') {
      headers = ['Designation', 'Sitting Fee (Rs)', 'Honaraium (Rs)', 'Total Honaraium (Rs)'];
      rows = designationSummary.rows.map(r => [
        `"${r.designation}"`,
        r.sittingFee,
        r.honorarium,
        r.total
      ]);
      rows.push(['Total', designationSummary.grandSitting, designationSummary.grandHon, designationSummary.grandTotal]);
    } else if (activeReport === 'AUDIT_ATTENDANCE') {
      headers = ['Sl No', 'Ward No', 'Ward Name', 'Member Name', 'Designation', 'Committee', ...monthMeetings.map(m => `"${m.formattedDate} (${m.type})"`), 'Total Attended', 'Sitting Fee (Rs)'];
      rows = filteredMemberData.map(d => [
        d.slNo,
        d.member.wardNo,
        `"${d.member.wardName}"`,
        `"${d.member.name}"`,
        `"${d.member.designationLabel}"`,
        `"${d.scObj ? d.scObj.name : 'Ex-officio'}"`,
        ...monthMeetings.map(m => {
          const isEligible = isMemberEligibleForMeeting(d.member, m);
          if (!isEligible) return 'N/A';
          return attendance[m.id]?.[d.member.id] ? 'Present' : 'Absent';
        }),
        d.totalAttended,
        d.admissibleSittingFee
      ]);
    } else if (activeReport === 'BANK_TRANSFER') {
      headers = ['Sl No', 'Ward No', 'Member Name', 'Bank Name', 'Branch', 'Account Number', 'IFSC Code', 'Net Payable (Rs)'];
      rows = filteredMemberData.map(d => [
        d.slNo,
        d.member.wardNo,
        `"${d.member.name}"`,
        `"${d.member.bankDetails.bankName}"`,
        `"${d.member.bankDetails.branch}"`,
        `"${d.member.bankDetails.accountNo}"`,
        d.member.bankDetails.ifsc,
        d.netPayable
      ]);
    } else {
      headers = ['Sl No', 'Ward No', 'Member Name', 'Committee', 'Board Attended', 'SC Attended', 'Honorarium', 'Sitting Fee', 'Phone Allowance', 'Net Payable'];
      rows = filteredMemberData.map(d => [
        d.slNo,
        d.member.wardNo,
        `"${d.member.name}"`,
        `"${d.scObj ? d.scObj.name : 'Ex-officio'}"`,
        d.boardAttended,
        d.scAttended,
        d.fixedHonorarium,
        d.admissibleSittingFee,
        d.phoneAllowance,
        d.netPayable
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Report Selector Header Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-4 no-print">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>പഞ്ചായത്ത് ഔദ്യോഗിക റിപ്പോർട്ടുകൾ (Official Reports)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              പദവി തിരിച്ചുള്ള സംഗ്രഹം, ഓഡിറ്റ്, ബാങ്ക് ട്രാൻസ്ഫർ റിപ്പോർട്ടുകൾ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Excel / CSV ഡൗൺലോഡ്</span>
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              <Printer className="w-4 h-4" />
              <span>റിപ്പോർട്ട് പ്രിന്റ് ചെയ്യുക (Print)</span>
            </button>
          </div>
        </div>

        {/* Report Types Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <button
            onClick={() => setActiveReport('DESIGNATION_SUMMARY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeReport === 'DESIGNATION_SUMMARY'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Table className="w-4 h-4 text-emerald-400" />
            <span>1. പദവി തിരിച്ചുള്ള സംഗ്രഹം (Honorarium of Members)</span>
          </button>

          <button
            onClick={() => setActiveReport('AUDIT_ATTENDANCE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeReport === 'AUDIT_ATTENDANCE'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileCheck className="w-4 h-4 text-indigo-400" />
            <span>2. തീയതി തിരിച്ചുള്ള ഹാജർ ഓഡിറ്റ് (Attendance Audit)</span>
          </button>

          <button
            onClick={() => setActiveReport('BANK_TRANSFER')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeReport === 'BANK_TRANSFER'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Landmark className="w-4 h-4 text-blue-400" />
            <span>3. ബാങ്ക് ട്രാൻസ്ഫർ ഷെഡ്യൂൾ (Bank Advice)</span>
          </button>

          <button
            onClick={() => setActiveReport('COMMITTEE_BREAKDOWN')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeReport === 'COMMITTEE_BREAKDOWN'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>4. സ്റ്റാൻഡിംഗ് കമ്മിറ്റി സംഗ്രഹം</span>
          </button>
        </div>

        {/* Bank Filter */}
        {activeReport === 'BANK_TRANSFER' && (
          <div className="flex items-center gap-2 pt-1 text-xs">
            <span className="font-bold text-slate-600">ബാങ്ക് ഫിൽട്ടർ:</span>
            {['ALL', 'State Bank of India', 'Kerala Gramin Bank', 'Canara Bank'].map(b => (
              <button
                key={b}
                onClick={() => setBankFilter(b)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  bankFilter === b ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {b === 'ALL' ? 'എല്ലാ ബാങ്കുകളും' : b}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Printable Report Paper Layout */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-md border border-slate-200 print:shadow-none print:border-none print:p-0">
        
        {/* =========================================================================
            REPORT 1: EXACT MATCH TO USER'S SCREENSHOT (HONARARIUM OF MEMBERS)
           ========================================================================= */}
        {activeReport === 'DESIGNATION_SUMMARY' && (
          <div className="max-w-3xl mx-auto border border-dashed border-slate-400 p-6 sm:p-8 rounded-2xl bg-white print:border-solid print:p-4">
            
            {/* Centered Headers exactly like the screenshot */}
            <div className="text-center space-y-1 mb-6">
              <h1 className="text-base sm:text-lg font-black tracking-wide text-slate-950 uppercase">
                PUTHUPPADY GRAMAPANCHAYATH
              </h1>
              <h2 className="text-sm sm:text-base font-extrabold tracking-wide text-slate-900 uppercase">
                HONARARIUM OF MEMBERS
              </h2>
              <p className="text-[11px] text-slate-500 font-medium no-print">
                {formatMonthYearMalayalam(selectedMonth)}
              </p>
            </div>

            {/* Exactly Styled 4-Column Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse border border-slate-700 text-xs sm:text-sm font-sans">
                <thead>
                  <tr className="bg-slate-50 font-bold border-b border-slate-700 text-slate-950">
                    <th className="p-3 border border-slate-700 w-1/3">Designation</th>
                    <th className="p-3 border border-slate-700">Sitting Fee</th>
                    <th className="p-3 border border-slate-700">Honaraium</th>
                    <th className="p-3 border border-slate-700 font-extrabold">Total Honaraium</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {designationSummary.rows.map((row) => (
                    <tr key={row.designation} className="hover:bg-slate-50">
                      <td className="p-3.5 border border-slate-700 font-semibold text-slate-900">
                        {row.designation}
                      </td>
                      <td className="p-3.5 border border-slate-700 font-semibold text-slate-900">
                        ₹{row.sittingFee.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 border border-slate-700 font-semibold text-slate-900">
                        ₹{row.honorarium.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 border border-slate-700 font-bold text-slate-950">
                        ₹{row.total.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}

                  {/* Grand Total Row */}
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-800 text-slate-950">
                    <td className="p-3.5 border border-slate-700 font-black text-center uppercase">
                      Total
                    </td>
                    <td className="p-3.5 border border-slate-700 font-black">
                      ₹{designationSummary.grandSitting.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 border border-slate-700 font-black">
                      ₹{designationSummary.grandHon.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 border border-slate-700 font-black text-emerald-950">
                      ₹{designationSummary.grandTotal.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Official Certification Signature Block */}
            <div className="mt-8 pt-6 border-t border-slate-300 grid grid-cols-2 gap-6 text-xs text-slate-700">
              <div>
                <p className="font-semibold">തയ്യാറാക്കിയത്: ജൂനിയർ സൂപ്രണ്ട് / ക്ലർക്ക്</p>
                <div className="pt-8 font-bold text-slate-900">പുതുപ്പാടി ഗ്രാമപഞ്ചായത്ത്</div>
              </div>
              <div className="text-right">
                <p className="font-semibold">പരിശോധിച്ചത്: പഞ്ചായത്ത് സെക്രട്ടറി / പ്രസിഡന്റ്</p>
                <div className="pt-8 font-bold text-slate-900">പുതുപ്പാടി ഗ്രാമപഞ്ചായത്ത്</div>
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            REPORT 2: ATTENDANCE AUDIT
           ========================================================================= */}
        {activeReport === 'AUDIT_ATTENDANCE' && (
          <div>
            <div className="text-center pb-4 border-b-2 border-slate-900 mb-5">
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
                ഗവൺമെന്റ് ഓഫ് കേരള • തദ്ദേശ സ്വയംഭരണ വകുപ്പ്
              </div>
              <h1 className="text-xl font-black text-slate-950 mt-1">
                പുതുപ്പാടി ഗ്രാമപഞ്ചായത്ത് കാര്യാലയം
              </h1>
              <div className="mt-2 inline-block px-4 py-1 rounded-lg bg-slate-100 border border-slate-300 text-xs font-bold text-slate-900">
                ഭരണസമിതി അംഗങ്ങളുടെ തീയതി തിരിച്ചുള്ള ഹാജർ ഓഡിറ്റ് റിപ്പോർട്ട് - {formatMonthYearMalayalam(selectedMonth)}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs print:text-[8pt] print-table">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-y-2 border-slate-900">
                    <th className="p-2 border border-slate-300 w-10 text-center">ക്രം.</th>
                    <th className="p-2 border border-slate-300 w-12 text-center">വാർഡ്</th>
                    <th className="p-2 border border-slate-300">മെമ്പറുടെ പേര് & പദവി</th>
                    <th className="p-2 border border-slate-300">സ്ഥിരംസമിതി</th>
                    {monthMeetings.map((mtg, idx) => (
                      <th key={mtg.id} className="p-2 border border-slate-300 text-center">
                        <div>{mtg.formattedDate}</div>
                        <div className="text-[9px] font-normal text-slate-500">
                          {mtg.type === 'Board Meeting' ? 'ബോർഡ്' : 'SC'}
                        </div>
                      </th>
                    ))}
                    <th className="p-2 border border-slate-300 text-center font-bold">ഹാജരായവ</th>
                    <th className="p-2 border border-slate-300 text-right font-bold">സിറ്റിംഗ് ഫീസ്</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {filteredMemberData.map((d) => (
                    <tr key={d.member.id} className="hover:bg-slate-50">
                      <td className="p-1.5 border border-slate-300 text-center font-mono">{d.slNo}</td>
                      <td className="p-1.5 border border-slate-300 text-center font-mono font-bold">{d.member.wardNo}</td>
                      <td className="p-1.5 border border-slate-300">
                        <div className="font-bold text-slate-900">{d.member.name}</div>
                        <div className="text-[10px] text-slate-500">{d.member.designationLabel}</div>
                      </td>
                      <td className="p-1.5 border border-slate-300 text-[11px]">
                        {d.scObj ? d.scObj.name : 'ഭരണനേതൃത്വം'}
                      </td>
                      {monthMeetings.map((mtg) => {
                        const isEligible = isMemberEligibleForMeeting(d.member, mtg);
                        const isPresent = Boolean(attendance[mtg.id]?.[d.member.id]);

                        return (
                          <td key={mtg.id} className="p-1.5 border border-slate-300 text-center font-mono">
                            {!isEligible ? (
                              <span className="text-slate-300">-</span>
                            ) : isPresent ? (
                              <span className="font-bold text-emerald-700">P</span>
                            ) : (
                              <span className="font-bold text-rose-600">A</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-1.5 border border-slate-300 text-center font-mono font-bold bg-slate-50">
                        {d.totalAttended} യോഗം
                      </td>
                      <td className="p-1.5 border border-slate-300 text-right font-mono font-bold">
                        ₹{d.admissibleSittingFee.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}

                  {/* Total Row */}
                  <tr className="bg-slate-200 font-bold border-t-2 border-slate-900">
                    <td colSpan={monthMeetings.length + 5} className="p-2 text-right border border-slate-400">
                      ആകെ സിറ്റിംഗ് ഫീസ് തുക (TOTAL):
                    </td>
                    <td className="p-2 text-right font-mono font-black border border-slate-400 text-emerald-950">
                      {formatINR(totalSitting)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            REPORT 3: BANK TRANSFER DBT ADVICE
           ========================================================================= */}
        {activeReport === 'BANK_TRANSFER' && (
          <div>
            <div className="text-center pb-4 border-b-2 border-slate-900 mb-5">
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
                ഗവൺമെന്റ് ഓഫ് കേരള • തദ്ദേശ സ്വയംഭരണ വകുപ്പ്
              </div>
              <h1 className="text-xl font-black text-slate-950 mt-1">
                പുതുപ്പാടി ഗ്രാമപഞ്ചായത്ത് കാര്യാലയം
              </h1>
              <div className="mt-2 inline-block px-4 py-1 rounded-lg bg-slate-100 border border-slate-300 text-xs font-bold text-slate-900">
                ഡയറക്ട് ബാങ്ക് ട്രാൻസ്ഫർ / DBT പേയ്മെന്റ് ഷെഡ്യൂൾ - {formatMonthYearMalayalam(selectedMonth)}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs print:text-[8pt] print-table">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-y-2 border-slate-900">
                    <th className="p-2 border border-slate-300 w-10 text-center">ക്രം.</th>
                    <th className="p-2 border border-slate-300 w-12 text-center">വാർഡ്</th>
                    <th className="p-2 border border-slate-300">അംഗത്തിന്റെ പേര് (Beneficiary Name)</th>
                    <th className="p-2 border border-slate-300">ബാങ്ക് & ബ്രാഞ്ച്</th>
                    <th className="p-2 border border-slate-300 font-mono">അക്കൗണ്ട് നമ്പർ</th>
                    <th className="p-2 border border-slate-300 font-mono">IFSC കോഡ്</th>
                    <th className="p-2 border border-slate-300 text-right font-bold">ട്രാൻസ്ഫർ തുക (Net Amount)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {filteredMemberData.map((d) => (
                    <tr key={d.member.id} className="hover:bg-slate-50">
                      <td className="p-2 border border-slate-300 text-center font-mono">{d.slNo}</td>
                      <td className="p-2 border border-slate-300 text-center font-mono font-bold">{d.member.wardNo}</td>
                      <td className="p-2 border border-slate-300 font-bold text-slate-900">
                        {d.member.name} ({d.member.englishName})
                      </td>
                      <td className="p-2 border border-slate-300">
                        {d.member.bankDetails.bankName} ({d.member.bankDetails.branch})
                      </td>
                      <td className="p-2 border border-slate-300 font-mono font-semibold">
                        {d.member.bankDetails.accountNo}
                      </td>
                      <td className="p-2 border border-slate-300 font-mono text-slate-600">
                        {d.member.bankDetails.ifsc}
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono font-bold text-slate-950">
                        ₹{d.netPayable.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}

                  <tr className="bg-slate-200 font-bold border-t-2 border-slate-900">
                    <td colSpan={6} className="p-2 text-right border border-slate-400">
                      ആകെ ബാങ്ക് ട്രാൻസ്ഫർ ബാധ്യത (TOTAL NET TRANSFER):
                    </td>
                    <td className="p-2 text-right font-mono font-black text-sm border border-slate-400 text-emerald-950">
                      {formatINR(totalNet)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            REPORT 4: COMMITTEE BREAKDOWN
           ========================================================================= */}
        {activeReport === 'COMMITTEE_BREAKDOWN' && (
          <div>
            <div className="text-center pb-4 border-b-2 border-slate-900 mb-5">
              <h1 className="text-xl font-black text-slate-950">
                പുതുപ്പാടി ഗ്രാമപഞ്ചായത്ത് - സ്റ്റാൻഡിംഗ് കമ്മിറ്റി സംഗ്രഹം
              </h1>
              <p className="text-xs text-slate-600 mt-1">{formatMonthYearMalayalam(selectedMonth)}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs print:text-[8pt] print-table">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-y-2 border-slate-900">
                    <th className="p-2 border border-slate-300 w-10 text-center">ക്രം.</th>
                    <th className="p-2 border border-slate-300 w-12 text-center">വാർഡ്</th>
                    <th className="p-2 border border-slate-300">മെമ്പറുടെ പേര്</th>
                    <th className="p-2 border border-slate-300">സ്ഥിരംസമിതി</th>
                    <th className="p-2 border border-slate-300 text-right">സ്ഥിര ഓണറേറിയം</th>
                    <th className="p-2 border border-slate-300 text-center">ബോർഡ് ഹാജർ</th>
                    <th className="p-2 border border-slate-300 text-center">SC ഹാജർ</th>
                    <th className="p-2 border border-slate-300 text-right">സിറ്റിംഗ് ഫീസ്</th>
                    <th className="p-2 border border-slate-300 text-right font-bold">ആകെ തുക</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {filteredMemberData.map((d) => (
                    <tr key={d.member.id} className="hover:bg-slate-50">
                      <td className="p-2 border border-slate-300 text-center font-mono">{d.slNo}</td>
                      <td className="p-2 border border-slate-300 text-center font-mono font-bold">{d.member.wardNo}</td>
                      <td className="p-2 border border-slate-300 font-bold">{d.member.name}</td>
                      <td className="p-2 border border-slate-300">{d.scObj ? d.scObj.name : 'ഭരണനേതൃത്വം'}</td>
                      <td className="p-2 border border-slate-300 text-right font-mono">₹{d.fixedHonorarium.toLocaleString('en-IN')}</td>
                      <td className="p-2 border border-slate-300 text-center font-mono">{d.boardAttended}</td>
                      <td className="p-2 border border-slate-300 text-center font-mono">{d.scAttended}</td>
                      <td className="p-2 border border-slate-300 text-right font-mono">₹{d.admissibleSittingFee.toLocaleString('en-IN')}</td>
                      <td className="p-2 border border-slate-300 text-right font-mono font-bold text-emerald-950">₹{d.netPayable.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
