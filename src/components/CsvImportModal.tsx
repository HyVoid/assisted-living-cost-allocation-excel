import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, Check, AlertTriangle, Download } from 'lucide-react';
import { Transaction } from '../types';
import { parseCSV, exportSampleCSV } from '../utils/storage';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (transactions: Transaction[], mode: 'append' | 'replace') => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<Transaction[]>([]);
  const [mode, setMode] = useState<'append' | 'replace'>('append');
  const [fileName, setFileName] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      processCsv(text);
    };
    reader.readAsText(file);
  };

  const processCsv = (rawText: string) => {
    try {
      const records = parseCSV(rawText);
      if (records.length === 0) {
        setParseError('No rows found in CSV. Please verify file structure.');
        setParsedRows([]);
        return;
      }

      const txs: Transaction[] = records.map((r, index) => {
        const id = r.Tx_ID || r.id || `TX-IMP-${Date.now()}-${index + 1}`;
        const date = r.Tx_Date || r.date || new Date().toISOString().slice(0, 10);
        const accountCode = r.Tx_Account_Code || r.accountCode || '';
        const description = r.Tx_Description || r.description || 'Imported Transaction';
        const costType = (r.Tx_Cost_Type || r.costType || 'Direct') as 'Direct' | 'Shared';
        const amount = parseFloat(r.Tx_Amount || r.amount || '0') || 0;
        const directUnitId = r.Tx_Direct_Unit_ID || r.directUnitId || '';
        const allocationRuleId = r.Tx_Allocation_Rule_ID || r.allocationRuleId || '';

        return {
          id,
          date,
          accountCode,
          description,
          costType: costType === 'Shared' ? 'Shared' : 'Direct',
          amount,
          directUnitId: directUnitId || undefined,
          allocationRuleId: allocationRuleId || undefined,
        };
      });

      setParsedRows(txs);
      setParseError(null);
    } catch (err: any) {
      setParseError(err.message || 'Failed to parse CSV text.');
      setParsedRows([]);
    }
  };

  const handleConfirm = () => {
    if (parsedRows.length === 0) return;
    onImport(parsedRows, mode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051C2C]/40 backdrop-blur-sm animate-fade-up">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-[#E8E8E6] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E8E6] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#2251FF]" />
            <h3 className="font-display font-semibold text-[18px] text-[#051C2C]">
              Bulk CSV Transactions Import
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#888888] hover:text-[#051C2C] hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between bg-[#051C2C]/5 p-3 rounded-lg text-[12px] text-[#051C2C]">
            <span>Supported Headers: Tx_ID, Tx_Date, Tx_Account_Code, Tx_Description, Tx_Cost_Type, Tx_Amount, Tx_Direct_Unit_ID, Tx_Allocation_Rule_ID</span>
            <button
              onClick={exportSampleCSV}
              className="flex items-center gap-1 font-semibold text-[#2251FF] hover:underline cursor-pointer shrink-0 ml-3"
            >
              <Download className="w-3.5 h-3.5" />
              Download Template
            </button>
          </div>

          {/* File input */}
          <div className="border-2 border-dashed border-[#E8E8E6] hover:border-[#2251FF] rounded-lg p-6 text-center cursor-pointer transition-colors bg-[#F5F5F2]/50 relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="w-8 h-8 text-[#2251FF] mx-auto mb-2" />
            <p className="text-[13px] font-medium text-[#051C2C]">
              {fileName ? fileName : 'Click or Drag & Drop CSV File here'}
            </p>
            <p className="text-[11px] text-[#888888] mt-1">Accepts UTF-8 encoded standard comma-separated files</p>
          </div>

          {/* Or Paste Raw Text */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#051C2C] mb-1">
              Or Paste Raw CSV Data
            </label>
            <textarea
              rows={4}
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                processCsv(e.target.value);
              }}
              placeholder="Tx_ID,Tx_Date,Tx_Account_Code,Tx_Description,Tx_Cost_Type,Tx_Amount,Tx_Direct_Unit_ID,Tx_Allocation_Rule_ID&#10;TX-2026-9001,2026-04-05,REV-101,Resident Care Fees,Direct,170000,UNIT-A,"
              className="w-full text-[12px] font-mono p-3 rounded-md border border-[#E8E8E6] bg-[#FFFDE7] focus:outline-none focus:ring-1 focus:ring-[#2251FF]"
            />
          </div>

          {parseError && (
            <div className="anomaly-block flex items-center gap-2 text-[12px] text-[#D32F2F]">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-semibold text-[#00C853] flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  Successfully parsed {parsedRows.length} transaction rows
                </span>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={mode === 'append'}
                      onChange={() => setMode('append')}
                      className="accent-[#2251FF]"
                    />
                    <span>Append to existing</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={mode === 'replace'}
                      onChange={() => setMode('replace')}
                      className="accent-[#2251FF]"
                    />
                    <span>Replace all records</span>
                  </label>
                </div>
              </div>

              {/* Preview table */}
              <div className="max-h-48 overflow-y-auto border border-[#E8E8E6] rounded-md text-[11px]">
                <table className="w-full text-left">
                  <thead className="bg-[#051C2C]/5 text-[#051C2C] sticky top-0">
                    <tr>
                      <th className="p-2">ID</th>
                      <th className="p-2">Date</th>
                      <th className="p-2">Account</th>
                      <th className="p-2">Type</th>
                      <th className="p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E8E6]">
                    {parsedRows.slice(0, 10).map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="p-2 font-mono">{r.id}</td>
                        <td className="p-2">{r.date}</td>
                        <td className="p-2">{r.accountCode}</td>
                        <td className="p-2">{r.costType}</td>
                        <td className="p-2 text-right font-mono">${r.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedRows.length > 10 && (
                  <p className="p-2 text-center text-[10px] text-[#888888] bg-gray-50">
                    ...and {parsedRows.length - 10} more rows
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E8E8E6] bg-[#F5F5F2]/60 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-[13px] font-medium text-[#051C2C] hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={parsedRows.length === 0}
            className={`px-5 py-2 rounded-md text-[13px] font-semibold text-white transition-all ${
              parsedRows.length > 0
                ? 'bg-[#2251FF] hover:bg-[#1a40d6] shadow-sm cursor-pointer'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Import {parsedRows.length} Rows
          </button>
        </div>
      </div>
    </div>
  );
};
