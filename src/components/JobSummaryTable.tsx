/**
 * JobSummaryTable — Bảng tổng hợp hanger tối ưu cho toàn bộ job.
 *
 * Mỗi connection (carried truss) → 1 hanger được chọn:
 *   - Nếu có inventory: chọn hanger rẻ nhất trong số các hanger available (in stock)
 *   - Nếu không có inventory: chọn hanger rẻ nhất overall
 *
 * Hiển thị bảng theo từng girder, kèm tổng giá toàn job.
 * Có nút Export Excel.
 */

import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import type { GirderGroup } from '../types';
import type { SSTHangerResult } from '../lib/sst-types';
import type { ParsedInventory } from '../lib/inventory';
import { isInStock } from '../lib/inventory';
import { AUI, ATTR } from '../aui';
import { AuiIcon } from './AuiIcon';
import { AuiTable } from './AuiTable';
import { AuiPane } from './AuiPane';
import { loadInventoryFile } from '../lib/inventory';
import { buildSSTPayload } from '../lib/sst-mapper';
import { submitToSST, hasSSTToken } from '../lib/sst-api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HangerResultsMap {
  /** key = `${girderId}::${carriedInstanceId}` */
  [key: string]: SSTHangerResult[];
}

interface SelectedHanger {
  girderId: string;
  girderLabel: string;
  carriedId: string;
  carriedLabel: string;
  offsetX: number;          // inches from girder left end
  downReaction: number;
  upliftReaction: number;
  hanger: SSTHangerResult | null;
  isInStock: boolean;
  selectionMode: 'available' | 'cheapest' | 'none';
}

// ---------------------------------------------------------------------------
// Helper: pick best hanger
// ---------------------------------------------------------------------------

function pickBestHanger(
  hangers: SSTHangerResult[],
  inventory: ParsedInventory | null,
): { hanger: SSTHangerResult | null; mode: 'available' | 'cheapest' | 'none' } {
  if (!hangers || hangers.length === 0) return { hanger: null, mode: 'none' };

  const withCost = (h: SSTHangerResult) => h.installedCost > 0 ? h.installedCost : Infinity;

  if (inventory) {
    // Try to find cheapest in-stock hanger
    const inStockHangers = hangers.filter((h) => isInStock(h.model, inventory));
    if (inStockHangers.length > 0) {
      const best = inStockHangers.reduce((a, b) => withCost(a) <= withCost(b) ? a : b);
      return { hanger: best, mode: 'available' };
    }
    // No in-stock → fall back to cheapest overall
    const best = hangers.reduce((a, b) => withCost(a) <= withCost(b) ? a : b);
    return { hanger: best, mode: 'cheapest' };
  }

  // No inventory → cheapest overall
  const best = hangers.reduce((a, b) => withCost(a) <= withCost(b) ? a : b);
  return { hanger: best, mode: 'cheapest' };
}

// ---------------------------------------------------------------------------
// Format helpers
// ---------------------------------------------------------------------------

function fmtOffset(inches: number): string {
  const ft = Math.floor(inches / 12);
  const ins = (inches % 12).toFixed(2);
  return `${ft}'-${ins}"`;
}

