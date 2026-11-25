import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { AUI, ATTR } from '../aui';
import { AuiIcon } from './AuiIcon';

const CHECK = (
    <svg className="aui-select-item-glyph" viewBox="0 0 16 16" focusable="false" width="1em" height="1em">
        <path d="M3.5 8.5l3 3 6-6.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ITEM = 'aui-stateful aui-focus-color-info aui-focus-width-2 aui-select-item aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none';
const ITEM_IDLE = `${ITEM} aui-color-text-surface`;
const ITEM_PICKED = `${ITEM} aui-color-solid-raised`;

export interface AuiSelectOption<T> { value: T; label: string }

/**
 * The closed `select-open` recipe of AtomicAUI. `aui/aui-behaviour.js` opens, places and closes the list and fires `aui-change`
 * (detail.value = the option's label). The script owns the open state, so the part is rebuilt (new key) only when the
 * value changes from outside, never when the user picks.
 */
export function AuiSelect<T extends string | number>({ label, value, options, onChange }: {
    label: string;
    value: T;
    options: AuiSelectOption<T>[];
    onChange: (v: T) => void;
}) {
    const id = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const picked = useRef(value);
    const [version, setVersion] = useState(0);
    const optionsRef = useRef(options);
    optionsRef.current = options;
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    useEffect(() => {
        if (value !== picked.current) {
            picked.current = value;
            setVersion((v) => v + 1);
        }
    }, [value]);

    useEffect(() => {
        const el = rootRef.current;
        if (!el) return;
        const handler = (e: Event) => {
            const text = String((e as CustomEvent).detail?.value ?? '');
            const found = optionsRef.current.find((o) => o.label === text);
            if (found) {
                picked.current = found.value;
                onChangeRef.current(found.value);
            }
        };
        el.addEventListener('aui-change', handler);
        return () => el.removeEventListener('aui-change', handler);
    }, [version]);

    const current = options.find((o) => o.value === value);
    return (
        <div ref={rootRef} key={version}>
            <div className={AUI.field} data-filled="">
                <label id={`${id}-label`} htmlFor={`${id}-trigger`} className={AUI.fieldLabel} data-filled="">{label}</label>
                <button
                    type="button"
                    id={`${id}-trigger`}
                    role="combobox"
                    aria-expanded="false"
                    aria-haspopup="listbox"
                    className="aui-stateful aui-focus-color-info aui-focus-width-2 aui-select-trigger aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-fixed-surface aui-frame--inset aui-width-fill"
                    data-filled=""
                    aria-labelledby={`${id}-label`}
                    aria-controls={`${id}-list`}
                >
                    <span className="aui-select-value">{current?.label}</span>
                    <span aria-hidden="true" data-aui-rotate="" className="aui-select-chevron">
                        <AuiIcon name="chevron-down" />
                    </span>
                </button>
                <input type="hidden" value={current?.label ?? ''} readOnly />
            </div>
            <div data-side="bottom" data-align="center" role="presentation" {...ATTR} className="aui-select-positioner aui-display-none">
                <div
                    data-side="bottom"
                    data-align="center"
                    tabIndex={-1}
                    role="presentation"
                    className="aui-select-popup aui-frame aui-scale-block-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface aui-elevation-4"
                    data-aui-popup-motion="anchored"
                    style={{ '--aui-width': 'var(--anchor-width)' } as CSSProperties}
                >
                    <div role="presentation">
                        <div role="presentation" tabIndex={-1} className="aui-view-scroll-area-viewport">
                            <div id={`${id}-list`} role="listbox" className="aui-select-list" data-aui-picked-class={ITEM_PICKED}>
                                {options.map((o) => {
                                    const on = o.value === value;
                                    return (
                                        <div key={o.label} role="option" aria-selected={on} tabIndex={-1} className={on ? ITEM_PICKED : ITEM_IDLE} {...(on ? { 'data-selected': '' } : {})}>
                                            <div className="aui-select-item-text">{o.label}</div>
                                            <span aria-hidden="true" className="aui-select-item-indicator aui-frame aui-part aui-bg-transparent aui-scale-no-padding-sm" {...(on ? { 'data-selected': '' } : {})}>{CHECK}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
