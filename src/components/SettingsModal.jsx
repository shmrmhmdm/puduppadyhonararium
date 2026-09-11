import React, { useState } from 'react';
import { X, Sliders, RotateCcw, Check, ShieldCheck } from 'lucide-react';
import { STATUTORY_RATES } from '../data/initialData';

export default function SettingsModal({ isOpen, onClose, rates, onSaveRates }) {
  const [formData, setFormData] = useState({ ...rates });

  if (!isOpen) return null;

  const handleReset = () => {
    setFormData({ ...STATUTORY_RATES });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveRates(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-800/60 border border-emerald-500/30">
              <Sliders className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-base">സ്റ്റാറ്റ്യൂട്ടറി നിരക്കുകൾ & പരിധികൾ</h3>
              <p className="text-xs text-slate-300">Statutory Rules & Honorarium Rates</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Sitting Fee & Ceiling */}
          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-3">
            <div className="font-bold text-xs text-emerald-950 flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              സിറ്റിംഗ് ഫീസ് ചട്ടങ്ങൾ (Sitting Fee Rules)
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  വാർഡ് മെമ്പർമാർക്ക് (₹/Mtg)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.sittingFee?.member ?? 200}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    sittingFee: { ...(formData.sittingFee || {}), member: Number(e.target.value) },
                    sittingFeePerMeeting: Number(e.target.value)
                  })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  പ്രസിഡന്റ് / വൈസ് പ്രസിഡന്റ് / SC (₹/Mtg)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.sittingFee?.president ?? 250}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setFormData({ 
                      ...formData, 
                      sittingFee: { 
                        ...(formData.sittingFee || {}), 
                        president: val,
                        vice_president: val,
                        sc_chairperson: val
                      }
                    });
                  }}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="text-[10px] text-slate-500 pt-1 border-t border-emerald-200/60 flex items-center justify-between">
              <span>പരമാവധി പ്രതിമാസ പരിധി: മെമ്പർമാർക്ക് <strong>₹1,000</strong> (5 യോഗം), മറ്റുള്ളവർക്ക് <strong>₹1,250</strong> (5 യോഗം)</span>
            </div>
          </div>

          {/* Monthly Fixed Honorarium */}
          <div>
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-2">
              പ്രതിമാസ സ്ഥിര ഓണറേറിയം (Fixed Honorarium Rates)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">പ്രസിഡന്റ് (President)</label>
                <input
                  type="number"
                  value={formData.honorarium.president}
                  onChange={(e) => setFormData({
                    ...formData,
                    honorarium: { ...formData.honorarium, president: Number(e.target.value) }
                  })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1">വൈസ് പ്രസിഡന്റ് (VP)</label>
                <input
                  type="number"
                  value={formData.honorarium.vice_president}
                  onChange={(e) => setFormData({
                    ...formData,
                    honorarium: { ...formData.honorarium, vice_president: Number(e.target.value) }
                  })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1">സ്റ്റാൻഡിംഗ് ചെയർപേഴ്സൺ</label>
                <input
                  type="number"
                  value={formData.honorarium.sc_chairperson}
                  onChange={(e) => setFormData({
                    ...formData,
                    honorarium: { ...formData.honorarium, sc_chairperson: Number(e.target.value) }
                  })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1">വാർഡ് മെമ്പർ (Ward Member)</label>
                <input
                  type="number"
                  value={formData.honorarium.member}
                  onChange={(e) => setFormData({
                    ...formData,
                    honorarium: { ...formData.honorarium, member: Number(e.target.value) }
                  })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ഡിഫോൾട്ടിലേക്ക് മാറ്റുക (Reset)</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                റദ്ദാക്കുക (Cancel)
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>സേവ് ചെയ്യുക (Save)</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
