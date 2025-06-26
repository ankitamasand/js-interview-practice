/* Advanced Fetch with
- Retry mechanism with exponential back-off delays
- Fetch timeout using AbortController
- [PENDING] configurable keepalive header for unload event so that we don't miss requests when user leaves the page
*/

function fetchWithRetry(url, options, config) {
  const {
    timeout = 3000, // default timeout 3000
    maxRetries = 3,
    baseDelay = 500, // retry the request after 500ms
  } = config;

  let attempt = 0;

  function getBackoffDelay(attempt) {
    return baseDelay * Math.pow(2, attempt);
  }

  return new Promise((resolve, reject) => {
    function attemptFetch() {
      const abortController = new AbortController();
      const timerId = setTimeout(() => abortController.abort(), timeout);

      fetch(url, { ...options, signal: abortController.signal })
        .then((response) => {
          // cancel the setTimeout as the request finished before the timeou
          clearTimeout(timerId);

          // fetch goes to catch block only for network errors so we have to check for response.ok
          if (!response.ok) {
            const error = new Error(`HTTP error, ${response.status}`);
            error.status = response.status;
            throw error;
          }
          resolve(response);
        })
        .catch((err) => {
          if (err.name === "AbortError") {
            console.warn(`Request timeout attempt ${attempt + 1}`);
          } else {
            console.log(`fetch failed ${attempt + 1} ${err.message}`);
          }

          if (attempt < maxRetries) {
            const delay = getBackoffDelay(attempt);
            attempt++;
            setTimeout(() => attemptFetch(), delay);
          } else {
            reject(err);
          }
        });
    }

    attemptFetch();
  });
}
