import Api from './mappConnect/Api.js';
import Session from './mappConnect/Session.js';

const API_BASE_URL = `${window.location.origin}/api/1.0`;
const OPCUA_ENDPOINT_URL = `opc.tcp://127.0.0.1:4840`;

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
            disconnectButton.disabled = true;
            connectButton.disabled = false;
            updateButtons();
        });
        if (status === undefined) {
            return;
        }
        connectStatus.value = status.string;
        disconnectButton.disabled = false;
        connectButton.disabled = true;
        updateButtons();

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

    const nodeIdInput1 = document.getElementById('nodeIdInput1');
    const nodeIdInput2 = document.getElementById('nodeIdInput2');
    const readInput = document.getElementById('readInput');
    const readButton = document.getElementById('readButton');
    const writeInput = document.getElementById('writeInput');
    const writeButton = document.getElementById('writeButton');
    const readWriteStatus = document.getElementById('readWriteStatus');

    function updateButtons() {
        if (connectStatus.value === 'Good') {
            readButton.disabled = false;
            writeButton.disabled = false;
        } else {
            readButton.disabled = true;
            writeButton.disabled = true;
        }
    }

    readButton.addEventListener('click', async () => {
        const results = await session.read([
            {
                nodeId: `ns=${namespaceIndex};${nodeIdInput1.value}`,
                attribute: 'value'
            },
            {
                nodeId: `ns=${namespaceIndex};${nodeIdInput2.value}`,
                attribute: 'value'
            }
        ]);
        readWriteStatus.value = JSON.stringify(results.map(result => result.status.string));
        readInput.value = JSON.stringify(results.map(result => result.status.isGood() ? result.value.value : null));
    });

    writeButton.addEventListener('click', async () => {
        let values;
        try {
            if (!isNaN(writeInput.value)) {
                readWriteStatus.value = 'BadInput';
                return;
            }
            values = writeInput.value.split(',').map(Number);
            if (values.includes(NaN)) {
                readWriteStatus.value = 'BadInput';
                return;
            }
        } catch (error) {
            readWriteStatus.value = 'BadInput';
            return;
        }

        const statuses = await session.write([
            {
                nodeId: `ns=${namespaceIndex};${nodeIdInput1.value}`,
                attributeName: 'value',
                value: values[0]
            },
            {
                nodeId: `ns=${namespaceIndex};${nodeIdInput2.value}`,
                attributeName: 'value',
                value: values[1]
            }
        ]);
        readWriteStatus.value = JSON.stringify(statuses.map(status => status.string));
    });

}
