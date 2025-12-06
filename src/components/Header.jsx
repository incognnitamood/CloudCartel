import React from 'react';
import { Download, Sparkles } from 'lucide-react';

const Header = ({ monthlyCost, onExportTerraform, hasNodes }) => {
  return (
    <header className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between max-w-full">
        <div className="flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-white" />
          <div>
            <h1 className="text-2xl font-bold text-white">CloudCartel</h1>
            <p className="text-sm text-purple-100">Build. Simulate. Learn.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20">
            <div className="text-xs text-purple-100 uppercase tracking-wide">Monthly Cost</div>
            <div className="text-xl font-bold text-white">${monthlyCost}</div>
          </div>
          
          <button
            onClick={onExportTerraform}
            disabled={!hasNodes}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all
              ${hasNodes
                ? 'bg-white text-purple-600 hover:bg-purple-50 hover:shadow-lg'
                : 'bg-gray-400 text-gray-600 cursor-not-allowed'
              }
            `}
          >
            <Download className="w-5 h-5" />
            Export Terraform
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

