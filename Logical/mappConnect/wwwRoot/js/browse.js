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

async function domReady() {
    let connectStatus = document.getElementById('connectStatus');
    let connectButton = document.getElementById('connectButton');
    let disconnectButton = document.getElementById('disconnectButton');
    let namespaceInput = document.getElementById('namespaceInput');
    let nodeIdInput = document.getElementById('nodeIdInput');
    let browseButton = document.getElementById('browse');
    let backButton = document.getElementById('back');
    let browsePath = document.getElementById('browsePath');
    let browseStatus = document.getElementById('browseStatus');
    let browseHistory = [];

    // connect to opcua server
    connectButton.addEventListener('click', async e => {
        if (!authDone) {
            console.error('api session not authenticated');
            return;
        }
        // move function declaration to function body root
        async function updateNamespaceIndex(namespaceUri) {
            namespaceIndex = await session.getNamespaceIndex(namespaceUri).catch((err) => { 
                browsePath.innerHTML = '';
                browseHistory = [];
                browseStatus.value = err;
                return -1;
            });
            if (namespaceIndex > -1) {
                browseStatus.value = '';
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
        browseButton.disabled = false;
        backButton.disabled = false;

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
        browseButton.disabled = true;
        backButton.disabled = true;
    });

    function createTable(data) {
        let table = document.createElement('table');
        let thead = document.createElement('thead');
        let tbody = document.createElement('tbody');

        let headerRow = document.createElement('tr');
        Object.keys(data[0]).forEach(key => {
            let th = document.createElement('th');
            th.textContent = key;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        data.forEach(item => {
            let row = document.createElement('tr');
            row.addEventListener('click', async () => {
                let result = await session.browse(item['Node Id']);
                displayResult(result, item['Node Id']);
            });
            Object.values(item).forEach(value => {
                let td = document.createElement('td');
                td.textContent = value;
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
        table.appendChild(tbody);

        return table;
    }

    function displayResult(result, nodeId) {
        if (result.status.isGood()) {
            let formattedResult = result.references.map(ref => {
                return {
                    'Browse Name': ref.browseName,
                    'Display Name': ref.displayName,
                    'Is Forward': ref.isForward,
                    'Node Class': ref.nodeClass,
                    'Node Id': ref.nodeId,
                    'Reference Type Id': ref.referenceTypeId,
                    'Type Definition': ref.typeDefinition
                };
            });
            browsePath.innerHTML = '';
            browsePath.appendChild(createTable(formattedResult));
            browseStatus.value = result.status.string;
            if (nodeId !== undefined) {
                browseHistory.push(nodeId);
            }
            let lastNodeInHistory = browseHistory[browseHistory.length - 1];

            if (lastNodeInHistory.split(';')[1] === undefined) {
                nodeIdInput.value = lastNodeInHistory;
            } else {
                nodeIdInput.value = lastNodeInHistory.split(';')[1];
            }
            
        } else browseStatus.value = result.status.string;
    }

    browseButton.addEventListener('click', async () => {
        let inputNodeId = nodeIdInput.value;
        let nodeId;

        if (inputNodeId.startsWith('ns=') || inputNodeId.startsWith('i=')) {
            nodeId = inputNodeId;
        } else {
            nodeId = `ns=${namespaceIndex};${inputNodeId}`;
        }

        let result = await session.browse(nodeId);
        displayResult(result, nodeId);

    });

    backButton.addEventListener('click', async () => {
        if (browseHistory.length > 1) {
            browseHistory.pop();

            let nodeId = browseHistory[browseHistory.length - 1];
            let result = await session.browse(nodeId);
            displayResult(result);
        }
    });
}
