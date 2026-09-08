import {
  AppState,
  AllocationRule,
  RuleSummary,
  Transaction,
  CalculatedTransaction,
  AllocationEngineRow,
  UnitPLStatement,
  ConsolidatedPLStatement,
  UnitRankingItem,
  Unit,
  Account,
} from '../types';

/**
 * Formula 1: Calculates Rule percentage totals and 100% balance validation.
 */
export function calculateRuleSummaries(
  rules: AllocationRule[],
  tolerance: number = 0.0001
): RuleSummary[] {
  const grouped: Record<string, AllocationRule[]> = {};
  for (const r of rules) {
    if (!grouped[r.ruleId]) {
      grouped[r.ruleId] = [];
    }
    grouped[r.ruleId].push(r);
  }

  const summaries: RuleSummary[] = [];

  for (const ruleId of Object.keys(grouped)) {
    const items = grouped[ruleId];
    const desc = items[0]?.ruleDesc || ruleId;
    const totalPercent = items.reduce((acc, curr) => acc + (curr.percent || 0), 0);
    const diff = totalPercent - 1;

    let status: 'OK' | 'Under' | 'Over' = 'OK';
    let statusText = `✅ Balanced (100.0%)`;

    if (Math.abs(diff) > tolerance) {
      if (diff < 0) {
        status = 'Under';
        statusText = `⚠️ Underallocated (${(totalPercent * 100).toFixed(1)}%)`;
      } else {
        status = 'Over';
        statusText = `❌ Overallocated (${(totalPercent * 100).toFixed(1)}%)`;
      }
    }

    summaries.push({
      ruleId,
      ruleDesc: desc,
      totalPercent,
      status,
      statusText,
      unitAllocations: items.map((i) => ({ unitId: i.targetUnit, percent: i.percent })),
    });
  }

  return summaries;
}

/**
 * Formula 2: Single-entry 7-fold compliance audit engine.
 */
export function validateTransaction(
  tx: Transaction,
  state: AppState,
  ruleSummaries: Map<string, RuleSummary>
): CalculatedTransaction {
  const dateStr = tx.date || '';
  const calcMonth = dateStr.length >= 7 ? dateStr.substring(0, 7) : 'Unknown';
  const txYear = dateStr ? new Date(dateStr).getFullYear() : 0;
  const targetYear = state.config.analysisYear;

  const acct = state.accounts.find((a) => a.code === tx.accountCode);
  const calcAccountName = acct ? acct.name : '⚠️ Unknown Account';
  const calcCategory = acct ? acct.category : 'Unknown';

  let alert = '✅ Validated';
  let isValid = true;

  if (tx.amount <= 0) {
    alert = '❌ Amount must be strictly greater than zero';
    isValid = false;
  } else if (txYear !== targetYear && !isNaN(txYear) && txYear !== 0) {
    alert = `⚠️ Fiscal Year Mismatch (Non-${targetYear} period)`;
    isValid = false;
  } else if (!acct) {
    alert = '❌ Account Code not defined in Setup dictionary';
    isValid = false;
  } else if (tx.costType === 'Direct') {
    if (!tx.directUnitId || tx.directUnitId.trim() === '') {
      alert = '❌ Direct item missing target Beneficiary Unit';
      isValid = false;
    } else if (tx.allocationRuleId && tx.allocationRuleId.trim() !== '') {
      alert = '❌ Direct cost must not specify an Allocation Rule';
      isValid = false;
    }
  } else if (tx.costType === 'Shared') {
    if (!tx.allocationRuleId || tx.allocationRuleId.trim() === '') {
      alert = '❌ Shared cost missing Allocation Rule ID';
      isValid = false;
    } else if (tx.directUnitId && tx.directUnitId.trim() !== '') {
      alert = '❌ Shared cost must not specify a Direct Unit ID';
      isValid = false;
    } else {
      const summary = ruleSummaries.get(tx.allocationRuleId);
      if (!summary) {
        alert = '❌ Associated Allocation Rule does not exist';
        isValid = false;
      } else if (summary.status !== 'OK') {
        alert = `❌ Associated Rule is not 100% balanced (${summary.statusText})`;
        isValid = false;
      }
    }

    if (calcCategory === 'Revenue') {
      alert = '❌ Revenue accounts cannot be set as Shared';
      isValid = false;
    }
  }

  return {
    ...tx,
    calcMonth,
    calcAccountName,
    calcCategory,
    calcAuditAlert: alert,
    isValid,
  };
}

