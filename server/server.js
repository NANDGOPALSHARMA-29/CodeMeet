require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDB = require("./src/config/db");
const initializeSocket = require("./src/socket/index");


const httpServer = http.createServer(app);
initializeSocket(httpServer);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    httpServer.listen(PORT, () => {
      console.log(`CodeMeet server running on port no ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed Error:", error.message);
    process.exit(1);
  }
};

startServer();