function fmtLoad(lb: number): string {
  return lb > 0 ? `${lb.toLocaleString()} lb` : '—';
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Batch query state
// ---------------------------------------------------------------------------

interface BatchProgress {
  total: number;
  completed: number;
  failed: number;
  running: boolean;
  aborted: boolean;
}

interface JobSummaryTableProps {
  girders: GirderGroup[];
  hangerResultsMap: HangerResultsMap;
  inventory: ParsedInventory | null;
  onInventoryChange: (inv: ParsedInventory | null) => void;
  onHangersLoaded: (girderId: string, carriedId: string, hangers: SSTHangerResult[]) => void;
}

export function JobSummaryTable({
  girders,
  hangerResultsMap,
  inventory,
  onInventoryChange,
  onHangersLoaded,
}: JobSummaryTableProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef(false);

  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(null);
  const [noToken, setNoToken] = useState(false);

  // ---------------------------------------------------------------------------
  // Batch auto-query: run on mount for all connections not yet queried
  // ---------------------------------------------------------------------------

  const runBatchQuery = useCallback(async () => {
    if (!hasSSTToken()) {
      setNoToken(true);
      return;
    }
    setNoToken(false);

    // Collect connections that haven't been queried yet
    const pending: Array<{ girderId: string; carriedId: string; group: GirderGroup; carriedIdx: number }> = [];
    for (const group of girders) {
      for (let i = 0; i < group.carriedTrusses.length; i++) {
        const carried = group.carriedTrusses[i];
        const key = `${group.girder.id}::${carried.instance.id}`;
        if (!hangerResultsMap[key] && (carried.downReaction ?? 0) > 0) {
          pending.push({ girderId: group.girder.id, carriedId: carried.instance.id, group, carriedIdx: i });
        }
      }
    }

    if (pending.length === 0) return;

    abortRef.current = false;
    setBatchProgress({ total: pending.length, completed: 0, failed: 0, running: true, aborted: false });

    let completed = 0;
    let failed = 0;

    for (const item of pending) {
      if (abortRef.current) {
        setBatchProgress(prev => prev ? { ...prev, running: false, aborted: true } : null);
        return;
      }

      const carried = item.group.carriedTrusses[item.carriedIdx];
      try {
        const payload = buildSSTPayload(item.group, carried);
        const res = await submitToSST(payload);
        if (res.success) {
          onHangersLoaded(item.girderId, item.carriedId, res.hangers);
        } else {
          failed++;
          // If 401/403, abort the whole batch — token is invalid
          if (res.error?.includes('401') || res.error?.includes('403')) {
            setBatchProgress(prev => prev ? { ...prev, running: false, aborted: true, failed: failed + (pending.length - completed - 1) } : null);
            setNoToken(true);
            return;
          }
        }
      } catch {
        failed++;
      }

      completed++;
      setBatchProgress(prev => prev ? { ...prev, completed, failed, running: completed < pending.length } : null);

      // 800ms delay between calls to avoid rate limiting (skip after last)
      if (completed < pending.length && !abortRef.current) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }

    setBatchProgress(prev => prev ? { ...prev, running: false } : null);
  }, [girders, hangerResultsMap, onHangersLoaded]);

  // Auto-run on mount
  useEffect(() => {
    runBatchQuery();
    return () => { abortRef.current = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run only on mount (tab open)

  // Build the selected-hanger rows for all connections
  const rows: SelectedHanger[] = useMemo(() => {
    const result: SelectedHanger[] = [];
    for (const group of girders) {
      for (const carried of group.carriedTrusses) {
        const key = `${group.girder.id}::${carried.instance.id}`;
        const hangers = hangerResultsMap[key] ?? [];
        const { hanger, mode } = pickBestHanger(hangers, inventory);
        result.push({
          girderId: group.girder.id,
          girderLabel: group.girder.label,
          carriedId: carried.instance.id,
          carriedLabel: carried.instance.label,
          offsetX: carried.localX,
          downReaction: carried.downReaction ?? 0,
          upliftReaction: carried.upliftReaction ?? 0,
          hanger,
          isInStock: hanger ? isInStock(hanger.model, inventory) : false,
          selectionMode: mode,
        });
      }
    }
    return result;
  }, [girders, hangerResultsMap, inventory]);

  // Group rows by girder
  const byGirder = useMemo(() => {
    const map = new Map<string, SelectedHanger[]>();
    for (const row of rows) {
      if (!map.has(row.girderId)) map.set(row.girderId, []);
      map.get(row.girderId)!.push(row);
    }
    return map;
  }, [rows]);

  // Stats
  const totalConnections = rows.length;
  const resolvedConnections = rows.filter((r) => r.hanger !== null).length;
  const pendingConnections = totalConnections - resolvedConnections;
  const hasInventory = inventory !== null;

  // Total cost
  const totalCost = useMemo(() => rows.reduce((s, r) => s + (r.hanger?.cost ?? 0), 0), [rows]);

  // Model summary: count per hanger model
  const modelSummary = useMemo(() => {
    const map = new Map<string, { count: number; inStockCount: number }>();
    for (const row of rows) {
      if (!row.hanger) continue;
      const model = row.hanger.model;
      const existing = map.get(model) ?? { count: 0, inStockCount: 0 };
      map.set(model, {
        count: existing.count + 1,
        inStockCount: existing.inStockCount + (row.isInStock ? 1 : 0),
      });
    }
    // Sort by count descending
    return Array.from(map.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .map(([model, stats]) => ({ model, ...stats }));
  }, [rows]);

  // Handle inventory file import
  const handleInventoryFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await loadInventoryFile(file);
      onInventoryChange(parsed);
    } catch {
      // silently ignore — user can retry
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Export to Excel
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // ── Style helpers ──────────────────────────────────────────────────────────
    const HEADER_FILL = { patternType: 'solid' as const, fgColor: { rgb: '1E3A5F' } };
    const HEADER_FONT = { bold: true, color: { rgb: 'FFFFFF' }, sz: 10 };
    const TOTAL_FILL  = { patternType: 'solid' as const, fgColor: { rgb: '0F2A45' } };
    const TOTAL_FONT  = { bold: true, color: { rgb: 'A0C4FF' }, sz: 10 };
    const BORDER_THIN = {
      top:    { style: 'thin' as const, color: { rgb: '334155' } },
      bottom: { style: 'thin' as const, color: { rgb: '334155' } },
      left:   { style: 'thin' as const, color: { rgb: '334155' } },
      right:  { style: 'thin' as const, color: { rgb: '334155' } },
    };
    const BORDER_HEADER = {
      top:    { style: 'medium' as const, color: { rgb: '0EA5E9' } },
      bottom: { style: 'medium' as const, color: { rgb: '0EA5E9' } },
      left:   { style: 'thin'   as const, color: { rgb: '0EA5E9' } },
      right:  { style: 'thin'   as const, color: { rgb: '0EA5E9' } },
    };

    /** Apply header style + border to all cells in row 0, data border to rest */
    function styleSheet(ws: XLSX.WorkSheet, numCols: number, numRows: number) {
      for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
          const addr = XLSX.utils.encode_cell({ r, c });
          if (!ws[addr]) continue;
          if (r === 0) {
            ws[addr].s = { fill: HEADER_FILL, font: HEADER_FONT, border: BORDER_HEADER, alignment: { horizontal: 'center' } };
          } else if (r === numRows - 1) {
            ws[addr].s = { fill: TOTAL_FILL, font: TOTAL_FONT, border: BORDER_THIN, alignment: { horizontal: c === 0 ? 'left' : 'center' } };
          } else {
            ws[addr].s = { border: BORDER_THIN, alignment: { horizontal: c === 0 ? 'left' : 'center' } };
          }
        }
      }
    }

    // ── Sheet 1: Hanger Schedule ───────────────────────────────────────────────
    const summaryData: (string | number)[][] = [
      ['Girder', 'Carried Truss', 'Offset X', 'Hanger Model', 'Download Cap (lb)', 'Uplift Cap (lb)', 'Width (in)', 'Height (in)', 'Bearing (in)', 'MSRP ($)', 'In Stock', 'Selection'],
    ];
    for (const row of rows) {
      summaryData.push([
        row.girderLabel,
        row.carriedLabel,
        fmtOffset(row.offsetX),
        row.hanger?.model ?? 'N/A — No SST results',
        row.hanger?.downloadLoad ?? '',
        row.hanger?.upliftLoad ?? '',
        row.hanger?.width ?? '',
        row.hanger?.height ?? '',
        row.hanger?.bearing ?? '',
        row.hanger?.cost ?? '',
        row.hanger ? (row.isInStock ? 'Yes' : 'No') : '',
        row.selectionMode === 'available' ? 'Lowest Cost In-Stock'
          : row.selectionMode === 'cheapest' ? 'Lowest Cost Overall'
          : 'Pending',
      ]);
    }

    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    ws1['!cols'] = [
      { wch: 10 }, { wch: 14 }, { wch: 12 },
      { wch: 20 }, { wch: 16 }, { wch: 14 }, { wch: 10 }, { wch: 10 },
      { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 20 },
    ];
    styleSheet(ws1, 12, summaryData.length);
    XLSX.utils.book_append_sheet(wb, ws1, 'Hanger Schedule');

    // ── Sheet 2: Model Summary ─────────────────────────────────────────────────
    const modelData: (string | number)[][] = [
      ['Hanger Model', 'Qty', 'In Stock'],
    ];
    for (const item of modelSummary) {
      modelData.push([item.model, item.count, item.inStockCount > 0 ? item.inStockCount : '—']);
    }
    modelData.push(['TOTAL', modelSummary.reduce((s, m) => s + m.count, 0), modelSummary.reduce((s, m) => s + m.inStockCount, 0) || '—']);

    const ws2 = XLSX.utils.aoa_to_sheet(modelData);
    ws2['!cols'] = [{ wch: 20 }, { wch: 8 }, { wch: 10 }];
    styleSheet(ws2, 3, modelData.length);
    XLSX.utils.book_append_sheet(wb, ws2, 'Model Summary');

    const timestamp = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '-');
    XLSX.writeFile(wb, `hanger_schedule_${timestamp}.xlsx`);
  };

  const isQuerying = batchProgress?.running === true;
  const batchDone = batchProgress && !batchProgress.running;
  const batchPct = batchProgress && batchProgress.total > 0
    ? Math.round((batchProgress.completed / batchProgress.total) * 100)
    : 0;

  return (
    <AuiPane name="job-summary" title="Job Summary">
      {/* Header */}
      <div className={AUI.row}>
        <AuiIcon name="file-spreadsheet" />
        <h3 className={AUI.heading} {...ATTR}>Job Hanger Schedule</h3>
        <span className={AUI.text} {...ATTR}>
          {resolvedConnections}/{totalConnections} connections resolved
        </span>
      </div>

      <div className={AUI.row} role="group" aria-label="Job actions">
        {/* Inventory import */}
        <input ref={fileInputRef} type="file" accept=".xml" hidden onChange={handleInventoryFile} />
        <button type="button" onClick={() => fileInputRef.current?.click()} className={AUI.button}>
          <AuiIcon name="box" />
          {hasInventory ? 'Replace Inventory XML' : 'Import Inventory XML'}
        </button>
        {hasInventory && (
          <>
            <span className={AUI.text} {...ATTR}>
              <AuiIcon name="box-check" />
              {inventory!.inStockSet.size} models in stock
            </span>
            <button type="button" onClick={() => onInventoryChange(null)} className={AUI.buttonQuiet}>
              Remove
            </button>
          </>
        )}

        {/* Re-query button (shown when not running) */}
        {!isQuerying && (
          <button
            type="button"
            onClick={runBatchQuery}
            disabled={!hasSSTToken()}
            className={hasSSTToken() ? AUI.button : AUI.buttonDisabled}
            title="Re-query SST for all connections"
          >
            Re-query All
          </button>
        )}

        {/* Stop button (shown while running) */}
        {isQuerying && (
          <button type="button" onClick={() => { abortRef.current = true; }} className={AUI.button}>
            Stop
          </button>
        )}

        {/* Export Excel */}
        <button
          type="button"
          onClick={handleExportExcel}
          disabled={resolvedConnections === 0}
          className={resolvedConnections > 0 ? AUI.buttonMain : AUI.buttonDisabled}
        >
          <AuiIcon name="download" />
          Export Excel
        </button>
      </div>

      {/* No token warning */}
      {noToken && (
        <div className={AUI.bannerError} role="alert" aria-label="No SST token found. Set the Bearer token in the SST Workspace (Analyzer tab) first, then re-query." data-aui-banner-color="error" data-aui-banner-scale="sm">
          <div className={AUI.bannerText} {...ATTR}>
            No SST token found. Set the Bearer token in the SST Workspace (Analyzer tab) first, then re-query.
          </div>
        </div>
      )}

      {/* Batch progress bar */}
      {batchProgress && (
        <div className={AUI.stack}>
          <div className={AUI.row}>
            {isQuerying ? (
              <AuiIcon name="spinner" />
            ) : batchDone && batchProgress.failed === 0 ? (
              <AuiIcon name="circle-check" />
            ) : (
              <AuiIcon name="circle-exclamation" />
            )}
            <span className={AUI.text} {...ATTR}>
              {isQuerying
                ? `Querying SST API… ${batchProgress.completed}/${batchProgress.total}`
                : batchProgress.aborted
                  ? `Stopped — ${batchProgress.completed}/${batchProgress.total} completed`
                  : `Done — ${batchProgress.completed}/${batchProgress.total} queried${batchProgress.failed > 0 ? `, ${batchProgress.failed} failed` : ''}`
              }
            </span>
            {batchProgress.failed > 0 && (
              <span className={AUI.text} {...ATTR}>{batchProgress.failed} failed</span>
            )}
          </div>
          {/* OPEN: no Progress recipe in the standard (GAPS.md); the browser's own progress element */}
          <progress value={batchPct} max={100} aria-label="Batch progress" />
        </div>
      )}

      {/* Stats bar */}
      <div className={AUI.row} role="group" aria-label="Job statistics">
        <span className={AUI.text} {...ATTR}>Total Connections</span>
        <span className={AUI.text} {...ATTR}>{totalConnections}</span>
        <span className={AUI.text} {...ATTR}>Hangers Selected</span>
        <span className={AUI.text} {...ATTR}>{resolvedConnections}</span>
        <span className={AUI.text} {...ATTR}>Selection Mode</span>
        <span className={AUI.text} {...ATTR}>
          {hasInventory ? 'Lowest Cost In-Stock (fallback: lowest cost overall)' : 'Lowest Cost Overall (no inventory loaded)'}
        </span>
      </div>

      {/* ── Model Summary Table ── */}
      {modelSummary.length > 0 && (
        <div className={AUI.stack}>
          <div className={AUI.row}>
            <h3 className={AUI.heading} {...ATTR}>Hanger Model Summary</h3>
            <span className={AUI.text} {...ATTR}>
              {modelSummary.length} model{modelSummary.length !== 1 ? 's' : ''} · {resolvedConnections} total hangers
            </span>
          </div>
          <AuiTable
            label="Hanger Model Summary"
            columns={[
              { header: 'Hanger Model' },
              { header: 'Qty', align: 'right' },
              ...(hasInventory ? [{ header: 'In Stock', align: 'right' as const }] : []),
            ]}
            rows={[
              ...modelSummary.map(({ model, count, inStockCount }) => ({
                key: model,
                cells: [
                  model,
                  count,
                  ...(hasInventory ? [inStockCount > 0 ? inStockCount : '—'] : []),
                ],
              })),
              {
                key: '__total',
                cells: [
                  'Total',
                  modelSummary.reduce((s, m) => s + m.count, 0),
                  ...(hasInventory ? [modelSummary.reduce((s, m) => s + m.inStockCount, 0) || '—'] : []),
                ],
              },
            ]}
          />
        </div>
      )}

      {girders.length === 0 && (
        <span className={AUI.text} {...ATTR}>No girder data loaded.</span>
      )}

      {Array.from(byGirder.entries()).map(([girderId, gRows]) => {
        const girderLabel = gRows[0].girderLabel;
        const girderResolved = gRows.filter((r) => r.hanger !== null).length;

        return (
          <div key={girderId} className={AUI.stack}>
            {/* Girder header */}
            <div className={AUI.row}>
              <h3 className={AUI.heading} {...ATTR}>Girder: {girderLabel}</h3>
              <span className={AUI.text} {...ATTR}>{girderResolved}/{gRows.length} connections</span>
            </div>

            {/* Connections table */}
            <AuiTable
              label={`Girder ${girderLabel} connections`}
              columns={[
                { header: 'Carried Truss' },
                { header: 'Offset X', align: 'right' },
                { header: 'Hanger Model' },
                { header: 'DL Cap (lb)', align: 'right' },
                { header: 'UL Cap (lb)', align: 'right' },
                { header: 'Width', align: 'right' },
                { header: 'Height', align: 'right' },
                { header: 'Stock', align: 'center' },
                { header: 'Selection' },
              ]}
              rows={gRows.map((row) => ({
                key: row.carriedId,
                cells: [
                  <>
                    <div>{row.carriedLabel}</div>
                    <div>{row.carriedId}</div>
                  </>,
                  fmtOffset(row.offsetX),
                  row.hanger ? (
                    <>
                      {row.isInStock && <AuiIcon name="box-check" />}
                      {row.hanger.model}
                    </>
                  ) : (
                    Object.keys(hangerResultsMap).some(k => k.startsWith(row.girderId) && k.endsWith(row.carriedId))
                      ? 'No results from SST'
                      : 'Run SST query first'
                  ),
                  row.hanger ? row.hanger.downloadLoad.toLocaleString() : '—',
                  row.hanger ? row.hanger.upliftLoad.toLocaleString() : '—',
                  row.hanger && row.hanger.width > 0 ? `${row.hanger.width.toFixed(3)}"` : '—',
                  row.hanger && row.hanger.height > 0 ? `${row.hanger.height.toFixed(3)}"` : '—',
                  row.hanger ? (row.isInStock ? <AuiIcon name="box-check" /> : '—') : '—',
                  row.selectionMode === 'available' ? (
                    <span className={AUI.chipSuccess}><span className={AUI.chipLabel} {...ATTR}>In-Stock</span></span>
                  ) : row.selectionMode === 'cheapest' ? (
                    <span className={AUI.chipNeutral}><span className={AUI.chipLabel} {...ATTR}>Lowest Cost</span></span>
                  ) : (
                    <span className={AUI.chipWarning}><span className={AUI.chipLabel} {...ATTR}>Pending</span></span>
                  ),
                ],
              }))}
            />
          </div>
        );
      })}
    </AuiPane>
  );
}
