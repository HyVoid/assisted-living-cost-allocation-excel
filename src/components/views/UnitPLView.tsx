import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  Layers,
  Info,
  ChevronRight,
  X,
  FileText,
  TrendingUp,
} from 'lucide-react';
import {
  AppState,
  UnitPLStatement,
  AllocationEngineRow,
  Account,
} from '../../types';
import { StatusBadge } from '../StatusBadge';
import { DataBar } from '../DataBar';

interface UnitPLViewProps {
  state: AppState;
  unitPL: UnitPLStatement;
  engineRows: AllocationEngineRow[];
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  availableMonths: string[];
}

export const UnitPLView: React.FC<UnitPLViewProps> = ({
  state,
  unitPL,
  engineRows,
  selectedMonth,
  onSelectMonth,
  availableMonths,
}) => {
  // Modal for drill-down line inspection
  const [drillDownInfo, setDrillDownInfo] = useState<{
    unitId: string;
    accountCode: string;
    accountName: string;
    costType: string;
    amount: number;
    rows: AllocationEngineRow[];
  } | null>(null);

  const activeUnits = state.units.filter((u) => u.status === 'Active');
  const revAccounts = state.accounts.filter((a) => a.category === 'Revenue');
  const directAccounts = state.accounts.filter((a) => a.category === 'Direct Expense');
  const sharedAccounts = state.accounts.filter((a) => a.category === 'Shared Expense');

  // Helper to open drill-down
  const handleCellClick = (unitId: string, accountCode: string, costType: 'Direct' | 'Allocated Shared') => {
    const acct = state.accounts.find((a) => a.code === accountCode);
    const filteredRows = engineRows.filter((r) => {
      const matchMonth = selectedMonth === 'All-Year' || r.month === selectedMonth;
      return matchMonth && r.unitId === unitId && r.accountCode === accountCode && r.costType === costType;
    });

    const totalAmt = filteredRows.reduce((a, c) => a + c.allocatedAmount, 0);

    setDrillDownInfo({
      unitId,
      accountCode,
      accountName: acct ? acct.name : accountCode,
      costType,
      amount: totalAmt,
      rows: filteredRows,
    });
  };

  // Compute Total Company and Benchmark
  const companyTotalRevenue = (Object.values(unitPL.totalRevenue) as number[]).reduce((a: number, b: number) => a + b, 0);
  const companyTotalDirect = (Object.values(unitPL.totalDirectCost) as number[]).reduce((a: number, b: number) => a + b, 0);
  const companyContributionMargin = companyTotalRevenue - companyTotalDirect;
  const companyContributionPct = companyTotalRevenue > 0 ? companyContributionMargin / companyTotalRevenue : 0;
  const companyTotalAllocated = (Object.values(unitPL.totalAllocatedCost) as number[]).reduce((a: number, b: number) => a + b, 0);
  const companyTotalCost = companyTotalDirect + companyTotalAllocated;
  const companyNetIncome = companyTotalRevenue - companyTotalCost;
  const companyProfitMargin = companyTotalRevenue > 0 ? companyNetIncome / companyTotalRevenue : 0;

  const unitCount = activeUnits.length || 1;
  const benchmarkRevenue = companyTotalRevenue / unitCount;
  const benchmarkNetIncome = companyNetIncome / unitCount;

  // Max revenue for data bar
  const maxUnitRevenue = Math.max(...(Object.values(unitPL.totalRevenue) as number[]), 1);
  const maxUnitDirect = Math.max(...(Object.values(unitPL.totalDirectCost) as number[]), 1);
  const maxUnitAllocated = Math.max(...(Object.values(unitPL.totalAllocatedCost) as number[]), 1);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-[28px] font-semibold text-[#051C2C] tracking-tight">
            03_Unit_PL: Multi-Location Contribution P&L Statement
          </h1>
          <p className="text-[13px] text-[#888888] mt-1">
            Dynamic horizontal matrix evaluating facility gross contribution vs. absorbed shared overhead and true net operating margin.
          </p>
        </div>

        {/* Month Selector & Target Benchmark */}
        <div className="flex items-center gap-3">
          <div className="app-card px-3 py-1.5 flex items-center gap-2 border border-[#E8E8E6] shadow-sm">
            <Calendar className="w-4 h-4 text-[#2251FF]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#051C2C]">Period:</span>
            <select
              value={selectedMonth}
              onChange={(e) => onSelectMonth(e.target.value)}
              className="cell-editable px-2 py-1 text-[12px] font-mono font-bold text-[#051C2C] cursor-pointer"
            >
              <option value="All-Year">All-Year (YTD Cumulative)</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="app-card px-3 py-1.5 flex items-center gap-2 border border-[#E8E8E6] text-[12px] text-[#051C2C] shadow-sm">
            <span className="text-[#888888]">Target Margin:</span>
            <span className="font-mono font-bold text-[#2251FF]">
              {(state.config.targetMargin * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Operational Methodology Insight */}
      <div className="insight-block">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#2251FF] shrink-0 mt-0.5" />
          <div className="text-[12px] text-[#051C2C] leading-relaxed">
            <strong>Management Accounting Hierarchy:</strong> Evaluates operational performance in two distinct tiers:
            <span className="font-semibold text-[#051C2C]"> (1) Contribution Margin</span> measures on-site operational efficiency before corporate costs;
            <span className="font-semibold text-[#051C2C]"> (2) Net Operating Income</span> captures full-absorption profitability after applying dynamic shared rules. Click any cell to inspect its underlying audit trail.
          </div>
        </div>
      </div>

      {/* Main P&L Matrix Table */}
      <div className="app-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr>
                <th className="table-head-cell min-w-[260px] sticky left-0 bg-[#FFFFFF] z-10">
                  Financial Statement Line Items
                </th>
                {activeUnits.map((u) => (
                  <th key={u.id} className="table-head-cell text-right min-w-[150px]">
                    <div className="font-bold text-[#051C2C]">{u.id}</div>
                    <div className="text-[10px] text-[#888888] font-normal lowercase tracking-normal truncate max-w-[140px]">
                      {u.name}
                    </div>
                  </th>
                ))}
                <th className="table-head-cell text-right min-w-[150px] bg-[#051C2C]/5 font-bold text-[#051C2C]">
                  Total Company
                </th>
                <th className="table-head-cell text-right min-w-[140px] text-[#888888]">
                  Benchmark / Avg
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E8E6]">
              {/* ════════════ SECTION 1: REVENUE ════════════ */}
              <tr className="bg-[#051C2C]/5">
                <td
                  colSpan={activeUnits.length + 3}
                  className="px-4 py-2 font-bold uppercase tracking-wider text-[#051C2C] text-[11px]"
                >
                  I. Operating Revenues (Direct)
                </td>
              </tr>
              {revAccounts.map((acct) => {
                const totalRow = activeUnits.reduce(
                  (sum, u) => sum + (unitPL.revenueByAccount[acct.code]?.[u.id] || 0),
                  0
                );
                return (
                  <tr key={acct.code} className="hover:bg-[#F5F5F2]/40 transition-colors">
                    <td className="p-2.5 pl-6 font-medium text-[#051C2C] sticky left-0 bg-white">
                      <span className="font-mono text-[11px] text-[#888888] mr-2">{acct.code}</span>
                      {acct.name}
                    </td>
                    {activeUnits.map((u) => {
                      const val = unitPL.revenueByAccount[acct.code]?.[u.id] || 0;
                      return (
                        <td
                          key={u.id}
                          onClick={() => handleCellClick(u.id, acct.code, 'Direct')}
                          className="p-2.5 text-right font-mono text-[#051C2C] cell-interactive"
                          title="Click to view line vouchers"
                        >
                          ${val.toLocaleString()}
                        </td>
                      );
                    })}
                    <td className="p-2.5 text-right font-mono font-semibold text-[#051C2C] bg-[#051C2C]/5">
                      ${totalRow.toLocaleString()}
                    </td>
                    <td className="p-2.5 text-right font-mono text-[#888888]">
                      ${(totalRow / unitCount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                  </tr>
                );
              })}
              {/* Total Revenue Summary Row */}
              <tr className="bg-emerald-50/40 font-bold border-t-2 border-[#051C2C]/20">
                <td className="p-3 pl-4 text-[#051C2C] sticky left-0 bg-emerald-50/60">
                  Total Operating Revenue
                </td>
                {activeUnits.map((u) => {
                  const val = unitPL.totalRevenue[u.id] || 0;
                  return (
                    <td key={u.id} className="p-3 text-right font-mono text-[13px] text-[#051C2C]">
                      <div>${val.toLocaleString()}</div>
                      <div className="mt-1">
                        <DataBar value={val} max={maxUnitRevenue} height={4} />
                      </div>
                    </td>
                  );
                })}
                <td className="p-3 text-right font-mono text-[13px] text-[#051C2C] bg-emerald-50/80">
                  ${companyTotalRevenue.toLocaleString()}
                </td>
                <td className="p-3 text-right font-mono text-[#888888]">
                  ${benchmarkRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
              </tr>

              {/* ════════════ SECTION 2: DIRECT OPERATING COSTS ════════════ */}
              <tr className="bg-[#051C2C]/5">
                <td
                  colSpan={activeUnits.length + 3}
                  className="px-4 py-2 font-bold uppercase tracking-wider text-[#051C2C] text-[11px]"
                >
                  II. Direct Facility Expenses (On-Site Operations)
                </td>
              </tr>
              {directAccounts.map((acct) => {
                const totalRow = activeUnits.reduce(
                  (sum, u) => sum + (unitPL.directCostByAccount[acct.code]?.[u.id] || 0),
                  0
                );
                return (
                  <tr key={acct.code} className="hover:bg-[#F5F5F2]/40 transition-colors">
                    <td className="p-2.5 pl-6 font-medium text-[#051C2C] sticky left-0 bg-white">
                      <span className="font-mono text-[11px] text-[#888888] mr-2">{acct.code}</span>
                      {acct.name}
                    </td>
                    {activeUnits.map((u) => {
                      const val = unitPL.directCostByAccount[acct.code]?.[u.id] || 0;
                      return (
                        <td
                          key={u.id}
                          onClick={() => handleCellClick(u.id, acct.code, 'Direct')}
                          className="p-2.5 text-right font-mono text-[#051C2C] cell-interactive"
                          title="Click to view line vouchers"
                        >
                          ${val.toLocaleString()}
                        </td>
                      );
                    })}
                    <td className="p-2.5 text-right font-mono font-semibold text-[#051C2C] bg-[#051C2C]/5">
                      ${totalRow.toLocaleString()}
                    </td>
                    <td className="p-2.5 text-right font-mono text-[#888888]">
                      ${(totalRow / unitCount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                  </tr>
                );
              })}
              {/* Total Direct Cost Summary Row */}
              <tr className="bg-blue-50/40 font-bold border-t border-[#051C2C]/10">
                <td className="p-2.5 pl-4 text-[#051C2C] sticky left-0 bg-blue-50/60">
                  Total Direct Expenses
                </td>
                {activeUnits.map((u) => {
                  const val = unitPL.totalDirectCost[u.id] || 0;
                  return (
                    <td key={u.id} className="p-2.5 text-right font-mono text-[#051C2C]">
                      <div>${val.toLocaleString()}</div>
                      <div className="mt-1">
                        <DataBar value={val} max={maxUnitDirect} height={4} />
                      </div>
                    </td>
                  );
                })}
                <td className="p-2.5 text-right font-mono font-bold text-[#051C2C] bg-blue-50/80">
                  ${companyTotalDirect.toLocaleString()}
                </td>
                <td className="p-2.5 text-right font-mono text-[#888888]">
                  ${(companyTotalDirect / unitCount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
              </tr>

              {/* ════════════ SECTION 3: CONTRIBUTION MARGIN ════════════ */}
              <tr className="bg-[#F5F5F2] font-bold border-t-2 border-[#051C2C]">
                <td className="p-3 pl-4 text-[#051C2C] sticky left-0 bg-[#F5F5F2]">
                  Direct Contribution Margin ($)
                </td>
                {activeUnits.map((u) => {
                  const cm = unitPL.contributionMargin[u.id] || 0;
                  return (
                    <td key={u.id} className="p-3 text-right font-mono text-[13px] font-bold text-[#051C2C]">
                      ${cm.toLocaleString()}
                    </td>
                  );
                })}
                <td className="p-3 text-right font-mono text-[13px] font-bold text-[#051C2C] bg-[#051C2C]/10">
                  ${companyContributionMargin.toLocaleString()}
                </td>
                <td className="p-3 text-right font-mono text-[#888888]">
                  ${(companyContributionMargin / unitCount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
              </tr>
              <tr className="bg-[#F5F5F2] text-[11px] text-[#555555]">
                <td className="p-1.5 pl-6 sticky left-0 bg-[#F5F5F2]">
                  Contribution Margin Ratio (%)
                </td>
                {activeUnits.map((u) => {
                  const pct = unitPL.contributionMarginPct[u.id] || 0;
                  return (
                    <td key={u.id} className="p-1.5 text-right font-mono">
                      {(pct * 100).toFixed(1)}%
                    </td>
                  );
                })}
                <td className="p-1.5 text-right font-mono font-bold bg-[#051C2C]/10">
                  {(companyContributionPct * 100).toFixed(1)}%
                </td>
                <td className="p-1.5 text-right font-mono text-[#888888]">
                  {(companyContributionPct * 100).toFixed(1)}%
                </td>
              </tr>

              {/* ════════════ SECTION 4: ALLOCATED SHARED COSTS ════════════ */}
              <tr className="bg-[#051C2C]/5">
                <td
                  colSpan={activeUnits.length + 3}
                  className="px-4 py-2 font-bold uppercase tracking-wider text-[#051C2C] text-[11px]"
                >
                  III. Absorbed Shared Overhead & Logistics (Allocated via Rules)
                </td>
              </tr>
              {sharedAccounts.map((acct) => {
                const totalRow = activeUnits.reduce(
                  (sum, u) => sum + (unitPL.allocatedCostByAccount[acct.code]?.[u.id] || 0),
                  0
                );
                return (
                  <tr key={acct.code} className="hover:bg-[#F5F5F2]/40 transition-colors">
                    <td className="p-2.5 pl-6 font-medium text-[#051C2C] sticky left-0 bg-white">
                      <span className="font-mono text-[11px] text-[#2251FF] mr-2">{acct.code}</span>
                      {acct.name}
                    </td>
                    {activeUnits.map((u) => {
                      const val = unitPL.allocatedCostByAccount[acct.code]?.[u.id] || 0;
                      return (
                        <td
                          key={u.id}
                          onClick={() => handleCellClick(u.id, acct.code, 'Allocated Shared')}
                          className="p-2.5 text-right font-mono text-[#051C2C] cell-interactive"
                          title="Click to view shared allocation components"
                        >
                          ${val.toLocaleString()}
                        </td>
                      );
                    })}
                    <td className="p-2.5 text-right font-mono font-semibold text-[#051C2C] bg-[#051C2C]/5">
                      ${totalRow.toLocaleString()}
                    </td>
                    <td className="p-2.5 text-right font-mono text-[#888888]">
                      ${(totalRow / unitCount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                  </tr>
                );
              })}
              {/* Total Allocated Shared Costs */}
              <tr className="bg-purple-50/40 font-bold border-t border-[#051C2C]/10">
                <td className="p-2.5 pl-4 text-[#051C2C] sticky left-0 bg-purple-50/60">
                  Total Allocated Shared Overhead
                </td>
                {activeUnits.map((u) => {
                  const val = unitPL.totalAllocatedCost[u.id] || 0;
                  return (
                    <td key={u.id} className="p-2.5 text-right font-mono text-[#051C2C]">
                      <div>${val.toLocaleString()}</div>
                      <div className="mt-1">
                        <DataBar value={val} max={maxUnitAllocated} height={4} />
                      </div>
                    </td>
                  );
                })}
                <td className="p-2.5 text-right font-mono font-bold text-[#051C2C] bg-purple-50/80">
                  ${companyTotalAllocated.toLocaleString()}
                </td>
                <td className="p-2.5 text-right font-mono text-[#888888]">
                  ${(companyTotalAllocated / unitCount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
              </tr>

              {/* Total Full-Absorption Cost */}
              <tr className="bg-[#F5F5F2]/70 font-semibold border-t border-[#051C2C]/10">
                <td className="p-2.5 pl-4 text-[#051C2C] sticky left-0 bg-[#F5F5F2]">
                  Total Operating Cost (Direct + Allocated)
                </td>
                {activeUnits.map((u) => {
                  const tc = unitPL.totalCost[u.id] || 0;
                  return (
                    <td key={u.id} className="p-2.5 text-right font-mono text-[#051C2C]">
                      ${tc.toLocaleString()}
                    </td>
                  );
                })}
                <td className="p-2.5 text-right font-mono font-bold text-[#051C2C] bg-[#051C2C]/10">
                  ${companyTotalCost.toLocaleString()}
                </td>
                <td className="p-2.5 text-right font-mono text-[#888888]">
                  ${(companyTotalCost / unitCount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
              </tr>

              {/* ════════════ SECTION 5: FINAL NET OPERATING INCOME & HEALTH ════════════ */}
              <tr className="bg-[#FFFFFF] font-bold border-t-2 border-[#051C2C]">
                <td className="p-3.5 pl-4 text-[#051C2C] sticky left-0 bg-white text-[13px]">
                  Net Operating Income ($)
                </td>
                {activeUnits.map((u) => {
                  const net = unitPL.netIncome[u.id] || 0;
                  return (
                    <td key={u.id} className="p-3.5 text-right font-mono text-[14px] font-bold text-[#2251FF]">
                      ${net.toLocaleString()}
                    </td>
                  );
                })}
                <td className="p-3.5 text-right font-mono text-[14px] font-bold text-[#2251FF] bg-[#051C2C]/10">
                  ${companyNetIncome.toLocaleString()}
                </td>
                <td className="p-3.5 text-right font-mono text-[#888888]">
                  ${benchmarkNetIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
              </tr>

              {/* Net Profit Margin % */}
              <tr className="bg-[#FFFFFF]">
                <td className="p-2.5 pl-4 font-semibold text-[#051C2C] sticky left-0 bg-white">
                  Net Operating Margin (%)
                </td>
                {activeUnits.map((u) => {
                  const margin = unitPL.profitMargin[u.id] || 0;
                  return (
                    <td key={u.id} className="p-2.5 text-right font-mono text-[13px] font-bold text-[#051C2C]">
                      {(margin * 100).toFixed(1)}%
                    </td>
                  );
                })}
                <td className="p-2.5 text-right font-mono font-bold text-[#051C2C] bg-[#051C2C]/10">
                  {(companyProfitMargin * 100).toFixed(1)}%
                </td>
                <td className="p-2.5 text-right font-mono text-[#888888]">
                  {(companyProfitMargin * 100).toFixed(1)}%
                </td>
              </tr>

              {/* Operational Health Evaluation */}
              <tr className="bg-[#F5F5F2]/40">
                <td className="p-3 pl-4 font-semibold text-[#051C2C] sticky left-0 bg-[#F5F5F2]/60">
                  Operational Health Assessment
                </td>
                {activeUnits.map((u) => {
                  const alert = unitPL.healthAlert[u.id] || { status: 'marginal', label: '⚠️ Marginal Risk' };
                  const badgeVariant =
                    alert.status === 'excellent'
                      ? 'success'
                      : alert.status === 'deficit'
                      ? 'danger'
                      : 'warning';
                  return (
                    <td key={u.id} className="p-3 text-right">
                      <StatusBadge variant={badgeVariant} size="sm">
                        {alert.label}
                      </StatusBadge>
                    </td>
                  );
                })}
                <td className="p-3 text-right bg-[#051C2C]/10">
                  <StatusBadge
                    variant={companyProfitMargin >= state.config.targetMargin ? 'success' : 'warning'}
                    size="sm"
                  >
                    {companyProfitMargin >= state.config.targetMargin
                      ? '🟢 Portfolio Met Target'
                      : '🟡 Portfolio Under Watch'}
                  </StatusBadge>
                </td>
                <td className="p-3 text-right text-[#888888] font-mono text-[11px]">
                  Baseline: {(state.config.targetMargin * 100).toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Drill Down Modal */}
      {drillDownInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051C2C]/40 backdrop-blur-sm animate-fade-up">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden border border-[#E8E8E6] flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-[#E8E8E6] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#2251FF]" />
                <div>
                  <h3 className="font-display font-semibold text-[17px] text-[#051C2C]">
                    Audit Drill-Down: {drillDownInfo.unitId} • {drillDownInfo.accountCode}
                  </h3>
                  <p className="text-[11px] text-[#888888]">
                    {drillDownInfo.accountName} ({drillDownInfo.costType}) • Total: ${drillDownInfo.amount.toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDrillDownInfo(null)}
                className="p-1 rounded-md text-[#888888] hover:text-[#051C2C] hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-[#051C2C]/5 text-[#051C2C]">
                  <tr>
                    <th className="p-2">Row #</th>
                    <th className="p-2">Source Voucher</th>
                    <th className="p-2 text-center">Period</th>
                    <th className="p-2 text-center">Nature</th>
                    <th className="p-2 text-right">Applied Rate</th>
                    <th className="p-2 text-right">Allocated Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E6]">
                  {drillDownInfo.rows.map((r) => (
                    <tr key={r.allocRowId} className="hover:bg-gray-50">
                      <td className="p-2 font-mono text-[#888888]">{r.allocRowId}</td>
                      <td className="p-2 font-mono font-bold text-[#051C2C]">{r.sourceTxId}</td>
                      <td className="p-2 text-center font-mono">{r.month}</td>
                      <td className="p-2 text-center">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100">
                          {r.costType}
                        </span>
                      </td>
                      <td className="p-2 text-right font-mono">{(r.appliedRate * 100).toFixed(1)}%</td>
                      <td className="p-2 text-right font-mono font-bold text-[#051C2C]">
                        ${r.allocatedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-3 border-t border-[#E8E8E6] bg-[#F5F5F2]/50 flex justify-between items-center text-[12px]">
              <span className="text-[#888888]">{drillDownInfo.rows.length} underlying transaction records found</span>
              <button
                onClick={() => setDrillDownInfo(null)}
                className="px-4 py-1.5 bg-[#051C2C] text-white rounded-md text-[12px] font-medium hover:bg-black transition-colors cursor-pointer"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
