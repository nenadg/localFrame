window.addEventListener('load', function(){
  var localFrameContent = [
    '<div id="iframe-div">',
    '</div>',
    '<div style="float: left; width: 40vw; height: 100vh; margin: 0px 5px 0px 5px">',
      '<h1>localFrame</h1>',
      '<p> <- your iframe content should be rendered left from here.',
    '</div>'
  ].join('');

  document.body.innerHTML += localFrameContent;
  console.log(window.testurl)
  loadPage(window.testurl);
});

/**
 * Little xhr wrapper
 * @param {string}   [method] Name of http method
 * @param {string}   [url] url to load from
 * @param {array}    [params] parameters you're passing to page
 * @param {function} [callback] function that handles response
 * @return {object}  XMLHttpRequest response
 */
var XHR = (function() {
  var _xhr = (function() {
    try {
      return new(this.XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');
    } catch (e) {}
  })();

  return function(method, url, params, callback) {
    _xhr.onreadystatechange = function() {
      if (_xhr.readyState == 4) {
        var _response;

        try {
          _response = JSON.parse(_xhr.response);
        } catch (e) {
          _response = _xhr.responseText;
        }

        if (_xhr.status != 200) {
          // catch an error
          console.error('error', response);
        } else {

          if (callback) {

            callback(_response);
          } else {
            // deal with it
          }
        }
      }
    }

    if (!params) {
      params = JSON.stringify({});
    } else {
      params = JSON.stringify(params);
    }

    _xhr.open(method, url, true);
    _xhr.setRequestHeader("Content-type", "application/json;charset=UTF-8");
    _xhr.send(params);
  };
})();

/**
 * Loads remote page
 * @param {string}   [url] url to load from
 */
var loadPage = function(url){
  XHR('POST','http://localhost:8080', { url: url }, function(data){
    var body = data.body,
      iframe = document.createElement("IFRAME"),
      iframeDiv = document.querySelector('#iframe-div');

    iframeDiv.appendChild(iframe);

    iframe.src = 'about:blank';
    iframe.sandbox = 'allow-same-origin allow-scripts allow-popups allow-forms';
    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(body);
    iframe.contentWindow.document.close();
  });
}