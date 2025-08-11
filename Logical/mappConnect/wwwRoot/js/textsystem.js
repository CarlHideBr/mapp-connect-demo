import Api from './mappConnect/Api.js';
import Text from './mappConnect/Text.js';

const API_BASE_URL = `${window.location.origin}/api/1.0`;

const api = new Api(API_BASE_URL);
const txtApi = new Text(API_BASE_URL);
let authDone = false;

// authenticate api client session at the server and keep it alive with ping
let interval;
api.auth().then((response) => {
    if (!response?.ok) {
        throw new Error(`auth request failed with status: ${response.status} - ${response.statusText}`);
    }
    authDone = true;
    interval = window.setInterval(() => api.ping().catch(() => { document.getElementById('authStatus').value = 'lost connection to server, please reload'; }), 30000);
}).catch((err) => {
    document.getElementById('authStatus').value = err;
});

if (document.readyState === 'interactive') {
    domReady();
} else {
    document.addEventListener('DOMContentLoaded', domReady);
}

function domReady() {
    let usernameInput = document.getElementById('usernameInput');
    let passwordInput = document.getElementById('passwordInput');
    let authButton = document.getElementById('authButton');
    let authStatus = document.getElementById('authStatus');
    let readButton = document.getElementById('readButton');
    let namespaceInput = document.getElementById('namespaceInput');
    let languageInput = document.getElementById('languageInput');
    let textIdInput = document.getElementById('textIdInput');
    let readInput = document.getElementById('readInput');
    let readStatus = document.getElementById('readStatus');
    let getLanguages = function () {
        return txtApi.getLanguages().then((response) => {
            response.languageIds.forEach((languageId) => {
                let option = document.createElement('option');
                option.value = languageId;
                option.innerText = languageId;
                languageInput.appendChild(option);
            });
        });
    };
    let getDefaultLanguage = function () {
        return txtApi.getDefaultLanguage().then((response) => {
            languageInput.value = response.defaultLanguageId;
        });
    };
    Promise.all([getLanguages(), getDefaultLanguage()]).then(() => {
        authButton.disabled = false;
        authButton.addEventListener('click', () => {
            const username = usernameInput.value;
            const password = passwordInput.value;
            api.auth(username, password).then(response => {
                if (!response?.ok) {
                    return Promise.reject(new Error(`auth request failed with status: ${response.status} - ${response.statusText}`));
                }
                return response.json();
            }).then((response) => {
                authDone = true;
                window.clearInterval(interval);
                interval = window.setInterval(() => api.ping().catch(() => { authStatus.value = 'lost connection to server, please reload'; }), 30000);
                authStatus.value = `User changed to "${response?.username}"`;
                usernameInput.value = '';
                passwordInput.value = '';
            }, (err) => {
                authStatus.value = err;
            });
        });
        readButton.disabled = false;
        readButton.addEventListener('click', () => {
            const textId = textIdInput.value;
            txtApi.getText(languageInput.value, namespaceInput.value, textId).then((response) => {
                readInput.value = textId?.length ? response[textId] : JSON.stringify(response);
                readStatus.value = 'success';
            }, (err) => {
                readInput.value = '';
                readStatus.value = err;
            });
        });
    }, (err) => {
        readStatus.value = err;
    });
}
