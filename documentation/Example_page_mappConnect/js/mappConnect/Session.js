import OpcUaApi from './OpcUaApi.js';
import Status from './Status.js';
import Subscription from './Subscription.js';

/**
 * Represents a session for connecting to an OPC UA server.
 */
export default class Session {
    #opcUaApi;
    #id = -1;
    #subscriptions = {};
    #socket;
    #connectionStatus = 'Disconnected';
    #abortController;
    #keepAliveInterval;

    /**
     * Creates a new Session instance.
     * @param {string} apiUrl - The URL of the OPC UA API.
     * @param {WebSocket} socket - The WebSocket object for receiving real-time data updates.
     */
    constructor(apiUrl = 'http://localhost:8080/api/1.0', socket = undefined) {
        this.#socket = socket;
        this.#opcUaApi = new OpcUaApi(apiUrl);
    }

    /**
     * Connects to the OPC UA server.
     * @param {string} url - The URL of the OPC UA server.
     * @param {boolean} [keepAlive=true] - Whether to keep the connection alive. If false the session will be closed after 30 seconds of inactivity.
     * @returns {Status} - The status of the connection attempt.
     */
    async connect(url, keepAlive = true) {
        let response = await this.#opcUaApi.sessionsPost({ url });
        if (!response?.ok) {
            throw new Error(`connect request failed with status: ${response.status} - ${response.statusText}`);
        }
        let json = await response.json();
        let status = new Status(json.status);
        if (status.isGood()) {
            this.#id = parseInt(json.id, 10);
            if (this.#socket) {
                this.#abortController = new AbortController();
                this.#socket.addEventListener('message', ev => {
                    this.#handleWebsocketMessage(ev.data);
                }, { signal: this.#abortController.signal });
            }
            if (keepAlive) {
                this.#startKeepAlive();
            }
        }
        return status;
    }

