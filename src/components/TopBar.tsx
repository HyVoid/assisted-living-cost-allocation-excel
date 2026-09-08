import React from 'react';
import { Menu, AlertCircle, CheckCircle2, Building2, ChevronRight, Layers } from 'lucide-react';
import { TabId } from './Sidebar';

interface TopBarProps {
  activeTab: TabId;
  onOpenMobile: () => void;
  invalidTxCount: number;
  onNavigateTransactions: () => void;
  lastSaved: string;
}

const TAB_TITLES: Record<TabId, { name: string; subtitle: string }> = {
  '00_Setup': {
    name: '00_Setup',
    subtitle: 'Parameters & Dimension Tables',
  },
  '01_Transactions': {
    name: '01_Transactions',
    subtitle: 'Operational Voucher Journal',
  },
  '02_Allocation_Engine': {
    name: '02_Allocation_Engine',
    subtitle: 'Dynamic Array Calculation Engine',
  },
  '03_Unit_PL': {
    name: '03_Unit_PL',
    subtitle: 'Multi-Location Contribution P&L Statement',
  },
  '04_Consolidated_PL': {
    name: '04_Consolidated_PL',
    subtitle: 'Corporate Statement & 3-Way Audit Center',
  },
  '05_Dashboard': {
    name: '05_Dashboard',
    subtitle: 'Executive Operations & Profitability Cockpit',
  },
};

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onOpenMobile,
  invalidTxCount,
  onNavigateTransactions,
  lastSaved,
}) => {
  const currentTab = TAB_TITLES[activeTab] || { name: activeTab, subtitle: '' };

  const formatLastSavedTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-14 bg-white/90 backdrop-blur-sm border-b border-[#E8E8E6] px-4 md:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile burger & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="md:hidden p-1.5 -ml-1.5 rounded-md text-[#051C2C] hover:bg-[#F5F5F2] cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-[12px] text-[#888888]">
          <span className="font-semibold text-[#051C2C] flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#2251FF]" />
            EquiCare
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#888888]" />
          <span className="font-mono text-[#051C2C] font-semibold">{currentTab.name}</span>
          <span className="hidden sm:inline text-[11px] text-[#888888]">
            — {currentTab.subtitle}
          </span>
        </div>
      </div>

      {/* Right: Status Indicators */}
      <div className="flex items-center gap-3">
        {invalidTxCount > 0 ? (
          <button
            onClick={onNavigateTransactions}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#D32F2F]/10 border border-[#D32F2F]/30 text-[#D32F2F] text-[11px] font-semibold hover:bg-[#D32F2F]/15 transition-colors cursor-pointer"
            title="Click to inspect audit issues in 01_Transactions"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{invalidTxCount} Audit Issue{invalidTxCount > 1 ? 's' : ''}</span>
          </button>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00C853]" />
            <span>Audit Passed</span>
          </div>
        )}

        <div className="hidden md:flex items-center gap-1 text-[11px] text-[#888888]">
          <span>Synced:</span>
          <span className="font-mono font-medium text-[#051C2C]">
            {formatLastSavedTime(lastSaved)}
          </span>
        </div>
      </div>
    </header>
  );
};
