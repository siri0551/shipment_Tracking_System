require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./src/config/db");

const authRoutes = require("./src/routes/auth.routes");
const shipmentRoutes = require("./src/routes/shipment.routes");
const blockchainRoutes = require("./src/routes/blockchain.routes");
const trackingRoutes = require("./src/routes/tracking.routes");
const qrRoutes = require("./src/routes/qr.routes");
const historyRoutes = require("./src/routes/history.routes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

connectDB();

app.set("io", io);

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/blockchain", blockchainRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/history", historyRoutes);

// Socket.io — clients join a room by trackingId to get real-time updates
io.on("connection", (socket) => {
  socket.on("joinTracking", (trackingId) => socket.join(trackingId));
  socket.on("leaveTracking", (trackingId) => socket.leave(trackingId));
});

app.get("/", (req, res) => res.json({ message: "Shipment Tracking API Running" }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || "Server Error" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
