import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function LoginScreen({ users, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMsg('യൂസർനെയിമും പാസ്‌വേഡും രേഖപ്പെടുത്തുക.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Find matching user
      const matchedUser = (users || []).find(
        u => u.username.toLowerCase() === cleanUser && u.password === cleanPass
      );

      if (!matchedUser) {
        setErrorMsg('യൂസർനെയിം അല്ലെങ്കിൽ പാസ്‌വേഡ് തെറ്റാണ്!');
        setIsLoading(false);
        return;
      }

      if (matchedUser.status === 'inactive') {
        setErrorMsg('ഈ അക്കൗണ്ട് താൽക്കാലികമായി നിർജ്ജീവമാക്കിയിരിക്കുന്നു (Inactive). അഡ്മിനുമായി ബന്ധപ്പെടുക.');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onLogin(matchedUser);
    }, 400);
  };

  const handleFillAdmin = () => {
    setUsername('admin');
    setPassword('admin123');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100">
      
      {/* Background Subtle Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-slate-900 p-6 text-center border-b border-emerald-500/30 relative">
          <div className="w-20 h-20 mx-auto bg-white rounded-2xl p-1.5 shadow-lg border border-slate-200 flex items-center justify-center mb-3">
            <img 
              src={logoImg} 
              alt="Puduppady Grama Panchayat Emblem" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-300">
            ഗവൺമെന്റ് ഓഫ് കേരള • തദ്ദേശ സ്വയംഭരണ വകുപ്പ്
          </div>
          <h1 className="text-lg sm:text-xl font-black text-white mt-1 leading-tight">
            പുതുപ്പാടി ഗ്രാമപഞ്ചായത്ത്
          </h1>
          <p className="text-xs text-emerald-200/90 font-medium mt-0.5">
            മെമ്പേഴ്സ് ഓണറേറിയം & ഹാജർ പോർട്ടൽ
          </p>
        </div>

        {/* Login Form */}
        <div className="p-6 sm:p-8 space-y-5">
          
          <div className="text-center space-y-1">
            <h2 className="text-base font-bold text-slate-100 flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>സുരക്ഷിത ലോഗിൻ (Portal Login)</span>
            </h2>
            <p className="text-xs text-slate-400">
              പ്രവേശനത്തിന് നിങ്ങളുടെ യൂസർ ഐഡിയും പാസ്‌വേഡും നൽകുക
            </p>
          </div>

          {/* Error Alert Box */}
          {errorMsg && (
            <div className="bg-rose-950/80 border border-rose-500/50 text-rose-200 p-3 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Username Input */}
            <div>
              <label className="block font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>യൂസർനെയിം (Username)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. admin, clerk1..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                <span>പാസ്‌വേഡ് (Password)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-3.5 pr-10 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-950/40 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-sm mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>പരിശോധിക്കുന്നു...</span>
                </>
              ) : (
                <>
                  <span>പോർട്ടലിലേക്ക് പ്രവേശിക്കുക</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Quick Default Admin Credentials Card */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 space-y-2 text-[11px]">
            <div className="flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ഡിഫോൾട്ട് അഡ്മിൻ ലോഗിൻ:</span>
              </span>
              <button
                type="button"
                onClick={handleFillAdmin}
                className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline cursor-pointer"
              >
                ഓട്ടോ ഫിൽ
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono text-[11px] bg-slate-900/80 p-2 rounded-xl border border-slate-700/40">
              <div>User: <span className="text-emerald-300 font-bold">admin</span></div>
              <div>Pass: <span className="text-emerald-300 font-bold">admin123</span></div>
            </div>
            <p className="text-[10px] text-slate-400">
              ലോഗിൻ ചെയ്ത ശേഷം അഡ്മിന് പുതിയ ക്ലർക്ക് / വ്യൂവർ അക്കൗണ്ടുകൾ ഉണ്ടാക്കാം.
            </p>
          </div>

          {/* Roles Legend */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-center gap-4 text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Admin (പൂർണ്ണ അനുമതി)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Clerk (ഹാജർ എൻട്രി)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>Viewer (കാണാൻ മാത്രം)</span>
            </span>
          </div>

        </div>

      </div>

      {/* Footer copyright */}
      <div className="mt-6 text-center text-xs text-slate-500">
        പുതുപ്പാടി ഗ്രാമപഞ്ചായത്ത് കാര്യാലയം • കോഴിക്കോട് ജില്ല
      </div>

    </div>
  );
}
