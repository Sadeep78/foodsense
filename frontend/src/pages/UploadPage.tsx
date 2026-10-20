import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Database,
} from 'lucide-react';
import client from '../api/client';
import { UploadValidationResult } from '../types';

export const UploadPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sales' | 'inventory'>('sales');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validating, setValidating] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<UploadValidationResult | null>(null);
  const [importing, setImporting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loadingSample, setLoadingSample] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setValidationResult(null);
      setStatusMessage(null);
    }
  };

  const handleValidate = async () => {
    if (!selectedFile) return;
    setValidating(true);
    setStatusMessage(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const endpoint = activeTab === 'sales' ? '/upload/sales/validate' : '/upload/inventory/validate';
      const res = await client.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setValidationResult(res.data);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Validation failed. Please verify file structure.',
      });
    } finally {
      setValidating(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!validationResult || !validationResult.preview_data) return;
    setImporting(true);
    setStatusMessage(null);

    try {
      const endpoint = activeTab === 'sales' ? '/upload/sales/confirm' : '/upload/inventory/confirm';
      const res = await client.post(endpoint, {
        dataset_type: activeTab,
        rows: validationResult.preview_data,
      });

      setStatusMessage({
        type: 'success',
        text: res.data.message || 'Records imported successfully!',
      });
      // Clear file
      setSelectedFile(null);
      setValidationResult(null);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Import failed.',
      });
    } finally {
      setImporting(false);
    }
  };

  const handleLoadSampleData = async () => {
    setLoadingSample(true);
    setStatusMessage(null);
    try {
      const res = await client.post('/data/load-sample');
      setStatusMessage({
        type: 'success',
        text: res.data.message || 'Successfully seeded 12-month sample dataset and updated forecasts!',
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to load sample data.',
      });
    } finally {
      setLoadingSample(false);
    }
  };

  const downloadTemplate = (type: 'sales' | 'inventory') => {
    window.open(`http://localhost:8000/data/templates/${type}`, '_blank');
  };

  const downloadSampleData = (type: 'sales' | 'inventory') => {
    window.open(`http://localhost:8000/data/sample-file/${type}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Title & Fast Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Data Upload & Schema Validation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Import point-of-sale transactions or batch expiry inventory to update demand forecasts.
          </p>
        </div>

        <button
          onClick={handleLoadSampleData}
          disabled={loadingSample}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-md shadow-emerald-700/20 transition-all"
        >
          {loadingSample ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 text-emerald-300" />
          )}
          <span>{loadingSample ? 'Seeding 12 Months...' : '1-Click Load Sample Dataset'}</span>
        </button>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-medium border flex items-center justify-between ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertOctagon className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs underline font-semibold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl dark:bg-slate-800 max-w-md">
        <button
          onClick={() => {
            setActiveTab('sales');
            setSelectedFile(null);
            setValidationResult(null);
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'sales'
              ? 'bg-white text-brand-700 shadow-sm dark:bg-slate-900 dark:text-brand-300'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          (a) Daily Sales Records
        </button>
        <button
          onClick={() => {
            setActiveTab('inventory');
            setSelectedFile(null);
            setValidationResult(null);
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'inventory'
              ? 'bg-white text-brand-700 shadow-sm dark:bg-slate-900 dark:text-brand-300'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          (b) Inventory & Expiry Records
        </button>
      </div>

      {/* File Dropzone & Schema Guideline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-brand-500 transition-colors dark:border-slate-700">
            <UploadCloud className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              {selectedFile ? selectedFile.name : `Select or drag & drop ${activeTab} CSV/XLSX file`}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Supported formats: .csv, .xlsx, .xls (Up to 10MB)
            </p>

            <input
              type="file"
              id="file-upload"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 rounded-xl hover:bg-brand-100 cursor-pointer dark:bg-brand-950 dark:text-brand-300 dark:border-brand-800 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Browse File</span>
            </label>
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">
                Ready to validate: <b>{selectedFile.name}</b> ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
              <button
                onClick={handleValidate}
                disabled={validating}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-sm"
              >
                {validating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{validating ? 'Inspecting Data...' : 'Validate Schema & Values'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Schema Specification & Downloadable Templates */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Expected Column Schema
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Your file must contain the following columns in row 1:
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 dark:bg-slate-800/50 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 space-y-1 mb-4">
              {activeTab === 'sales' ? (
                <>
                  <p>• date <span className="text-slate-400 font-sans">(YYYY-MM-DD)</span></p>
                  <p>• product_id <span className="text-slate-400 font-sans">(e.g. PRD-001)</span></p>
                  <p>• product_name</p>
                  <p>• category <span className="text-slate-400 font-sans">(e.g. Bakery)</span></p>
                  <p>• quantity_sold <span className="text-slate-400 font-sans">(numeric ≥ 0)</span></p>
                  <p>• unit_price <span className="text-slate-400 font-sans">(LKR)</span></p>
                  <p>• unit_cost <span className="text-slate-400 font-sans">(LKR)</span></p>
                </>
              ) : (
                <>
                  <p>• product_id <span className="text-slate-400 font-sans">(e.g. PRD-001)</span></p>
                  <p>• batch_id <span className="text-slate-400 font-sans">(unique batch ref)</span></p>
                  <p>• quantity_received <span className="text-slate-400 font-sans">(numeric &gt; 0)</span></p>
                  <p>• received_date <span className="text-slate-400 font-sans">(YYYY-MM-DD)</span></p>
                  <p>• expiry_date <span className="text-slate-400 font-sans">(≥ received_date)</span></p>
                  <p>• quantity_wasted <span className="text-slate-400 font-sans">(numeric ≥ 0)</span></p>
                  <p>• waste_reason <span className="text-slate-400 font-sans">(Expired, Unsold...)</span></p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => downloadTemplate(activeTab)}
              className="flex items-center justify-between w-full p-2.5 text-xs font-semibold rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
            >
              <span className="flex items-center gap-2">
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Download Blank CSV Template</span>
              </span>
              <span className="text-[10px] text-slate-400">.csv</span>
            </button>

            <button
              onClick={() => downloadSampleData(activeTab)}
              className="flex items-center justify-between w-full p-2.5 text-xs font-semibold rounded-xl bg-slate-50 hover:bg-slate-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/40"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Download Full Sample Data</span>
              </span>
              <span className="text-[10px] text-emerald-600 font-bold">12-Mo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Validation Result Inspection Card */}
      {validationResult && (
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              {validationResult.valid ? (
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                  <AlertOctagon className="w-6 h-6" />
                </div>
              )}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {validationResult.valid ? 'Validation Passed: Ready for Import' : 'Validation Failed: Issues Detected'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total Rows: {validationResult.total_rows} • Valid Rows: {validationResult.valid_rows} • Errors: {validationResult.error_count} • Warnings: {validationResult.warning_count}
                </p>
              </div>
            </div>

            {validationResult.valid && (
              <button
                onClick={handleConfirmImport}
                disabled={importing}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all"
              >
                {importing && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>{importing ? 'Importing & Recalculating...' : 'Confirm & Commit Import'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Validation Issues Table / List */}
          {validationResult.issues.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Integrity Issues & Warnings ({validationResult.issues.length})
              </h4>
              <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
                {validationResult.issues.map((iss, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                      iss.severity === 'error'
                        ? 'bg-rose-100/70 text-rose-900 dark:bg-rose-950/60 dark:text-rose-200'
                        : 'bg-amber-100/70 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold uppercase text-[10px] px-1.5 py-0.5 rounded bg-white/50">
                        Row {iss.row}
                      </span>
                      <span className="font-semibold">{iss.column}:</span>
                      <span>{iss.message}</span>
                    </div>
                    {iss.value !== null && (
                      <span className="text-[11px] font-mono opacity-80">Val: {String(iss.value)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Preview Table */}
          {validationResult.preview_data.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                First 10 Rows Preview
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      {Object.keys(validationResult.preview_data[0]).map((key) => (
                        <th key={key} className="px-3 py-2 font-semibold">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {validationResult.preview_data.slice(0, 10).map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        {Object.values(row).map((val: any, cIdx) => (
                          <td key={cIdx} className="px-3 py-1.5 font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
