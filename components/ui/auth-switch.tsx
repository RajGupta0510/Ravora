import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface AuthSwitchProps {
  mode: 'login' | 'register';
  onChange: (mode: 'login' | 'register') => void;
}

const OPTIONS: { id: 'login' | 'register'; label: string }[] = [
  { id: 'login', label: 'Sign in' },
  { id: 'register', label: 'Create account' },
];

/*
 * Segmented mode switch. One shared Amber pill springs between the two options
 * (motion layoutId), the pattern used by Watermelon UI's Fluid Tabs, restyled flat.
 */
export const AuthSwitch: React.FC<AuthSwitchProps> = ({ mode, onChange }) => {
  const reduced = useReducedMotion();
  return (
    <div className="ra-switch" role="tablist" aria-label="Sign in or create an account">
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          role="tab"
          aria-selected={mode === o.id}
          onClick={() => onChange(o.id)}
        >
          {mode === o.id && (
            <motion.span
              layoutId="ra-switch-pill"
              className="pill"
              transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 340, damping: 30, mass: 0.8 }}
            />
          )}
          <span>{o.label}</span>
        </button>
      ))}
    </div>
  );
};

export default AuthSwitch;
