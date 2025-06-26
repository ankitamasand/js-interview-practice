/* Analytics SDK with
init() - to initialize the SDK with apiKey
track()
updateConfig() methods
- flushqueue after init to make sure events that are called before initialization are tracked
- support retries 
- simulate fetch with a promise/httpbin endpoint with 30% chance of failure
- [PENDING] supports keepalive option in fetch/navigator.sendBaecon (64KB limit) on unload event to make sure we don't lose any event when the user leaves the page
- [PENDING] batch multiple events so that we don't call the server for every single event

Retry Mechanism:
401/403 DONT RETRY    Unauthorized
400     DONT RETRY    Client bug
429     RETRY         Too many requests, retry after backoff delay, honour retry-after header
500     RETRY         Internal server error
503     RETRY         Service Unavailable


*/

const MAX_RETRIES = 2;
const BASE_DELAY = 2000;

function fakeFetch() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, 1000);
    if (Math.random() < 0.5) throw new Error("Server Error");
  });
}

async function fakeFetchEndpoint(eventName, data) {
  const response = await fetch("https://httpbin.org/post", {
    method: "POST",
    body: JSON.stringify({
      event: eventName,
      data,
    }),
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Server Error ${response.status}`);
  }
  const result = await response.json();
  console.log("event sent to the server", result);
}

function getBackOffDelay(attempt) {
  return BASE_DELAY * Math.pow(2, attempt);
}

function createAnalyticsSDK() {
  let config = {};
  let isInitialized = false;
  let eventsQueue = [];

  async function attemptSend({ eventName, data }, attempts = 0) {
    try {
      await sendToServer({ eventName, data });
    } catch (err) {
      console.log("Event failed", eventName, err);
      if (attempts < MAX_RETRIES) {
        const delay = getBackOffDelay(attempts);
        console.log(`Retrying event ${eventName}, attempt ${attempts + 1}`);
        setTimeout(() => attemptSend({ eventName, data }, ++attempts), delay);
      } else {
        console.log("dropped event after max number of retries", eventName);
      }
    }
  }

  async function sendToServer({ eventName, data }) {
    console.log(`Sending ${eventName} to server`);
    await fakeFetch();
    console.log(`Event Sent ${eventName}`);
  }

  function sendEvent({ eventName, data }) {
    if (!isInitialized) {
      console.warn("SDK is not initialized, Queuing event", eventName);
      eventsQueue.push({ eventName, data });
      return;
    }
    attemptSend({ eventName, data });
  }

  // events are queued in the eventsQueue if the are called before initialization
  function flushQueue() {
    for (const { eventName, data } of eventsQueue) {
      attemptSend({ eventName, data });
    }
    eventsQueue.length = 0; // to make sure we don't send duplicate events
  }

  return {
    init(userConfig) {
      if (isInitialized) {
        console.log("SDK is already initialized");
        return;
      }
      config = userConfig;
      isInitialized = true;
      flushQueue();
    },
    track(eventName, data) {
      sendEvent({
        eventName,
        data,
        userId: config?.user?.id,
        time: Date.now().toString(),
      });
    },
    updateConfig(newConfig) {
      config = { ...config, ...newConfig };
    },
  };
}

// const analytics = createAnalyticsSDK();
// analytics.track("PageView", { page: "Homepage" });
// analytics.init({ user: { id: "Ankita" }, apiKey: "123456" });
// analytics.init({ user: { id: "Ankita" }, apiKey: "123456" });

// using fetch for sending requests to the server
// batching
// navigator.sendBaecon or keepalive option in fetch
