import axios from "axios";

var isLocal = true;
const host = isLocal ? 'https://localhost:3000' : 'https://k8brg6kc-3000.inc1.devtunnels.ms';
const chatHost = isLocal ? 'wss://localhost:3000' : 'https://k8brg6kc-3000.inc1.devtunnels.ms';
const voiceHost = isLocal ? 'wss://localhost:3030' : 'https://k8brg6kc-3030.inc1.devtunnels.ms';
const whiteboardHost = isLocal ? 'wss://localhost:3040/whiteboard' : 'ws://k8brg6kc-3040.inc1.devtunnels.ms';
const apiClient = axios.create({
  baseURL: host,
});

export default apiClient;
export { host, chatHost, voiceHost, whiteboardHost, isLocal };
