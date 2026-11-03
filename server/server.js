const http = require("http");
const app = require("./app");
const initializeSocket = require("./src/socket/index");

const httpServer = http.createServer(app);

initializeSocket(httpServer);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`CodeMeet server running on port ${PORT}`);
});