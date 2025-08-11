
/**
 * Represents an API client for fetching texts from a server.
 */
export default class Text {
    #baseUrl;

    constructor(baseUrl = 'http://localhost:8084/api/1.0') {
        this.#baseUrl = baseUrl;
    }

    /**
     * Get IDs of available languages.
     * @returns {Promise<Response>} A promise that resolves to the server response.
     */
    getLanguages() {
        return fetch(`${this.#baseUrl}/text/languages`, {
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if (!response?.ok) {
                return Promise.reject(new Error(`getLanguages request failed with status: ${response.status} - ${response.statusText}`));
            }
            return response.json();
        });
    }
    /**
     * Get ID of the default (System) language.
     * @returns {Promise<Response>} A promise that resolves to the server response.
     */
    getDefaultLanguage() {
        return fetch(`${this.#baseUrl}/text/languages/default`, {
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if (!response?.ok) {
                return Promise.reject(new Error(`getDefaultLanguage request failed with status: ${response.status} - ${response.statusText}`));
            }
            return response.json();
        });
    }
    /**
     * Get a text of a textkey of a specified language ID and namespace.
     * @param {string} (languageId=en) the language id in which the text should be returned
     * @param {string} (namespace=Default-Namespace) the namespace to which the text belongs
     * @param {string} (textkey=Samples.HELLO_WORLD) the key of the text 
     * @returns {Promise<Response>} A promise that resolves to the server response.
     */
    getText(languageId = 'en', namespace = 'Default-Namespace', textkey = 'Samples.HELLO_WORLD') {
        languageId = typeof languageId === 'string' && languageId.length > 0 ? languageId : 'en';
        namespace = typeof namespace === 'string' && namespace.length > 0 ? namespace : 'Default-Namespace';
        textkey = typeof textkey === 'string' ? textkey : '';
        return fetch(`${this.#baseUrl}/text/${[languageId, namespace, textkey].filter((arg) => arg?.length).map(encodeURIComponent).join('/')}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if (!response?.ok) {
                return Promise.reject(new Error(`getText request failed with status: ${response.status} - ${response.statusText}`));
            }
            return response.json();
        });
    }
}
