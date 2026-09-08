import { AppState, Transaction } from '../types';
import { initialData } from '../data/initialData';

const STORAGE_KEY = 'equicare_assisted_living_model_v1';

export function loadStateFromStorage(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.units && parsed.accounts && parsed.rules && parsed.transactions) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load state from localStorage:', err);
  }
  return initialData;
}

export function saveStateToStorage(state: AppState): void {
  try {
    const dataToSave = {
      ...state,
      lastSaved: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function exportBackupJSON(state: AppState): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `equicare-backup-${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
  const results: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple regex for CSV splitting considering quotes
    const values: string[] = [];
    let insideQuote = false;
    let curVal = '';

    for (let charIndex = 0; charIndex < line.length; charIndex++) {
      const char = line[charIndex];
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        values.push(curVal.trim().replace(/^"|"$/g, ''));
        curVal = '';
      } else {
        curVal += char;
      }
    }
    values.push(curVal.trim().replace(/^"|"$/g, ''));

    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] || '';
    });
    results.push(rowObj);
  }

  return results;
}

export function exportSampleCSV(): void {
  const headers = 'Tx_ID,Tx_Date,Tx_Account_Code,Tx_Description,Tx_Cost_Type,Tx_Amount,Tx_Direct_Unit_ID,Tx_Allocation_Rule_ID';
  const samples = [
    'TX-2026-9001,2026-04-05,REV-101,"April Resident Care Fees - Downtown",Direct,170000,UNIT-A,',
    'TX-2026-9002,2026-04-15,EXP-201,"Nurse & Caregiver Hourly Payroll",Direct,63000,UNIT-A,',
    'TX-2026-9003,2026-04-20,EXP-301,"Shared Van Maintenance & Fleet Gas",Shared,8500,,VEH-001',
    'TX-2026-9004,2026-04-28,EXP-302,"Executive Leadership & Legal Support",Shared,36000,,CORP-001',
  ];
  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent([headers, ...samples].join('\n'));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', csvContent);
  downloadAnchor.setAttribute('download', 'sample_transactions_template.csv');
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
