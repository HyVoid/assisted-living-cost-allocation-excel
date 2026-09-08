import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 py-6 border-t border-[#E8E8E6] text-center text-[#888888]">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#00C853]" />
          <span>
            Client-Side Privacy Notice: All storage and computing functions operate strictly in your browser's localStorage. The web application does not transmit or store any user data on external servers.
          </span>
        </div>
        <div className="flex items-center gap-3 text-[#888888]">
          <span>EquiCare Assisted Living Financial Model</span>
          <span>•</span>
          <span>Dynamic Array Engine v1.0</span>
        </div>
      </div>
    </footer>
  );
};
