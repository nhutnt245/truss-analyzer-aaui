import type { ReactNode } from 'react';
import { AUI, ATTR } from '../aui';

const FRAME = { side: AUI.paneSide, list: AUI.paneList, results: AUI.paneResults, fill: AUI.pane } as const;

/** One pane of the `view-pane` recipe: a 28 px header with the title, then the body card inside a scroll area. */
export function AuiPane({ name, title, size = 'fill', extra, children }: {
    name: string;
    title: ReactNode;
    size?: keyof typeof FRAME;
    /** text or buttons at the right end of the header */
    extra?: ReactNode;
    children: ReactNode;
}) {
    return (
        <div className={FRAME[size]} data-aui-pane={name}>
            <div className={AUI.paneHeader} data-aui-pane-header>
                <h2 className={AUI.paneTitle} {...ATTR}>{title}</h2>
                {extra}
            </div>
            <div role="presentation" className={AUI.paneScroll}>
                <div role="presentation" tabIndex={-1} className={AUI.paneViewport}>
                    <div className={AUI.paneCard} data-aui-pane-body="card">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
