export type CostType = 'Direct' | 'Shared';
export type AccountCategory = 'Revenue' | 'Direct Expense' | 'Shared Expense';
export type UnitStatus = 'Active' | 'Inactive';

export interface SystemConfig {
  currencySymbol: string;
  targetMargin: number; // e.g. 0.15 for 15%
  tolerance: number;    // e.g. 0.0001
  analysisYear: number; // e.g. 2026
  suspenseUnit: string; // e.g. 'UNASSIGNED'
}

export interface Unit {
  id: string;          // e.g. 'UNIT-A'
  name: string;        // e.g. 'Downtown Campus'
  status: UnitStatus;  // 'Active' | 'Inactive'
  capacityBeds?: number;
}

export interface Account {
  code: string;        // e.g. 'REV-101'
  name: string;        // e.g. 'Resident Monthly Care Fees'
  category: AccountCategory;
  guidance: string;    // Operational notes
}

export interface AllocationRule {
  rowId: string;       // Unique ID for rule row
  ruleId: string;      // e.g. 'VEH-001'
  ruleDesc: string;    // e.g. '3-Location Fleet Van Sharing'
  targetUnit: string;  // e.g. 'UNIT-A'
  percent: number;     // e.g. 0.40 for 40%
}

export interface RuleSummary {
  ruleId: string;
  ruleDesc: string;
  totalPercent: number;
  status: 'OK' | 'Under' | 'Over';
  statusText: string;
  unitAllocations: { unitId: string; percent: number }[];
}

export interface Transaction {
  id: string;          // e.g. 'TX-2026-0001'
  date: string;        // YYYY-MM-DD
  accountCode: string; // references Account.code
  description: string;
  costType: CostType;  // 'Direct' | 'Shared'
  amount: number;      // positive amount
  directUnitId?: string; // required if Direct
  allocationRuleId?: string; // required if Shared
}

export interface CalculatedTransaction extends Transaction {
  calcMonth: string;         // YYYY-MM
  calcAccountName: string;
  calcCategory: AccountCategory | 'Unknown';
  calcAuditAlert: string;    // audit verdict message
  isValid: boolean;          // true if passes all 7 checks
}

export interface AllocationEngineRow {
  allocRowId: number;        // sequential 1, 2, 3...
  sourceTxId: string;        // Tx_ID
  month: string;             // YYYY-MM
  unitId: string;            // target unit code
  accountCode: string;
  accountName: string;
  costType: 'Direct' | 'Allocated Shared';
  appliedRate: number;       // 1.0 or rule percent
  allocatedAmount: number;   // calculated final amount
}

export interface UnitPLStatement {
  month: string;             // 'All-Year' or 'YYYY-MM'
  units: string[];           // Active unit IDs
  revenueByAccount: Record<string, Record<string, number>>; // accountCode -> { unitId: amount }
  totalRevenue: Record<string, number>; // unitId -> amount
  
  directCostByAccount: Record<string, Record<string, number>>; // accountCode -> { unitId: amount }
  totalDirectCost: Record<string, number>; // unitId -> amount
  
  contributionMargin: Record<string, number>; // unitId -> amount
  contributionMarginPct: Record<string, number>; // unitId -> ratio
  
  allocatedCostByAccount: Record<string, Record<string, number>>; // accountCode -> { unitId: amount }
  totalAllocatedCost: Record<string, number>; // unitId -> amount
  
  totalCost: Record<string, number>; // unitId -> amount (Direct + Allocated)
  netIncome: Record<string, number>; // unitId -> amount
  profitMargin: Record<string, number>; // unitId -> ratio
  healthAlert: Record<string, { status: 'excellent' | 'warning' | 'marginal' | 'deficit'; label: string }>;
}

export interface ConsolidatedPLStatement {
  month: string;
  consolidatedRevenue: number;
  consolidatedDirectCost: number;
  consolidatedContributionMargin: number;
  consolidatedSharedCost: number;
  consolidatedNetIncome: number;
  consolidatedProfitMargin: number;
  
  // 3-Way Reconciliation
  sourceTotalExpense: number;
  allocatedTotalExpense: number;
  unitRollupExpense: number;
  reconciliationDiff: number;
  isBalanced: boolean;
  auditVerdict: string;
}

export interface UnitRankingItem {
  rank: number;
  unitId: string;
  unitName: string;
  revenue: number;
  directCost: number;
  allocatedCost: number;
  totalCost: number;
  netIncome: number;
  profitMargin: number;
  burdenRatio: number; // allocatedCost / totalCost
  healthStatus: 'excellent' | 'warning' | 'marginal' | 'deficit';
  healthLabel: string;
}

export interface AppState {
  config: SystemConfig;
  units: Unit[];
  accounts: Account[];
  rules: AllocationRule[];
  transactions: Transaction[];
  lastSaved: string; // ISO string
}
