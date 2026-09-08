import React from 'react';
import {
  FileSpreadsheet,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Scale,
  Info,
} from 'lucide-react';
import { ConsolidatedPLStatement, AppState } from '../../types';
import { StatusBadge } from '../StatusBadge';

interface ConsolidatedPLViewProps {
  state: AppState;
  consolPL: ConsolidatedPLStatement;
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  availableMonths: string[];
}

export const ConsolidatedPLView: React.FC<ConsolidatedPLViewProps> = ({
  state,
  consolPL,
  selectedMonth,
  onSelectMonth,
  availableMonths,
}) => {
  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header and Month Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-[28px] font-semibold text-[#051C2C] tracking-tight">
            04_Consolidated_PL: Corporate Statement & 3-Way Audit Center
          </h1>
          <p className="text-[13px] text-[#888888] mt-1">
            Dual-core financial architecture ensuring statutory consolidated earnings and complete mathematical reconciliation against multi-unit rollups.
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

      {/* Audit Guarantee Banner */}
      <div
        className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          consolPL.isBalanced
            ? 'bg-emerald-50/60 border-emerald-200'
            : 'bg-red-50/60 border-red-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
              consolPL.isBalanced ? 'bg-[#00C853]' : 'bg-[#D32F2F]'
            }`}
          >
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[15px] text-[#051C2C]">
                3-Way Mathematical Reconciliation Audit
              </h3>
              <StatusBadge variant={consolPL.isBalanced ? 'success' : 'danger'} size="sm">
                {consolPL.isBalanced ? '100% BALANCED' : 'VARIANCE ALERT'}
              </StatusBadge>
            </div>
            <p className="text-[12px] text-[#555555] mt-0.5">
              Source Vouchers Total ≡ Allocation Engine Unfolded ≡ Unit Rollup Sum. Variance: $
              {consolPL.reconciliationDiff.toFixed(2)} (Tolerance: {state.config.tolerance})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[13px] font-bold text-[#051C2C]">
            {consolPL.auditVerdict}
          </span>
        </div>
      </div>

      {/* Dual Core Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Core: Consolidated P&L (7 cols) */}
        <div className="lg:col-span-7 app-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8E8E6]">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#2251FF]" />
                <h2 className="section-title text-[18px] font-semibold text-[#051C2C]">
                  Corporate Consolidated Income Statement
                </h2>
              </div>
              <span className="text-[11px] font-mono text-[#888888]">
                Statutory Reporting Level
              </span>
            </div>

            <div className="space-y-4">
              {/* Row: Operating Revenue */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/40 border border-emerald-100">
                <div>
                  <span className="text-[13px] font-bold text-[#051C2C] block">
                    1. Consolidated Operating Revenues
                  </span>
                  <span className="text-[11px] text-[#888888]">
                    Gross billing from all operating residential campuses
                  </span>
                </div>
                <span className="font-mono font-bold text-[16px] text-[#051C2C]">
                  ${consolPL.consolidatedRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Row: Direct Cost */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50/30 border border-blue-100">
                <div>
                  <span className="text-[13px] font-semibold text-[#051C2C] block">
                    2. Consolidated Direct Operating Expenses
                  </span>
                  <span className="text-[11px] text-[#888888]">
                    Nursing payroll, dietary food provisions, unit utilities, clinical PPE
                  </span>
                </div>
                <span className="font-mono font-semibold text-[15px] text-[#051C2C]">
                  -${consolPL.consolidatedDirectCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Subtotal: Contribution Margin */}
              <div className="flex items-center justify-between p-2.5 px-4 rounded-md bg-[#F5F5F2] border-l-4 border-[#051C2C]">
                <span className="text-[12px] font-bold text-[#051C2C]">
                  = Direct Contribution Margin
                </span>
                <span className="font-mono font-bold text-[14px] text-[#051C2C]">
                  ${consolPL.consolidatedContributionMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Row: Shared Overhead */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50/30 border border-purple-100">
                <div>
                  <span className="text-[13px] font-semibold text-[#051C2C] block">
                    3. Consolidated Shared Overhead & Logistics
                  </span>
                  <span className="text-[11px] text-[#888888]">
                    Corporate leadership, shared fleet vehicles, centralized EHR & cloud systems
                  </span>
                </div>
                <span className="font-mono font-semibold text-[15px] text-[#051C2C]">
                  -${consolPL.consolidatedSharedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Final Net Income */}
              <div className="p-4 rounded-xl bg-white border-2 border-[#051C2C] flex items-center justify-between shadow-sm">
                <div>
                  <span className="font-display font-bold text-[18px] text-[#051C2C] block leading-tight">
                    Consolidated Net Operating Income
                  </span>
                  <span className="text-[12px] text-[#888888]">
                    Operating Margin: {(consolPL.consolidatedProfitMargin * 100).toFixed(1)}% (Benchmark: {(state.config.targetMargin * 100).toFixed(1)}%)
                  </span>
                </div>
                <span className="font-mono font-bold text-[22px] text-[#2251FF]">
                  ${consolPL.consolidatedNetIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E8E8E6] text-[11px] text-[#888888] flex items-center justify-between">
            <span>Anti-Double Counting Model: Source vouchers queried directly</span>
            <span>Period: {selectedMonth}</span>
          </div>
        </div>

        {/* Right Core: 3-Way Reconciliation Audit Center (5 cols) */}
        <div className="lg:col-span-5 app-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8E8E6]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00C853]" />
                <h2 className="section-title text-[18px] font-semibold text-[#051C2C]">
                  Reconciliation Audit Center
                </h2>
              </div>
              <StatusBadge variant={consolPL.isBalanced ? 'success' : 'danger'} size="sm">
                {consolPL.isBalanced ? 'PASS' : 'FAIL'}
              </StatusBadge>
            </div>

            <p className="text-[12px] text-[#555555] mb-4">
              Mathematical cross-verification guaranteeing that all expenses recorded on original invoices precisely equal the amount allocated across facilities.
            </p>

            {/* Step-by-Step 3-Way Metrics */}
            <div className="space-y-3">
              {/* Box 1: Source */}
              <div className="p-3 rounded-lg border border-[#E8E8E6] bg-[#F5F5F2]/40">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#888888]">
                    A. Source Vouchers Expense Total
                  </span>
                  <span className="font-mono font-bold text-[14px] text-[#051C2C]">
                    ${consolPL.sourceTotalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-[10px] text-[#888888] mt-0.5">
                  Direct + Shared expense lines in 01_Transactions
                </p>
              </div>

              {/* Box 2: Engine */}
              <div className="p-3 rounded-lg border border-[#E8E8E6] bg-[#F5F5F2]/40">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#888888]">
                    B. Allocation Engine Expanded Sum
                  </span>
                  <span className="font-mono font-bold text-[14px] text-[#2251FF]">
                    ${consolPL.allocatedTotalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-[10px] text-[#888888] mt-0.5">
                  Unfolded records in 02_Allocation_Engine
                </p>
              </div>

              {/* Box 3: Rollup */}
              <div className="p-3 rounded-lg border border-[#E8E8E6] bg-[#F5F5F2]/40">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#888888]">
                    C. Unit P&L Horizontal Rollup
                  </span>
                  <span className="font-mono font-bold text-[14px] text-[#051C2C]">
                    ${consolPL.unitRollupExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-[10px] text-[#888888] mt-0.5">
                  Sum of Total Costs row across all facilities in 03_Unit_PL
                </p>
              </div>

              {/* Difference Result */}
              <div className="p-3 rounded-lg border-2 border-dashed border-[#E8E8E6] bg-white flex items-center justify-between">
                <div>
                  <span className="text-[12px] font-bold text-[#051C2C] block">
                    Three-Way Absolute Variance
                  </span>
                  <span className="text-[10px] text-[#888888]">
                    Formula: |A − B| + |B − C|
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-[16px] text-[#00C853]">
                    ${consolPL.reconciliationDiff.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-[#888888] block">Zero Leakage</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E8E8E6] text-[11px] text-[#888888]">
            Audit Certification: Pass tolerance &lt;= {state.config.tolerance}
          </div>
        </div>
      </div>
    </div>
  );
};
