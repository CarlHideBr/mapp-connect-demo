import Status from './Status.js';

/**
 * Represents a subscription to an OPC UA server.
 */
export default class Subscription {
    #opcUaApi;
    #sessionId;
    #subscriptionId;
    #dataChangeCallbacks = {};
    #monitoredItemIds = [];
    static clientHandle = 0;

    /**
     * Creates a new Subscription instance.
     * @param {object} opcUaApi - The OPC UA API object.
     * @param {string} sessionId - The session ID.
     * @param {string} subscriptionId - The subscription ID.
     */
    constructor(opcUaApi, sessionId, subscriptionId) {
        this.#opcUaApi = opcUaApi;
        this.#sessionId = sessionId;
        this.#subscriptionId = subscriptionId;
    }

    /**
     * Creates a monitored item for the subscription.
     * @param {string} nodeId - The node ID to monitor.
     * @param {string} attributeName - The attribute name to monitor.
     * @param {object} options - Additional options for creating the monitored item.
     * @param {object} options.monitoringParameters - The monitoring parameters.
     * @param {string} options.timestampsToReturn - The timestamps to return.
     * @param {string} options.monitoringMode - The monitoring mode.
     * @param {function} dataChangedCb - The callback function to be called when data changes.
     * @returns {object} - An object containing the monitored item ID, revised sampling interval, and status.
     */
    async createMonitoredItem(nodeId, attributeName, { monitoringParameters, timestampsToReturn, monitoringMode }, dataChangedCb) {
        const createRequest = {
            itemToMonitor: {
                nodeId: nodeId,
                attribute: attributeName
            },
            monitoringParameters,
            timestampsToReturn,
            monitoringMode
        };
        createRequest.monitoringParameters.clientHandle = Subscription.#getClientHandle();
        let response = await this.#opcUaApi.sessionsSessionIdSubscriptionsSubscriptionIdMonitoredItemsPost(this.#sessionId, this.#subscriptionId, createRequest);
        let json = await response.json();
        let status = new Status(json.status);
        if (status.isBad()) {
            return { status };
        }
        this.#dataChangeCallbacks[createRequest.monitoringParameters.clientHandle] = dataChangedCb;
        this.#monitoredItemIds[createRequest.monitoringParameters.clientHandle] = json.monitoredItemId;
        return { monitoredItemId: json.monitoredItemId, revisedSamplingInterval: json.revisedSamplingInterval, status };
    }

    /**
     * Changes the monitoring mode of a monitored item.
     * @param {string} monitoredItemId - The ID of the monitored item.
     * @param {string} monitoringMode - The new monitoring mode.
     * @returns {object} - The status of the operation.
     */
    async changeMonitoredItem(monitoredItemId, monitoringMode) {
        const changeRequest = { monitoringMode };
        let response = await this.#opcUaApi.sessionsSessionIdSubscriptionsSubscriptionIdMonitoredItemsPatch(this.#sessionId, this.#subscriptionId, monitoredItemId, changeRequest);
        let json = await response.json();
        let status = new Status(json.status);
        return status;
    }

    /**
     * Deletes the subscription.
     */
    async delete() {
        await this.#opcUaApi.sessionsSessionIdSubscriptionsSubscriptionIdDelete(this.#sessionId, this.#subscriptionId);
        this.#subscriptionId = undefined;
        this.#opcUaApi = null;
    }

    /**
     * Handles data change notifications.
     * @param {object[]} dataNotifications - An array of data change notifications.
     */
    dataChange(dataNotifications) {
        dataNotifications.forEach(dataNotification => {
            let callback = this.#dataChangeCallbacks[dataNotification.clientHandle];
            if (callback) {
                delete dataNotification.clientHandle;
                dataNotification.status = new Status(dataNotification.status);
                callback(dataNotification);
            }
        });
    }

    /**
     * Generates a unique client handle for a monitored item.
     * @returns {number} - The client handle.
     * @private
     */
    static #getClientHandle() {
        return Subscription.clientHandle++;
    }
}
