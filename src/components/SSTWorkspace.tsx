/**
 * SST Hanger Selector — Full Workspace View
 *
 * Replaces the diagrams+sidebar workspace when user clicks "Find Hanger"
 * on a carried truss. Layout mirrors the SST site:
 *   Left column  = INPUT (5 collapsible sections, editable Job Settings)
 *   Right column = OUTPUT (token, action button, results table + filter bar)
 */

import React, { useId, useState, useCallback, useEffect, useRef } from 'react';
import type { GirderGroup, CarriedTruss } from '../types';
import type { SSTHangerResult, SSTAPIResponse, SSTPayload } from '../lib/sst-types';
import { buildSSTPayload, computeAnsitpi } from '../lib/sst-mapper';
import {
  hasSSTToken,
  submitToSST,
} from '../lib/sst-api';
import { AUI, ATTR } from '../aui';
import { AuiIcon } from './AuiIcon';
import { AuiSelect } from './AuiSelect';
import { AuiSection } from './AuiSection';
import { AuiTable } from './AuiTable';
import { AuiPane } from './AuiPane';
import type { ParsedInventory } from '../lib/inventory';
import { loadInventoryFile, isInStock } from '../lib/inventory';

// ---------------------------------------------------------------------------
// Job Settings overrides — user-editable fields lifted to SSTWorkspace
// ---------------------------------------------------------------------------

export interface JobOverrides {
  style: number;
  fastenerType: number;
  downloadDurationType: number;
  upliftLoadDurationType: number;
  ansitpi: number;
}

// ---------------------------------------------------------------------------
// Enum label maps
// ---------------------------------------------------------------------------

const MATERIAL_LABELS: Record<number, string> = {
  1: 'Solid Sawn', 2: 'Glulam', 3: 'LSL', 4: 'LVL',
  5: 'Truss', 6: 'I-Joist', 7: 'Truss', 10: 'Concrete', 11: 'Steel',
};

/** Lumber Species labels keyed by SST material code (truss species variant) */
const SPECIES_LABELS: Record<number, string> = {
  5: 'DF — Douglas Fir',
  6: 'HF — Hem Fir',
  7: 'SP — Southern Pine',
  8: 'SPF — Spruce Pine Fir',
};
const STYLE_LABELS: Record<number, string> = {
  0: 'All Types', 1: 'Face Mount', 2: 'Top Flange', 3: 'Concealed Flange',
};
const FASTENER_LABELS: Record<number, string> = {
  0: 'All', 1: 'Nails', 2: 'Bolts', 3: 'Screws',
};
const ANSITPI_LABELS: Record<number, string> = {
  0: 'Off', 3: 'On (End Connection)', 6: 'On (Interior Connection)',
};
const CODE_LABELS: Record<number, string> = {
  0: 'None', 10: 'IBC 2018', 20: 'IRC 2018', 30: 'IBC 2021', 40: 'IRC 2021',
};
const DL_DUR_LABELS: Record<number, string> = {
  90: 'Dead (90)', 100: 'Floor (100)', 115: 'Snow (115)', 125: 'Roof (125)', 160: 'Quake/Wind (160)',
};
const UL_DUR_LABELS: Record<number, string> = {
  100: 'Normal (100)', 160: 'Quake/Wind (160)',
};
const SKEW_LABELS: Record<number, string> = { 0: 'None', 1: 'Left', 2: 'Right' };
const SLOPE_LABELS: Record<number, string> = { 0: 'None', 1: 'Up', 2: 'Down' };

function widthToNominal(w: number): string {
  if (w <= 1.5) return '2x (1 1/2")';
  if (w <= 2.5) return '3x (2 1/2")';
  if (w <= 3.5) return '4x (3 1/2")';
  if (w <= 5.5) return '6x (5 1/2")';
  return `${w}"`;
}

function depthToNominal(d: number): string {
  if (d <= 3.5) return '4 (3 1/2")';
  if (d <= 4.5) return '5 (4 1/2")';
  if (d <= 5.5) return '6 (5 1/2")';
  if (d <= 7.25) return '8 (7 1/4")';
  if (d <= 9.25) return '10 (9 1/4")';
  if (d <= 11.25) return '12 (11 1/4")';
  return `${d}"`;
}

/** How a field's value was obtained — shown as a plain text tag */
type SourceType = 'tre' | 'tre-or-ifc' | 'computed' | 'default' | 'unknown';

const SOURCE_LABEL: Record<SourceType, string> = {
  tre: 'TRE',
  'tre-or-ifc': 'TRE/IFC',
  computed: 'computed',
  default: 'default',
  unknown: 'unknown',
};

function sourceLine(sourceType?: SourceType, sourceNote?: string) {
  if (!sourceType) return null;
  return (
    <span className={AUI.text} {...ATTR}>
      [{SOURCE_LABEL[sourceType]}]{sourceNote ? ` ${sourceNote}` : ''}
    </span>
  );
}

