import { GirderGroup } from "../types";
import { AUI, ATTR } from "../aui";

interface GirderListProps {
    girders: GirderGroup[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export function GirderList({ girders, selectedId, onSelect }: GirderListProps) {
    if (girders.length === 0) {
        return (
            <div className={AUI.stack}>
                <span className={AUI.text} {...ATTR}>Awaiting Data...</span>
            </div>
        )
    }

    return (
        <div className={AUI.stack} role="list" aria-label="Girder Trusses">
            {girders.map(group => {
                const isSelected = selectedId === group.girder.id;
                return (
                    <button
                        key={group.girder.id}
                        type="button"
                        role="listitem"
                        aria-current={isSelected ? 'true' : undefined}
                        onClick={() => onSelect(group.girder.id)}
                        className={isSelected ? AUI.buttonMain : AUI.button}
                    >
                        <span className={AUI.text} {...ATTR}>{group.girder.label}</span>
                        <span className={AUI.text} {...ATTR}>{isSelected ? 'ACTIVE' : 'PRIMARY'}</span>
                        <span className={AUI.text} {...ATTR}>{group.girder.id}</span>
                        <span className={AUI.text} {...ATTR}>Connects: {group.carriedTrusses.length} | Load Path Confirmed</span>
                    </button>
                )
            })}
        </div>
    )
}
