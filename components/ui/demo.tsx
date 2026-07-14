import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface DemoProps {
  onSelectDemoUser: (email: string, pass: string) => void;
  isLoading: boolean;
}

export const Demo: React.FC<DemoProps> = ({ onSelectDemoUser, isLoading }) => {
  return (
    <div className="mt-8 p-5 bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl max-w-[480px] w-full mx-auto shadow-2xl relative overflow-hidden group">
      {/* Background radial glow */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-accent/10 rounded-full blur-2xl group-hover:bg-accent/20 transition-all duration-300" />
      
      <div className="flex items-start gap-4">
        <div className="p-2.5 bg-accent/10 rounded-xl text-accent group-hover:scale-110 transition-transform duration-200">
          <Sparkles className="w-5 h-5" />
        </div>
        
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-white tracking-wide">Developer Sandbox Fallback</h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Need to test quickly? Click below to instantly load demo credentials and launch your automated portfolio workspace.
          </p>
          
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onSelectDemoUser('demo@ravora.ai', 'Password123!')}
            className="mt-4 flex items-center gap-2 text-xs font-bold text-primary hover:text-white transition-colors duration-200 group/btn"
          >
            Load Demo Account
            <ArrowRight className="w-3.5 h-3.5 transform group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Demo;
