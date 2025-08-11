
/**
 * Represents an API client for making requests to a server.
 */
export default class Api {
    #baseUrl;

    constructor(baseUrl = 'http://localhost:8080/api/1.0') {
        this.#baseUrl = baseUrl;
    }

    /**
     * Creates the client session on the server.
     * @param {string} (username)
     * @param {string} (password)
     * @returns {Promise<Response>} A promise that resolves to the authentication response.
     */
    auth(username, password) {
        const headers = new Headers();
        if (username?.length) {
            headers.append('Authorization', `Basic ${btoa(username + ':' + password)}`);
        }
        return fetch(`${this.#baseUrl}/auth`, {
            method: 'GET',
            headers,
            credentials: 'include'
        });
    }

    /**
     * Keep client session alive. The session will be destroyed if not used for 60s (no requests, no websocket connection).
     * If there is an active websocket connection the session will be kept alive as long as the websocket connection is open.
     * @returns {Promise<Response>} A promise that resolves to the ping response.
     */
    ping() {
        return fetch(`${this.#baseUrl}/ping`, {
            method: 'GET',
            credentials: 'include'
        });
    }
}
