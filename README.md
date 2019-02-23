# Caching Proxy

A Proxy server that caches responses in filesystem that really works

 * Need to test against a remote API and have a slow connections?
 * The service has no CORS enabled so you can query it from localhost?

Solution: **Cache it in a local server**

# Install

```sh
npm install caching-proxy
```

or globally:

```sh
npm install -g caching-proxy
```

# Usage

Imaging you are consuming an API like http://api.server.com/v2/sources/19/series?format=json and now want to cache all requests there locally or just enable CORS. Start caching-server, use the same urls, just change the server name;

```sh
npx caching-proxy --hostName "http://api.server.com" --port 9000
```

And now instead of consuming http://api.server.com/v2/sources/19/series?format=json, point your client to http://localhost:9000/v2/sources/19/series?format=json

and voila!