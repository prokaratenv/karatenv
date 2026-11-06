/** True in the hosted (sandboxed) build, where downloads and direct API calls are blocked. */
export const HOSTED = import.meta.env.MODE === 'artifact';