/**
 * Formula 3: Allocation Engine expansion (1-to-1 Direct & 1-to-Many Shared).
 */
export function expandAllocations(
  calcTransactions: CalculatedTransaction[],
  rules: AllocationRule[]
): AllocationEngineRow[] {
  const rows: AllocationEngineRow[] = [];
  let seq = 1;

  for (const tx of calcTransactions) {
    if (!tx.isValid) continue;

    if (tx.costType === 'Direct') {
      rows.push({
        allocRowId: seq++,
        sourceTxId: tx.id,
        month: tx.calcMonth,
        unitId: tx.directUnitId || 'UNASSIGNED',
        accountCode: tx.accountCode,
        accountName: tx.calcAccountName,
        costType: 'Direct',
        appliedRate: 1.0,
        allocatedAmount: tx.amount,
      });
    } else if (tx.costType === 'Shared') {
      const matchedRules = rules.filter((r) => r.ruleId === tx.allocationRuleId);
      for (const r of matchedRules) {
        const amt = Math.round(tx.amount * r.percent * 100) / 100;
        rows.push({
          allocRowId: seq++,
          sourceTxId: tx.id,
          month: tx.calcMonth,
          unitId: r.targetUnit,
          accountCode: tx.accountCode,
          accountName: tx.calcAccountName,
          costType: 'Allocated Shared',
          appliedRate: r.percent,
          allocatedAmount: amt,
        });
      }
    }
  }

  return rows;
}

/**
 * Formula 4: Dynamic Unit P&L Contribution Statement Calculation.
 */
