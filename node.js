const http = require("http");
const { datasets } = require("zoau");
const data = /^\/data\/.*/;
const hostname = "0.0.0.0";
const port = process.env.PORT || 0; // system will replace with a free port
let myname = process.env.LOGNAME;

const server = http.createServer((req, res) => {
  const basic = /^\/$/; // between the beginning (^) and end ($) look for "/"
  const fav = /^\/fav/;
  const hello = /^\/hello\//;
  console.log(req.url);
  if (fav.test(req.url)) sendResponse(res, "", 200);
  if (hello.test(req.url)) {
    const name = req.url.replace(/^\/[^\/]*\/([A-Z0-9a-z]+).*$/, "$1");
    sendResponse(res, `Hello ${name}!`, 200, "text/plain");
  }

  if (basic.test(req.url)) {
    sendResponse(res, `Hello World from ${myname} on z/OS`, 200, "text/plain");
  }
  if (data.test(req.url)) {
    const dsn = req.url.replace(/^\/[^\/]*\/([A-Z0-9a-z]+).*$/, "$1");
    const dsopen = datasets
      .read("ZXP.PUBLIC.SOURCE(" + dsn + ")")
      .then(function (contents) {
        sendResponse(res, contents, 200, "text/plain");
      })
      .catch(function (error) {
        sendResponse(res, "${dsn} not found", 404, "text/plain");
      });
  }
  server.close();
});

function sendResponse(res, content, code, type) {
  res.statusCode = code;
  res.setHeader("Content-Type", type || "text/plain");
  res.end(content);
}

server.listen(port, hostname, () => {
  console.log(
    `Server running at http://${hostname}: ${server.address().port} /`
  );
});
