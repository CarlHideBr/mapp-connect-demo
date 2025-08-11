import Api from './mappConnect/Api.js';
import Session from './mappConnect/Session.js';

const API_BASE_URL = `${window.location.origin}/api/1.0`;
const OPCUA_ENDPOINT_URL = `opc.tcp://127.0.0.1:4840`;

const ATTRIBUTE_VALUE = 'value';

const api = new Api(API_BASE_URL);
const session = new Session(API_BASE_URL);

let authDone = false;
let namespaceIndex;

// authenticate api client session at the server and keep it alive with ping
api.auth().then((response) => {
    if (!response?.ok) {
        throw new Error(`auth request failed with status: ${response.status} - ${response.statusText}`);
    }
    authDone = true;
    window.setInterval(() => api.ping().catch(() => { document.getElementById('connectStatus').value = 'lost connection to server, please reload'; }), 30000);
}).catch((err) => {
    document.getElementById('connectStatus').value = err;
});

if (document.readyState === 'interactive') {
    domReady();
} else {
    document.addEventListener('DOMContentLoaded', domReady);
}

function domReady() {
    let connectStatus = document.getElementById('connectStatus');
    let connectButton = document.getElementById('connectButton');
    let disconnectButton = document.getElementById('disconnectButton');
    let nodeIdInput = document.getElementById('nodeIdInput');
    let readButton = document.getElementById('readButton');
    let writeButton = document.getElementById('writeButton');
    let readWriteStatus = document.getElementById('readWriteStatus');
    let readInput = document.getElementById('readInput');
    let writeInput = document.getElementById('writeInput');
    let namespaceInput = document.getElementById('namespaceInput');

    // connect to opcua server
    connectButton.addEventListener('click', async e => {
        if (!authDone) {
            console.error('api session not authenticated');
            return;
        }
        connectButton.disabled = true;
        async function updateNamespaceIndex(namespaceUri) {
            namespaceIndex = await session.getNamespaceIndex(namespaceUri).catch((err) => { 
                readWriteStatus.value = err;
                return -1;
            });
            if (namespaceIndex > -1) {
                readWriteStatus.value = '';
            }
        }
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
        readButton.disabled = false;
        writeButton.disabled = false;

        if (status.isGood()) {
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
        readButton.disabled = true;
        writeButton.disabled = true;
    });

    // read value
    readButton.addEventListener('click', async e => {
        let result = await session.read(`ns=${namespaceIndex};${nodeIdInput.value}`, ATTRIBUTE_VALUE);
        readWriteStatus.value = result.status.string;
        if (result.status.isGood()) {
            readInput.value = result.value;
        }
    });

    // write value
    writeButton.addEventListener('click', async e => {
        let status = await session.write(`ns=${namespaceIndex};${nodeIdInput.value}`, ATTRIBUTE_VALUE, writeInput.value);
        readWriteStatus.value = status.string;
    });
}