export function calculateUnitPL(
  month: string,
  units: Unit[],
  accounts: Account[],
  engineRows: AllocationEngineRow[],
  targetMargin: number
): UnitPLStatement {
  const activeUnits = units.filter((u) => u.status === 'Active').map((u) => u.id);

  // Filter rows by month
  const filteredRows =
    month === 'All-Year' ? engineRows : engineRows.filter((r) => r.month === month);

  // Categories
  const revAccounts = accounts.filter((a) => a.category === 'Revenue');
  const directAccounts = accounts.filter((a) => a.category === 'Direct Expense');
  const sharedAccounts = accounts.filter((a) => a.category === 'Shared Expense');

  const revenueByAccount: Record<string, Record<string, number>> = {};
  const directCostByAccount: Record<string, Record<string, number>> = {};
  const allocatedCostByAccount: Record<string, Record<string, number>> = {};

  const totalRevenue: Record<string, number> = {};
  const totalDirectCost: Record<string, number> = {};
  const totalAllocatedCost: Record<string, number> = {};
  const contributionMargin: Record<string, number> = {};
  const contributionMarginPct: Record<string, number> = {};
  const totalCost: Record<string, number> = {};
  const netIncome: Record<string, number> = {};
  const profitMargin: Record<string, number> = {};
  const healthAlert: Record<
    string,
    { status: 'excellent' | 'warning' | 'marginal' | 'deficit'; label: string }
  > = {};

  for (const u of activeUnits) {
    totalRevenue[u] = 0;
    totalDirectCost[u] = 0;
    totalAllocatedCost[u] = 0;
  }

  // Populate Revenue
  for (const acct of revAccounts) {
    revenueByAccount[acct.code] = {};
    for (const u of activeUnits) {
      const sum = filteredRows
        .filter((r) => r.unitId === u && r.accountCode === acct.code && r.costType === 'Direct')
        .reduce((acc, cur) => acc + cur.allocatedAmount, 0);
      revenueByAccount[acct.code][u] = sum;
      totalRevenue[u] += sum;
    }
  }

  // Populate Direct Expenses
  for (const acct of directAccounts) {
    directCostByAccount[acct.code] = {};
    for (const u of activeUnits) {
      const sum = filteredRows
        .filter((r) => r.unitId === u && r.accountCode === acct.code && r.costType === 'Direct')
        .reduce((acc, cur) => acc + cur.allocatedAmount, 0);
      directCostByAccount[acct.code][u] = sum;
      totalDirectCost[u] += sum;
    }
  }

  // Populate Allocated Shared Expenses
  for (const acct of sharedAccounts) {
    allocatedCostByAccount[acct.code] = {};
    for (const u of activeUnits) {
      const sum = filteredRows
        .filter(
          (r) => r.unitId === u && r.accountCode === acct.code && r.costType === 'Allocated Shared'
        )
        .reduce((acc, cur) => acc + cur.allocatedAmount, 0);
      allocatedCostByAccount[acct.code][u] = sum;
      totalAllocatedCost[u] += sum;
    }
  }

  // Calculate Margins and Health Indicators
  for (const u of activeUnits) {
    const rev = totalRevenue[u];
    const direct = totalDirectCost[u];
    const shared = totalAllocatedCost[u];

    const cMargin = rev - direct;
    const cMarginPct = rev > 0 ? cMargin / rev : 0;

    const tCost = direct + shared;
    const net = rev - tCost;
    const margin = rev > 0 ? net / rev : 0;

    contributionMargin[u] = cMargin;
    contributionMarginPct[u] = cMarginPct;
    totalCost[u] = tCost;
    netIncome[u] = net;
    profitMargin[u] = margin;

    if (margin >= targetMargin) {
      healthAlert[u] = { status: 'excellent', label: '🟢 Outstanding Performance' };
    } else if (margin >= targetMargin * 0.5) {
      healthAlert[u] = { status: 'warning', label: '🟡 On-Track (Watch Costs)' };
    } else if (margin >= 0) {
      healthAlert[u] = { status: 'marginal', label: '⚠️ Marginal Risk' };
    } else {
      healthAlert[u] = { status: 'deficit', label: '🔴 Operating Deficit (Action Required)' };
    }
  }

  return {
    month,
    units: activeUnits,
    revenueByAccount,
    totalRevenue,
    directCostByAccount,
    totalDirectCost,
    contributionMargin,
    contributionMarginPct,
    allocatedCostByAccount,
    totalAllocatedCost,
    totalCost,
    netIncome,
    profitMargin,
    healthAlert,
  };
}

/**
 * Formula 5: Consolidated Financial Statement & 3-Way Audit Center.
 */
