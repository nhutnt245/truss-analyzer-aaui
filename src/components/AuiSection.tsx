import { useId, type ReactNode } from 'react';
import { AuiIcon } from './AuiIcon';

const ITEM = 'aui-accordion-item aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0';
const TRIGGER = 'aui-stateful aui-focus-color-info aui-focus-width-2 aui-accordion-trigger aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface';
const PANEL = 'aui-accordion-panel aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface';

/** One section of the `accordion-sections` recipe; the page keeps the open state (the recipe's "You add" line). */
export function AuiSection({ title, expanded, onToggle, children }: { title: string; expanded: boolean; onToggle: () => void; children: ReactNode }) {
    const id = useId();
    return (
        <div data-orientation="vertical" dir="ltr" className="aui-accordion">
            <div data-orientation="vertical" {...(expanded ? { 'data-open': '' } : {})} className={ITEM}>
                <h3 data-orientation="vertical" {...(expanded ? { 'data-open': '' } : {})} className="aui-accordion-header">
                    <button type="button" aria-expanded={expanded} aria-controls={`${id}-panel`} id={`${id}-trigger`} onClick={onToggle} className={TRIGGER} {...(expanded ? { 'data-panel-open': '' } : {})}>
                        <span className="aui-accordion-trigger-content"><span>{title}</span></span>
                        <span aria-hidden="true" data-aui-rotate="" className="aui-accordion-chevron"><AuiIcon name="chevron-down" /></span>
                    </button>
                </h3>
                {expanded && (
                    <div data-orientation="vertical" data-open="" id={`${id}-panel`} aria-labelledby={`${id}-trigger`} role="region" className={PANEL}>
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
}
