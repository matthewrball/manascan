import { createServer } from "https";
import { readFileSync } from "fs";
import httpProxy from "http-proxy";

const proxy = httpProxy.createProxyServer({
  target: "http://localhost:3000",
  ws: true,
});

const server = createServer(
  {
    key: readFileSync("certificates/key.pem"),
    cert: readFileSync("certificates/cert.pem"),
  },
  (req, res) => {
    proxy.web(req, res);
  }
);

server.on("upgrade", (req, socket, head) => {
  proxy.ws(req, socket, head);
});

server.listen(3001, "0.0.0.0", () => {
  console.log("HTTPS proxy running at https://192.168.68.52:3001");
});
