import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { AllocationEngineRow, AppState } from '../../types';
import { StatusBadge } from '../StatusBadge';

interface AllocationEngineViewProps {
  state: AppState;
  engineRows: AllocationEngineRow[];
  sourceTotal: number;
  engineTotal: number;
  tolerance: number;
}

export const AllocationEngineView: React.FC<AllocationEngineViewProps> = ({
  state,
  engineRows,
  sourceTotal,
  engineTotal,
  tolerance,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [selectedUnit, setSelectedUnit] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Extract unique months
  const uniqueMonths = useMemo(() => {
    const set = new Set<string>();
    engineRows.forEach((r) => set.add(r.month));
    return Array.from(set).sort();
  }, [engineRows]);

  // Reconciliation diff
  const diff = Math.abs(sourceTotal - engineTotal);
  const isEngineBalanced = diff <= tolerance;

  // Filtered rows
  const filteredRows = useMemo(() => {
    return engineRows.filter((r) => {
      if (selectedMonth !== 'All' && r.month !== selectedMonth) return false;
      if (selectedUnit !== 'All' && r.unitId !== selectedUnit) return false;
      if (selectedType !== 'All' && r.costType !== selectedType) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchTx = r.sourceTxId.toLowerCase().includes(term);
        const matchUnit = r.unitId.toLowerCase().includes(term);
        const matchAcct = r.accountCode.toLowerCase().includes(term);
        const matchName = r.accountName.toLowerCase().includes(term);
        if (!matchTx && !matchUnit && !matchAcct && !matchName) return false;
      }
      return true;
    });
  }, [engineRows, selectedMonth, selectedUnit, selectedType, searchTerm]);

  const filteredSum = filteredRows.reduce((acc, cur) => acc + cur.allocatedAmount, 0);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header with Top-Right Source-to-Allocated Self-Reconciliation Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-[28px] font-semibold text-[#051C2C] tracking-tight">
            02_Allocation_Engine: Dynamic Array Calculation Engine
          </h1>
          <p className="text-[13px] text-[#888888] mt-1">
            System computation layer. Automatically splits 1-to-Many shared costs into granular unit records with full mathematical audit trail.
          </p>
        </div>

        {/* Top-Right Self-Reconciliation Indicator (L2:L4 equivalent) */}
        <div className="app-card p-3.5 bg-white border border-[#E8E8E6] flex items-center gap-6 shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#888888] block">
              Source Vouchers Inflow
            </span>
            <span className="font-mono text-[14px] font-bold text-[#051C2C]">
              ${sourceTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-[#888888]" />
          <div>
            <span className="text-[10px] uppercase font-bold text-[#888888] block">
              Engine Unfolded Total
            </span>
            <span className="font-mono text-[14px] font-bold text-[#2251FF]">
              ${engineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#888888] block">
              Engine Status
            </span>
            <StatusBadge variant={isEngineBalanced ? 'success' : 'danger'} size="sm">
              {isEngineBalanced ? '✅ 100% Self-Balanced' : `❌ Variance $${diff.toFixed(2)}`}
            </StatusBadge>
          </div>
        </div>
      </div>

      {/* Insight explanation */}
      <div className="insight-block">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#2251FF] shrink-0 mt-0.5" />
          <div className="text-[12px] text-[#051C2C] leading-relaxed">
            <strong>Immutable Computation Pipeline:</strong> Each row below is dynamically projected from validated vouchers in <span className="font-mono">01_Transactions</span>. Shared items retain their original <span className="font-mono font-semibold">Tx_ID</span> for complete audit drill-down, so financial managers can trace each cost to its source invoice and applied allocation percentage.
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="app-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-[#888888] absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search Tx ID, Unit, Account..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-[12px] rounded-md border border-[#E8E8E6] bg-white focus:outline-none focus:ring-1 focus:ring-[#2251FF]"
            />
          </div>

          {/* Month Filter */}
          <div className="flex items-center gap-1 text-[12px] text-[#051C2C]">
            <span className="text-[#888888] text-[11px] uppercase font-semibold">Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-2.5 py-1.5 text-[12px] font-mono rounded-md border border-[#E8E8E6] bg-white cursor-pointer"
            >
              <option value="All">All Months ({uniqueMonths.length})</option>
              {uniqueMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Unit Filter */}
          <div className="flex items-center gap-1 text-[12px] text-[#051C2C]">
            <span className="text-[#888888] text-[11px] uppercase font-semibold">Target Unit:</span>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="px-2.5 py-1.5 text-[12px] font-mono rounded-md border border-[#E8E8E6] bg-white cursor-pointer"
            >
              <option value="All">All Facilities</option>
              {state.units
                .filter((u) => u.status === 'Active')
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.id} ({u.name})
                  </option>
                ))}
            </select>
          </div>

          {/* Cost Type Filter */}
          <div className="flex items-center gap-1 text-[12px] text-[#051C2C]">
            <span className="text-[#888888] text-[11px] uppercase font-semibold">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-2.5 py-1.5 text-[12px] rounded-md border border-[#E8E8E6] bg-white cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Direct">Direct Only</option>
              <option value="Allocated Shared">Allocated Shared Only</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[12px] border-l border-[#E8E8E6] pl-4">
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#888888] block">Expanded Rows</span>
            <span className="font-mono font-bold text-[#051C2C]">
              {filteredRows.length} / {engineRows.length}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#888888] block">Filtered Sum</span>
            <span className="font-mono font-bold text-[#2251FF]">
              ${filteredSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Engine Expanded Table */}
      <div className="app-card overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-[12px]">
            <thead className="sticky top-0 bg-white shadow-sm">
              <tr>
                <th className="table-head-cell">Row #</th>
                <th className="table-head-cell">Source Tx ID</th>
                <th className="table-head-cell text-center">Period</th>
                <th className="table-head-cell text-center">Beneficiary Unit</th>
                <th className="table-head-cell">Account</th>
                <th className="table-head-cell">Account Description</th>
                <th className="table-head-cell text-center">Cost Nature</th>
                <th className="table-head-cell text-right">Applied Rate</th>
                <th className="table-head-cell text-right">Allocated Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E8E6]">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-[#888888]">
                    No allocated records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.allocRowId} className="hover:bg-[#F5F5F2]/60 transition-colors">
                    <td className="p-2.5 font-mono text-[11px] text-[#888888] text-center w-12">
                      {String(row.allocRowId).padStart(5, '0')}
                    </td>
                    <td className="p-2.5 font-mono font-bold text-[#051C2C] whitespace-nowrap">
                      {row.sourceTxId}
                    </td>
                    <td className="p-2.5 text-center font-mono text-[11px] text-[#555555] whitespace-nowrap">
                      {row.month}
                    </td>
                    <td className="p-2.5 text-center font-mono font-semibold text-[#051C2C] whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200">
                        {row.unitId}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono font-semibold text-[11px] text-[#051C2C] whitespace-nowrap">
                      {row.accountCode}
                    </td>
                    <td className="p-2.5 text-[12px] text-[#051C2C] font-medium">
                      {row.accountName}
                    </td>
                    <td className="p-2.5 text-center whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          row.costType === 'Direct'
                            ? 'bg-blue-50 text-blue-800'
                            : 'bg-purple-50 text-purple-800'
                        }`}
                      >
                        {row.costType}
                      </span>
                    </td>
                    <td className="p-2.5 text-right font-mono text-[12px] text-[#555555] whitespace-nowrap">
                      {(row.appliedRate * 100).toFixed(1)}%
                    </td>
                    <td className="p-2.5 text-right font-mono font-semibold text-[#051C2C] text-[13px] whitespace-nowrap">
                      ${row.allocatedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
