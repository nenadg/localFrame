# localFrame
bypass sameorigin policy from your couch, without using `JSONP`, `document.domain`, `XDomainRequest` or `window.postMessage` methods.

A proof of concept technique to bypass SAMEORIGIN policy enforced on iframes. It's basically local node.js proxy that routes remote content directly to your iframe like it was served from your localhost. This allows full `iframe.contentWindow.document` access without security restrictions.

### How does it work
Instead of `iframe.src="http://example.com"` we post the request to our localhost proxy, that will `request(...)` our beloved site and respond with it's body. 
One can inject anything to `response.end`, or from local script.

##### Note
This is lousy written work in progress so it will fail in many scenarios.