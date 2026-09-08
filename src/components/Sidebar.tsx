import React, { useState } from 'react';
import {
  Building2,
  Database,
  ArrowRightLeft,
  PieChart,
  FileSpreadsheet,
  LayoutDashboard,
  Download,
  Upload,
  RotateCcw,
  FileUp,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Menu,
  X,
} from 'lucide-react';

export type TabId =
  | '00_Setup'
  | '01_Transactions'
  | '02_Allocation_Engine'
  | '03_Unit_PL'
  | '04_Consolidated_PL'
  | '05_Dashboard';

interface SidebarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  lastSaved: string;
  onExportBackup: () => void;
  onImportBackup: () => void;
  onBulkCsvImport: () => void;
  onResetData: () => void;
  invalidTxCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  lastSaved,
  onExportBackup,
  onImportBackup,
  onBulkCsvImport,
  onResetData,
  invalidTxCount,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const tabs: { id: TabId; label: string; shortLabel: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: '00_Setup',
      label: '00_Setup',
      shortLabel: 'Setup',
      icon: <Database className="w-4 h-4 shrink-0" />,
    },
    {
      id: '01_Transactions',
      label: '01_Transactions',
      shortLabel: 'Transactions',
      icon: <ArrowRightLeft className="w-4 h-4 shrink-0" />,
      badge: invalidTxCount > 0 ? invalidTxCount : undefined,
    },
    {
      id: '02_Allocation_Engine',
      label: '02_Allocation_Engine',
      shortLabel: 'Engine',
      icon: <PieChart className="w-4 h-4 shrink-0" />,
    },
    {
      id: '03_Unit_PL',
      label: '03_Unit_PL',
      shortLabel: 'Unit P&L',
      icon: <Building2 className="w-4 h-4 shrink-0" />,
    },
    {
      id: '04_Consolidated_PL',
      label: '04_Consolidated_PL',
      shortLabel: 'Consolidation',
      icon: <FileSpreadsheet className="w-4 h-4 shrink-0" />,
    },
    {
      id: '05_Dashboard',
      label: '05_Dashboard',
      shortLabel: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
    },
  ];

  const formatLastSavedTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  const handleSelectTab = (id: TabId) => {
    onSelectTab(id);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between select-none">
      {/* Top section: Brand & Navigation */}
      <div>
        {/* Brand identity header */}
        <div
          className={`h-16 px-4 flex items-center border-b border-[#E8E8E6] ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-[#051C2C] flex items-center justify-center text-white shrink-0 shadow-sm">
              <Building2 className="w-4.5 h-4.5 text-[#2251FF]" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-bold text-[18px] text-[#051C2C] tracking-tight leading-none truncate">
                    EquiCare
                  </span>
                  <span className="text-[9px] font-semibold bg-[#2251FF]/10 text-[#2251FF] px-1 py-0.5 rounded leading-none uppercase tracking-wider">
                    SaaS
                  </span>
                </div>
                <p className="text-[10px] text-[#888888] tracking-tight truncate leading-none mt-1">
                  Allocation & P&L
                </p>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle button */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-md text-[#888888] hover:text-[#051C2C] hover:bg-[#F5F5F2] transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-md text-[#888888] hover:text-[#051C2C] hover:bg-[#F5F5F2]"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section title */}
        {!isCollapsed && (
          <div className="px-4 pt-5 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">
              Model Modules
            </span>
          </div>
        )}

        {/* Navigation links */}
        <nav className="px-2.5 space-y-1 mt-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`sidebar-tab-${tab.id}`}
                onClick={() => handleSelectTab(tab.id)}
                title={tab.label}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer group relative ${
                  isActive
                    ? 'bg-[#2251FF] text-white shadow-sm font-semibold'
                    : 'text-[#051C2C]/70 hover:text-[#051C2C] hover:bg-[#F5F5F2]'
                } ${isCollapsed ? 'justify-center px-2' : ''}`}
              >
                <div
                  className={`${
                    isActive ? 'text-white' : 'text-[#051C2C]/60 group-hover:text-[#051C2C]'
                  }`}
                >
                  {tab.icon}
                </div>

                {!isCollapsed && (
                  <span className="truncate flex-1 text-left">{tab.label}</span>
                )}

                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full leading-none shrink-0 ${
                      isActive
                        ? 'bg-white text-[#D32F2F]'
                        : 'bg-[#D32F2F] text-white'
                    } ${isCollapsed ? 'absolute -top-1 -right-1 ring-2 ring-white' : ''}`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom section: Persistence, Actions & Diagnostics */}
      <div className="p-3 border-t border-[#E8E8E6] bg-white space-y-3">
        {/* Persistence timestamp indicator */}
        {!isCollapsed ? (
          <div className="flex items-center justify-between px-2 py-1.5 rounded-md bg-[#F5F5F2] border border-[#E8E8E6] text-[11px] text-[#051C2C]/80">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00C853] shrink-0" />
              <span className="truncate font-mono">Saved {formatLastSavedTime(lastSaved)}</span>
            </div>
          </div>
        ) : (
          <div
            className="flex items-center justify-center p-2 rounded-md bg-[#F5F5F2] text-[#00C853]"
            title={`Saved at ${formatLastSavedTime(lastSaved)}`}
          >
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}

        {/* Data Utilities Header */}
        {!isCollapsed && (
          <div className="px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888] block">
              Data Management
            </span>
          </div>
        )}

        {/* Operations Buttons Grid */}
        <div className={`grid gap-1.5 ${isCollapsed ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {/* Bulk CSV */}
          <button
            id="sidebar-btn-bulk-csv"
            onClick={onBulkCsvImport}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-md text-[11px] font-medium text-[#051C2C] bg-[#F5F5F2] hover:bg-[#EAEAE7] transition-colors cursor-pointer border border-[#E8E8E6] ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="Bulk CSV Import for transactions"
          >
            <FileUp className="w-3.5 h-3.5 text-[#2251FF] shrink-0" />
            {!isCollapsed && <span className="truncate">Bulk CSV</span>}
          </button>

          {/* Export JSON */}
          <button
            id="sidebar-btn-export-backup"
            onClick={onExportBackup}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-md text-[11px] font-medium text-[#051C2C] bg-[#F5F5F2] hover:bg-[#EAEAE7] transition-colors cursor-pointer border border-[#E8E8E6] ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="Export complete model state to JSON"
          >
            <Download className="w-3.5 h-3.5 text-[#051C2C] shrink-0" />
            {!isCollapsed && <span className="truncate">Export</span>}
          </button>

          {/* Import JSON */}
          <button
            id="sidebar-btn-import-backup"
            onClick={onImportBackup}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-md text-[11px] font-medium text-[#051C2C] bg-[#F5F5F2] hover:bg-[#EAEAE7] transition-colors cursor-pointer border border-[#E8E8E6] ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="Import model state from JSON file"
          >
            <Upload className="w-3.5 h-3.5 text-[#051C2C] shrink-0" />
            {!isCollapsed && <span className="truncate">Import</span>}
          </button>

          {/* Reset */}
          <button
            id="sidebar-btn-reset-data"
            onClick={onResetData}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-md text-[11px] font-medium text-[#D32F2F] hover:bg-[#D32F2F]/10 transition-colors cursor-pointer border border-[#D32F2F]/20 ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="Reset model to factory default dataset"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            {!isCollapsed && <span className="truncate">Reset</span>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block fixed top-0 bottom-0 left-0 bg-white border-r border-[#E8E8E6] z-40 transition-all duration-200 ease-in-out ${
          isCollapsed ? 'w-[68px]' : 'w-[250px]'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-[#051C2C]/40 backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        >
          <aside
            className="fixed top-0 bottom-0 left-0 w-[270px] bg-white border-r border-[#E8E8E6] shadow-xl z-50"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
