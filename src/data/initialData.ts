import { AppState } from '../types';

export const initialData: AppState = {
  config: {
    currencySymbol: '$',
    targetMargin: 0.15, // 15% benchmark
    tolerance: 0.0001,
    analysisYear: 2026,
    suspenseUnit: 'UNASSIGNED',
  },
  units: [
    { id: 'UNIT-A', name: 'Downtown Campus', status: 'Active', capacityBeds: 80 },
    { id: 'UNIT-B', name: 'Westside Memory Care', status: 'Active', capacityBeds: 55 },
    { id: 'UNIT-C', name: 'North Hills Assisted Living', status: 'Active', capacityBeds: 90 },
    { id: 'UNIT-D', name: 'Sunnyvale Garden Villa', status: 'Active', capacityBeds: 60 },
  ],
  accounts: [
    {
      code: 'REV-101',
      name: 'Resident Monthly Care & Housing',
      category: 'Revenue',
      guidance: 'Standard monthly recurring service and room fees billed to residents.',
    },
    {
      code: 'REV-102',
      name: 'Specialized Memory Care Programs',
      category: 'Revenue',
      guidance: 'Supplemental charges for high-acuity dementia and behavioral care services.',
    },
    {
      code: 'REV-103',
      name: 'Ancillary Therapy & Personal Assistance',
      category: 'Revenue',
      guidance: 'Medication management, visiting therapy, and ad-hoc caregiver escort charges.',
    },
    {
      code: 'EXP-201',
      name: 'Direct Caregiving & Nursing Labor',
      category: 'Direct Expense',
      guidance: 'On-site RN, LPN, and certified nursing assistant (CNA) hourly wages.',
    },
    {
      code: 'EXP-202',
      name: 'Dietary Nutrition & Meal Supplies',
      category: 'Direct Expense',
      guidance: 'Daily culinary provisions, specialty dietary supplements, and kitchen supplies.',
    },
    {
      code: 'EXP-203',
      name: 'Campus Facility Operations & Utilities',
      category: 'Direct Expense',
      guidance: 'On-site electricity, water, HVAC service, and building security fees.',
    },
    {
      code: 'EXP-204',
      name: 'Medical Supplies & Sanitation PPE',
      category: 'Direct Expense',
      guidance: 'Incontinence supplies, dressings, sanitary PPE, and clinical consumables.',
    },
    {
      code: 'EXP-301',
      name: 'Shared Fleet Van & Resident Transport',
      category: 'Shared Expense',
      guidance: 'Shared handicap-accessible vans, fuel, auto insurance, and driver payroll.',
    },
    {
      code: 'EXP-302',
      name: 'HQ Corporate Management & Legal Support',
      category: 'Shared Expense',
      guidance: 'Executive leadership, clinical compliance, accounting, and legal retainers.',
    },
    {
      code: 'EXP-303',
      name: 'Centralized EHR Software & Cloud IT',
      category: 'Shared Expense',
      guidance: 'Enterprise electronic health records, HIPAA cloud hosting, and IT helpdesk.',
    },
    {
      code: 'EXP-304',
      name: 'Regional Group Purchasing & Logistics',
      category: 'Shared Expense',
      guidance: 'Central procurement contracting, supply chain logistics, and bulk distribution.',
    },
  ],
  rules: [
    // VEH-001: 3-Location Fleet Van Sharing (A: 40%, B: 35%, C: 25%) -> 100%
    { rowId: 'rule-1', ruleId: 'VEH-001', ruleDesc: '3-Location Fleet Van Sharing', targetUnit: 'UNIT-A', percent: 0.40 },
    { rowId: 'rule-2', ruleId: 'VEH-001', ruleDesc: '3-Location Fleet Van Sharing', targetUnit: 'UNIT-B', percent: 0.35 },
    { rowId: 'rule-3', ruleId: 'VEH-001', ruleDesc: '3-Location Fleet Van Sharing', targetUnit: 'UNIT-C', percent: 0.25 },

    // CORP-001: HQ Overhead 4-Way Allocation (A: 30%, B: 20%, C: 35%, D: 15%) -> 100%
    { rowId: 'rule-4', ruleId: 'CORP-001', ruleDesc: 'HQ Executive Overhead 4-Way', targetUnit: 'UNIT-A', percent: 0.30 },
    { rowId: 'rule-5', ruleId: 'CORP-001', ruleDesc: 'HQ Executive Overhead 4-Way', targetUnit: 'UNIT-B', percent: 0.20 },
    { rowId: 'rule-6', ruleId: 'CORP-001', ruleDesc: 'HQ Executive Overhead 4-Way', targetUnit: 'UNIT-C', percent: 0.35 },
    { rowId: 'rule-7', ruleId: 'CORP-001', ruleDesc: 'HQ Executive Overhead 4-Way', targetUnit: 'UNIT-D', percent: 0.15 },

    // IT-001: Centralized EHR & IT Operations (A: 28%, B: 22%, C: 32%, D: 18%) -> 100%
    { rowId: 'rule-8', ruleId: 'IT-001', ruleDesc: 'Centralized EHR & Cloud IT', targetUnit: 'UNIT-A', percent: 0.28 },
    { rowId: 'rule-9', ruleId: 'IT-001', ruleDesc: 'Centralized EHR & Cloud IT', targetUnit: 'UNIT-B', percent: 0.22 },
    { rowId: 'rule-10', ruleId: 'IT-001', ruleDesc: 'Centralized EHR & Cloud IT', targetUnit: 'UNIT-C', percent: 0.32 },
    { rowId: 'rule-11', ruleId: 'IT-001', ruleDesc: 'Centralized EHR & Cloud IT', targetUnit: 'UNIT-D', percent: 0.18 },

    // PROC-001: Regional Group Purchasing (A: 35%, B: 25%, C: 25%, D: 15%) -> 100%
    { rowId: 'rule-12', ruleId: 'PROC-001', ruleDesc: 'Regional Group Purchasing', targetUnit: 'UNIT-A', percent: 0.35 },
    { rowId: 'rule-13', ruleId: 'PROC-001', ruleDesc: 'Regional Group Purchasing', targetUnit: 'UNIT-B', percent: 0.25 },
    { rowId: 'rule-14', ruleId: 'PROC-001', ruleDesc: 'Regional Group Purchasing', targetUnit: 'UNIT-C', percent: 0.25 },
    { rowId: 'rule-15', ruleId: 'PROC-001', ruleDesc: 'Regional Group Purchasing', targetUnit: 'UNIT-D', percent: 0.15 },
  ],
  transactions: [
    // ══════════════════ 2026-01 TRANSACTIONS ══════════════════
    // Direct Revenue
    { id: 'TX-2026-0001', date: '2026-01-05', accountCode: 'REV-101', description: 'January Resident Care Fees - Downtown', costType: 'Direct', amount: 168000, directUnitId: 'UNIT-A' },
    { id: 'TX-2026-0002', date: '2026-01-05', accountCode: 'REV-101', description: 'January Resident Care Fees - Westside', costType: 'Direct', amount: 112000, directUnitId: 'UNIT-B' },
    { id: 'TX-2026-0003', date: '2026-01-05', accountCode: 'REV-101', description: 'January Resident Care Fees - North Hills', costType: 'Direct', amount: 194000, directUnitId: 'UNIT-C' },
    { id: 'TX-2026-0004', date: '2026-01-05', accountCode: 'REV-101', description: 'January Resident Care Fees - Sunnyvale', costType: 'Direct', amount: 128000, directUnitId: 'UNIT-D' },
    { id: 'TX-2026-0005', date: '2026-01-08', accountCode: 'REV-102', description: 'Specialized Memory Care Billing - Westside', costType: 'Direct', amount: 38000, directUnitId: 'UNIT-B' },
    { id: 'TX-2026-0006', date: '2026-01-08', accountCode: 'REV-103', description: 'Ancillary Physical Therapy Escorts - North Hills', costType: 'Direct', amount: 14500, directUnitId: 'UNIT-C' },
    { id: 'TX-2026-0007', date: '2026-01-08', accountCode: 'REV-103', description: 'Ancillary Medication Management - Downtown', costType: 'Direct', amount: 12000, directUnitId: 'UNIT-A' },

    // Direct Operating Expenses (2026-01)
    { id: 'TX-2026-0008', date: '2026-01-15', accountCode: 'EXP-201', description: 'Bi-Weekly Nurse & CNA Staffing Payroll - Downtown', costType: 'Direct', amount: 62000, directUnitId: 'UNIT-A' },
    { id: 'TX-2026-0009', date: '2026-01-15', accountCode: 'EXP-201', description: 'Bi-Weekly Memory Care Nursing Payroll - Westside', costType: 'Direct', amount: 54000, directUnitId: 'UNIT-B' },
    { id: 'TX-2026-0010', date: '2026-01-15', accountCode: 'EXP-201', description: 'Bi-Weekly Caregiver Staffing Payroll - North Hills', costType: 'Direct', amount: 71000, directUnitId: 'UNIT-C' },
    { id: 'TX-2026-0011', date: '2026-01-15', accountCode: 'EXP-201', description: 'Bi-Weekly Nursing Staffing Payroll - Sunnyvale', costType: 'Direct', amount: 48000, directUnitId: 'UNIT-D' },
    { id: 'TX-2026-0012', date: '2026-01-18', accountCode: 'EXP-202', description: 'Dining Services & Wholesale Groceries - Downtown', costType: 'Direct', amount: 18500, directUnitId: 'UNIT-A' },
    { id: 'TX-2026-0013', date: '2026-01-18', accountCode: 'EXP-202', description: 'Dining Services & Memory Dietary Food - Westside', costType: 'Direct', amount: 14200, directUnitId: 'UNIT-B' },
    { id: 'TX-2026-0014', date: '2026-01-18', accountCode: 'EXP-202', description: 'Dining Services & Fresh Food - North Hills', costType: 'Direct', amount: 21000, directUnitId: 'UNIT-C' },
    { id: 'TX-2026-0015', date: '2026-01-18', accountCode: 'EXP-202', description: 'Dining Services & Organic Meal Prep - Sunnyvale', costType: 'Direct', amount: 15500, directUnitId: 'UNIT-D' },
    { id: 'TX-2026-0016', date: '2026-01-22', accountCode: 'EXP-203', description: 'Campus Utilities & Power Grid - Downtown', costType: 'Direct', amount: 9800, directUnitId: 'UNIT-A' },
    { id: 'TX-2026-0017', date: '2026-01-22', accountCode: 'EXP-203', description: 'HVAC Seasonal Inspection & Gas - Westside', costType: 'Direct', amount: 8400, directUnitId: 'UNIT-B' },
    { id: 'TX-2026-0018', date: '2026-01-22', accountCode: 'EXP-203', description: 'Campus Power & Facility Maintenance - North Hills', costType: 'Direct', amount: 11200, directUnitId: 'UNIT-C' },
    { id: 'TX-2026-0019', date: '2026-01-22', accountCode: 'EXP-203', description: 'Facility Maintenance & Landscape - Sunnyvale', costType: 'Direct', amount: 8900, directUnitId: 'UNIT-D' },
    { id: 'TX-2026-0020', date: '2026-01-25', accountCode: 'EXP-204', description: 'Clinical Incontinence & PPE Consumables - Downtown', costType: 'Direct', amount: 7200, directUnitId: 'UNIT-A' },
    { id: 'TX-2026-0021', date: '2026-01-25', accountCode: 'EXP-204', description: 'Specialized Medical Supplies - Westside', costType: 'Direct', amount: 6800, directUnitId: 'UNIT-B' },
    { id: 'TX-2026-0022', date: '2026-01-25', accountCode: 'EXP-204', description: 'Sanitary Supplies & PPE - North Hills', costType: 'Direct', amount: 8500, directUnitId: 'UNIT-C' },
    { id: 'TX-2026-0023', date: '2026-01-25', accountCode: 'EXP-204', description: 'Resident Care Consumables - Sunnyvale', costType: 'Direct', amount: 5600, directUnitId: 'UNIT-D' },

    // Shared Expenses (Entered ONCE!) (2026-01)
    { id: 'TX-2026-0024', date: '2026-01-20', accountCode: 'EXP-301', description: 'Regional Handicap Vans Maintenance & Fleet Fuel', costType: 'Shared', amount: 8500, allocationRuleId: 'VEH-001' },
    { id: 'TX-2026-0025', date: '2026-01-28', accountCode: 'EXP-302', description: 'Corporate Executive Leadership & Legal Retainer', costType: 'Shared', amount: 36000, allocationRuleId: 'CORP-001' },
    { id: 'TX-2026-0026', date: '2026-01-28', accountCode: 'EXP-303', description: 'Enterprise PointClickCare EHR & HIPAA Hosting', costType: 'Shared', amount: 14000, allocationRuleId: 'IT-001' },
    { id: 'TX-2026-0027', date: '2026-01-30', accountCode: 'EXP-304', description: 'Regional Central Purchasing & Warehouse Logistics', costType: 'Shared', amount: 9200, allocationRuleId: 'PROC-001' },

    // ══════════════════ 2026-02 TRANSACTIONS ══════════════════
    // Direct Revenue
    { id: 'TX-2026-0028', date: '2026-02-04', accountCode: 'REV-101', description: 'February Resident Care Fees - Downtown', costType: 'Direct', amount: 172000, directUnitId: 'UNIT-A' },
    { id: 'TX-2026-0029', date: '2026-02-04', accountCode: 'REV-101', description: 'February Resident Care Fees - Westside', costType: 'Direct', amount: 115000, directUnitId: 'UNIT-B' },
    { id: 'TX-2026-0030', date: '2026-02-04', accountCode: 'REV-101', description: 'February Resident Care Fees - North Hills', costType: 'Direct', amount: 198000, directUnitId: 'UNIT-C' },
    { id: 'TX-2026-0031', date: '2026-02-04', accountCode: 'REV-101', description: 'February Resident Care Fees - Sunnyvale', costType: 'Direct', amount: 131000, directUnitId: 'UNIT-D' },
    { id: 'TX-2026-0032', date: '2026-02-08', accountCode: 'REV-102', description: 'Specialized Memory Care Billing - Westside', costType: 'Direct', amount: 40000, directUnitId: 'UNIT-B' },
    { id: 'TX-2026-0033', date: '2026-02-08', accountCode: 'REV-103', description: 'Ancillary Physical Therapy Escorts - North Hills', costType: 'Direct', amount: 15200, directUnitId: 'UNIT-C' },
    { id: 'TX-2026-0034', date: '2026-02-08', accountCode: 'REV-103', description: 'Ancillary Care Add-ons - Sunnyvale', costType: 'Direct', amount: 9500, directUnitId: 'UNIT-D' },

    // Direct Operating Expenses (2026-02)
    { id: 'TX-2026-0035', date: '2026-02-15', accountCode: 'EXP-201', description: 'Bi-Weekly Nurse & CNA Staffing Payroll - Downtown', costType: 'Direct', amount: 63500, directUnitId: 'UNIT-A' },
    { id: 'TX-2026-0036', date: '2026-02-15', accountCode: 'EXP-201', description: 'Bi-Weekly Memory Care Nursing Payroll - Westside', costType: 'Direct', amount: 55200, directUnitId: 'UNIT-B' },
    { id: 'TX-2026-0037', date: '2026-02-15', accountCode: 'EXP-201', description: 'Bi-Weekly Caregiver Staffing Payroll - North Hills', costType: 'Direct', amount: 72500, directUnitId: 'UNIT-C' },
    { id: 'TX-2026-0038', date: '2026-02-15', accountCode: 'EXP-201', description: 'Bi-Weekly Nursing Staffing Payroll - Sunnyvale', costType: 'Direct', amount: 49000, directUnitId: 'UNIT-D' },
    { id: 'TX-2026-0039', date: '2026-02-18', accountCode: 'EXP-202', description: 'Dietary Food & Kitchen Supplies - Downtown', costType: 'Direct', amount: 19000, directUnitId: 'UNIT-A' },
    { id: 'TX-2026-0040', date: '2026-02-18', accountCode: 'EXP-202', description: 'Dietary Nutrition Provisions - Westside', costType: 'Direct', amount: 14600, directUnitId: 'UNIT-B' },
    { id: 'TX-2026-0041', date: '2026-02-18', accountCode: 'EXP-202', description: 'Dietary Nutrition Provisions - North Hills', costType: 'Direct', amount: 21500, directUnitId: 'UNIT-C' },
    { id: 'TX-2026-0042', date: '2026-02-18', accountCode: 'EXP-202', description: 'Culinary Supplies & Groceries - Sunnyvale', costType: 'Direct', amount: 15800, directUnitId: 'UNIT-D' },
    { id: 'TX-2026-0043', date: '2026-02-22', accountCode: 'EXP-203', description: 'Campus Power & Facility Maintenance - Downtown', costType: 'Direct', amount: 10100, directUnitId: 'UNIT-A' },
    { id: 'TX-2026-0044', date: '2026-02-22', accountCode: 'EXP-203', description: 'Facility Maintenance & Utilities - Westside', costType: 'Direct', amount: 8600, directUnitId: 'UNIT-B' },
    { id: 'TX-2026-0045', date: '2026-02-22', accountCode: 'EXP-203', description: 'Campus Power & Repairs - North Hills', costType: 'Direct', amount: 11400, directUnitId: 'UNIT-C' },
    { id: 'TX-2026-0046', date: '2026-02-22', accountCode: 'EXP-203', description: 'Facility Utilities - Sunnyvale', costType: 'Direct', amount: 9100, directUnitId: 'UNIT-D' },
    { id: 'TX-2026-0047', date: '2026-02-25', accountCode: 'EXP-204', description: 'Medical Supplies & Sanitation PPE - Downtown', costType: 'Direct', amount: 7400, directUnitId: 'UNIT-A' },
    { id: 'TX-2026-0048', date: '2026-02-25', accountCode: 'EXP-204', description: 'Specialized Medical Supplies - Westside', costType: 'Direct', amount: 7100, directUnitId: 'UNIT-B' },
    { id: 'TX-2026-0049', date: '2026-02-25', accountCode: 'EXP-204', description: 'Sanitary Supplies & PPE - North Hills', costType: 'Direct', amount: 8700, directUnitId: 'UNIT-C' },
    { id: 'TX-2026-0050', date: '2026-02-25', accountCode: 'EXP-204', description: 'Resident Care Consumables - Sunnyvale', costType: 'Direct', amount: 5800, directUnitId: 'UNIT-D' },

    // Shared Expenses (2026-02)
    { id: 'TX-2026-0051', date: '2026-02-20', accountCode: 'EXP-301', description: 'Shared Resident Van Fleet Operations & Fuel', costType: 'Shared', amount: 8900, allocationRuleId: 'VEH-001' },
    { id: 'TX-2026-0052', date: '2026-02-27', accountCode: 'EXP-302', description: 'Corporate HQ Leadership & Management Retainer', costType: 'Shared', amount: 36000, allocationRuleId: 'CORP-001' },
    { id: 'TX-2026-0053', date: '2026-02-27', accountCode: 'EXP-303', description: 'Centralized IT Helpdesk & EHR Cloud Subscription', costType: 'Shared', amount: 14000, allocationRuleId: 'IT-001' },
    { id: 'TX-2026-0054', date: '2026-02-28', accountCode: 'EXP-304', description: 'Regional Group Purchasing & Supply Logistics', costType: 'Shared', amount: 9500, allocationRuleId: 'PROC-001' },

    // ══════════════════ 2026-03 TRANSACTIONS ══════════════════
    // Direct Revenue
    { id: 'TX-2026-0055', date: '2026-03-05', accountCode: 'REV-101', description: 'March Resident Care Fees - Downtown', costType: 'Direct', amount: 175000, directUnitId: 'UNIT-A' },
    { id: 'TX-2026-0056', date: '2026-03-05', accountCode: 'REV-101', description: 'March Resident Care Fees - Westside', costType: 'Direct', amount: 118000, directUnitId: 'UNIT-B' },
    { id: 'TX-2026-0057', date: '2026-03-05', accountCode: 'REV-101', description: 'March Resident Care Fees - North Hills', costType: 'Direct', amount: 202000, directUnitId: 'UNIT-C' },
    { id: 'TX-2026-0058', date: '2026-03-05', accountCode: 'REV-101', description: 'March Resident Care Fees - Sunnyvale', costType: 'Direct', amount: 134000, directUnitId: 'UNIT-D' },
    { id: 'TX-2026-0059', date: '2026-03-08', accountCode: 'REV-102', description: 'Specialized Memory Care Billing - Westside', costType: 'Direct', amount: 42000, directUnitId: 'UNIT-B' },
    { id: 'TX-2026-0060', date: '2026-03-08', accountCode: 'REV-103', description: 'Ancillary Physical Therapy Escorts - North Hills', costType: 'Direct', amount: 16000, directUnitId: 'UNIT-C' },
    { id: 'TX-2026-0061', date: '2026-03-08', accountCode: 'REV-103', description: 'Medication Management - Downtown', costType: 'Direct', amount: 13500, directUnitId: 'UNIT-A' },

    // Direct Operating Expenses (2026-03)
    { id: 'TX-2026-0062', date: '2026-03-15', accountCode: 'EXP-201', description: 'Bi-Weekly Nurse & CNA Staffing Payroll - Downtown', costType: 'Direct', amount: 64500, directUnitId: 'UNIT-A' },
    { id: 'TX-2026-0063', date: '2026-03-15', accountCode: 'EXP-201', description: 'Bi-Weekly Memory Care Nursing Payroll - Westside', costType: 'Direct', amount: 56000, directUnitId: 'UNIT-B' },
    { id: 'TX-2026-0064', date: '2026-03-15', accountCode: 'EXP-201', description: 'Bi-Weekly Caregiver Staffing Payroll - North Hills', costType: 'Direct', amount: 73800, directUnitId: 'UNIT-C' },
    { id: 'TX-2026-0065', date: '2026-03-15', accountCode: 'EXP-201', description: 'Bi-Weekly Nursing Staffing Payroll - Sunnyvale', costType: 'Direct', amount: 49800, directUnitId: 'UNIT-D' },
    { id: 'TX-2026-0066', date: '2026-03-18', accountCode: 'EXP-202', description: 'Dining Services & Wholesale Groceries - Downtown', costType: 'Direct', amount: 19500, directUnitId: 'UNIT-A' },
    { id: 'TX-2026-0067', date: '2026-03-18', accountCode: 'EXP-202', description: 'Dining Services & Nutrition Provisions - Westside', costType: 'Direct', amount: 15000, directUnitId: 'UNIT-B' },
    { id: 'TX-2026-0068', date: '2026-03-18', accountCode: 'EXP-202', description: 'Dietary Nutrition Provisions - North Hills', costType: 'Direct', amount: 22000, directUnitId: 'UNIT-C' },
    { id: 'TX-2026-0069', date: '2026-03-18', accountCode: 'EXP-202', description: 'Culinary Supplies & Groceries - Sunnyvale', costType: 'Direct', amount: 16200, directUnitId: 'UNIT-D' },
    { id: 'TX-2026-0070', date: '2026-03-22', accountCode: 'EXP-203', description: 'Campus Power & Facility Maintenance - Downtown', costType: 'Direct', amount: 10400, directUnitId: 'UNIT-A' },
    { id: 'TX-2026-0071', date: '2026-03-22', accountCode: 'EXP-203', description: 'Facility Maintenance & Utilities - Westside', costType: 'Direct', amount: 8800, directUnitId: 'UNIT-B' },
    { id: 'TX-2026-0072', date: '2026-03-22', accountCode: 'EXP-203', description: 'Campus Power & Building Services - North Hills', costType: 'Direct', amount: 11800, directUnitId: 'UNIT-C' },
    { id: 'TX-2026-0073', date: '2026-03-22', accountCode: 'EXP-203', description: 'Facility Utilities - Sunnyvale', costType: 'Direct', amount: 9300, directUnitId: 'UNIT-D' },
    { id: 'TX-2026-0074', date: '2026-03-25', accountCode: 'EXP-204', description: 'Medical Supplies & Sanitation PPE - Downtown', costType: 'Direct', amount: 7600, directUnitId: 'UNIT-A' },
    { id: 'TX-2026-0075', date: '2026-03-25', accountCode: 'EXP-204', description: 'Specialized Clinical Supplies - Westside', costType: 'Direct', amount: 7300, directUnitId: 'UNIT-B' },
    { id: 'TX-2026-0076', date: '2026-03-25', accountCode: 'EXP-204', description: 'Sanitary Supplies & PPE - North Hills', costType: 'Direct', amount: 8900, directUnitId: 'UNIT-C' },
    { id: 'TX-2026-0077', date: '2026-03-25', accountCode: 'EXP-204', description: 'Resident Care Consumables - Sunnyvale', costType: 'Direct', amount: 6000, directUnitId: 'UNIT-D' },

    // Shared Expenses (2026-03)
    { id: 'TX-2026-0078', date: '2026-03-20', accountCode: 'EXP-301', description: 'Shared Resident Van Fleet Operations & Inspections', costType: 'Shared', amount: 9100, allocationRuleId: 'VEH-001' },
    { id: 'TX-2026-0079', date: '2026-03-27', accountCode: 'EXP-302', description: 'Corporate HQ Leadership & Audit Retainers', costType: 'Shared', amount: 36000, allocationRuleId: 'CORP-001' },
    { id: 'TX-2026-0080', date: '2026-03-27', accountCode: 'EXP-303', description: 'Enterprise EHR Subscription & IT Cloud Backup', costType: 'Shared', amount: 14000, allocationRuleId: 'IT-001' },
    { id: 'TX-2026-0081', date: '2026-03-28', accountCode: 'EXP-304', description: 'Regional Purchasing & Volume Rebate Logistics', costType: 'Shared', amount: 9800, allocationRuleId: 'PROC-001' },
  ],
  lastSaved: new Date().toISOString(),
};
