// Creates global variables for the app
// This file is replaced during the webserver start.
// see /scripts/docker-lighttpd/start.sh

/**
 * The URL of the API to use for the app.
 * If undefined, the app will use the API url provided during the build time.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var NX_API_URL = undefined;

/**
 * Superfaktura API URL
 * If undefined, the app will use the API url provided during the build time.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var NX_SF_API_URL = undefined;
