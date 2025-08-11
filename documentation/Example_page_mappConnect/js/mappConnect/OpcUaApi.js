/**
 * Represents an API for interacting with OPC UA sessions and subscriptions.
 */
export default class OpcUaApi {
    #baseUrl;

    /**
     * Creates an instance of OpcUaApi.
     * @param {string} [baseUrl='http://localhost:8080/api/1.0'] - The base URL of the OPC UA API.
     */
    constructor(baseUrl = 'http://localhost:8080/api/1.0') {
        this.#baseUrl = `${baseUrl}/opcua`;
        this.fetch = function () {
            return fetch(...arguments);
        };
    }

    /**
     * Creates a new OPC UA session.
     * @param {Object} connectInfo - The connection information for creating the session.
     * @returns {Promise<Response>} - The fetch promise for creating the session.
     */
    sessionsPost(connectInfo) {
        return this.fetch(`${this.#baseUrl}/sessions`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(connectInfo)
        });
    }

    /**
     * Reset session timeout with specified id.
     * When creating a new opcua session with /opcoa/sessions PATCH request, a timeout in milliseconds can be configured. 
     * With this HEAD request as with all other /opcua/sessions/ requests the timer for the timeout is reseted. 
     * If the timer expires the opcua session is deleted.
     * @param {string} sessionId - The ID of the session.
     * @returns {Promise<Response>} - A Promise that resolves to the response of the HEAD request.
     */
    sessionsSessionIdHead(sessionId) {
        return this.fetch(`${this.#baseUrl}/sessions/${sessionId}`, {
            method: 'HEAD',
            credentials: 'include'
        });
    }

    /**
     * Updates an existing OPC UA session.
     * @param {string} sessionId - The ID of the session to update.
     * @param {Object} data - The data to update the session with.
     * @returns {Promise<Response>} - The fetch promise for updating the session.
     */
    sessionsSessionIdPatch(sessionId, data) {
        return this.fetch(`${this.#baseUrl}/sessions/${sessionId}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }

    /**
     * Deletes an OPC UA session.
     * @param {string} sessionId - The ID of the session to delete.
     * @returns {Promise<Response>} - The fetch promise for deleting the session.
     */
    sessionsSessionIdDelete(sessionId) {
        return this.fetch(`${this.#baseUrl}/sessions/${sessionId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
    }

    /**
     * Retrieves the attributes of a specific node in an OPC UA session.
     * @param {string} sessionId - The ID of the session.
     * @param {string} nodeId - The ID of the node.
     * @param {string} attributeName - The name of the attribute.
     * @returns {Promise<Response>} - The fetch promise for retrieving the node attributes.
     */
    sessionsSessionIdNodesNodeIdAttributesAttributeNameGet(sessionId, nodeId, attributeName) {
        return this.fetch(`${this.#baseUrl}/sessions/${sessionId}/nodes/${encodeURIComponent(nodeId)}/attributes/${attributeName}`, {
            method: 'GET',
            credentials: 'include'
        });
    }

    /**
     * 
     * @param {string} sessionId - The ID of the session
     * @param {string} nodeId - The ID of the node
     * @param {string} methodId - The ID of the method
     * @param {Object} args - THe arguments for the method
     * @returns {Promise<Response>} - The fetch promise
     */
    sessionsSessionIdNodesNodeIdMethodsMethodIdPost(sessionId, nodeId, methodId, args) {
        return this.fetch(`${this.#baseUrl}/sessions/${sessionId}/nodes/${encodeURIComponent(nodeId)}/methods/${encodeURIComponent(methodId)}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(args)
        });
    }

    /**
     * Updates the value of a specific attribute of a node in an OPC UA session.
     * @param {string} sessionId - The ID of the session.
     * @param {string} nodeId - The ID of the node.
     * @param {string} attributeName - The name of the attribute.
     * @param {any} value - The new value of the attribute.
     * @returns {Promise<Response>} - The fetch promise for updating the node attribute.
     */
    sessionsSessionIdNodesNodeIdAttributesAttributeNamePut(sessionId, nodeId, attributeName, value) {
        return this.fetch(`${this.#baseUrl}/sessions/${sessionId}/nodes/${encodeURIComponent(nodeId)}/attributes/${attributeName}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(value)
        });
    }

    /**
     * Retrieves the namespace information for a specific namespace URI in an OPC UA session.
     * @param {string} sessionId - The ID of the session.
     * @param {string} namespaceUri - The URI of the namespace.
     * @returns {Promise<Response>} - The fetch promise for retrieving the namespace information.
     */
    // console error if namespaceUri is not valid
    sessionsSessionIdNamespacesNamespaceUriGet(sessionId, namespaceUri) {
        return this.fetch(`${this.#baseUrl}/sessions/${sessionId}/namespaces/${encodeURIComponent(namespaceUri)}`, {
            method: 'GET',
            credentials: 'include'
        });
    }

    /**
     * Creates a new OPC UA subscription in a session.
     * @param {string} sessionId - The ID of the session.
     * @param {Object} settings - The settings for creating the subscription.
     * @returns {Promise<Response>} - The fetch promise for creating the subscription.
     */
    sessionsSessionIdSubscriptionsPost(sessionId, settings) {
        return this.fetch(`${this.#baseUrl}/sessions/${sessionId}/subscriptions`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settings)
        });
    }

    /**
     * Deletes an OPC UA subscription from a session.
     * @param {string} sessionId - The ID of the session.
     * @param {string} subscriptionId - The ID of the subscription to delete.
     * @returns {Promise<Response>} - The fetch promise for deleting the subscription.
     */
    sessionsSessionIdSubscriptionsSubscriptionIdDelete(sessionId, subscriptionId) {
        return this.fetch(`${this.#baseUrl}/sessions/${sessionId}/subscriptions/${subscriptionId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
    }

    /**
     * Creates a new monitored item in an OPC UA subscription.
     * @param {string} sessionId - The ID of the session.
     * @param {string} subscriptionId - The ID of the subscription.
     * @param {Object} createRequest - The request for creating the monitored item.
     * @returns {Promise<Response>} - The fetch promise for creating the monitored item.
     */
    sessionsSessionIdSubscriptionsSubscriptionIdMonitoredItemsPost(sessionId, subscriptionId, createRequest) {
        return this.fetch(`${this.#baseUrl}/sessions/${sessionId}/subscriptions/${subscriptionId}/monitoredItems`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(createRequest)
        });
    }

    /**
     * Updates a monitored item in an OPC UA subscription.
     * @param {string} sessionId - The ID of the session.
     * @param {string} subscriptionId - The ID of the subscription.
     * @param {string} monitoredItemId - The ID of the monitored item to update.
     * @param {Object} changeRequest - The request for changing the monitored item.
     * @returns {Promise<Response>} - The fetch promise for updating the monitored item.
     */
    sessionsSessionIdSubscriptionsSubscriptionIdMonitoredItemsPatch(sessionId, subscriptionId, monitoredItemId, changeRequest) {
        return this.fetch(`${this.#baseUrl}/sessions/${sessionId}/subscriptions/${subscriptionId}/monitoredItems/${monitoredItemId}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(changeRequest)
        });
    }

    /**
     * Deletes a monitored item from an OPC UA subscription.
     * @param {string} sessionId - The ID of the session.
     * @param {string} subscriptionId - The ID of the subscription.
     * @param {string} monitoredItemId - The ID of the monitored item to delete.
     * @returns {Promise<Response>} - The fetch promise for deleting the monitored item.
     */
    sessionsSessionIdSubscriptionsSubscriptionIdMonitoredItemsMonitoredItemIdDelete(sessionId, subscriptionId, monitoredItemId) {
        return this.fetch(`${this.#baseUrl}/sessions/${sessionId}/subscriptions/${subscriptionId}/monitoredItems/${monitoredItemId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
    }

    /**
    * Gets the references of a node in an OPC UA session.
    * @param {string} sessionId - The ID of the session.
    * @param {string} nodeId - The ID of the node.
    * @returns {Promise<Response>} - The fetch promise for getting the node references.
    */
    sessionsSessionIdNodesNodeIdReferencesGet(sessionId, nodeId) {
        return this.fetch(`${this.#baseUrl}/sessions/${sessionId}/nodes/${encodeURIComponent(nodeId)}/references`, {
            method: 'GET',
            credentials: 'include'
        });
    }
    
    /**
    * Sends a batch of requests.
    * @param {Function} method - The method to be called for each argument.
    * @param {Array} args - The arguments to be passed to the method.
    * @returns {Promise<Response>} - The fetch promise for sending the batch of requests.
    */
    async batch(method, args) {
        let requestsData = [];
        let i = 0;
        let sameBase;
        let orgFetch = this.fetch;
        let request = {};
        this.fetch = function (url, options) {
            request.url = url;
            request.method = options.method;
            request.body = options.body;
        };
        for (let j = 0; j < args.length; j++) {
            let arg = args[j];
            await method.call(this, ...Object.values(arg));
            let singleRequestData = {
                id: i++,
                method: request.method,
                url: request.url
            };
            if (typeof request.body === 'string' && request.body.length > 0) {
                singleRequestData.body = JSON.parse(request.body);
                singleRequestData.headers = { 'Content-Type': 'application/json' };
            }
            requestsData.push(singleRequestData);
            sameBase = this.#getMatchingString(sameBase, request.url);
        }
        sameBase = sameBase.substring(0, sameBase.lastIndexOf('/'));
        requestsData.forEach(ele => {
            ele.url = ele.url.replace(sameBase, '');
        });
        this.fetch = orgFetch;
        return this.fetch(sameBase + '/$batch', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ requests: requestsData })
        });
    }

    #getMatchingString(str1, str2) {
        if (!str1) return str2;
        var match = '';
        for (var i = 0; i < str1.length; i++) {
            if (str1[i] !== str2[i]) {
                return match;
            }
            match += str1[i];
        }
        return match;
    }
}