    /**
     * Disconnects from the OPC UA server.
     * @returns {Promise<void>}
     */
    async disconnect() {
        clearInterval(this.#keepAliveInterval);
        this.#abortController?.abort();
        await this.#opcUaApi.sessionsSessionIdDelete(this.#id);
    }

    /**
     * Gets the current connection status.
     * @returns {string} - The connection status.
     */
    get status() {
        return this.#connectionStatus;
    }

    /**
     * Changes the user identity token for the session.
     * @param {string} userIdentityToken - The new user identity token.
     * @returns {Status} - The status of the operation.
     */
    async changeUser(userIdentityToken) {
        let response = await this.#opcUaApi.sessionsSessionIdPatch(this.#id, { userIdentityToken });
        let json = await response.json();
        return new Status(json.status);
    }

    /**
    * Reads the value of an attribute for a specific node or nodes.
    * @param {string | Array} nodeId - The ID of the node or an array of node objects.
    * @param {string} attributeName - The name of the attribute.
    * @returns {Promise<Object>} - A promise that resolves to an object containing the status and value (if successful).
    */
    async read(nodeId, attributeName) {
        if (!Array.isArray(nodeId)) {
            let response = await this.#opcUaApi.sessionsSessionIdNodesNodeIdAttributesAttributeNameGet(this.#id, nodeId, attributeName);
            let json = await response.json();
            let status = new Status(json.status);
            return { status, ...(status.isGood() && { value: json.value }) };
        } else {
            let args = nodeId.map(ele => ({
                sessionId: this.#id,
                nodeId: ele.nodeId,
                attributeName: ele.attribute
            }));
            let responses = await this.#opcUaApi.batch(this.#opcUaApi.sessionsSessionIdNodesNodeIdAttributesAttributeNameGet, args);
            let json = await responses.json();
            return json.responses.map(resp => {
                let status = new Status(resp.body.status);
                return { status, ...(status.isGood() && { value: resp.body }) };
            });
        }
    }

    /**
     * Calls a method for a specific node. 
     * @param {string} nodeId - The ID of the node.
     * @param {string} methodId - The ID of the method.
     * @param {Object} args - The arguments for the method.
     * @returns {Object} - An object containing the status and value (if successful).
     */
    async callMethod(nodeId, methodId, args) {
        let response = await this.#opcUaApi.sessionsSessionIdNodesNodeIdMethodsMethodIdPost(this.#id, nodeId, methodId, args);
        let json = await response.json();
        let status = new Status(json.status);
        return { status, ...(status.isGood() && { value: json.args }) };
    }

    /**
     * Writes a value to an attribute for a specific node.
     * @param {string} nodeId - The ID of the node.
     * @param {string} attributeName - The name of the attribute.
     * @param {any} value - The value to write.
     * @returns {Status} - The status of the operation.
     */
    async write(nodeId, attributeName, value) {
        if (!Array.isArray(nodeId)) {
            let response = await this.#opcUaApi.sessionsSessionIdNodesNodeIdAttributesAttributeNamePut(this.#id, nodeId, attributeName, { value });
            let json = await response.json();
            return new Status(json.status);
        } else {
            let args = nodeId.map(ele => ({
                sessionId: this.#id,
                nodeId: ele.nodeId,                
                attributeName: ele.attributeName,
                value: { value: ele.value }
            }));

            let responses = await this.#opcUaApi.batch(this.#opcUaApi.sessionsSessionIdNodesNodeIdAttributesAttributeNamePut, args);
            let json = await responses.json();
            
            return json.responses.map(resp => {
                let status = new Status(resp.body.status);
                return status;
            });
        }
    }

    /**
     * Gets the namespace index for a given namespace URI.
     * @param {string} namespaceUri - The URI of the namespace.
     * @returns {number} - The namespace index.
     */
    async getNamespaceIndex(namespaceUri) {
        let response = await this.#opcUaApi.sessionsSessionIdNamespacesNamespaceUriGet(this.#id, namespaceUri);
        if (!response?.ok) {
            throw new Error(`getNamespaceIndex request failed with status: ${response.status} - ${response.statusText}`);
        }
        let json = await response.json();
        return json.index;
    }

    /**
     * Creates a new subscription for receiving data change notifications.
     * @param {Object} settings - The subscription settings.
     * @returns {Object} - An object containing the created subscription and the status.
     */
    async createSubscription(settings) {
        if (!this.#socket || this.#socket.readyState !== 1) {
            throw new Error('createSubscription needs open websocket');
        }
        let response = await this.#opcUaApi.sessionsSessionIdSubscriptionsPost(this.#id, settings);
        let json = await response.json();
        let status = new Status(json.status);
        if (status.isBad()) {
            return status;
        }
        let subscriptionId = parseInt(json.subscriptionId);
        let subscription = new Subscription(this.#opcUaApi, this.#id, subscriptionId);
        this.#subscriptions[subscriptionId] = subscription;
        return { subscription, status };
    }

    /**
     * Browses the references of a node in an OPC UA session.
     * @param {string} nodeId - The ID of the node.
     * @returns {Promise<Response>} - The fetch promise for browsing the node references.
     */
    async browse(nodeId) {
        let response = await this.#opcUaApi.sessionsSessionIdNodesNodeIdReferencesGet(this.#id, nodeId);
        let json = await response.json();
        let status = new Status(json.status);
        return { status, ...(status.isGood() && { references: json.references }) };
    }

    /**
     * The server deletes the opc ua session after 30s (configurable) of inactivity.
     * Sending a head request to the server resets the timer. Keep in mind that load on the client/server may
     * influence the interval. 15s should be a good value for most cases.
     */
    #startKeepAlive() {
        this.keepAliveInterval = window.setInterval(() => {
            this.#opcUaApi.sessionsSessionIdHead(this.#id).then(response => {
                if (response.status !== 204) {
                    console.error(`session gone, please reconnect`);
                    clearInterval(this.#keepAliveInterval);
                }
            });
        }, 15000);
    }

    /**
     * Handles incoming messages from the WebSocket.
     * @param {string} msg - The message received from the WebSocket.
     * @private
     */
    #handleWebsocketMessage(msg) {
        let json = JSON.parse(msg);
        if (json.sessionId !== this.#id) {
            return;
        }
        if (json.status && json.statusId) {
            this.#connectionStatus = {
                status: json.status,
                statusId: json.statusId
            };
        }
        if (json.subscriptionId) {
            let subscription = this.#subscriptions[json.subscriptionId];
            subscription.dataChange(json.DataNotifications);
        }
    }
}
