/**
 * Represents a status object.
 */
export default class Status {
    #code = 0;
    #string = '';

    constructor(params) {
        this.#code ||= params.code;
        this.#string ||= params.string;
    }

    /**
     * Gets the code of the status.
     * @returns {number} The status code.
     */
    get code() {
        return this.#code;
    }

    /**
     * Gets the string representation of the status.
     * @returns {string} The status string.
     */
    get string() {
        return this.#string;
    }

    /**
     * Checks if the status is bad.
     * @returns {boolean} True if the status is bad, false otherwise.
     */
    isBad() {
        return (((this.#code) & 0x80000000) !== 0);
    }

    /**
     * Checks if the status is good.
     * @returns {boolean} True if the status is good, false otherwise.
     */
    isGood = function () {
        return (((this.#code) & 0xC0000000) === 0x00000000);
    };
}
