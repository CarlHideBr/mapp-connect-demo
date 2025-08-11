import Api from './mappConnect/Api.js';
import Session from './mappConnect/Session.js';

const API_BASE_URL = `${window.location.origin}/api/1.0`;
const OPCUA_ENDPOINT_URL = `opc.tcp://127.0.0.1:4840`;

const ATTRIBUTE_VALUE = 'value';

const api = new Api(API_BASE_URL);
let session = null;

let authDone = false;
let namespaceIndex;

// authenticate api client session at the server and keep it alive with ping
api.auth().then((response) => {
    if (!response?.ok) {
        throw new Error(`auth request failed with status: ${response.status} - ${response.statusText}`);
    }
    authDone = true;
    // create websocket already needs authenticated session because it assosiated with the session
    session = new Session(API_BASE_URL, createSocket());
}).catch((err) => {
    document.getElementById('connectStatus').value = err;
});

if (document.readyState === 'interactive') {
    domReady();
} else {
    document.addEventListener('DOMContentLoaded', domReady);
}

// the socket will be used to push data (value updates) from the server to the client
function createSocket() {
    let socket;
    try {
        const scheme = window.location.protocol.includes('https') ? 'wss' : 'ws';
        const host = `${scheme}://${window.location.host}/api/1.0/pushchannel`;
        socket = new WebSocket(host);

        console.log(`Socket status: ${socket.readyState}`);

        socket.onopen = function () {
            console.log(`Socket status: ${socket.readyState} (open)`);
        };
        // socket.onmessage = function (msg) {
        //     console.log(msg.data);
        // }
        socket.onclose = function () {
            console.log(`Socket status: ${socket.readyState} (closed)`);
        };
    } catch (exception) {
        console.error(`Socket error: ${exception}`);
    }
    return socket;
}

function domReady() {
    let connectStatus = document.getElementById('connectStatus');
    let connectButton = document.getElementById('connectButton');
    let disconnectButton = document.getElementById('disconnectButton');

    let nodeIdInput = document.getElementById('nodeIdInput');
    let timestampsToReturnInput = document.getElementById('timestampsToReturnInput');
    let monitoringModeInput = document.getElementById('monitoringModeInput');
    let queueSizeInput = document.getElementById('queueSizeInput');
    let subscribeButton = document.getElementById('subscribeButton');
    let unsubscribeButton = document.getElementById('unsubscribeButton');
    let valueInput = document.getElementById('valueInput');
    let sourceTimestampConverted = document.getElementById('sourceTimestampConverted');
    let serverTimestampConverted = document.getElementById('serverTimestampConverted');
    let changeMonitoringModeButton = document.getElementById('changeMonitoringModeButton');
    let namespaceInput = document.getElementById('namespaceInput');
    let subscribeStatus = document.getElementById('subscribeStatus');

    // connect to opcua server
    connectButton.addEventListener('click', async e => {
        if (!authDone) {
            console.error('api session not authenticated');
            return;
        }
        async function updateNamespaceIndex(namespaceUri) {
            namespaceIndex = await session.getNamespaceIndex(namespaceUri).catch((err) => { 
                subscribeStatus.value = err;
                return -1;
            });
            if (namespaceIndex > -1) {
                subscribeStatus.value = '';
            }
        }
        connectButton.disabled = true;
        const status = await session.connect(OPCUA_ENDPOINT_URL).catch((err) => {
            connectStatus.value = err;
            connectButton.disabled = false;
        });
        if (status === undefined) {
            return;
        }
        connectStatus.value = status.string;
        disconnectButton.disabled = false;
        connectButton.disabled = true;
        subscribeButton.disabled = false;

        if (status.isGood()) {
            // get namespace index for namespace uri
            updateNamespaceIndex(namespaceInput.value);
            namespaceInput.addEventListener('change', e => updateNamespaceIndex(namespaceInput.value));
        }
        
    });

    // disconnect opcua session
    disconnectButton.addEventListener('click', async e => {
        await session.disconnect();
        connectStatus.value = 'disconnected';
        disconnectButton.disabled = true;
        connectButton.disabled = false;
        subscribeButton.disabled = true;
        unsubscribeButton.disabled = true;
        changeMonitoringModeButton.disabled = true;
    });

    let subscription = null;
    let monitoredItemId;

    subscribeButton.addEventListener('click', async () => {
        // create a subscription
        if (subscription == null) {
            let result = await session.createSubscription({
                publishingInterval: 100,
                publishingEnabled: true
            });
            subscribeStatus.value = result.status.string;
            if (result.status.isGood()) {
                subscribeButton.disabled = true;
                unsubscribeButton.disabled = false;
                nodeIdInput.disabled = true;
                changeMonitoringModeButton.disabled = false;
                subscription = result.subscription;
            } else {
                return;
            }
            let nodeId = `ns=${namespaceIndex};${nodeIdInput.value}`;
            let settings = {
                monitoringParameters: {
                    samplingInterval: 100,
                    queueSize: queueSizeInput.value
                },
                timestampsToReturn: timestampsToReturnInput.value,
                monitoringMode: monitoringModeInput.value
            };
            result = await subscription.createMonitoredItem(nodeId, ATTRIBUTE_VALUE, settings, dataNotification => {
                subscribeStatus.value = dataNotification.status.string;
                if (dataNotification.status.isBad()) {
                    return;
                }
                valueInput.value = dataNotification.value;
                sourceTimestampConverted.value = convertToDateString(dataNotification.sourceTimestamp);
                serverTimestampConverted.value = convertToDateString(dataNotification.serverTimestamp);

                // simulate value update
                window.setTimeout(() => {
                    session.write(nodeId, ATTRIBUTE_VALUE, ++dataNotification.value);
                }, 1000);
            });
            subscribeStatus.value = result.status.string;
            monitoredItemId = result.monitoredItemId;
        }
    });

    changeMonitoringModeButton.addEventListener('click', async () => {
        if (!subscription) {
            return;
        }
        let status = await subscription.changeMonitoredItem(monitoredItemId, monitoringModeInput.value);
        subscribeStatus.value = status.string;
    });

    unsubscribeButton.addEventListener('click', async () => {
        await subscription.delete();
        subscription = null;
        subscribeButton.disabled = false;
        unsubscribeButton.disabled = true;
        nodeIdInput.disabled = false;
        changeMonitoringModeButton.disabled = true;
    });
}

/**
 * Convert a file time to a date string.
 * @param {number} fileTime - The file time to convert.
 * @returns {string} The converted date string.
 */
function convertToDateString(fileTime) {
    if (fileTime === null || fileTime === undefined) {
        return '';
    }
    let epoch_diff = 116444736000000000;
    let rate_diff = 10000000;
    return new Date(parseInt((fileTime - epoch_diff) / rate_diff) * 1000).toLocaleString();
}
