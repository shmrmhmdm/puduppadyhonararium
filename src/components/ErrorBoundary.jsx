import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    try {
      const savedMembers = localStorage.getItem('puduppady_members_v11');
      if (savedMembers) {
        try {
          const parsed = JSON.parse(savedMembers);
          const cleaned = parsed.map(m => ({
            ...m,
            bankDetails: {
              accountNo: m.bankDetails?.accountNo || m.accountNo || '',
              ifsc: m.bankDetails?.ifsc || m.ifsc || 'SBIN0070554',
              bankName: m.bankDetails?.bankName || m.bankName || 'State Bank of India',
              branch: m.bankDetails?.branch || m.branch || 'Puduppady'
            }
          }));
          localStorage.setItem('puduppady_members_v11', JSON.stringify(cleaned));
        } catch (e) {
          console.warn(e);
        }
      }
    } catch (e) {
      console.warn(e);
    }
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              ഒരു അപ്രതീക്ഷിത തടസ്സം നേരിട്ടു
            </h2>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              ആപ്പിൽ ഡാറ്റ ലോഡ് ചെയ്യുന്നതിൽ ചെറിയൊരു പ്രശ്നം നേരിട്ടു. താഴെയുള്ള ബട്ടൺ ക്ലിക്ക് ചെയ്ത് പേജ് വീണ്ടും റീലോഡ് ചെയ്യുക.
            </p>
            {this.state.error && (
              <div className="text-[11px] font-mono text-rose-300 bg-rose-950/60 p-3 rounded-xl border border-rose-800/40 text-left mb-6 overflow-x-auto">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>പേജ് റീലോഡ് ചെയ്യുക (Reload Page)</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
