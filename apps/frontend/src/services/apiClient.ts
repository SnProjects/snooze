import axios from "axios";

var isLocal = true;
const host = isLocal ? 'http://localhost:3000' : 'https://k8brg6kc-3000.inc1.devtunnels.ms/';
const voiceHost = isLocal ? 'http://localhost:3030' : 'https://k8brg6kc-3030.inc1.devtunnels.ms';
const apiClient = axios.create({
  baseURL: host,
});

export default apiClient;
export { host, voiceHost, isLocal };
