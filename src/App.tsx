import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sidebar, TabId } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Footer } from './components/Footer';
import { CsvImportModal } from './components/CsvImportModal';
import { SetupView } from './components/views/SetupView';
import { TransactionsView } from './components/views/TransactionsView';
import { AllocationEngineView } from './components/views/AllocationEngineView';
import { UnitPLView } from './components/views/UnitPLView';
import { ConsolidatedPLView } from './components/views/ConsolidatedPLView';
import { DashboardView } from './components/views/DashboardView';
import { initialData } from './data/initialData';
import {
  AppState,
  SystemConfig,
  Unit,
  Account,
  AllocationRule,
  Transaction,
} from './types';
import {
  loadStateFromStorage,
  saveStateToStorage,
  exportBackupJSON,
} from './utils/storage';
import {
  calculateRuleSummaries,
  validateTransaction,
  expandAllocations,
  calculateUnitPL,
  calculateConsolidatedPL,
  calculateDashboardRankings,
} from './utils/engine';

export default function App() {
  // Load state from localStorage on init
  const [state, setState] = useState<AppState>(() => loadStateFromStorage());
  const [activeTab, setActiveTab] = useState<TabId>('05_Dashboard');
  const [selectedMonth, setSelectedMonth] = useState<string>('All-Year');
  const [isCsvModalOpen, setIsCsvModalOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // File input ref for JSON backup import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save to localStorage whenever state changes
  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

  // Reactive Rule Summaries & Validation
  const ruleSummaries = useMemo(() => {
    return calculateRuleSummaries(state.rules, state.config.tolerance);
  }, [state.rules, state.config.tolerance]);

  const ruleMap = useMemo(() => {
    const map = new Map();
    ruleSummaries.forEach((s) => map.set(s.ruleId, s));
    return map;
  }, [ruleSummaries]);

  // Reactive Calculated Transactions
  const calcTransactions = useMemo(() => {
    return state.transactions.map((tx) => validateTransaction(tx, state, ruleMap));
  }, [state.transactions, state, ruleMap]);

  // Extract all available periods
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    calcTransactions.forEach((tx) => {
      if (tx.calcMonth && tx.calcMonth !== 'Unknown') {
        set.add(tx.calcMonth);
      }
    });
    return Array.from(set).sort();
  }, [calcTransactions]);

  // Reactive Allocation Engine Rows
  const engineRows = useMemo(() => {
    return expandAllocations(calcTransactions, state.rules);
  }, [calcTransactions, state.rules]);

  // Reactive Unit P&L Matrix
  const unitPL = useMemo(() => {
    return calculateUnitPL(
      selectedMonth,
      state.units,
      state.accounts,
      engineRows,
      state.config.targetMargin
    );
  }, [selectedMonth, state.units, state.accounts, engineRows, state.config.targetMargin]);

  // Reactive Consolidated P&L Statement & 3-Way Reconciliation
  const consolPL = useMemo(() => {
    return calculateConsolidatedPL(
      selectedMonth,
      calcTransactions,
      engineRows,
      unitPL,
      state.config.tolerance
    );
  }, [selectedMonth, calcTransactions, engineRows, unitPL, state.config.tolerance]);

  // Reactive Dashboard Ranking Ladder
  const dashboardData = useMemo(() => {
    return calculateDashboardRankings(unitPL, state.units);
  }, [unitPL, state.units]);

  // Overall Source vs Engine totals for 02_Allocation_Engine header
  const sourceTotal = useMemo(() => {
    return calcTransactions
      .filter((tx) => tx.isValid)
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  }, [calcTransactions]);

  const engineTotal = useMemo(() => {
    return engineRows.reduce((sum, r) => sum + (r.allocatedAmount || 0), 0);
  }, [engineRows]);

  const invalidTxCount = useMemo(() => {
    return calcTransactions.filter((tx) => !tx.isValid).length;
  }, [calcTransactions]);

  // State Update Handlers
  const handleUpdateConfig = (config: SystemConfig) => {
    setState((prev) => ({ ...prev, config, lastSaved: new Date().toISOString() }));
  };

  const handleUpdateUnits = (units: Unit[]) => {
    setState((prev) => ({ ...prev, units, lastSaved: new Date().toISOString() }));
  };

  const handleUpdateAccounts = (accounts: Account[]) => {
    setState((prev) => ({ ...prev, accounts, lastSaved: new Date().toISOString() }));
  };

  const handleUpdateRules = (rules: AllocationRule[]) => {
    setState((prev) => ({ ...prev, rules, lastSaved: new Date().toISOString() }));
  };

  const handleUpdateTransactions = (transactions: Transaction[]) => {
    setState((prev) => ({ ...prev, transactions, lastSaved: new Date().toISOString() }));
  };

  // SaaS Backup Operations
  const handleExportBackup = () => {
    exportBackupJSON(state);
  };

  const handleTriggerImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileImported = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.units && parsed.accounts && parsed.rules && parsed.transactions) {
          setState({
            ...parsed,
            lastSaved: new Date().toISOString(),
          });
          alert('Backup data successfully restored!');
        } else {
          alert('Invalid backup JSON format. Missing essential tables.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'Are you sure you want to reset all data to the factory default Assisted Living model? Any custom additions will be lost.'
      )
    ) {
      setState({
        ...initialData,
        lastSaved: new Date().toISOString(),
      });
      setSelectedMonth('All-Year');
    }
  };

  const handleCsvImported = (newTxs: Transaction[], mode: 'append' | 'replace') => {
    if (mode === 'replace') {
      handleUpdateTransactions(newTxs);
    } else {
      handleUpdateTransactions([...state.transactions, ...newTxs]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F2] text-[#1A1A2E] flex flex-col">
      {/* Hidden File Input for JSON Backup Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileImported}
        accept=".json"
        className="hidden"
      />

      {/* Left Sidebar (Collapsible & Mobile Drawer) */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        lastSaved={state.lastSaved}
        onExportBackup={handleExportBackup}
        onImportBackup={handleTriggerImport}
        onBulkCsvImport={() => setIsCsvModalOpen(true)}
        onResetData={handleResetData}
        invalidTxCount={invalidTxCount}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Right Content Column (Padded to accommodate fixed sidebar) */}
      <div
        className={`flex-1 flex flex-col transition-all duration-200 ease-in-out ${
          isSidebarCollapsed ? 'md:pl-[68px]' : 'md:pl-[250px]'
        }`}
      >
        {/* Top Sticky Bar */}
        <TopBar
          activeTab={activeTab}
          onOpenMobile={() => setIsMobileSidebarOpen(true)}
          invalidTxCount={invalidTxCount}
          onNavigateTransactions={() => setActiveTab('01_Transactions')}
          lastSaved={state.lastSaved}
        />

        {/* Main Content Area (Max-width 1400px, responsive padding) */}
        <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 md:px-8 py-6">
          {activeTab === '00_Setup' && (
            <SetupView
              state={state}
              ruleSummaries={ruleSummaries}
              onUpdateConfig={handleUpdateConfig}
              onUpdateUnits={handleUpdateUnits}
              onUpdateAccounts={handleUpdateAccounts}
              onUpdateRules={handleUpdateRules}
            />
          )}

          {activeTab === '01_Transactions' && (
            <TransactionsView
              state={state}
              calcTransactions={calcTransactions}
              ruleSummaries={ruleSummaries}
              onUpdateTransactions={handleUpdateTransactions}
            />
          )}

          {activeTab === '02_Allocation_Engine' && (
            <AllocationEngineView
              state={state}
              engineRows={engineRows}
              sourceTotal={sourceTotal}
              engineTotal={engineTotal}
              tolerance={state.config.tolerance}
            />
          )}

          {activeTab === '03_Unit_PL' && (
            <UnitPLView
              state={state}
              unitPL={unitPL}
              engineRows={engineRows}
              selectedMonth={selectedMonth}
              onSelectMonth={setSelectedMonth}
              availableMonths={availableMonths}
            />
          )}

          {activeTab === '04_Consolidated_PL' && (
            <ConsolidatedPLView
              state={state}
              consolPL={consolPL}
              selectedMonth={selectedMonth}
              onSelectMonth={setSelectedMonth}
              availableMonths={availableMonths}
            />
          )}

          {activeTab === '05_Dashboard' && (
            <DashboardView
              state={state}
              consolPL={consolPL}
              unitPL={unitPL}
              rankings={dashboardData.rankings}
              topUnit={dashboardData.topUnit}
              bottomUnit={dashboardData.bottomUnit}
              selectedMonth={selectedMonth}
              onSelectMonth={setSelectedMonth}
              availableMonths={availableMonths}
            />
          )}
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Bulk CSV Import Modal */}
      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImport={handleCsvImported}
      />
    </div>
  );
}