export function calculateConsolidatedPL(
  month: string,
  calcTransactions: CalculatedTransaction[],
  engineRows: AllocationEngineRow[],
  unitPL: UnitPLStatement,
  tolerance: number = 0.0001
): ConsolidatedPLStatement {
  const validTx = calcTransactions.filter((tx) => tx.isValid);
  const periodTx =
    month === 'All-Year' ? validTx : validTx.filter((tx) => tx.calcMonth === month);

  // Consolidated Statement (Direct from source transactions to prevent double counting!)
  const consolidatedRevenue = periodTx
    .filter((tx) => tx.calcCategory === 'Revenue')
    .reduce((acc, cur) => acc + cur.amount, 0);

  const consolidatedDirectCost = periodTx
    .filter((tx) => tx.costType === 'Direct' && tx.calcCategory === 'Direct Expense')
    .reduce((acc, cur) => acc + cur.amount, 0);

  const consolidatedContributionMargin = consolidatedRevenue - consolidatedDirectCost;

  const consolidatedSharedCost = periodTx
    .filter((tx) => tx.costType === 'Shared' && tx.calcCategory === 'Shared Expense')
    .reduce((acc, cur) => acc + cur.amount, 0);

  const consolidatedNetIncome =
    consolidatedRevenue - (consolidatedDirectCost + consolidatedSharedCost);

  const consolidatedProfitMargin =
    consolidatedRevenue > 0 ? consolidatedNetIncome / consolidatedRevenue : 0;

  // 3-Way Reconciliation Controls
  // 1. Source Expenses (all non-revenue vouchers)
  const sourceTotalExpense = periodTx
    .filter((tx) => tx.calcCategory !== 'Revenue')
    .reduce((acc, cur) => acc + cur.amount, 0);

  // 2. Engine Unfolded Expenses
  const periodEngine =
    month === 'All-Year' ? engineRows : engineRows.filter((r) => r.month === month);
  const allocatedTotalExpense = periodEngine
    .filter((r) => r.accountCode.startsWith('EXP'))
    .reduce((acc, cur) => acc + cur.allocatedAmount, 0);

  // 3. Unit P&L Rollup Expenses (sum across all units)
  const unitRollupExpense = Object.values(unitPL.totalCost).reduce((a, b) => a + b, 0);

  // Discrepancy checks: |Source - Engine| + |Engine - Rollup|
  const diff1 = Math.abs(sourceTotalExpense - allocatedTotalExpense);
  const diff2 = Math.abs(allocatedTotalExpense - unitRollupExpense);
  const reconciliationDiff = Math.round((diff1 + diff2) * 100) / 100;

  const isBalanced = reconciliationDiff <= tolerance;
  const auditVerdict = isBalanced
    ? '🟢 100% Balanced (Zero Double-Count / Zero Leakage)'
    : `🔴 Audit Variance Detected: $${reconciliationDiff.toLocaleString()} (Needs Review)`;

  return {
    month,
    consolidatedRevenue,
    consolidatedDirectCost,
    consolidatedContributionMargin,
    consolidatedSharedCost,
    consolidatedNetIncome,
    consolidatedProfitMargin,
    sourceTotalExpense,
    allocatedTotalExpense,
    unitRollupExpense,
    reconciliationDiff,
    isBalanced,
    auditVerdict,
  };
}

/**
 * Formula 6: Executive Dashboard Ranking Matrix and Insights.
 */
export function calculateDashboardRankings(
  unitPL: UnitPLStatement,
  units: Unit[]
): {
  rankings: UnitRankingItem[];
  topUnit: UnitRankingItem | null;
  bottomUnit: UnitRankingItem | null;
} {
  const items: UnitRankingItem[] = [];

  for (const uId of unitPL.units) {
    const unitObj = units.find((u) => u.id === uId);
    const uName = unitObj ? unitObj.name : uId;
    const rev = unitPL.totalRevenue[uId] || 0;
    const direct = unitPL.totalDirectCost[uId] || 0;
    const shared = unitPL.totalAllocatedCost[uId] || 0;
    const total = unitPL.totalCost[uId] || 0;
    const net = unitPL.netIncome[uId] || 0;
    const margin = unitPL.profitMargin[uId] || 0;
    const burden = total > 0 ? shared / total : 0;
    const health = unitPL.healthAlert[uId] || {
      status: 'marginal',
      label: '⚠️ Marginal Risk',
    };

    items.push({
      rank: 0,
      unitId: uId,
      unitName: uName,
      revenue: rev,
      directCost: direct,
      allocatedCost: shared,
      totalCost: total,
      netIncome: net,
      profitMargin: margin,
      burdenRatio: burden,
      healthStatus: health.status,
      healthLabel: health.label,
    });
  }

  // Sort descending by profitMargin
  items.sort((a, b) => b.profitMargin - a.profitMargin);

  items.forEach((item, index) => {
    item.rank = index + 1;
  });

  const topUnit = items.length > 0 ? items[0] : null;
  const bottomUnit = items.length > 0 ? items[items.length - 1] : null;

  return {
    rankings: items,
    topUnit,
    bottomUnit,
  };
}
