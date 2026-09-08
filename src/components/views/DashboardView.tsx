import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Trophy,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Building,
  Layers,
} from 'lucide-react';
import {
  AppState,
  ConsolidatedPLStatement,
  UnitPLStatement,
  UnitRankingItem,
} from '../../types';
import { StatusBadge } from '../StatusBadge';
import { DataBar } from '../DataBar';

interface DashboardViewProps {
  state: AppState;
  consolPL: ConsolidatedPLStatement;
  unitPL: UnitPLStatement;
  rankings: UnitRankingItem[];
  topUnit: UnitRankingItem | null;
  bottomUnit: UnitRankingItem | null;
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  availableMonths: string[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  state,
  consolPL,
  unitPL,
  rankings,
  topUnit,
  bottomUnit,
  selectedMonth,
  onSelectMonth,
  availableMonths,
}) => {
  const totalExpense = consolPL.consolidatedDirectCost + consolPL.consolidatedSharedCost;
  const targetMargin = state.config.targetMargin;
  const isTargetMet = consolPL.consolidatedProfitMargin >= targetMargin;

  const maxRevenue = Math.max(...rankings.map((r) => r.revenue), 1);
  const maxNetIncome = Math.max(...rankings.map((r) => r.netIncome), 1);

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-[28px] font-semibold text-[#051C2C] tracking-tight">
            05_Dashboard: Executive Operations & Profitability Cockpit
          </h1>
          <p className="text-[13px] text-[#888888] mt-1">
            Strategic decision cockpit synthesizing portfolio earnings, facility performance ladders, and shared overhead absorption equity.
          </p>
        </div>

        {/* Period Selector */}
        <div className="app-card px-3 py-1.5 flex items-center gap-2 border border-[#E8E8E6] shadow-sm self-start sm:self-auto">
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
      </div>

      {/* Hero KPI Grid (4 Cards with EB Garamond Typography) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Revenue */}
        <div className="app-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#888888]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Total Portfolio Revenue
            </span>
            <Building className="w-4 h-4 text-[#2251FF]" />
          </div>
          <div className="my-2">
            <span className="kpi-number text-[36px] font-bold text-[#051C2C] block leading-none">
              ${consolPL.consolidatedRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="text-[11px] text-[#888888] flex items-center justify-between">
            <span>{rankings.length} Active Campuses</span>
            <span className="font-mono">
              Avg ${(consolPL.consolidatedRevenue / (rankings.length || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}/unit
            </span>
          </div>
        </div>

        {/* Card 2: Expense */}
        <div className="app-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#888888]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Total Operating Expenses
            </span>
            <Layers className="w-4 h-4 text-[#888888]" />
          </div>
          <div className="my-2">
            <span className="kpi-number text-[36px] font-bold text-[#051C2C] block leading-none">
              ${totalExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="text-[11px] text-[#888888] flex items-center justify-between">
            <span>Direct: ${(consolPL.consolidatedDirectCost).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            <span>Shared: ${(consolPL.consolidatedSharedCost).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
        </div>

        {/* Card 3: Net Operating Income */}
        <div className="app-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#888888]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Net Operating Income
            </span>
            <TrendingUp className="w-4 h-4 text-[#2251FF]" />
          </div>
          <div className="my-2">
            <span className="kpi-number text-[36px] font-bold text-[#2251FF] block leading-none">
              ${consolPL.consolidatedNetIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="text-[11px] text-[#888888] flex items-center justify-between">
            <span>Total Bottom-Line Profit</span>
            <span className="font-mono text-[#051C2C] font-semibold">
              {(consolPL.consolidatedProfitMargin * 100).toFixed(1)}% Return
            </span>
          </div>
        </div>

        {/* Card 4: Operating Margin % */}
        <div className="app-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#888888]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Operating Profit Margin
            </span>
            <PieChart className="w-4 h-4 text-[#00C853]" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="kpi-number text-[36px] font-bold text-[#051C2C] block leading-none">
              {(consolPL.consolidatedProfitMargin * 100).toFixed(1)}%
            </span>
            <span className="text-[12px] text-[#888888] font-mono">
              / target {(targetMargin * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <StatusBadge variant={isTargetMet ? 'success' : 'warning'} size="sm">
              {isTargetMet ? 'Met Corporate Target' : 'Below Baseline Target'}
            </StatusBadge>
            <span className="text-[11px] text-[#888888] font-mono">
              Gap: {((consolPL.consolidatedProfitMargin - targetMargin) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Executive Highlights (Top Unit & Bottom Unit) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Performer */}
        {topUnit && (
          <div className="p-4 rounded-xl bg-white border-l-4 border-[#00C853] shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00C853]/10 text-[#008f3b] flex items-center justify-center font-bold">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#888888] block">
                  Top Performing Operational Facility
                </span>
                <span className="font-display text-[17px] font-bold text-[#051C2C]">
                  {topUnit.name} ({topUnit.unitId})
                </span>
                <p className="text-[11px] text-[#888888] mt-0.5">
                  Revenue ${topUnit.revenue.toLocaleString()} • Net ${topUnit.netIncome.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-[20px] font-bold text-[#008f3b] block leading-none">
                {(topUnit.profitMargin * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-[#888888]">Net Margin</span>
            </div>
          </div>
        )}

        {/* Watch / Remediation Performer */}
        {bottomUnit && (
          <div className="p-4 rounded-xl bg-white border-l-4 border-amber-500 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#888888] block">
                  Remediation & Cost-Control Watchlist
                </span>
                <span className="font-display text-[17px] font-bold text-[#051C2C]">
                  {bottomUnit.name} ({bottomUnit.unitId})
                </span>
                <p className="text-[11px] text-[#888888] mt-0.5">
                  Shared Burden Ratio: {(bottomUnit.burdenRatio * 100).toFixed(1)}% of total expenses
                </p>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`font-mono text-[20px] font-bold block leading-none ${
                  bottomUnit.profitMargin < 0 ? 'text-[#D32F2F]' : 'text-amber-700'
                }`}
              >
                {(bottomUnit.profitMargin * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-[#888888]">Net Margin</span>
            </div>
          </div>
        )}
      </div>

      {/* Performance Ladder Table (天梯榜) */}
      <div className="app-card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#E8E8E6]">
          <div>
            <h2 className="section-title text-[18px] font-semibold text-[#051C2C]">
              Facility Profitability Ladder & Overhead Burden (Dash_Ranking_Matrix)
            </h2>
            <p className="text-[12px] text-[#888888]">
              Cross-facility ranking ordered by final net operating profit margin.
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#888888]">
            Sorted by Net Profit Margin (High to Low)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr>
                <th className="table-head-cell text-center w-12">Rank</th>
                <th className="table-head-cell">Facility Unit</th>
                <th className="table-head-cell text-right">Revenue</th>
                <th className="table-head-cell text-right">Direct Costs</th>
                <th className="table-head-cell text-right">Absorbed Shared</th>
                <th className="table-head-cell text-right">Total Costs</th>
                <th className="table-head-cell text-right">Net Income</th>
                <th className="table-head-cell text-right">Net Margin</th>
                <th className="table-head-cell text-center min-w-[140px]">Shared Burden</th>
                <th className="table-head-cell text-right">Operating Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E8E6]">
              {rankings.map((item) => (
                <tr key={item.unitId} className="hover:bg-[#F5F5F2]/60 transition-colors">
                  <td className="p-3 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold font-mono ${
                        item.rank === 1
                          ? 'bg-[#00C853]/15 text-[#008f3b]'
                          : 'bg-gray-100 text-[#555555]'
                      }`}
                    >
                      {item.rank}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="font-mono font-bold text-[#051C2C] mr-2">{item.unitId}</span>
                    <span className="text-[#555555] font-medium">{item.unitName}</span>
                  </td>
                  <td className="p-3 text-right font-mono text-[#051C2C]">
                    ${item.revenue.toLocaleString()}
                  </td>
                  <td className="p-3 text-right font-mono text-[#555555]">
                    ${item.directCost.toLocaleString()}
                  </td>
                  <td className="p-3 text-right font-mono text-[#2251FF] font-semibold">
                    ${item.allocatedCost.toLocaleString()}
                  </td>
                  <td className="p-3 text-right font-mono text-[#555555]">
                    ${item.totalCost.toLocaleString()}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-[#051C2C] text-[13px]">
                    ${item.netIncome.toLocaleString()}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-[#051C2C] text-[13px]">
                    {(item.profitMargin * 100).toFixed(1)}%
                  </td>
                  <td className="p-3 text-center">
                    <div className="w-full">
                      <DataBar
                        value={item.burdenRatio * 100}
                        max={100}
                        height={5}
                        showText={true}
                        suffix="%"
                      />
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <StatusBadge
                      variant={
                        item.healthStatus === 'excellent'
                          ? 'success'
                          : item.healthStatus === 'deficit'
                          ? 'danger'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {item.healthLabel}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actionable Executive Insights */}
      <div className="insight-block">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[#2251FF] shrink-0 mt-0.5" />
          <div className="space-y-1.5 text-[12px] text-[#051C2C]">
            <h4 className="font-bold text-[13px] text-[#051C2C]">
              Operational Diagnosis & Resource Allocation Guidance
            </h4>
            <p>
              • <strong>High Burden Ratio Alert:</strong> Facilities with a shared cost burden ratio &gt; 30% are highly sensitive to corporate allocations. If a campus is experiencing tight margins, management should verify whether the underlying allocation metrics (e.g. bed count vs. vehicle hours) are properly aligned.
            </p>
            <p>
              • <strong>Audit Reconciliation Assurance:</strong> Corporate income statement totals match individual campus rollups dollar-for-dollar. No unallocated corporate expenses remain suspended.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
