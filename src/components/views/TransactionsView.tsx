import React, { useState, useMemo } from 'react';
import {
  ArrowRightLeft,
  Search,
  Filter,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Download,
  Info,
  Layers,
} from 'lucide-react';
import {
  AppState,
  Transaction,
  CalculatedTransaction,
  RuleSummary,
} from '../../types';
import { StatusBadge } from '../StatusBadge';

interface TransactionsViewProps {
  state: AppState;
  calcTransactions: CalculatedTransaction[];
  ruleSummaries: RuleSummary[];
  onUpdateTransactions: (transactions: Transaction[]) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  state,
  calcTransactions,
  ruleSummaries,
  onUpdateTransactions,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [selectedCostType, setSelectedCostType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // New Transaction Form State
  const [newDate, setNewDate] = useState('2026-03-15');
  const [newAcctCode, setNewAcctCode] = useState(state.accounts[0]?.code || 'REV-101');
  const [newDesc, setNewDesc] = useState('');
  const [newCostType, setNewCostType] = useState<'Direct' | 'Shared'>('Direct');
  const [newAmount, setNewAmount] = useState('5000');
  const [newDirectUnit, setNewDirectUnit] = useState(state.units[0]?.id || 'UNIT-A');
  const [newRuleId, setNewRuleId] = useState(ruleSummaries[0]?.ruleId || 'VEH-001');

  // Extract unique months
  const uniqueMonths = useMemo(() => {
    const set = new Set<string>();
    calcTransactions.forEach((tx) => {
      if (tx.calcMonth && tx.calcMonth !== 'Unknown') {
        set.add(tx.calcMonth);
      }
    });
    return Array.from(set).sort();
  }, [calcTransactions]);

  // Filtered transactions
  const filtered = useMemo(() => {
    return calcTransactions.filter((tx) => {
      if (selectedMonth !== 'All' && tx.calcMonth !== selectedMonth) return false;
      if (selectedCostType !== 'All' && tx.costType !== selectedCostType) return false;
      if (selectedStatus === 'Valid' && !tx.isValid) return false;
      if (selectedStatus === 'Invalid' && tx.isValid) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchId = tx.id.toLowerCase().includes(term);
        const matchDesc = tx.description.toLowerCase().includes(term);
        const matchAcct = tx.accountCode.toLowerCase().includes(term);
        const matchName = tx.calcAccountName.toLowerCase().includes(term);
        const matchUnit = tx.directUnitId?.toLowerCase().includes(term);
        const matchRule = tx.allocationRuleId?.toLowerCase().includes(term);
        if (!matchId && !matchDesc && !matchAcct && !matchName && !matchUnit && !matchRule) {
          return false;
        }
      }
      return true;
    });
  }, [calcTransactions, searchTerm, selectedMonth, selectedCostType, selectedStatus]);

  // Inline Cell Update Handler
  const handleCellUpdate = (id: string, field: keyof Transaction, val: any) => {
    const updated = state.transactions.map((tx) => {
      if (tx.id === id) {
        const nextTx = { ...tx, [field]: val };
        // If switching to Direct, clear rule ID; if Shared, clear unit ID
        if (field === 'costType') {
          if (val === 'Direct') {
            nextTx.allocationRuleId = undefined;
            if (!nextTx.directUnitId) nextTx.directUnitId = state.units[0]?.id;
          } else {
            nextTx.directUnitId = undefined;
            if (!nextTx.allocationRuleId) nextTx.allocationRuleId = ruleSummaries[0]?.ruleId;
          }
        }
        return nextTx;
      }
      return tx;
    });
    onUpdateTransactions(updated);
  };

  const handleDelete = (id: string) => {
    onUpdateTransactions(state.transactions.filter((tx) => tx.id !== id));
  };

  const handleAddTransaction = () => {
    const amt = parseFloat(newAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a positive numeric amount.');
      return;
    }

    const nextId = `TX-${newDate.slice(0, 4)}-${String(state.transactions.length + 1).padStart(4, '0')}`;
    const newTx: Transaction = {
      id: nextId,
      date: newDate,
      accountCode: newAcctCode,
      description: newDesc.trim() || 'General Operating Expense',
      costType: newCostType,
      amount: amt,
      directUnitId: newCostType === 'Direct' ? newDirectUnit : undefined,
      allocationRuleId: newCostType === 'Shared' ? newRuleId : undefined,
    };

    onUpdateTransactions([...state.transactions, newTx]);
    setNewDesc('');
  };

