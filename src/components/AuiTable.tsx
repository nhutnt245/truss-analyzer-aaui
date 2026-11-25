import type { CSSProperties, ReactNode } from 'react';
import { TBL } from '../aui';

export interface AuiColumn {
    header: string;
    /** content of the header cell when it holds a control (a sort button); `header` stays its name and key */
    headerNode?: ReactNode;
    align?: 'left' | 'center' | 'right';
}

export interface AuiRow {
    key: string;
    cells: ReactNode[];
    /** table-row-selected recipe: the picked row, and what a click on the row does */
    selected?: boolean;
    onSelect?: () => void;
}

const SCROLLBAR = { '--aui-scrollbar-size': 'var(--p-px-8)' } as CSSProperties;

/** The table-display recipe of AtomicAUI, whole: header table, scroll region, body table. */
export function AuiTable({ label, columns, rows }: { label: string; columns: AuiColumn[]; rows: AuiRow[] }) {
    const align = (c: AuiColumn) => TBL.align[c.align ?? 'left'];
    return (
        <div
            aria-label={label}
            className={TBL.table}
            role="table"
            data-aui-border="all-cells"
            data-aui-border-style="tonal"
            data-aui-selection-target="none"
            data-aui-a11y="table"
            data-aui-fit="fill"
            data-aui-scroll="self"
            data-aui-body-fit="content"
            data-aui-min-inline-size=""
            style={{ ...SCROLLBAR, '--aui-table-min-inline-size': `${columns.length * 176}px` } as CSSProperties}
        >
            <div className="aui-table-scroll-clip">
                <table className={TBL.head} role="presentation">
                    <thead role="rowgroup" className={TBL.headRowGroup}>
                        <tr data-aui-header-row="true" className={TBL.row} role="row" data-aui-table-row>
                            {columns.map((c) => (
                                <th key={c.header} scope="col" role="columnheader" data-aui-table-cell-painted className={`${TBL.th} ${align(c)}`}>{c.headerNode ?? c.header}</th>
                            ))}
                        </tr>
                    </thead>
                </table>
            </div>
            <div role="presentation" className={TBL.scrollArea} style={SCROLLBAR}>
                <div role="presentation" tabIndex={-1} className={TBL.viewport}>
                    <table className={TBL.body} role="presentation">
                        <colgroup data-aui-table-column-lock>
                            {columns.map((c) => <col key={c.header} />)}
                        </colgroup>
                        <tbody role="rowgroup" className={TBL.bodyGroup}>
                            {rows.map((r) => (
                                <tr
                                    key={r.key}
                                    className={r.selected ? `${TBL.row} ${TBL.rowSelected}` : TBL.row}
                                    role="row"
                                    data-aui-table-row
                                    {...(r.onSelect ? { 'aria-selected': r.selected ? 'true' : 'false', onClick: r.onSelect } : {})}
                                    {...(r.selected ? { 'data-selected': '' } : {})}
                                >
                                    {r.cells.map((cell, i) => (
                                        <td key={i} role="cell" className={`${TBL.td} ${align(columns[i])}`}>{cell}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
