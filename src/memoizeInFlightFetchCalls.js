/* Write a memoize function that supports caching of function results with multiple arguments, including objects.
- Handle async fetch calls and avoid de duplication of in-flight fetch calls
- Add a TTL to each promise stored in the cache so that it auto-deletes after TTL
- The cache should always return the most recent results
- Should provide a delete method to delete the cache
- Handles nested objects, arrays, primitives as arguments
*/

/* 
if a value is available in the cache and is not expired, return the value from the cache
If a value is not avaiable in the cache or it has expired, compute the value and store in the cache
*/

/* Approach 

- use Map data structure as an LRU cache with some max size
- create a stable cache key
  - map over all the arguments and call stable stringify for each of them
  - directly JSON.stringify primitive values
  - map over the array values and recursively stringify
  - sort the keys of the object for stable sort and then loop over the keys and recursively call stable stringify function
  - join the results
- check if the key is available in cache
  - check if expiry < now + ttl
      - return the cached result
  - else delete the cache entry
- compute the result as a promise and store the promise in the cache against the cached key
[IMPORTANT]: Note here we are storing promise in the cache and not the promoise result, to avoid de-duplication of fetch calls. We might get another fetch request with the same arguments while the similar one is in progress
*/

function stableStringify(value) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  // recursively call stableStringify for nested values in arrays/objects
  if (Array.isArray(value)) {
    return `'[ ${value.map(stableStringify).join(",")} ]'`;
  }

  // sorting the keys of object value for stable stringify
  const keys = Object.keys(value).sort();
  const entries = keys.map(
    (key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`
  );
  return `{${entries.join(",")}}`;
}

function getCacheKey(args) {
  return args.map(stableStringify).join("|");
}

function memoizeInFlightFetchCalls(fn, { ttl = 5000, maxSize = 10 } = {}) {
  let cache = new Map();
  const memoize = (...args) => {
    const key = getCacheKey(args);
    const now = Date.now();

    if (cache.has(key)) {
      const entry = cache.get(key);
      // TTL check
      if (now < entry.expiry) {
        // Refresh the LRU order
        cache.delete(key);
        cache.set(key, entry);
        console.log("Serving from cache");
        return entry.promise;
      } else {
        console.log("Cache expired");
        cache.delete(key);
      }
    }

    console.log("Computing the value");
    const promise = fn.apply(this, args).catch((err) => {
      cache.delete(key);
      throw err;
    });

    // Storing the promise along with expiry in cache to avoid de-duplication of in-flight fetch requests. This will help avoid computing expensive results for the parallel calls
    cache.set(key, {
      promise,
      expiry: now + ttl,
    });

    // Enforcing max maxSize
    if (cache.size > maxSize) {
      const lruKey = cache.keys().next().value; // keys() returns a map iterator and next() returns the first entry from the iterator in the order of insertion
      cache.delete(lruKey);
      console.log("Evicted LRU cache entry", lruKey);
    }

    return promise;
  };

  const deleteCache = () => {
    cache.clear();
  };

  memoize.delete = deleteCache;
  return memoize;
}

/* Usage */

const delay = (time) => {
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      resolve();
    }, time)
  );
};

const fetchData = async (user) => {
  await delay(1000);
  return {
    name: user.firstName,
    city: user.city,
    text: `I am a ${user.job} from ${user.city}`,
  };
};

const memoizedFetch = memoizeInFlightFetchCalls(fetchData, { maxSize: 2 });

(async () => {
  const pilot = { firstName: "Sam", city: "Los Angeles", job: "Pilot" };
  const farmer = { firstName: "Bob", city: "Texas", job: "farmer" };
  const chef = { firstName: "Mandy", city: "Newyork", job: "Chef" };

  const pilotResult1 = await memoizedFetch(pilot);
  console.log(pilotResult1);
  const farmerResult = await memoizedFetch(farmer);
  console.log(farmerResult);
  const pilotResult2 = await memoizedFetch(pilot);
  console.log(pilotResult2);
  const chefResult = await memoizedFetch(chef);
  console.log(chefResult);
})();