  const handleExportCSV = () => {
    const headers = 'Tx_ID,Tx_Date,Tx_Account_Code,Tx_Description,Tx_Cost_Type,Tx_Amount,Tx_Direct_Unit_ID,Tx_Allocation_Rule_ID,Calc_Month,Account_Name,Category,Audit_Alert';
    const lines = filtered.map((tx) =>
      [
        tx.id,
        tx.date,
        tx.accountCode,
        `"${tx.description.replace(/"/g, '""')}"`,
        tx.costType,
        tx.amount,
        tx.directUnitId || '',
        tx.allocationRuleId || '',
        tx.calcMonth,
        `"${tx.calcAccountName}"`,
        tx.calcCategory,
        `"${tx.calcAuditAlert}"`,
      ].join(',')
    );
    const content = 'data:text/csv;charset=utf-8,' + encodeURIComponent([headers, ...lines].join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', content);
    link.setAttribute('download', `transactions_export_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const invalidCount = calcTransactions.filter((tx) => !tx.isValid).length;
  const totalAmount = filtered.reduce((acc, cur) => acc + (cur.amount || 0), 0);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-[28px] font-semibold text-[#051C2C] tracking-tight">
            01_Transactions: Operational Voucher Journal
          </h1>
          <p className="text-[13px] text-[#888888] mt-1">
            Single-entry journal for all facility operations. Yellow cells indicate editable fields. Formulas evaluate in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-white hover:bg-gray-50 border border-[#E8E8E6] text-[12px] font-medium text-[#051C2C] cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-[#051C2C]" />
            Export Filtered CSV
          </button>
        </div>
      </div>

      {/* Operational Policy Insight */}
      <div className="insight-block">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#2251FF] shrink-0 mt-0.5" />
          <div className="text-[12px] text-[#051C2C] leading-relaxed">
            <strong>Single-Entry Shared Cost Rule:</strong> Enter shared multi-location invoices once (e.g. $8,500 fleet van maintenance). Select <span className="font-semibold text-[#2251FF]">Cost_Type = Shared</span> and specify an Allocation Rule ID. The calculation engine (<span className="font-mono">02_Allocation_Engine</span>) will automatically split and apportion costs across beneficiary units, eliminating double-counting.
          </div>
        </div>
      </div>

      {/* Filter and KPI bar */}
      <div className="app-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-[#888888] absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search description, ID, unit, rule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-[12px] rounded-md border border-[#E8E8E6] bg-white focus:outline-none focus:ring-1 focus:ring-[#2251FF]"
            />
          </div>

          {/* Month Filter */}
          <div className="flex items-center gap-1 text-[12px] text-[#051C2C]">
            <span className="text-[#888888] text-[11px] uppercase font-semibold">Period:</span>
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

          {/* Cost Type Filter */}
          <div className="flex items-center gap-1 text-[12px] text-[#051C2C]">
            <span className="text-[#888888] text-[11px] uppercase font-semibold">Cost Type:</span>
            <select
              value={selectedCostType}
              onChange={(e) => setSelectedCostType(e.target.value)}
              className="px-2.5 py-1.5 text-[12px] rounded-md border border-[#E8E8E6] bg-white cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Direct">Direct Only</option>
              <option value="Shared">Shared Only</option>
            </select>
          </div>

          {/* Audit Status Filter */}
          <div className="flex items-center gap-1 text-[12px] text-[#051C2C]">
            <span className="text-[#888888] text-[11px] uppercase font-semibold">Audit Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 text-[12px] rounded-md border border-[#E8E8E6] bg-white cursor-pointer"
            >
              <option value="All">All Vouchers ({calcTransactions.length})</option>
              <option value="Valid">Valid Only ({calcTransactions.length - invalidCount})</option>
              <option value="Invalid">Audit Issues ({invalidCount})</option>
            </select>
          </div>
        </div>

        {/* Aggregate Status Indicator */}
        <div className="flex items-center gap-4 text-[12px] border-l border-[#E8E8E6] pl-4">
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#888888] block">Showing Vouchers</span>
            <span className="font-mono font-bold text-[#051C2C]">
              {filtered.length} / {calcTransactions.length}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#888888] block">Total Amount</span>
            <span className="font-mono font-bold text-[#051C2C]">
              ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          {invalidCount > 0 && (
            <div className="bg-[#D32F2F]/10 px-2.5 py-1 rounded text-[#D32F2F] font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{invalidCount} Audit Issue{invalidCount > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Fast Append Row Bar */}
      <div className="app-card p-4 bg-[#F5F5F2]/40 border border-[#E8E8E6]">
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#051C2C] mb-2">
          Add New Operational Voucher
        </span>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
          {/* Date */}
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="md:col-span-2 cell-editable px-2 py-1.5 text-[12px] font-mono"
          />

          {/* Account Code */}
          <select
            value={newAcctCode}
            onChange={(e) => setNewAcctCode(e.target.value)}
            className="md:col-span-2 cell-editable px-2 py-1.5 text-[12px]"
          >
            {state.accounts.map((a) => (
              <option key={a.code} value={a.code}>
                {a.code} - {a.name}
              </option>
            ))}
          </select>

          {/* Description */}
          <input
            type="text"
            placeholder="Operational summary description..."
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="md:col-span-3 cell-editable px-2 py-1.5 text-[12px]"
          />

          {/* Cost Type */}
          <select
            value={newCostType}
            onChange={(e: any) => setNewCostType(e.target.value)}
            className="md:col-span-1 cell-editable px-2 py-1.5 text-[12px] font-semibold"
          >
            <option value="Direct">Direct</option>
            <option value="Shared">Shared</option>
          </select>

          {/* Amount */}
          <input
            type="number"
            placeholder="Amount"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            className="md:col-span-2 cell-editable px-2 py-1.5 text-[12px] font-mono text-right"
          />

          {/* Target Unit (if Direct) or Rule ID (if Shared) */}
          {newCostType === 'Direct' ? (
            <select
              value={newDirectUnit}
              onChange={(e) => setNewDirectUnit(e.target.value)}
              className="md:col-span-1 cell-editable px-1 py-1.5 text-[12px] font-mono"
            >
              {state.units
                .filter((u) => u.status === 'Active')
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.id}
                  </option>
                ))}
            </select>
          ) : (
            <select
              value={newRuleId}
              onChange={(e) => setNewRuleId(e.target.value)}
              className="md:col-span-1 cell-editable px-1 py-1.5 text-[12px] font-mono text-[#2251FF] font-semibold"
            >
              {ruleSummaries.map((s) => (
                <option key={s.ruleId} value={s.ruleId}>
                  {s.ruleId}
                </option>
              ))}
            </select>
          )}

          {/* Submit */}
          <button
            onClick={handleAddTransaction}
            className="md:col-span-1 flex items-center justify-center rounded-md bg-[#2251FF] text-white hover:bg-[#1a40d6] transition-colors cursor-pointer"
            title="Append Transaction"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Journal Data Table */}
      <div className="app-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr>
                {/* Manual Input Zone */}
                <th className="table-head-cell">Tx ID</th>
                <th className="table-head-cell">Date</th>
                <th className="table-head-cell">Account</th>
                <th className="table-head-cell">Description</th>
                <th className="table-head-cell text-center">Cost Type</th>
                <th className="table-head-cell text-right">Amount</th>
                <th className="table-head-cell text-center">Direct Unit</th>
                <th className="table-head-cell text-center">Alloc Rule</th>

                {/* Auto Calculated Zone */}
                <th className="table-head-cell text-center bg-[#F5F5F2]">Month</th>
                <th className="table-head-cell bg-[#F5F5F2]">Account Name</th>
                <th className="table-head-cell bg-[#F5F5F2]">Category</th>
                <th className="table-head-cell bg-[#F5F5F2]">Audit Alert</th>
                <th className="table-head-cell text-center w-10">Act</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E8E6]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={13} className="p-8 text-center text-[#888888]">
                    No transactions found matching current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr
                    key={tx.id}
                    className={`hover:bg-[#F5F5F2]/60 transition-colors ${
                      !tx.isValid ? 'bg-red-50/40' : ''
                    }`}
                  >
                    {/* Tx ID */}
                    <td className="p-2.5 font-mono font-bold text-[#051C2C] whitespace-nowrap">
                      {tx.id}
                    </td>

                    {/* Date */}
                    <td className="p-2 whitespace-nowrap">
                      <input
                        type="date"
                        value={tx.date}
                        onChange={(e) => handleCellUpdate(tx.id, 'date', e.target.value)}
                        className="cell-editable px-2 py-0.5 text-[11px] font-mono"
                      />
                    </td>

                    {/* Account Code */}
                    <td className="p-2 whitespace-nowrap">
                      <select
                        value={tx.accountCode}
                        onChange={(e) => handleCellUpdate(tx.id, 'accountCode', e.target.value)}
                        className="cell-editable px-1.5 py-0.5 text-[11px] font-mono font-semibold"
                      >
                        {state.accounts.map((a) => (
                          <option key={a.code} value={a.code}>
                            {a.code}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Description */}
                    <td className="p-2 min-w-[200px]">
                      <input
                        type="text"
                        value={tx.description}
                        onChange={(e) => handleCellUpdate(tx.id, 'description', e.target.value)}
                        className="cell-editable w-full px-2 py-0.5 text-[12px]"
                      />
                    </td>

                    {/* Cost Type */}
                    <td className="p-2 text-center whitespace-nowrap">
                      <select
                        value={tx.costType}
                        onChange={(e: any) => handleCellUpdate(tx.id, 'costType', e.target.value)}
                        className={`cell-editable px-1.5 py-0.5 text-[11px] font-semibold ${
                          tx.costType === 'Shared' ? 'text-[#2251FF]' : 'text-[#051C2C]'
                        }`}
                      >
                        <option value="Direct">Direct</option>
                        <option value="Shared">Shared</option>
                      </select>
                    </td>

                    {/* Amount */}
                    <td className="p-2 text-right whitespace-nowrap">
                      <input
                        type="number"
                        step="100"
                        value={tx.amount}
                        onChange={(e) => handleCellUpdate(tx.id, 'amount', parseFloat(e.target.value) || 0)}
                        className="cell-editable w-24 px-1.5 py-0.5 text-[12px] font-mono text-right font-semibold"
                      />
                    </td>

                    {/* Direct Unit ID */}
                    <td className="p-2 text-center whitespace-nowrap">
                      {tx.costType === 'Direct' ? (
                        <select
                          value={tx.directUnitId || ''}
                          onChange={(e) => handleCellUpdate(tx.id, 'directUnitId', e.target.value)}
                          className="cell-editable px-1.5 py-0.5 text-[11px] font-mono font-semibold text-[#051C2C]"
                        >
                          <option value="">Select Unit</option>
                          {state.units
                            .filter((u) => u.status === 'Active')
                            .map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.id}
                              </option>
                            ))}
                        </select>
                      ) : (
                        <span className="text-[#888888] font-mono text-[11px] italic">-</span>
                      )}
                    </td>

                    {/* Allocation Rule ID */}
                    <td className="p-2 text-center whitespace-nowrap">
                      {tx.costType === 'Shared' ? (
                        <select
                          value={tx.allocationRuleId || ''}
                          onChange={(e) => handleCellUpdate(tx.id, 'allocationRuleId', e.target.value)}
                          className="cell-editable px-1.5 py-0.5 text-[11px] font-mono font-semibold text-[#2251FF]"
                        >
                          <option value="">Select Rule</option>
                          {ruleSummaries.map((s) => (
                            <option key={s.ruleId} value={s.ruleId}>
                              {s.ruleId}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-[#888888] font-mono text-[11px] italic">-</span>
                      )}
                    </td>

                    {/* Calculated Month */}
                    <td className="p-2.5 text-center font-mono text-[11px] text-[#555555] bg-[#F5F5F2]/40 whitespace-nowrap">
                      {tx.calcMonth}
                    </td>

                    {/* Calculated Account Name */}
                    <td className="p-2.5 text-[11px] text-[#051C2C] bg-[#F5F5F2]/40 truncate max-w-[160px]" title={tx.calcAccountName}>
                      {tx.calcAccountName}
                    </td>

                    {/* Calculated Category */}
                    <td className="p-2.5 text-[11px] bg-[#F5F5F2]/40 whitespace-nowrap">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          tx.calcCategory === 'Revenue'
                            ? 'bg-emerald-50 text-emerald-800'
                            : tx.calcCategory === 'Direct Expense'
                            ? 'bg-blue-50 text-blue-800'
                            : 'bg-purple-50 text-purple-800'
                        }`}
                      >
                        {tx.calcCategory}
                      </span>
                    </td>

                    {/* Audit Alert */}
                    <td className="p-2.5 bg-[#F5F5F2]/40 whitespace-nowrap">
                      <StatusBadge variant={tx.isValid ? 'success' : 'danger'} size="sm">
                        {tx.calcAuditAlert}
                      </StatusBadge>
                    </td>

                    {/* Action */}
                    <td className="p-2 text-center">
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="text-[#888888] hover:text-[#D32F2F] p-1 rounded transition-colors cursor-pointer"
                        title="Delete voucher"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
