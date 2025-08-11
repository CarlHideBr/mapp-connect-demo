import OpcUaApi from './OpcUaApi';
import { Status } from './types';

type DataNotification = { clientHandle: number; value: any; status: { code: number; string: string } };

export default class Session {
  #opcUaApi: OpcUaApi;
  #id = -1;
  #socket?: WebSocket;
  #abortController?: AbortController;
  #keepAliveInterval?: number;
  #subscriptions: Record<number, (dn: DataNotification) => void> = {};

  constructor(apiUrl: string, socket?: WebSocket) {
    this.#opcUaApi = new OpcUaApi(apiUrl);
    this.#socket = socket;
  }

  async connect(url: string, keepAlive = true) {
    const response = await this.#opcUaApi.sessionsPost({ url });
    if (!response?.ok) throw new Error(`connect request failed with status: ${response.status} - ${response.statusText}`);
    const json = await response.json();
    const status = new Status(json.status);
    if (status.isGood()) {
      this.#id = parseInt(json.id, 10);
      if (this.#socket) {
        this.#abortController = new AbortController();
        this.#socket.addEventListener('message', ev => this.#handleWebsocketMessage(ev.data), { signal: this.#abortController.signal });
      }
      if (keepAlive) this.#startKeepAlive();
    }
    return status;
  }
  async disconnect() {
    if (this.#keepAliveInterval) clearInterval(this.#keepAliveInterval);
    this.#abortController?.abort();
    await this.#opcUaApi.sessionsSessionIdDelete(this.#id);
  }
  async read(nodeId: string | Array<{ nodeId: string; attribute: string }>, attributeName: string) {
    if (!Array.isArray(nodeId)) {
      const response = await this.#opcUaApi.sessionsSessionIdNodesNodeIdAttributesAttributeNameGet(this.#id, nodeId, attributeName);
      const json = await response.json();
      const status = new Status(json.status);
      return { status, ...(status.isGood() && { value: json.value }) };
    } else {
      const args = nodeId.map((ele) => ({ sessionId: this.#id, nodeId: ele.nodeId, attributeName: ele.attribute }));
      const responses = await this.#opcUaApi.batch(this.#opcUaApi.sessionsSessionIdNodesNodeIdAttributesAttributeNameGet, args);
      const json = await responses.json();
      return json.responses.map((resp: any) => { const status = new Status(resp.body.status); return { status, ...(status.isGood() && { value: resp.body }) }; });
    }
  }
  async write(nodeId: string | Array<{ nodeId: string; attributeName: string; value: any }>, attributeName: string, value?: any) {
    if (!Array.isArray(nodeId)) {
      const response = await this.#opcUaApi.sessionsSessionIdNodesNodeIdAttributesAttributeNamePut(this.#id, nodeId, attributeName, { value });
      const json = await response.json();
      return new Status(json.status);
    } else {
      const args = nodeId.map(ele => ({ sessionId: this.#id, nodeId: ele.nodeId, attributeName: ele.attributeName, value: { value: ele.value } }));
      const responses = await this.#opcUaApi.batch(this.#opcUaApi.sessionsSessionIdNodesNodeIdAttributesAttributeNamePut, args);
      const json = await responses.json();
      return json.responses.map((resp: any) => new Status(resp.body.status));
    }
  }
  #startKeepAlive() {
    this.#keepAliveInterval = window.setInterval(() => {
      this.#opcUaApi.sessionsSessionIdHead(this.#id).then(res => { if (res.status !== 204) { console.error('session gone, please reconnect'); if (this.#keepAliveInterval) clearInterval(this.#keepAliveInterval); } });
    }, 15000) as unknown as number;
  }
  #handleWebsocketMessage(msg: string) {
    const json = JSON.parse(msg);
    if (json.sessionId !== this.#id) return;
    if (json.subscriptionId) {
      const cb = this.#subscriptions[json.subscriptionId];
      if (cb) (json.DataNotifications as DataNotification[]).forEach(cb);
    }
  }
}
