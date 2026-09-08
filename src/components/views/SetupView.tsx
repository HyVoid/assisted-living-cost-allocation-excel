import React, { useState } from 'react';
import {
  Settings,
  Building2,
  BookOpen,
  Split,
  Plus,
  Trash2,
  Info,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import {
  AppState,
  SystemConfig,
  Unit,
  Account,
  AllocationRule,
  RuleSummary,
} from '../../types';
import { StatusBadge } from '../StatusBadge';

interface SetupViewProps {
  state: AppState;
  ruleSummaries: RuleSummary[];
  onUpdateConfig: (config: SystemConfig) => void;
  onUpdateUnits: (units: Unit[]) => void;
  onUpdateAccounts: (accounts: Account[]) => void;
  onUpdateRules: (rules: AllocationRule[]) => void;
}

export const SetupView: React.FC<SetupViewProps> = ({
  state,
  ruleSummaries,
  onUpdateConfig,
  onUpdateUnits,
  onUpdateAccounts,
  onUpdateRules,
}) => {
  // New unit form state
  const [newUnitId, setNewUnitId] = useState('');
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitCapacity, setNewUnitCapacity] = useState(60);

  // New account form state
  const [newAcctCode, setNewAcctCode] = useState('');
  const [newAcctName, setNewAcctName] = useState('');
  const [newAcctCategory, setNewAcctCategory] = useState<'Revenue' | 'Direct Expense' | 'Shared Expense'>('Direct Expense');
  const [newAcctGuidance, setNewAcctGuidance] = useState('');

  // New rule row state
  const [newRuleId, setNewRuleId] = useState('VEH-001');
  const [newRuleDesc, setNewRuleDesc] = useState('');
  const [newRuleTargetUnit, setNewRuleTargetUnit] = useState(state.units[0]?.id || 'UNIT-A');
  const [newRulePercent, setNewRulePercent] = useState('25');

  // Handlers for System Config
  const handleConfigChange = (key: keyof SystemConfig, value: any) => {
    onUpdateConfig({
      ...state.config,
      [key]: value,
    });
  };

  // Add Unit
  const handleAddUnit = () => {
    if (!newUnitId.trim() || !newUnitName.trim()) return;
    const cleanId = newUnitId.trim().toUpperCase();
    if (state.units.some((u) => u.id === cleanId)) {
      alert(`Unit ID ${cleanId} already exists!`);
      return;
    }
    const updated = [
      ...state.units,
      {
        id: cleanId,
        name: newUnitName.trim(),
        status: 'Active' as const,
        capacityBeds: Number(newUnitCapacity) || 60,
      },
    ];
    onUpdateUnits(updated);
    setNewUnitId('');
    setNewUnitName('');
  };

  const toggleUnitStatus = (id: string) => {
    const updated = state.units.map((u) =>
      u.id === id ? { ...u, status: (u.status === 'Active' ? 'Inactive' : 'Active') as 'Active' | 'Inactive' } : u
    );
    onUpdateUnits(updated);
  };

  // Add Account
  const handleAddAccount = () => {
    if (!newAcctCode.trim() || !newAcctName.trim()) return;
    const cleanCode = newAcctCode.trim().toUpperCase();
    if (state.accounts.some((a) => a.code === cleanCode)) {
      alert(`Account Code ${cleanCode} already exists!`);
      return;
    }
    const updated = [
      ...state.accounts,
      {
        code: cleanCode,
        name: newAcctName.trim(),
        category: newAcctCategory,
        guidance: newAcctGuidance.trim() || 'Standard operational line item',
      },
    ];
    onUpdateAccounts(updated);
    setNewAcctCode('');
    setNewAcctName('');
    setNewAcctGuidance('');
  };

  // Rule update
  const handleRulePercentChange = (rowId: string, rawVal: string) => {
    const parsed = parseFloat(rawVal);
    const newPercent = isNaN(parsed) ? 0 : Math.max(0, parsed / 100);
    const updated = state.rules.map((r) => (r.rowId === rowId ? { ...r, percent: newPercent } : r));
    onUpdateRules(updated);
  };

  const handleAddRuleRow = () => {
    if (!newRuleId.trim()) return;
    const pct = parseFloat(newRulePercent) / 100;
    const existingDesc = state.rules.find((r) => r.ruleId === newRuleId.trim())?.ruleDesc || newRuleDesc;
    const newRow: AllocationRule = {
      rowId: `rule-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ruleId: newRuleId.trim().toUpperCase(),
      ruleDesc: existingDesc || 'Shared Cost Allocation',
      targetUnit: newRuleTargetUnit,
      percent: isNaN(pct) ? 0.25 : pct,
    };
    onUpdateRules([...state.rules, newRow]);
  };

  const handleDeleteRuleRow = (rowId: string) => {
    if (state.rules.length <= 1) {
      alert('Cannot delete the last remaining allocation rule.');
      return;
    }
    onUpdateRules(state.rules.filter((r) => r.rowId !== rowId));
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Page Header */}
      <div>
        <h1 className="page-title text-[28px] font-semibold text-[#051C2C] tracking-tight">
          00_Setup: Configuration & Master Data
        </h1>
        <p className="text-[13px] text-[#888888] mt-1">
          Central neural hub for systemic parameters, operating units, charts of accounts, and multi-location allocation rule matrices.
        </p>
      </div>

      {/* Insight Callout */}
      <div className="insight-block">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#2251FF] shrink-0 mt-0.5" />
          <div className="text-[12px] text-[#051C2C] leading-relaxed">
            <strong>Allocation Rule Integrity:</strong> Any shared cost entered in <span className="font-mono font-semibold">01_Transactions</span> requires an active Rule ID. All unit percentages for each Rule ID must sum to exactly 100% (within tolerance). Non-conforming rules trigger automated gatekeeper protection to prevent cost leakage.
          </div>
        </div>
      </div>

      {/* Section 1: System Parameters */}
      <div className="app-card p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#E8E8E6]">
          <Settings className="w-4 h-4 text-[#2251FF]" />
          <h2 className="section-title text-[18px] font-semibold text-[#051C2C]">
            1. System Environmental Parameters (cfg_*)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#051C2C] mb-1">
              Currency Symbol (cfg_Currency)
            </label>
            <input
              type="text"
              value={state.config.currencySymbol}
              onChange={(e) => handleConfigChange('currencySymbol', e.target.value)}
              className="cell-editable w-full px-3 py-2 text-[13px] font-mono font-semibold text-center"
            />
            <span className="text-[10px] text-[#888888] mt-1 block">Displayed on all reports</span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#051C2C] mb-1">
              Target Margin (cfg_TargetMargin)
            </label>
            <div className="relative">
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={Math.round(state.config.targetMargin * 100)}
                onChange={(e) => handleConfigChange('targetMargin', (parseFloat(e.target.value) || 0) / 100)}
                className="cell-editable w-full px-3 py-2 text-[13px] font-mono text-center pr-6"
              />
              <span className="absolute right-2.5 top-2 text-[12px] text-[#888888]">%</span>
            </div>
            <span className="text-[10px] text-[#888888] mt-1 block">Baseline profitability threshold</span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#051C2C] mb-1">
              Reconciliation Tolerance
            </label>
            <input
              type="number"
              step="0.0001"
              value={state.config.tolerance}
              onChange={(e) => handleConfigChange('tolerance', parseFloat(e.target.value) || 0.0001)}
              className="cell-editable w-full px-3 py-2 text-[13px] font-mono text-center"
            />
            <span className="text-[10px] text-[#888888] mt-1 block">Floating-point zero threshold</span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#051C2C] mb-1">
              Fiscal Year (cfg_AnalysisYear)
            </label>
            <input
              type="number"
              value={state.config.analysisYear}
              onChange={(e) => handleConfigChange('analysisYear', parseInt(e.target.value, 10) || 2026)}
              className="cell-editable w-full px-3 py-2 text-[13px] font-mono text-center"
            />
            <span className="text-[10px] text-[#888888] mt-1 block">Valid audit voucher period</span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#051C2C] mb-1">
              Suspense Unit (cfg_SuspenseUnit)
            </label>
            <input
              type="text"
              value={state.config.suspenseUnit}
              onChange={(e) => handleConfigChange('suspenseUnit', e.target.value)}
              className="cell-editable w-full px-3 py-2 text-[13px] font-mono text-center uppercase"
            />
            <span className="text-[10px] text-[#888888] mt-1 block">Unassigned fallback holder</span>
          </div>
        </div>
      </div>

      {/* Section 2: Operational Units & Chart of Accounts Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Units Table */}
        <div className="lg:col-span-5 app-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8E8E6]">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#2251FF]" />
                <h2 className="section-title text-[18px] font-semibold text-[#051C2C]">
                  2. Operational Units (tbl_Dim_Unit)
                </h2>
              </div>
              <span className="text-[11px] font-mono text-[#888888]">
                {state.units.filter((u) => u.status === 'Active').length} Active Units
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="table-head-cell">Unit ID</th>
                    <th className="table-head-cell">Facility Campus Name</th>
                    <th className="table-head-cell text-center">Beds</th>
                    <th className="table-head-cell text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E6]">
                  {state.units.map((unit) => (
                    <tr key={unit.id} className="hover:bg-[#F5F5F2]/50 transition-colors">
                      <td className="p-3 font-mono font-semibold text-[#051C2C]">{unit.id}</td>
                      <td className="p-3 text-[13px] text-[#051C2C]">{unit.name}</td>
                      <td className="p-3 text-center text-[12px] font-mono text-[#888888]">
                        {unit.capacityBeds || '-'}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => toggleUnitStatus(unit.id)}
                          className="cursor-pointer focus:outline-none"
                          title="Click to toggle status"
                        >
                          <StatusBadge variant={unit.status === 'Active' ? 'success' : 'neutral'} size="sm">
                            {unit.status}
                          </StatusBadge>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Add Unit Form */}
          <div className="mt-4 pt-4 border-t border-[#E8E8E6] bg-[#F5F5F2]/40 p-3 rounded-lg">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#051C2C] mb-2">
              Add New Operating Facility
            </span>
            <div className="grid grid-cols-12 gap-2">
              <input
                type="text"
                placeholder="UNIT-E"
                value={newUnitId}
                onChange={(e) => setNewUnitId(e.target.value)}
                className="col-span-3 cell-editable px-2 py-1 text-[12px] uppercase font-mono"
              />
              <input
                type="text"
                placeholder="Eastside Memory Pavilion"
                value={newUnitName}
                onChange={(e) => setNewUnitName(e.target.value)}
                className="col-span-6 cell-editable px-2 py-1 text-[12px]"
              />
              <input
                type="number"
                placeholder="Beds"
                value={newUnitCapacity}
                onChange={(e) => setNewUnitCapacity(parseInt(e.target.value, 10) || 0)}
                className="col-span-2 cell-editable px-2 py-1 text-[12px] font-mono text-center"
              />
              <button
                onClick={handleAddUnit}
                className="col-span-1 flex items-center justify-center rounded-md bg-[#2251FF] text-white hover:bg-[#1a40d6] cursor-pointer"
                title="Add Facility"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Accounts Table */}
        <div className="lg:col-span-7 app-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8E8E6]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#2251FF]" />
                <h2 className="section-title text-[18px] font-semibold text-[#051C2C]">
                  3. Chart of Accounts (tbl_Dim_Account)
                </h2>
              </div>
              <span className="text-[11px] font-mono text-[#888888]">{state.accounts.length} Accounts</span>
            </div>

            <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white">
                  <tr>
                    <th className="table-head-cell">Code</th>
                    <th className="table-head-cell">Account Description</th>
                    <th className="table-head-cell">Category</th>
                    <th className="table-head-cell">Operational Guidance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E6]">
                  {state.accounts.map((acct) => (
                    <tr key={acct.code} className="hover:bg-[#F5F5F2]/50 transition-colors">
                      <td className="p-2.5 font-mono font-semibold text-[#051C2C] text-[12px] whitespace-nowrap">
                        {acct.code}
                      </td>
                      <td className="p-2.5 text-[12px] text-[#051C2C] font-medium whitespace-nowrap">
                        {acct.name}
                      </td>
                      <td className="p-2.5 text-[11px] whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            acct.category === 'Revenue'
                              ? 'bg-emerald-50 text-emerald-800'
                              : acct.category === 'Direct Expense'
                              ? 'bg-blue-50 text-blue-800'
                              : 'bg-purple-50 text-purple-800'
                          }`}
                        >
                          {acct.category}
                        </span>
                      </td>
                      <td className="p-2.5 text-[11px] text-[#888888] max-w-[200px] truncate" title={acct.guidance}>
                        {acct.guidance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Add Account Form */}
          <div className="mt-4 pt-4 border-t border-[#E8E8E6] bg-[#F5F5F2]/40 p-3 rounded-lg">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#051C2C] mb-2">
              Add New Account Code
            </span>
            <div className="grid grid-cols-12 gap-2">
              <input
                type="text"
                placeholder="EXP-205"
                value={newAcctCode}
                onChange={(e) => setNewAcctCode(e.target.value)}
                className="col-span-2 cell-editable px-2 py-1 text-[12px] uppercase font-mono"
              />
              <input
                type="text"
                placeholder="Physical Therapy Equipment"
                value={newAcctName}
                onChange={(e) => setNewAcctName(e.target.value)}
                className="col-span-4 cell-editable px-2 py-1 text-[12px]"
              />
              <select
                value={newAcctCategory}
                onChange={(e: any) => setNewAcctCategory(e.target.value)}
                className="col-span-3 cell-editable px-2 py-1 text-[12px]"
              >
                <option value="Revenue">Revenue</option>
                <option value="Direct Expense">Direct Expense</option>
                <option value="Shared Expense">Shared Expense</option>
              </select>
              <input
                type="text"
                placeholder="Guidance note..."
                value={newAcctGuidance}
                onChange={(e) => setNewAcctGuidance(e.target.value)}
                className="col-span-2 cell-editable px-2 py-1 text-[12px]"
              />
              <button
                onClick={handleAddAccount}
                className="col-span-1 flex items-center justify-center rounded-md bg-[#2251FF] text-white hover:bg-[#1a40d6] cursor-pointer"
                title="Add Account"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Shared Cost Allocation Rules Matrix */}
      <div className="app-card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#E8E8E6]">
          <div className="flex items-center gap-2">
            <Split className="w-4 h-4 text-[#2251FF]" />
            <h2 className="section-title text-[18px] font-semibold text-[#051C2C]">
              4. Shared Cost Allocation Rules Matrix (tbl_Allocation_Rules)
            </h2>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-[#888888]">
            <span>Total Rule Lines: <strong className="text-[#051C2C]">{state.rules.length}</strong></span>
          </div>
        </div>

        {/* Global Rule Audit Cards (Real-time 100% balance check) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {ruleSummaries.map((summary) => (
            <div
              key={summary.ruleId}
              className={`p-3 rounded-lg border transition-all ${
                summary.status === 'OK'
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-red-50/50 border-red-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-[12px] text-[#051C2C]">{summary.ruleId}</span>
                <StatusBadge variant={summary.status === 'OK' ? 'success' : 'danger'} size="sm">
                  {summary.statusText}
                </StatusBadge>
              </div>
              <p className="text-[11px] text-[#555555] truncate">{summary.ruleDesc}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {summary.unitAllocations.map((alloc) => (
                  <span
                    key={alloc.unitId}
                    className="text-[10px] font-mono px-1.5 py-0.5 bg-white rounded border border-[#E8E8E6]"
                  >
                    {alloc.unitId}: {(alloc.percent * 100).toFixed(0)}%
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Allocation Rules Detailed Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="table-head-cell">Rule ID</th>
                <th className="table-head-cell">Rule Operational Description</th>
                <th className="table-head-cell">Beneficiary Unit</th>
                <th className="table-head-cell text-right">Allocation Rate</th>
                <th className="table-head-cell text-center">Rule Sum Check</th>
                <th className="table-head-cell text-center">100% Status</th>
                <th className="table-head-cell text-center w-12">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E8E6]">
              {state.rules.map((rule) => {
                const summary = ruleSummaries.find((s) => s.ruleId === rule.ruleId);
                const isRuleBalanced = summary?.status === 'OK';
                const totalPct = summary ? summary.totalPercent * 100 : 0;

                return (
                  <tr key={rule.rowId} className="hover:bg-[#F5F5F2]/50 transition-colors">
                    <td className="p-3 font-mono font-semibold text-[#051C2C] text-[12px]">
                      {rule.ruleId}
                    </td>
                    <td className="p-3 text-[13px] text-[#051C2C]">{rule.ruleDesc}</td>
                    <td className="p-3 font-mono text-[12px] text-[#051C2C]">{rule.targetUnit}</td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <input
                          type="number"
                          step="1"
                          min="0"
                          max="100"
                          value={Math.round(rule.percent * 100)}
                          onChange={(e) => handleRulePercentChange(rule.rowId, e.target.value)}
                          className="cell-editable w-16 px-2 py-1 text-[13px] font-mono text-right font-semibold text-[#2251FF]"
                        />
                        <span className="text-[12px] text-[#888888]">%</span>
                      </div>
                    </td>
                    <td className="p-3 text-center font-mono text-[12px] text-[#555555]">
                      {totalPct.toFixed(1)}%
                    </td>
                    <td className="p-3 text-center">
                      <StatusBadge variant={isRuleBalanced ? 'success' : 'danger'} size="sm">
                        {isRuleBalanced ? '✅ OK' : summary?.statusText}
                      </StatusBadge>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDeleteRuleRow(rule.rowId)}
                        className="text-[#888888] hover:text-[#D32F2F] p-1 rounded transition-colors cursor-pointer"
                        title="Delete rule line"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Add Rule Row */}
        <div className="mt-4 pt-4 border-t border-[#E8E8E6] bg-[#F5F5F2]/40 p-3 rounded-lg">
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#051C2C] mb-2">
            Append Rule Breakdown Line
          </span>
          <div className="grid grid-cols-12 gap-2">
            <input
              type="text"
              placeholder="Rule ID (e.g. VEH-001)"
              value={newRuleId}
              onChange={(e) => setNewRuleId(e.target.value)}
              className="col-span-3 cell-editable px-2 py-1 text-[12px] uppercase font-mono"
            />
            <input
              type="text"
              placeholder="Rule description..."
              value={newRuleDesc}
              onChange={(e) => setNewRuleDesc(e.target.value)}
              className="col-span-4 cell-editable px-2 py-1 text-[12px]"
            />
            <select
              value={newRuleTargetUnit}
              onChange={(e) => setNewRuleTargetUnit(e.target.value)}
              className="col-span-2 cell-editable px-2 py-1 text-[12px] font-mono"
            >
              {state.units
                .filter((u) => u.status === 'Active')
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.id}
                  </option>
                ))}
            </select>
            <div className="col-span-2 relative">
              <input
                type="number"
                placeholder="25"
                step="1"
                min="0"
                max="100"
                value={newRulePercent}
                onChange={(e) => setNewRulePercent(e.target.value)}
                className="cell-editable w-full px-2 py-1 text-[12px] font-mono text-center pr-5"
              />
              <span className="absolute right-2 top-1 text-[11px] text-[#888888]">%</span>
            </div>
            <button
              onClick={handleAddRuleRow}
              className="col-span-1 flex items-center justify-center rounded-md bg-[#2251FF] text-white hover:bg-[#1a40d6] cursor-pointer"
              title="Add Rule Line"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
