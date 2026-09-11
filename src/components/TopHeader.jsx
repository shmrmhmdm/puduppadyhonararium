import React from 'react';
import { 
  Printer, 
  Calendar
} from 'lucide-react';
import { formatMonthYearMalayalam } from '../utils/calculations';

export default function TopHeader({ activeTab, selectedMonth, onPrint }) {
  const titles = {
    entry: {
      title: '1. ഹാജർ രേഖപ്പെടുത്തുക (Attendance Entry)',
      desc: 'ഭരണസമിതി / സ്ഥിരംസമിതി യോഗ തീയതികൾ ചേർത്ത് അംഗങ്ങളുടെ ഹാജർ രേഖപ്പെടുത്തുക'
    },
    acquittance: {
      title: '2. അക്വിറ്റൻസ് റോൾ (Monthly Acquittance Roll)',
      desc: 'ഓണറേറിയം, സിറ്റിംഗ് ഫീസ്, ബാങ്ക് അക്കൗണ്ട് വിവരങ്ങളും ഔദ്യോഗിക ഗവൺമെന്റ് റോൾ'
    },
    reports: {
      title: '3. ഔദ്യോഗിക റിപ്പോർട്ടുകൾ (Official Reports & Statements)',
      desc: 'തീയതി തിരിച്ചുള്ള ഹാജർ ഓഡിറ്റ്, ബാങ്ക് ട്രാൻസ്ഫർ അഡ്വൈസ്, സ്റ്റാൻഡിംഗ് കമ്മിറ്റി റിപ്പോർട്ടുകൾ'
    },
    payroll: {
      title: '4. സാമ്പത്തിക ബാധ്യതാ സംഗ്രഹം (Financial Summary)',
      desc: 'ആകെ വിതരണം ചെയ്യേണ്ട തുകയും ബാങ്ക് തിരിച്ചുള്ള കണക്കുകളും'
    },
    members: {
      title: '5. ഭരണസമിതി അംഗങ്ങളുടെ ഡയറക്ടറി (24 Members)',
      desc: 'പുതുപ്പാടി പഞ്ചായത്തിലെ 24 വാർഡ് മെമ്പർമാരുടെ വിവരങ്ങൾ'
    }
  };

  const current = titles[activeTab] || titles.entry;

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 no-print">
      <div>
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <span>{current.title}</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {current.desc}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          <span>{formatMonthYearMalayalam(selectedMonth)}</span>
        </div>

        {(activeTab === 'acquittance' || activeTab === 'reports') && (
          <button
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>പ്രിന്റ് ചെയ്യുക</span>
          </button>
        )}
      </div>
    </header>
  );
}
