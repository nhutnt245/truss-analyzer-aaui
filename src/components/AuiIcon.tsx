import { AUI } from '../aui';

/** AtomicAUI icon (Global Kit, Font Awesome names), the markup of the icon-button recipe. Decorative: the button around it carries the name. */
export function AuiIcon({ name }: { name: string }) {
    return (
        <span aria-hidden="true" className={AUI.iconWrap}>
            <i aria-hidden="true" className={`${AUI.icon} fa-duotone fa-${name}`} data-aui-icon-family="fa-7-pro" data-aui-icon-style="duotone" />
        </span>
    );
}
