import { useState, useCallback, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { LogPanel } from './components/LogPanel';
import { GirderList } from './components/GirderList';
import { GirderDetails } from './components/GirderDetails';
import { JobSummaryTable } from './components/JobSummaryTable';
import type { HangerResultsMap } from './components/JobSummaryTable';
import { GirderGroup, LogEntry } from './types';
import { analyzeFiles } from './lib/parser';
import { AUI, ATTR } from './aui';
import { AuiIcon } from './components/AuiIcon';
import { AuiPane } from './components/AuiPane';
import type { ParsedInventory } from './lib/inventory';
import type { SSTHangerResult } from './lib/sst-types';

import t07Raw from '../t07.tre.txt?raw';
import t02Raw from '../t02.tre.txt?raw';
import ifcRaw from '../2214224-08T.ifc.txt?raw';

export default function App() {
  const [logs, setLogs] = useState<LogEntry[]>([
      { id: '1', timestamp: new Date(), message: 'System initialized. Loading default project files...', type: 'info' }
  ]);
  const [girders, setGirders] = useState<GirderGroup[]>([]);
  const [selectedGirderId, setSelectedGirderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analyzer' | 'summary'>('analyzer');

  // Shared inventory state (lifted from SSTWorkspace so JobSummaryTable can use it)
  const [inventory, setInventory] = useState<ParsedInventory | null>(null);

  // Map of hanger results per connection: key = `${girderId}::${carriedInstanceId}`
  const [hangerResultsMap, setHangerResultsMap] = useState<HangerResultsMap>({});

  const handleHangersLoaded = useCallback((girderId: string, carriedId: string, hangers: SSTHangerResult[]) => {
    const key = `${girderId}::${carriedId}`;
    setHangerResultsMap(prev => ({ ...prev, [key]: hangers }));
  }, []);

  const handleLog = useCallback((entry: Omit<LogEntry, 'id'|'timestamp'>) => {
      setLogs(prev => [...prev, { ...entry, id: Math.random().toString(36).substring(2, 9), timestamp: new Date() }]);
  }, []);

  const handleAnalyze = useCallback((extractedGirders: GirderGroup[]) => {
      setGirders(extractedGirders);
      setHangerResultsMap({});  // reset hanger results when new project is loaded
      if (extractedGirders.length > 0) {
          setSelectedGirderId(extractedGirders[0].girder.id);
      } else {
          setSelectedGirderId(null);
      }
  }, []);

  // Run analysis on built-in files on mount
  useEffect(() => {
    let isMounted = true;
    const runDefaultAnalysis = async () => {
      try {
        const t07File = new File([t07Raw], "t07.tre.txt", { type: "text/plain" });
        const t02File = new File([t02Raw], "t02.tre.txt", { type: "text/plain" });
        const ifcFile = new File([ifcRaw], "2214224-08T.ifc.txt", { type: "text/plain" });

        const extractedGirders = await analyzeFiles(
          [ifcFile],
          [t07File, t02File],
          (msg, type) => {
            if (isMounted) handleLog({ message: msg, type: type || 'info' });
          }
        );

        if (isMounted) {
          setGirders(extractedGirders);
          if (extractedGirders.length > 0) {
              setSelectedGirderId(extractedGirders[0].girder.id);
          }
        }
      } catch (err) {
        if (isMounted) {
          handleLog({ message: "Failed to parse default files: " + String(err), type: 'error' });
        }
      }
    };
    runDefaultAnalysis();
    return () => { isMounted = false; };
  }, [handleLog]);

  const selectedGirder = girders.find(g => g.girder.id === selectedGirderId) || null;

  // Count resolved connections for the tab badge
  const resolvedCount = Object.keys(hangerResultsMap).length;

  return (
    <div className={AUI.page}>
        <div role="menubar" aria-orientation="horizontal" className={AUI.topBar}>
            <nav aria-label="Main" className={AUI.topNav}>
                <a
                    href="#analyzer"
                    role="link"
                    aria-current={activeTab === 'analyzer' ? 'page' : undefined}
                    onClick={(e) => { e.preventDefault(); setActiveTab('analyzer'); }}
                    className={AUI.link}
                >
                    Analyzer
                </a>
                <a
                    href="#summary"
                    role="link"
                    aria-current={activeTab === 'summary' ? 'page' : undefined}
                    onClick={(e) => { e.preventDefault(); setActiveTab('summary'); }}
                    className={AUI.link}
                >
                    <AuiIcon name="file-spreadsheet" />
                    Job Summary
                    {resolvedCount > 0 && (
                        <span className={activeTab === 'summary' ? AUI.chipNeutral : AUI.chipInfo}>
                            <span className={AUI.chipLabel} {...ATTR}>{resolvedCount}</span>
                        </span>
                    )}
                </a>
            </nav>
            <div className={AUI.topSpacer}></div>
            <button type="button" aria-label="Toggle theme" data-aui-theme-toggle className={AUI.topButton}>
                <AuiIcon name="moon" />
            </button>
        </div>

        <div className={AUI.panes} data-aui-panes="page under-bar">
            {/* Left sidebar: always visible */}
            <AuiPane
                name="girders"
                size="side"
                title="Girder Trusses"
                extra={girders.length > 0 && (
                    <span className={AUI.text} {...ATTR}>[{String(girders.length).padStart(2, '0')} Units]</span>
                )}
            >
                <FileUpload onAnalyze={handleAnalyze} onLog={handleLog} />
                <GirderList
                    girders={girders}
                    selectedId={selectedGirderId}
                    onSelect={(id) => { setSelectedGirderId(id); setActiveTab('analyzer'); }}
                />
                <div className={AUI.row} role="group" aria-label="Status">
                    <span className={AUI.chipSuccess}><span className={AUI.chipLabel} {...ATTR}>IFC Engine Ready</span></span>
                    <span className={AUI.text} {...ATTR}>TRE Solver Connected</span>
                    <span className={AUI.text} {...ATTR}>2023-10-27 14:42:01</span>
                </div>
            </AuiPane>

            {/* Main content area */}
            {activeTab === 'analyzer' && (
                <GirderDetails
                    group={selectedGirder}
                    inventory={inventory}
                    onInventoryChange={setInventory}
                    onHangersLoaded={handleHangersLoaded}
                />
            )}
            {activeTab === 'summary' && (
                <JobSummaryTable
                    girders={girders}
                    hangerResultsMap={hangerResultsMap}
                    inventory={inventory}
                    onInventoryChange={setInventory}
                    onHangersLoaded={handleHangersLoaded}
                />
            )}
        </div>
    </div>
  );
}
