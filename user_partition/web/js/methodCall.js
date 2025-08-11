import Api from './mappConnect/Api.js';
import Session from './mappConnect/Session.js';
import { getApiBaseUrl } from './mcConfig.js';

const API_BASE_URL = getApiBaseUrl();
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
        // move function declaration to function body root
        async function updateNamespaceIndex(namespaceUri) {
            namespaceIndex = await session.getNamespaceIndex(namespaceUri).catch((err) => { 
                addStatus.value = err;
                return -1;
            });
            if (namespaceIndex > -1) {
                addStatus.value = '';
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

        if (status.isGood()) {
            updateNamespaceIndex(namespaceInput.value);
            namespaceInput.addEventListener('change', e => updateNamespaceIndex(namespaceInput.value));
        }
        updateAddButtonState(); 
        
    });

    // disconnect opcua session
    disconnectButton.addEventListener('click', async e => {
        await session.disconnect();
        connectStatus.value = 'disconnected';
        disconnectButton.disabled = true;
        connectButton.disabled = false;
        addButton.disabled = true;
    });

    const firstOperandInput = document.getElementById('firstOperand');
    const secondOperandInput = document.getElementById('secondOperand');
    const addButton = document.getElementById('add');
    const resultField = document.getElementById('result');
    const addStatus = document.getElementById('addStatus');
    const nodeIdInput = document.getElementById('nodeIdInput');
    const methodIdInput = document.getElementById('methodIdInput');

    addButton.addEventListener('click', async () => {
        const firstOperand = parseFloat(firstOperandInput.value);
        const secondOperand = parseFloat(secondOperandInput.value);

        let args = {
            in1: firstOperand,
            in2: secondOperand            
        };

        let result = await session.callMethod(`ns=${namespaceIndex};${nodeIdInput.value}`, `ns=${namespaceIndex};${methodIdInput.value}`, args);

        resultField.value = result.value.out1;
        addStatus.value = result.status.string;
    });

    firstOperandInput.addEventListener('input', updateAddButtonState);
    secondOperandInput.addEventListener('input', updateAddButtonState);

    function updateAddButtonState() {
        const firstIsValid = !isNaN(parseFloat(firstOperandInput.value));
        const secondIsValid = !isNaN(parseFloat(secondOperandInput.value));
        
        if (connectStatus.value === 'Good') {
            addButton.disabled = !(firstIsValid && secondIsValid);
        } else addButton.disabled = true;
    }
}