function Row({ label, value, sourceType, sourceNote }: {
  label: string;
  value: string;
  highlight?: 'down' | 'up';
  sourceType?: SourceType;
  sourceNote?: string;
}) {
  return (
    <div className={AUI.rowBetween}>
      <span className={AUI.text} {...ATTR}>{label}</span>
      <div className={AUI.stack}>
        <span className={AUI.text} {...ATTR}>{value}</span>
        {sourceLine(sourceType, sourceNote)}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// INPUT Panel (left column)
// ---------------------------------------------------------------------------

type ViewMode = 'split' | 'input-only' | 'output-only';

// ---------------------------------------------------------------------------
// Reusable select control for Job Settings
// ---------------------------------------------------------------------------

function SelectRow<T extends number>({
  label,
  value,
  options,
  onChange,
  sourceType,
  sourceNote,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  sourceType?: SourceType;
  sourceNote?: string;
}) {
  return (
    <div className={AUI.stack}>
      <AuiSelect label={label} value={value} options={options} onChange={onChange} />
      {sourceLine(sourceType, sourceNote)}
    </div>
  );
}

/** A labelled number or text field (field-input recipe). */
function FilterField({ label, value, onChange, placeholder, step, type = 'number' }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  step?: string;
  type?: 'number' | 'text';
}) {
  const id = useId();
  return (
    <div className={AUI.field}>
      <label id={`${id}-l`} htmlFor={`${id}-i`} className={AUI.fieldLabel}>{label}</label>
      <div className={AUI.fieldControl}>
        <input
          id={`${id}-i`}
          type={type}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-labelledby={`${id}-l`}
          className={AUI.input}
        />
      </div>
    </div>
  );
}

function InputPanel({ payload, girderLabel, carriedLabel, viewMode, onViewChange, overrides, onOverridesChange, carried, group, top }: {
  payload: SSTPayload;
  girderLabel: string;
  carriedLabel: string;
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  overrides: JobOverrides;
  onOverridesChange: (o: JobOverrides) => void;
  carried: CarriedTruss;
  group: GirderGroup;
  /** the back button and heading, shown at the top of the first visible pane */
  top?: React.ReactNode;
}) {
  const [sections, setSections] = useState({
    connection: true,
    job: true,
    carrying: true,
    carried: true,
    hanger: true,
    mapping: false,
  });

  const toggle = (key: keyof typeof sections) =>
    setSections((s) => ({ ...s, [key]: !s[key] }));

  const cm = payload.carryingMember;
  const cd = payload.carriedMembers[0];
  const isTruss = payload.flushOption === 'BOTTOM';

  // Resolve species string for display (from cuttingMembers → bottomChord spec → ifcBottomChord)
  const girderSpeciesStr =
    group.girder.treData?.cuttingMembers?.find(m => m.type === 'BottomChord')?.species
    ?? group.girder.treData?.bottomChord
    ?? group.girder.ifcBottomChord
    ?? null;
  const carriedSpeciesStr =
    carried.treData?.cuttingMembers?.find(m => m.type === 'BottomChord')?.species
    ?? carried.treData?.bottomChord
    ?? null;

  // ANSI/TPI 1 connection type — computed from 5d rule
  const ansitpiComputed = computeAnsitpi(group, carried);
  const hasAnsitpiData = (group.girder.treData?.span ?? 0) > 0;

  const set = <K extends keyof JobOverrides>(key: K, val: JobOverrides[K]) =>
    onOverridesChange({ ...overrides, [key]: val });

  const defaultOverrides: JobOverrides = {
    style: payload.style,
    fastenerType: payload.fastenerType,
    downloadDurationType: payload.designInformations.downloadDurationType,
    upliftLoadDurationType: payload.designInformations.upliftLoadDurationType,
    ansitpi: payload.ansitpi,
  };

  const isDirty = JSON.stringify(overrides) !== JSON.stringify(defaultOverrides);

  const connectionBox = (selected: boolean, title: string, sub: string, check?: boolean) => (
    <div className={selected ? AUI.panelSelected : AUI.panel}>
      <div className={AUI.stack}>
        <span className={AUI.text} {...ATTR}>{title}</span>
        <span className={AUI.text} {...ATTR}>{sub}</span>
        {check && <AuiIcon name="circle-check" />}
      </div>
    </div>
  );

  return (
    <AuiPane
      name="sst-input"
      size={viewMode === 'input-only' ? 'fill' : 'list'}
      title="Input"
      extra={
        <>
          <span className={AUI.text} {...ATTR}>{carriedLabel} on {girderLabel}</span>
          {isDirty && (
            <button type="button" onClick={() => onOverridesChange(defaultOverrides)} className={AUI.buttonQuiet} title="Reset to defaults">
              <AuiIcon name="rotate-left" />
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={() => onViewChange(viewMode === 'input-only' ? 'split' : 'input-only')}
            className={viewMode === 'input-only' ? AUI.iconButtonSelected : AUI.iconButton}
            aria-label={viewMode === 'input-only' ? 'Show split view' : 'Expand Input'}
            title={viewMode === 'input-only' ? 'Show split view' : 'Expand Input'}
          >
            <AuiIcon name={viewMode === 'input-only' ? 'table-columns' : 'maximize'} />
          </button>
        </>
      }
    >
      {top}

      {/* 1. CONNECTION TYPE */}
      <AuiSection title="Connection Type" expanded={sections.connection} onToggle={() => toggle('connection')}>
        <div className={AUI.row}>
          {connectionBox(!isTruss, 'Joist', '(Flush Top)')}
          {connectionBox(isTruss, 'Truss', '(Flush Bottom)', isTruss)}
          {connectionBox(false, 'Multi-Truss', '(Flush Bottom)')}
        </div>
      </AuiSection>

      {/* 2. JOB SETTINGS — editable */}
      <AuiSection title="Job Settings" expanded={sections.job} onToggle={() => toggle('job')}>
        <div className={AUI.stack}>
          <SelectRow
            label="Hanger Type"
            value={overrides.style}
            onChange={(v) => set('style', v)}
            sourceType="default"
            sourceNote="filter by mount type"
            options={[
              { value: 0, label: 'All Types' },
              { value: 1, label: 'Face Mount' },
              { value: 2, label: 'Top Flange' },
              { value: 3, label: 'Concealed Flange' },
            ]}
          />
          <SelectRow
            label="Fastener Type"
            value={overrides.fastenerType}
            onChange={(v) => set('fastenerType', v)}
            sourceType="default"
            sourceNote="filter by fastener"
            options={[
              { value: 0, label: 'All' },
              { value: 1, label: 'Nails' },
              { value: 2, label: 'Bolts' },
              { value: 3, label: 'Screws' },
            ]}
          />
          <Row label="Building Code" value={CODE_LABELS[payload.buildingCode] ?? String(payload.buildingCode)} sourceType="default" sourceNote="IRC 2018" />
          <SelectRow
            label="Download Duration"
            value={overrides.downloadDurationType}
            onChange={(v) => set('downloadDurationType', v)}
            sourceType={carried.downDolFactor != null ? 'computed' : 'default'}
            sourceNote={carried.downDolFactor != null
              ? `DOL ${carried.downDolFactor.toFixed(2)} from downReaction LC`
              : 'load duration factor'}
            options={[
              { value: 90, label: 'Dead (90)' },
              { value: 100, label: 'Floor (100)' },
              { value: 115, label: 'Snow (115)' },
              { value: 125, label: 'Roof (125)' },
              { value: 160, label: 'Wind/Quake (160)' },
            ]}
          />
          <SelectRow
            label="Uplift Duration"
            value={overrides.upliftLoadDurationType}
            onChange={(v) => set('upliftLoadDurationType', v)}
            sourceType={carried.upliftDolFactor != null ? 'computed' : 'default'}
            sourceNote={carried.upliftDolFactor != null
              ? `DOL ${carried.upliftDolFactor.toFixed(2)} from upliftReaction LC`
              : 'uplift duration factor'}
            options={[
              { value: 100, label: 'Normal (100)' },
              { value: 160, label: 'Wind/Quake (160)' },
            ]}
          />
          {isTruss && (
            <SelectRow
              label="ANSI/TPI 1 Evaluation"
              value={overrides.ansitpi}
              onChange={(v) => set('ansitpi', v)}
              sourceType={hasAnsitpiData ? 'computed' : 'default'}
              sourceNote={hasAnsitpiData
                ? `${ansitpiComputed.isEndConnection ? 'End' : 'Interior'}: dist=${ansitpiComputed.distFromNearestBearing.toFixed(2)}" vs 5d=${ansitpiComputed.threshold.toFixed(2)}" (d=${ansitpiComputed.girderBCDepth}")`
                : 'no TRE span data'}
              options={[
                { value: 0, label: 'Off' },
                { value: 3, label: 'On (End Connection)' },
                { value: 6, label: 'On (Interior Connection)' },
              ]}
            />
          )}
          <Row label="Job ID" value={`${carriedLabel} on ${girderLabel}`} sourceType="tre" sourceNote="carried + girder label" />
        </div>
      </AuiSection>

      {/* 3. CARRYING MEMBER */}
      <AuiSection title={isTruss ? 'Girder (Carrying Member)' : 'Header (Carrying Member)'} expanded={sections.carrying} onToggle={() => toggle('carrying')}>
        <div className={AUI.stack}>
          <Row label="Type" value={MATERIAL_LABELS[cm.material] ?? String(cm.material)} sourceType="default" sourceNote="girder = Truss type" />
          <Row
            label="Lumber Species"
            value={SPECIES_LABELS[cm.material] ?? String(cm.material)}
            sourceType={girderSpeciesStr ? 'tre-or-ifc' : 'default'}
            sourceNote={girderSpeciesStr ? `TRE → IFC fallback: "${girderSpeciesStr}"` : 'default: DF'}
          />
          <Row label="Bottom Chord Width" value={widthToNominal(cm.width)} sourceType="tre" sourceNote={`actual: ${cm.width}"`} />
          <Row label="Bottom Chord Height" value={depthToNominal(cm.depth)} sourceType="tre" sourceNote={`actual: ${cm.depth}"`} />
          <Row
            label="Number of Plies"
            value={String(cm.ply)}
            sourceType={group.girder.treData?.ply != null ? 'tre' : 'default'}
            sourceNote={group.girder.treData?.ply != null
              ? `Ply=${group.girder.treData.ply} from [ADDITIONAL TRUSS INFO]`
              : 'not in TRE'}
          />
          {isTruss && (
            <>
              <Row label="Vertical Width (King Post)" value={cm.kingWidth > 0 ? `${cm.kingWidth}"` : 'N/A'} sourceType="computed" sourceNote={cm.kingWidth > 0 ? 'vertical web at connection point' : 'no vertical web detected'} />
              <Row label="Total Height" value={`${cm.kingHeight}"`} sourceType="computed" sourceNote={cm.kingWidth > 0 ? 'vertical web segment height' : 'from girder heel height'} />
            </>
          )}
          <Row label="Member ID" value={girderLabel} sourceType="tre" sourceNote="girder label" />
        </div>
      </AuiSection>

      {/* 4. CARRIED MEMBER */}
      <AuiSection title={isTruss ? 'Truss (Carried Member)' : 'Joist (Carried Member)'} expanded={sections.carried} onToggle={() => toggle('carried')}>
        <div className={AUI.stack}>
          <Row label="Member Type" value={MATERIAL_LABELS[cd.material] ?? String(cd.material)} sourceType="default" sourceNote="carried = Truss type" />
          <Row
            label="Lumber Species"
            value={SPECIES_LABELS[cd.material] ?? String(cd.material)}
            sourceType={carriedSpeciesStr ? 'tre' : 'default'}
            sourceNote={carriedSpeciesStr ? `from TRE: "${carriedSpeciesStr}"` : 'default: DF'}
          />
          <Row label="Bottom Chord Width" value={widthToNominal(cd.width)} sourceType="tre" sourceNote={`actual: ${cd.width}"`} />
          {isTruss ? (
            <Row label="Heel Height" value={`${cd.depth}"`} sourceType="tre" sourceNote="TRE heel at bearing side" />
          ) : (
            <Row label="Bottom Chord Height" value={depthToNominal(cd.depth)} sourceType="tre" sourceNote={`actual: ${cd.depth}"`} />
          )}
          <Row
            label="Number of Plies"
            value={String(cd.ply)}
            sourceType={carried.treData?.ply != null ? 'tre' : 'default'}
            sourceNote={carried.treData?.ply != null
              ? `Ply=${carried.treData.ply} from [ADDITIONAL TRUSS INFO]`
              : 'not in TRE'}
          />
          <Row label="Member ID" value={carriedLabel} sourceType="tre" sourceNote="carried label" />
          <Row label="Download (ASD)" value={`${cd.loads.load.toLocaleString()} lb`} sourceType="computed" sourceNote="from reaction analysis" />
          <Row label="Uplift (ASD)" value={`${cd.loads.uplift.toLocaleString()} lb`} sourceType="computed" sourceNote="from reaction analysis" />
        </div>
      </AuiSection>

      {/* 5. HANGER OPTIONS */}
      <AuiSection title="Hanger Options" expanded={sections.hanger} onToggle={() => toggle('hanger')}>
        <div className={AUI.stack}>
          <Row
            label="Skew (Degrees)"
            value={`${cd.angle.skewRaw}°`}
            sourceType={carried.hangerAngle != null ? 'computed' : 'unknown'}
            sourceNote={carried.hangerAngle != null
              ? `LG*T field[14]=${carried.hangerAngle}° → skew=${cd.angle.skewRaw}°`
              : 'not available in TRE/IFC'}
          />
          <Row label="Slope (Degrees)" value={`${cd.angle.slopeAngle}°`} sourceType="unknown" sourceNote="not available in TRE/IFC" />
          <Row label="Top Flange Bend (Degrees)" value="0°" sourceType="unknown" sourceNote="not available in TRE/IFC" />
          <Row label="Top Flange Slope (Degrees)" value="0°" sourceType="unknown" sourceNote="not available in TRE/IFC" />
        </div>
      </AuiSection>

      {/* 6. DATA MAPPING REFERENCE */}
      <AuiSection title="Data Mapping Reference" expanded={sections.mapping} onToggle={() => toggle('mapping')}>
        <div className={AUI.stack}>
          {/* Data Flow */}
          <div className={AUI.panel}>
            <div className={AUI.stack}>
              <span className={AUI.text} {...ATTR}>Data Flow</span>
              <span className={AUI.text} {...ATTR}>TRE file → parser.ts → enrichCarriedTrusses() → buildSSTPayload() → SST API</span>
              <span className={AUI.text} {...ATTR}>
                Each field below shows exactly which TRE section/field it reads from, so engineers can cross-check values directly in the source file.
              </span>
            </div>
          </div>

          {/* Bearing Side Detection */}
          <div className={AUI.panel}>
            <div className={AUI.stack}>
              <span className={AUI.text} {...ATTR}>Bearing Side Detection (Critical)</span>
              <span className={AUI.text} {...ATTR}>Step 1 — Girder TRE · Section [Hanger Loading Info.] · Line LG{'{n}'}T=... · Field parts[16] = bearing coordinate on carried truss (inches)</span>
              <span className={AUI.text} {...ATTR}>Step 2 — Carried TRE · Section REACTION INFO · Header line 2 -1 -1 -1 -1 &lt;bearingA&gt; &lt;bearingB&gt;</span>
              <span className={AUI.text} {...ATTR}>Step 3 — Match · bearingA (smaller, x≈0) = LEFT end · bearingB (larger, x≈span) = RIGHT end · Tolerance ±4.1"</span>
              <span className={AUI.text} {...ATTR}>Fallback · If no match → IFC bounding box geometry used to determine bearing side</span>
            </div>
          </div>

          {/* Field-by-field mapping */}
          <h4 className={AUI.heading} {...ATTR}>Job Settings</h4>
          <MappingRow2 label="Job ID" badge="TRE" badgeColor="green" treSection="[Hanger Loading Info.]" treField={`LG{n}T= parts[4] (carried label) + girder label`} note="e.g. T07 on T04" />
          <MappingRow2 label="Building Code" badge="Default" badgeColor="gray" note="IRC 2018" />
          <MappingRow2 label="Duration of Load" badge="Default" badgeColor="gray" note="Roof = 1.25 (download) · Wind/Quake = 1.60 (uplift)" />
          <MappingRow2 label="ANSI/TPI 1 Evaluation" badge="Computed" badgeColor="amber" treSection="[Hanger Loading Info.] + MEMBER INFO" treField="LG*T field[2]=xInches vs 5×BC_depth from nearest bearing" note="End (3) if dist &lt; 5d · Interior (6) if dist ≥ 5d · fallback: Interior" />
          <MappingRow2 label="Hanger Type" badge="Default" badgeColor="gray" note="All Types (0) — no filter" />

          <h4 className={AUI.heading} {...ATTR}>Carrying Member (Girder)</h4>
          <MappingRow2 label="Member ID" badge="TRE" badgeColor="green" treSection="[Hanger Loading Info.]" treField="LG{n}T= parts[4] → girder label" note="e.g. T07" />
          <MappingRow2 label="Type" badge="Default" badgeColor="gray" note="Truss (5)" />
          <MappingRow2 label="Lumber Species" badge="TRE" badgeColor="green" treSection="[ADDITIONAL CUTTING INFO]" treField="BottomChord → species token (DF/HF/SP/SPF) → material code 5/6/7/8" note="fallback: bottomChord spec string → default DF (5)" />
          <MappingRow2 label="Bottom Chord Width" badge="TRE" badgeColor="green" treSection="MEMBER INFO" treField="BottomChord member → width (inches)" note="e.g. 1.5&quot; for 2x lumber" />
          <MappingRow2 label="Bottom Chord Height" badge="TRE" badgeColor="green" treSection="MEMBER INFO" treField="BottomChord member → depth (inches)" note="e.g. 5.5&quot; for 2x6" />
          <MappingRow2 label="Number of Plies" badge="Default" badgeColor="gray" note="1 — not available in TRE" />
          <MappingRow2 label="Total Height (King)" badge="Computed" badgeColor="amber" note="vertical web height if king post found, otherwise BC depth — overall girder height at connection point" />
          <MappingRow2 label="Vertical Width (King Post)" badge="Computed" badgeColor="amber" note="Scans Web members for vertical segment at connection X ±2&quot; · width of that web member" />

          <h4 className={AUI.heading} {...ATTR}>Carried Member (Truss)</h4>
          <MappingRow2 label="Member ID" badge="TRE" badgeColor="green" treSection="[Hanger Loading Info.]" treField="LG{n}T= parts[4] → carried label" note="e.g. T02" />
          <MappingRow2 label="Type" badge="Default" badgeColor="gray" note="Truss (5)" />
          <MappingRow2 label="Lumber Species" badge="TRE" badgeColor="green" treSection="[ADDITIONAL CUTTING INFO]" treField="BottomChord → species token (DF/HF/SP/SPF) → material code 5/6/7/8" note="fallback: bottomChord spec string → default DF (5)" />
          <MappingRow2 label="Bottom Chord Width" badge="TRE" badgeColor="green" treSection="MEMBER INFO" treField="BottomChord member → width (inches)" note="e.g. 1.5&quot; for 2x lumber" />
          <MappingRow2 label="Heel Height" badge="TRE" badgeColor="green"
            treSection="[TRUSS DETAILS]"
            treField="Left Heel Height= or Right Heel Height= (chosen by bearing side)"
            note="bearingSide=left → Left Heel Height · bearingSide=right → Right Heel Height"
          />
          <MappingRow2 label="Number of Plies" badge="Default" badgeColor="gray" note="1 — not available in TRE" />
          <MappingRow2 label="Download (ASD)" badge="Computed" badgeColor="amber"
            treSection="REACTION INFO"
            treField="max(col[1]) where col[6]=-1 (governing) and col[3] matches bearing coordinate"
            note="max downward reaction across all load cases at the bearing end"
          />
          <MappingRow2 label="Uplift (ASD)" badge="Computed" badgeColor="amber"
            treSection="REACTION INFO"
            treField="min(col[1]) where col[6]=-1 (governing) and col[3] matches bearing coordinate"
            note="min (most negative) uplift reaction across all load cases"
          />

          <h4 className={AUI.heading} {...ATTR}>Hanger Options</h4>
          <MappingRow2 label="Skew (Degrees)" badge="N/A" badgeColor="red" note="Not available in TRE/IFC — defaults to 0°" />
          <MappingRow2 label="Slope (Degrees)" badge="N/A" badgeColor="red" note="Not available in TRE/IFC — defaults to 0°" />
          <MappingRow2 label="Top Flange Bend (Degrees)" badge="N/A" badgeColor="red" note="Not available in TRE/IFC — defaults to 0°" />
          <MappingRow2 label="Top Flange Slope (Degrees)" badge="N/A" badgeColor="red" note="Not available in TRE/IFC — defaults to 0°" />

          {/* Known gaps */}
          <div className={AUI.panel}>
            <div className={AUI.stack}>
              <span className={AUI.text} {...ATTR}>Known Data Gaps</span>
              <span className={AUI.text} {...ATTR}>Ply count — not in TRE; defaults to 1</span>
              <span className={AUI.text} {...ATTR}>Skew / Slope / Top Flange angles — not in TRE/IFC; all default to 0°</span>
              <span className={AUI.text} {...ATTR}>Lateral load — not available in TRE/IFC</span>
            </div>
          </div>
        </div>
      </AuiSection>
    </AuiPane>
  );
}

/** Engineering-friendly mapping row */
function MappingRow2({ label, badge, badgeColor, treSection, treField, note }: {
  label: string;
  badge: string;
  badgeColor: 'green' | 'amber' | 'gray' | 'red';
  treSection?: string;
  treField?: string;
  note?: string;
}) {
  const chip = { green: AUI.chipSuccess, amber: AUI.chipWarning, gray: AUI.chipNeutral, red: AUI.chipError }[badgeColor];
  return (
    <div className={AUI.row}>
      <span className={chip}><span className={AUI.chipLabel} {...ATTR}>{badge}</span></span>
      <div className={AUI.stack}>
        <span className={AUI.text} {...ATTR}>{label}</span>
        {treSection && <span className={AUI.text} {...ATTR}>Section: {treSection}</span>}
        {treField && <span className={AUI.text} {...ATTR}>Field: {treField}</span>}
        {note && <span className={AUI.text} {...ATTR}>{note}</span>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Output filter state
// ---------------------------------------------------------------------------

interface OutputFilters {
  model: string;
  minDownload: string;
  maxDownload: string;
  minUplift: string;
  maxUplift: string;
  minWidth: string;
  maxWidth: string;
  minHeight: string;
  maxHeight: string;
}

const EMPTY_FILTERS: OutputFilters = {
  model: '',
  minDownload: '',
  maxDownload: '',
  minUplift: '',
  maxUplift: '',
  minWidth: '',
  maxWidth: '',
  minHeight: '',
  maxHeight: '',
};

/**
 * Format Installed Cost relative to the cheapest option in the list — matching SST UI:
 *   - cheapest row  → "Lowest"
 *   - other rows    → "+X.XX%"
 * ici = 0 means unknown → "—"
 */
function installedCostLabel(ici: number, minIci: number): string {
  if (ici <= 0 || minIci <= 0) return '—';
  if (ici === minIci) return 'Lowest';
  const pct = ((ici - minIci) / minIci) * 100;
  return `+${pct.toFixed(2)}%`;
}


function applyFilters(hangers: SSTHangerResult[], f: OutputFilters): SSTHangerResult[] {
  return hangers.filter((h) => {
    if (f.model && !h.model.toLowerCase().includes(f.model.toLowerCase())) return false;
    if (f.minDownload !== '' && h.downloadLoad < Number(f.minDownload)) return false;
    if (f.maxDownload !== '' && h.downloadLoad > Number(f.maxDownload)) return false;
    if (f.minUplift !== '' && h.upliftLoad < Number(f.minUplift)) return false;
    if (f.maxUplift !== '' && h.upliftLoad > Number(f.maxUplift)) return false;
    if (f.minWidth !== '' && h.width < Number(f.minWidth)) return false;
    if (f.maxWidth !== '' && h.width > Number(f.maxWidth)) return false;
    if (f.minHeight !== '' && h.height < Number(f.minHeight)) return false;
    if (f.maxHeight !== '' && h.height > Number(f.maxHeight)) return false;
    return true;
  });
}

function isFiltersEmpty(f: OutputFilters): boolean {
  return Object.values(f).every((v) => v === '');
}

// ---------------------------------------------------------------------------
// OUTPUT Panel (right column)
// ---------------------------------------------------------------------------

function OutputPanel({
  payload,
  carriedLabel,
  viewMode,
  onViewChange,
  overrides,
  inventory,
  onInventoryChange,
  onHangersLoaded,
  top,
  onShowInput,
}: {
  payload: SSTPayload;
  carriedLabel: string;
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  overrides: JobOverrides;
  inventory: ParsedInventory | null;
  onInventoryChange: (inv: ParsedInventory | null) => void;
  onHangersLoaded?: (hangers: SSTHangerResult[]) => void;
  top?: React.ReactNode;
  onShowInput?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SSTAPIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<OutputFilters>(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [sortByInstalledCost, setSortByInstalledCost] = useState(true);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [filterInStockOnly, setFilterInStockOnly] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Build effective payload with user overrides applied
  const effectivePayload: SSTPayload = {
    ...payload,
    style: overrides.style,
    fastenerType: overrides.fastenerType,
    ansitpi: overrides.ansitpi,
    designInformations: {
      downloadDurationType: overrides.downloadDurationType,
      upliftLoadDurationType: overrides.upliftLoadDurationType,
    },
  };

  const runQuery = useCallback(async () => {
    if (!hasSSTToken()) {
      setError('No SST token set. Please set the Bearer token in the left sidebar first.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setFilters(EMPTY_FILTERS);

    try {
      console.log('[SST] Payload for', carriedLabel, effectivePayload);
      const res = await submitToSST(effectivePayload);
      console.log('[SST] Response:', res);
      setResult(res);
      if (!res.success) setError(res.error ?? 'Unknown error');
      else if (onHangersLoaded) onHangersLoaded(res.hangers);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(effectivePayload), carriedLabel]);

  // Auto-run on mount and when overrides change
  useEffect(() => {
    runQuery();
  }, [runQuery]);

  const allHangers = result?.success ? result.hangers : [];
  const filtered = (() => {
    let f = applyFilters(allHangers, filters);
    if (filterInStockOnly && inventory) {
      f = f.filter((h) => isInStock(h.model, inventory));
    }
    if (!sortByInstalledCost) return f;
    return [...f].sort((a, b) => {
      const aVal = a.installedCost > 0 ? a.installedCost : Infinity;
      const bVal = b.installedCost > 0 ? b.installedCost : Infinity;
      return aVal - bVal;
    });
  })();
  const hasActiveFilters = !isFiltersEmpty(filters);

  const setFilter = <K extends keyof OutputFilters>(key: K, val: string) =>
    setFilters((f) => ({ ...f, [key]: val }));

  const handleInventoryFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setInventoryError(null);
    try {
      const parsed = await loadInventoryFile(file);
      onInventoryChange(parsed);
    } catch (err) {
      setInventoryError(err instanceof Error ? err.message : 'Failed to parse inventory file');
      onInventoryChange(null);
    }
    // reset input so same file can be re-imported
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <AuiPane
      name="sst-output"
      title="Output"
      extra={
        <>
          {loading && <span className={AUI.text} {...ATTR}>Searching...</span>}
          {result?.success && !loading && (
            <span className={AUI.text} {...ATTR}>
              {hasActiveFilters
                ? `${filtered.length} / ${allHangers.length} hangers`
                : `${allHangers.length} hangers found`}
            </span>
          )}
          {onShowInput && (
            <button type="button" onClick={onShowInput} className={AUI.button} title="Show Input panel">
              <AuiIcon name="chevron-right" />
              Input
            </button>
          )}
          {result?.success && allHangers.length > 0 && (
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className={showFilters || hasActiveFilters ? AUI.buttonMain : AUI.button}
              title="Toggle result filters"
            >
              <AuiIcon name="sliders" />
              Filter
              {hasActiveFilters && (
                <span className={AUI.chipInfo}>
                  <span className={AUI.chipLabel} {...ATTR}>{Object.values(filters).filter((v) => v !== '').length}</span>
                </span>
              )}
            </button>
          )}
          <button type="button" onClick={runQuery} disabled={loading} className={loading ? AUI.buttonDisabled : AUI.button}>
            {loading ? 'Searching...' : 'Re-run'}
          </button>
          <button
            type="button"
            onClick={() => onViewChange(viewMode === 'output-only' ? 'split' : 'output-only')}
            className={viewMode === 'output-only' ? AUI.iconButtonSelected : AUI.iconButton}
            aria-label={viewMode === 'output-only' ? 'Show split view' : 'Expand Output'}
            title={viewMode === 'output-only' ? 'Show split view' : 'Expand Output'}
          >
            <AuiIcon name={viewMode === 'output-only' ? 'table-columns' : 'maximize'} />
          </button>
        </>
      }
    >
      {top}

      {/* INVENTORY BAR */}
      <div className={AUI.row} role="group" aria-label="Inventory">
        <AuiIcon name="box" />
        <span className={AUI.text} {...ATTR}>Inventory</span>

        {/* Import button */}
        <input ref={fileInputRef} type="file" accept=".xml" hidden onChange={handleInventoryFile} />
        <button type="button" onClick={() => fileInputRef.current?.click()} className={AUI.button}>
          {inventory ? 'Replace XML' : 'Import XML'}
        </button>

        {/* Loaded indicator */}
        {inventory && (
          <>
            <span className={AUI.text} {...ATTR}>
              <AuiIcon name="box-check" />
              {inventory.inStockSet.size} models in stock
            </span>
            <button type="button" onClick={() => setFilterInStockOnly((v) => !v)} className={filterInStockOnly ? AUI.buttonMain : AUI.button}>
              {filterInStockOnly ? 'In Stock Only ✓' : 'Show In Stock Only'}
            </button>
            <button
              type="button"
              onClick={() => { onInventoryChange(null); setFilterInStockOnly(false); setInventoryError(null); }}
              className={AUI.buttonQuiet}
              title="Remove inventory"
            >
              <AuiIcon name="xmark" /> Remove
            </button>
          </>
        )}

        {/* Error */}
        {inventoryError && (
          <span className={AUI.text} {...ATTR}>
            <AuiIcon name="circle-exclamation" />
            {inventoryError}
          </span>
        )}
      </div>

      {/* FILTER BAR */}
      {showFilters && result?.success && allHangers.length > 0 && (
        <div className={AUI.stack} role="group" aria-label="Filter Results">
          <div className={AUI.rowBetween}>
            <span className={AUI.text} {...ATTR}><AuiIcon name="sliders" /> Filter Results</span>
            {hasActiveFilters && (
              <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className={AUI.buttonQuiet}>
                <AuiIcon name="xmark" />
                Clear all
              </button>
            )}
          </div>
          <FilterField type="text" label="Model" value={filters.model} onChange={(v) => setFilter('model', v)} placeholder="e.g. LUS, HUS, HHUS..." />
          <div className={AUI.row}>
            <FilterField label="Download ≥" value={filters.minDownload} onChange={(v) => setFilter('minDownload', v)} placeholder="lb" />
            <FilterField label="Download ≤" value={filters.maxDownload} onChange={(v) => setFilter('maxDownload', v)} placeholder="lb" />
          </div>
          <div className={AUI.row}>
            <FilterField label="Uplift ≥" value={filters.minUplift} onChange={(v) => setFilter('minUplift', v)} placeholder="lb" />
            <FilterField label="Uplift ≤" value={filters.maxUplift} onChange={(v) => setFilter('maxUplift', v)} placeholder="lb" />
          </div>
          <div className={AUI.row}>
            <FilterField label="Width ≥ (in)" step="0.125" value={filters.minWidth} onChange={(v) => setFilter('minWidth', v)} placeholder="in" />
            <FilterField label="Width ≤ (in)" step="0.125" value={filters.maxWidth} onChange={(v) => setFilter('maxWidth', v)} placeholder="in" />
          </div>
          <div className={AUI.row}>
            <FilterField label="Height ≥ (in)" step="0.125" value={filters.minHeight} onChange={(v) => setFilter('minHeight', v)} placeholder="in" />
            <FilterField label="Height ≤ (in)" step="0.125" value={filters.maxHeight} onChange={(v) => setFilter('maxHeight', v)} placeholder="in" />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className={AUI.bannerError} role="alert" aria-label={error} data-aui-banner-color="error" data-aui-banner-scale="sm">
          <div className={AUI.bannerText} {...ATTR}>
            {error.split(/(https?:\/\/\S+)/g).map((part, i) =>
              /^https?:\/\//.test(part) ? (
                <a key={i} href={part} target="_blank" rel="noopener noreferrer" role="link" className={AUI.buttonLink}>
                  {part}
                </a>
              ) : (
                part
              )
            )}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className={AUI.row} role="status">
          <AuiIcon name="spinner" />
          <span className={AUI.text} {...ATTR}>Querying SST Hanger Selector API...</span>
        </div>
      )}

      {/* Results Table */}
      {result?.success && allHangers.length > 0 && (
        <div className={AUI.stack}>
          <div className={AUI.rowBetween}>
            <h4 className={AUI.heading} {...ATTR}>Results</h4>
            <div className={AUI.row}>
              <button type="button" onClick={() => setSortByInstalledCost((v) => !v)} className={sortByInstalledCost ? AUI.buttonMain : AUI.button}>
                {sortByInstalledCost ? '↑ Installed Cost' : 'Sort: Installed Cost'}
              </button>
              <span className={AUI.text} {...ATTR}>
                {hasActiveFilters
                  ? `${filtered.length} of ${allHangers.length} entries`
                  : `${allHangers.length} entries`}
              </span>
            </div>
          </div>
          {filtered.length > 0 ? (() => {
            const validIcis = filtered.map(h => h.installedCost).filter(v => v > 0);
            const minIci = validIcis.length > 0 ? Math.min(...validIcis) : 0;
            return (
              <AuiTable
                label="Results"
                columns={[
                  { header: 'Model' },
                  {
                    header: 'Installed Cost',
                    align: 'right',
                    headerNode: (
                      <button type="button" onClick={() => setSortByInstalledCost((v) => !v)} className={AUI.buttonQuiet} title="Sort by Installed Cost">
                        Installed Cost{sortByInstalledCost ? ' ↑' : ''}
                      </button>
                    ),
                  },
                  { header: 'Download (lb)', align: 'right' },
                  { header: 'Uplift (lb)', align: 'right' },
                  { header: 'Width', align: 'right' },
                  { header: 'Height', align: 'right' },
                  { header: 'Bearing', align: 'right' },
                ]}
                rows={filtered.map((h, i) => {
                  const inStock = isInStock(h.model, inventory);
                  return {
                    key: `${h.model}-${i}`,
                    cells: [
                      <>
                        {inStock && <AuiIcon name="box-check" />}
                        {h.model}
                      </>,
                      installedCostLabel(h.installedCost, minIci),
                      h.downloadLoad.toLocaleString(),
                      h.upliftLoad.toLocaleString(),
                      h.width > 0 ? `${h.width.toFixed(3)}"` : '—',
                      h.height > 0 ? `${h.height.toFixed(3)}"` : '—',
                      h.bearing > 0 ? `${h.bearing.toFixed(3)}"` : '—',
                    ],
                  };
                })}
              />
            );
          })() : (
            <div className={AUI.row}>
              <span className={AUI.text} {...ATTR}>No hangers match the current filters.</span>
              <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className={AUI.buttonQuiet}>
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}

      {result?.success && allHangers.length === 0 && (
        <span className={AUI.text} {...ATTR}>No matching hangers found for this configuration.</span>
      )}
    </AuiPane>
  );
}

// ---------------------------------------------------------------------------
// Main SSTWorkspace
// ---------------------------------------------------------------------------

interface SSTWorkspaceProps {
  group: GirderGroup;
  selectedCarried: CarriedTruss;
  inventory: ParsedInventory | null;
  onInventoryChange: (inv: ParsedInventory | null) => void;
  onHangersLoaded?: (girderId: string, carriedId: string, hangers: SSTHangerResult[]) => void;
  onBack: () => void;
}

export function SSTWorkspace({ group, selectedCarried, inventory, onInventoryChange, onHangersLoaded, onBack }: SSTWorkspaceProps) {
  const payload = buildSSTPayload(group, selectedCarried);
  const [viewMode, setViewMode] = useState<ViewMode>('output-only');

  // Job Settings overrides — lifted here so OutputPanel re-runs when changed
  const [overrides, setOverrides] = useState<JobOverrides>({
    style: payload.style,
    fastenerType: payload.fastenerType,
    downloadDurationType: payload.designInformations.downloadDurationType,
    upliftLoadDurationType: payload.designInformations.upliftLoadDurationType,
    ansitpi: payload.ansitpi,
  });

  // Reset overrides when selected truss changes
  useEffect(() => {
    setOverrides({
      style: payload.style,
      fastenerType: payload.fastenerType,
      downloadDurationType: payload.designInformations.downloadDurationType,
      upliftLoadDurationType: payload.designInformations.upliftLoadDurationType,
      ansitpi: payload.ansitpi,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCarried.instance.id]);

  const showInput = viewMode === 'split' || viewMode === 'input-only';
  const showOutput = viewMode === 'split' || viewMode === 'output-only';

  const back = (
    <div className={AUI.row}>
      <button type="button" onClick={onBack} className={AUI.buttonQuiet}>
        <AuiIcon name="arrow-left" />
        Back to Workspace
      </button>
      <AuiIcon name="magnifying-glass" />
      <h3 className={AUI.heading} {...ATTR}>SST Hanger Selector — {selectedCarried.instance.label}</h3>
    </div>
  );

  return (
    <>
      {/* Left: INPUT */}
      {showInput && (
        <InputPanel
          payload={payload}
          girderLabel={group.girder.label}
          carriedLabel={selectedCarried.instance.label}
          viewMode={viewMode}
          onViewChange={setViewMode}
          overrides={overrides}
          onOverridesChange={setOverrides}
          carried={selectedCarried}
          group={group}
          top={back}
        />
      )}

      {/* Right: OUTPUT (when the input is collapsed, its button sits in the output header) */}
      {showOutput && (
        <OutputPanel
          payload={payload}
          carriedLabel={selectedCarried.instance.label}
          viewMode={viewMode}
          onViewChange={setViewMode}
          overrides={overrides}
          inventory={inventory}
          onInventoryChange={onInventoryChange}
          onHangersLoaded={onHangersLoaded
            ? (hangers) => onHangersLoaded(group.girder.id, selectedCarried.instance.id, hangers)
            : undefined}
          top={showInput ? undefined : back}
          onShowInput={showInput ? undefined : () => setViewMode('split')}
        />
      )}

      {/* Collapsed OUTPUT: its button sits in the input header */}
      {!showOutput && (
        <AuiPane name="sst-output-collapsed" size="side" title="Output" extra={
          <button type="button" onClick={() => setViewMode('split')} className={AUI.button} title="Show Output panel">
            <AuiIcon name="chevron-left" />
            Show
          </button>
        }>
          <span className={AUI.text} {...ATTR}>Output is collapsed.</span>
        </AuiPane>
      )}
    </>
  );
}
