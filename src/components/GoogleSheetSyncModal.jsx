import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  Database
} from 'lucide-react';
import { APPS_SCRIPT_TEMPLATE } from '../services/googleSheetsService';

export default function GoogleSheetSyncModal({
  isOpen,
  onClose,
  sheetUrl,
  onSaveSheetUrl,
  onSyncToSheet,
  onFetchFromSheet,
  isSyncing,
  lastSyncTime
}) {
  const [urlInput, setUrlInput] = useState(sheetUrl || '');
  const [copied, setCopied] = useState(false);
  const [showScriptCode, setShowScriptCode] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSaveAndTest = async () => {
    onSaveSheetUrl(urlInput.trim());
    setStatusMessage('സേവ് ചെയ്തു. കണക്ഷൻ പരിശോധിക്കുന്നു...');
    if (urlInput.trim()) {
      await onSyncToSheet(urlInput.trim());
      setStatusMessage('ഗൂഗിൾ ഷീറ്റുമായി വിജയകരമായി ബന്ധിപ്പിച്ചു!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-5 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600/30 border border-emerald-400/30 shadow-inner">
              <Database className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white flex items-center gap-2">
                <span>ഗൂഗിൾ ഷീറ്റ് ഡാറ്റാബേസ് കണക്ഷൻ</span>
                <span className="text-[10px] bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-full font-extrabold uppercase">
                  Google Sheets DB
                </span>
              </h3>
              <p className="text-xs text-emerald-200/80">
                നിങ്ങളുടെ സ്വന്തം ഗൂഗിൾ ഷീറ്റിനെ ഈ ആപ്പുമായി ലൈവായി ബന്ധിപ്പിക്കുക
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* Status Banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
            sheetUrl 
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}>
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full shrink-0 ${sheetUrl ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <div>
                <div className="font-bold text-sm">
                  {sheetUrl ? 'ഗൂഗിൾ ഷീറ്റ് ഡാറ്റാബേസ് സജീവം (Connected)' : 'ലോക്കൽ മോഡിൽ പ്രവർത്തിക്കുന്നു (Not Connected)'}
                </div>
                <div className="text-[11px] opacity-80 mt-0.5">
                  {lastSyncTime ? `അവസാനം സിങ്ക് ചെയ്തത്: ${lastSyncTime}` : 'ഷീറ്റ് URL നൽകി കണക്റ്റ് ചെയ്യുക'}
                </div>
              </div>
            </div>

            {sheetUrl && (
              <button
                onClick={() => onSyncToSheet()}
                disabled={isSyncing}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-1.5 transition active:scale-95 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'സിങ്ക് ചെയ്യുന്നു...' : 'ഇപ്പോൾ സിങ്ക് ചെയ്യുക'}</span>
              </button>
            )}
          </div>

          {/* Web App URL Input */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="block font-bold text-slate-800 text-xs">
              ഗൂഗിൾ ആപ്പ് സ്ക്രിപ്റ്റ് വെബ് ആപ്പ് URL (Google Apps Script Web App URL):
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 p-2.5 rounded-xl border border-slate-300 bg-white font-mono text-xs focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleSaveAndTest}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition"
              >
                സേവ് & ടെസ്റ്റ്
              </button>
            </div>
            {statusMessage && (
              <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>{statusMessage}</span>
              </div>
            )}
          </div>

          {/* How to Connect in 4 Easy Steps */}
          <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>1 മിനിറ്റിൽ ഗൂഗിൾ ഷീറ്റ് കണക്റ്റ് ചെയ്യുന്ന വിധം:</span>
              </h4>

              <button
                type="button"
                onClick={handleCopyScript}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-200 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'കോഡ് കോപ്പി ചെയ്തു!' : 'സ്ക്രിപ്റ്റ് കോഡ് കോപ്പി ചെയ്യുക'}</span>
              </button>
            </div>

            <ol className="space-y-2 list-decimal list-inside text-slate-600 leading-relaxed">
              <li>നിങ്ങളുടെ ഗൂഗിൾ ഷീറ്റ് (Google Sheet) തുറക്കുക.</li>
              <li>മുകളിലെ മെനുവിൽ <strong>Extensions ➔ Apps Script</strong> ക്ലിക്ക് ചെയ്യുക.</li>
              <li>അവിടെയുള്ള കോഡ് മാറ്റി, മുകളിലെ <strong>"സ്ക്രിപ്റ്റ് കോഡ് കോപ്പി ചെയ്യുക"</strong> ബട്ടൺ വഴി കിട്ടിയ കോഡ് പേസ്റ്റ് ചെയ്യുക.</li>
              <li>മുകളിൽ വലത് വശത്തുള്ള <strong>Deploy ➔ New deployment</strong> ക്ലിക്ക് ചെയ്ത് <em>Web app</em> തിരഞ്ഞെടുക്കുക. (Who has access: <em>Anyone</em> നൽകുക).</li>
              <li>ലഭിക്കുന്ന <strong>Web App URL</strong> ഇവിടെ മുകളിലെ ബോക്സിൽ പേസ്റ്റ് ചെയ്ത് സേവ് ചെയ്യുക!</li>
            </ol>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 px-6 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            ഗൂഗിൾ ഷീറ്റിലെ മാറ്റങ്ങൾ നേരിട്ട് ആപ്പിലും, ആപ്പിലെ മാറ്റങ്ങൾ ഷീറ്റിലും തത്സമയം ലഭ്യമാകും.
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition"
          >
            പൂർത്തിയായി (Done)
          </button>
        </div>

      </div>
    </div>
  );
}
