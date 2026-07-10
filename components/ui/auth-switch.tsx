import React from 'react';

interface AuthSwitchProps {
  mode: 'login' | 'register';
  onChange: (mode: 'login' | 'register') => void;
}

export const AuthSwitch: React.FC<AuthSwitchProps> = ({ mode, onChange }) => {
  return (
    <div className="relative flex p-1.5 bg-[#0E1325]/80 backdrop-blur-md border border-white/5 rounded-xl w-full max-w-[320px] mx-auto select-none">
      {/* Sliding background */}
      <div
        className="absolute top-1.5 bottom-1.5 left-1.5 rounded-lg bg-gradient-to-r from-[#4F7CFF] to-[#7A5AF8] transition-all duration-300 ease-out shadow-[0_4px_20px_rgba(122,90,248,0.25)] pointer-events-none"
        style={{
          width: 'calc(50% - 12px)',
          transform: mode === 'login' ? 'translateX(0)' : 'translateX(calc(100% + 12px))',
        }}
      />

      <button
        type="button"
        onClick={() => onChange('login')}
        className={`relative z-20 w-1/2 py-2 text-xs font-bold uppercase tracking-wider rounded-lg text-center transition-colors duration-200 cursor-pointer ${mode === 'login' ? 'text-white' : 'text-slate-400 hover:text-white'
          }`}
      >
        Sign In
      </button>

      <button
        type="button"
        onClick={() => onChange('register')}
        className={`relative z-20 w-1/2 py-2 text-xs font-bold uppercase tracking-wider rounded-lg text-center transition-colors duration-200 cursor-pointer ${mode === 'register' ? 'text-white' : 'text-slate-400 hover:text-white'
          }`}
      >
        Register
      </button>
    </div>
  );
};

export default AuthSwitch;
