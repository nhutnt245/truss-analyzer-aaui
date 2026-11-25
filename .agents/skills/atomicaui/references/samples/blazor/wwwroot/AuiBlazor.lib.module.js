// Blazor loads this file by its name (<assembly>.lib.module.js). It hands the behaviour script's "aui-change" event to
// Blazor, so a component can write @onauichange. Keys and focus never make a round trip to the server: they stay in
// aui/aui-behaviour.js; only the result (the picked value, the picked tab) is sent.
export function afterWebStarted(blazor) {
  blazor.registerCustomEventType('auichange', {
    browserEventName: 'aui-change',
    createEventArgs: (event) => ({ value: event.detail.value ?? null, index: event.detail.index ?? -1 }),
  });
}
