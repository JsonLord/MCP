exports.WorkerEntrypoint = class {};
exports.DurableObject = class {};
exports.WorkflowEntrypoint = class {};
// Mock global WebSocket if it doesn't exist (Node 20 has it, but maybe partyserver checks specifically)
if (typeof globalThis.WebSocket === 'undefined') {
    globalThis.WebSocket = class {};
}
