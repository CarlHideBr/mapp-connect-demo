// Centralized helpers to build the correct mappConnect API and push channel URLs.
// mappConnect runs on 8080 (HTTP) and 8443 (HTTPS) by default, which are different
// from the integrated web server ports (80/443). Using window.origin would hit
// the wrong server when pages are not served by mappConnect itself.

export function getApiBaseUrl() {
    const isHttps = window.location.protocol === 'https:';
    const port = isHttps ? 8443 : 8080;
    const proto = isHttps ? 'https' : 'http';
    return `${proto}://${window.location.hostname}:${port}/api/1.0`;
}

export function getPushChannelUrl() {
    const isHttps = window.location.protocol === 'https:';
    const port = isHttps ? 8443 : 8080;
    const scheme = isHttps ? 'wss' : 'ws';
    return `${scheme}://${window.location.hostname}:${port}/api/1.0/pushchannel`;
}
