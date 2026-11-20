import React from 'react';

interface AuthSwitchProps {
  mode: 'login' | 'register';
  onChange: (mode: 'login' | 'register') => void;
}

export const AuthSwitch: React.FC<AuthSwitchProps> = ({ mode, onChange }) => {
  return (
    <div className="relative flex p-1 bg-[#10141d] border border-stone-300/10 rounded-lg w-full max-w-[320px] mx-auto select-none">
      {/* Sliding background */}
      <div
        className="absolute top-1 bottom-1 left-1 rounded-md bg-gradient-to-r from-[#f59e0b] to-[#d97706] transition-all duration-200 ease-out shadow-[0_2px_8px_rgba(245,158,11,0.25)] pointer-events-none"
        style={{
          width: 'calc(50% - 4px)',
          transform: mode === 'login' ? 'translateX(0)' : 'translateX(calc(100% + 4px))',
        }}
      />

      <button
        type="button"
        onClick={() => onChange('login')}
        className={`relative z-20 w-1/2 py-2 text-xs font-bold uppercase tracking-wider rounded-md text-center transition-colors duration-150 cursor-pointer ${mode === 'login' ? 'text-[#0b0e14]' : 'text-stone-400 hover:text-stone-200'
          }`}
      >
        Sign In
      </button>

      <button
        type="button"
        onClick={() => onChange('register')}
        className={`relative z-20 w-1/2 py-2 text-xs font-bold uppercase tracking-wider rounded-md text-center transition-colors duration-150 cursor-pointer ${mode === 'register' ? 'text-[#0b0e14]' : 'text-stone-400 hover:text-stone-200'
          }`}
      >
        Register
      </button>
    </div>
  );
};

export default AuthSwitch;
