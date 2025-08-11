export default class OpcUaApi {
  #baseUrl: string;
  fetch: typeof fetch;
  constructor(baseUrl: string) {
    this.#baseUrl = `${baseUrl}/opcua`;
    this.fetch = (...args) => fetch(...args as Parameters<typeof fetch>);
  }
  sessionsPost(connectInfo: { url: string }) {
    return this.fetch(`${this.#baseUrl}/sessions`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(connectInfo) });
  }
  sessionsSessionIdHead(sessionId: number) {
    return this.fetch(`${this.#baseUrl}/sessions/${sessionId}`, { method: 'HEAD', credentials: 'include' });
  }
  sessionsSessionIdPatch(sessionId: number, data: unknown) {
    return this.fetch(`${this.#baseUrl}/sessions/${sessionId}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  }
  sessionsSessionIdDelete(sessionId: number) {
    return this.fetch(`${this.#baseUrl}/sessions/${sessionId}`, { method: 'DELETE', credentials: 'include' });
  }
  sessionsSessionIdNodesNodeIdAttributesAttributeNameGet(sessionId: number, nodeId: string, attributeName: string) {
    return this.fetch(`${this.#baseUrl}/sessions/${sessionId}/nodes/${encodeURIComponent(nodeId)}/attributes/${attributeName}`, { method: 'GET', credentials: 'include' });
  }
  sessionsSessionIdNodesNodeIdMethodsMethodIdPost(sessionId: number, nodeId: string, methodId: string, args: unknown) {
    return this.fetch(`${this.#baseUrl}/sessions/${sessionId}/nodes/${encodeURIComponent(nodeId)}/methods/${encodeURIComponent(methodId)}`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(args) });
  }
  sessionsSessionIdNodesNodeIdAttributesAttributeNamePut(sessionId: number, nodeId: string, attributeName: string, value: unknown) {
    return this.fetch(`${this.#baseUrl}/sessions/${sessionId}/nodes/${encodeURIComponent(nodeId)}/attributes/${attributeName}`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) });
  }
  sessionsSessionIdNamespacesNamespaceUriGet(sessionId: number, namespaceUri: string) {
    return this.fetch(`${this.#baseUrl}/sessions/${sessionId}/namespaces/${encodeURIComponent(namespaceUri)}`, { method: 'GET', credentials: 'include' });
  }
  sessionsSessionIdSubscriptionsPost(sessionId: number, settings: unknown) {
    return this.fetch(`${this.#baseUrl}/sessions/${sessionId}/subscriptions`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
  }
  sessionsSessionIdSubscriptionsSubscriptionIdDelete(sessionId: number, subscriptionId: number) {
    return this.fetch(`${this.#baseUrl}/sessions/${sessionId}/subscriptions/${subscriptionId}`, { method: 'DELETE', credentials: 'include' });
  }
  sessionsSessionIdSubscriptionsSubscriptionIdMonitoredItemsPost(sessionId: number, subscriptionId: number, createRequest: unknown) {
    return this.fetch(`${this.#baseUrl}/sessions/${sessionId}/subscriptions/${subscriptionId}/monitoredItems`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(createRequest) });
  }
  sessionsSessionIdSubscriptionsSubscriptionIdMonitoredItemsPatch(sessionId: number, subscriptionId: number, monitoredItemId: number, changeRequest: unknown) {
    return this.fetch(`${this.#baseUrl}/sessions/${sessionId}/subscriptions/${subscriptionId}/monitoredItems/${monitoredItemId}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(changeRequest) });
  }
  sessionsSessionIdSubscriptionsSubscriptionIdMonitoredItemsMonitoredItemIdDelete(sessionId: number, subscriptionId: number, monitoredItemId: number) {
    return this.fetch(`${this.#baseUrl}/sessions/${sessionId}/subscriptions/${subscriptionId}/monitoredItems/${monitoredItemId}`, { method: 'DELETE', credentials: 'include' });
  }
  sessionsSessionIdNodesNodeIdReferencesGet(sessionId: number, nodeId: string) {
    return this.fetch(`${this.#baseUrl}/sessions/${sessionId}/nodes/${encodeURIComponent(nodeId)}/references`, { method: 'GET', credentials: 'include' });
  }
  async batch(method: Function, args: any[]) {
    const requestsData: any[] = [];
    let i = 0; let sameBase: string | undefined; let orgFetch = this.fetch as any;
    let request: any = {};
    this.fetch = ((url: string, options: any) => { request.url = url; request.method = options.method; request.body = options.body; }) as any;
    for (let j = 0; j < args.length; j++) {
      const arg = args[j];
      await (method as any).call(this, ...Object.values(arg));
      const singleRequestData: any = { id: i++, method: request.method, url: request.url };
      if (typeof request.body === 'string' && request.body.length > 0) {
        singleRequestData.body = JSON.parse(request.body);
        singleRequestData.headers = { 'Content-Type': 'application/json' };
      }
      requestsData.push(singleRequestData);
      sameBase = this.#getMatchingString(sameBase, request.url);
    }
    sameBase = (sameBase || '').substring(0, (sameBase || '').lastIndexOf('/'));
    requestsData.forEach(ele => { ele.url = ele.url.replace(sameBase!, ''); });
    this.fetch = orgFetch;
    return this.fetch(sameBase + '/$batch', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requests: requestsData }) });
  }
  #getMatchingString(str1: string | undefined, str2: string) {
    if (!str1) return str2; let match = '';
    for (let i = 0; i < str1.length; i++) { if (str1[i] !== str2[i]) return match; match += str1[i]; }
    return match;
  }
}
