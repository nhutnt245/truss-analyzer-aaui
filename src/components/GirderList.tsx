import { GirderGroup } from "../types";
import { AUI, ATTR } from "../aui";
import { AuiTable } from "./AuiTable";

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
        <AuiTable
            label="Girder Trusses"
            columns={[
                { header: 'Girder' },
                { header: 'Status' },
                { header: 'ID' },
                { header: 'Connects' },
            ]}
            rows={girders.map(group => {
                const isSelected = selectedId === group.girder.id;
                return {
                    key: group.girder.id,
                    selected: isSelected,
                    onSelect: () => onSelect(group.girder.id),
                    cells: [
                        group.girder.label,
                        isSelected ? 'ACTIVE' : 'PRIMARY',
                        group.girder.id,
                        `Connects: ${group.carriedTrusses.length} | Load Path Confirmed`,
                    ],
                };
            })}
        />
    )
}
