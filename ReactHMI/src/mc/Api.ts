export default class Api {
  #baseUrl: string;
  constructor(baseUrl: string) { this.#baseUrl = baseUrl; }
  auth(username?: string, password?: string) {
    const headers = new Headers();
    if (username?.length) headers.append('Authorization', `Basic ${btoa(username + ':' + password)}`);
    return fetch(`${this.#baseUrl}/auth`, { method: 'GET', headers, credentials: 'include' });
  }
  ping() {
    return fetch(`${this.#baseUrl}/ping`, { method: 'GET', credentials: 'include' });
  }
}
