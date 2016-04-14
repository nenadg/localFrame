var request = require('request'),
  fs = require('fs'),
  http = require('http'),
  jade = require('jade'),
  testurl = process.argv[2];

if(!testurl){
  console.log('[err] no url specified.');
  return;
}

const PORT=8080;

var callback = function(req, res){
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');

  // dealing with 'POST'
  if (req.method == 'POST') {
    var jsonString = '';

    req.on('data', function (data) {
        jsonString += data;
    });

    req.on('end', function () {
      var url;

      try {
        url = JSON.parse(jsonString).url
      } catch(e){
        url = null;
      };

      // case when localFrame.js sends page name
      if(url){
        request(url, function (error, response, body) {
          // inject something to page ....
          var repl = ['<script>',
                      '   console.log(\'Injected.\');',
                      '</script>',
                      '</body>'].join('');

          body = body.replace(/<\/body>/i, repl);

          res.end(JSON.stringify({ body: body }));
        });
      }
      // case when iframe page sends request
      else {
        var headers = req.headers,
          url = 'http://' + testurl;

        if(req.url.length > 1)
          url += req.url.indexOf('/') > 0 ? '/' + req.url : req.url;

        // modify requested host to testurl host, since iframe requests localhost:8080
        headers.host = testurl;

        var postOptions = {
          headers: headers,
          url: url,
          body: jsonString
        };
        
        console.log('[i] POSTing to remote origin ' + headers.host + ' url: ' + url);

        request.post(postOptions, function(error, response, body){
          // set remote-server set headers to our own, so our request is complete
          var i;
          for(i in response.headers){
            res.setHeader(i, response.headers[i]);
          }

          res.end(response.body);
        });
      }
    });
  }
  else {
    var file = req.url == '/' ? 'index.jade' : req.url.substr(1, req.url.length -1);

    fs.readFile(file, function (err, data){
      // serving local content
      if(data && data.length){

        // serve our .jade content
        if(file.indexOf('.jade') > -1){
          var fn = jade.compile(data, { pretty: true });
          data = fn({
            testurl: 'http://' + testurl,
            pageTitle: 'localFrame'
          });
        }

        res.writeHead(200, { 'Content-Type': 'text/html', 'Content-Length': data.length });
        res.write(data);
        res.end();
      }
      // serving remote content if it's not there
      else {
        fs.exists(file, function(exists) {
          if (!exists) {
            console.log('[i] Fetching remote file ' + file);

            var reqs = request.get('http://' + testurl + '/' + req.url);
            reqs.pipe(res);
          }
          else {
            res.end();
          }
        });
      }
    });
  }
}

var server = http.createServer(callback);

server.listen(PORT, function(){
    console.log("Server listening on: http://localhost:%s, testing url " + testurl, PORT);
});

