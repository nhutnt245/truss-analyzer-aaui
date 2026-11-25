export interface WorkOrderState { id: number; label: string }
export interface WorkOrder { number: string; title: string; asset: string; stateId: number; due: string; assignee: string }
export function listStates(): WorkOrderState[];
export function findOrders(query: { text: string; stateId: number }): WorkOrder[];
export function deleteOrder(number: string | null): void;
