// backend/server.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const multer = require("multer");
require("dotenv").config();

const { getConnection, getConnectionAsync } = require("./hana");
const apiRoutes = require("./routes/api");

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting (temporarily disabled for development)
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: "Too many requests from this IP, please try again later.",
// });
// app.use(limiter);

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use("/api", apiRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Circlo Rental API is running!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Database connection test
app.get("/test-hana", async (req, res) => {
  let conn;
  try {
    conn = await getConnectionAsync();

    conn.exec("SELECT CURRENT_USER FROM DUMMY", (err, result) => {
      if (err) {
        console.error("HANA query error:", err.message);
        res.status(500).json({
          error: "Query failed",
          details: err.message,
        });
      } else {
        res.json({
          status: "Database Connection Successful",
          hanaUser: result[0].CURRENT_USER,
          timestamp: new Date().toISOString(),
        });
      }
      if (conn) conn.disconnect();
    });
  } catch (err) {
    console.error("HANA connection error:", err.message);
    if (conn) conn.disconnect();
    res.status(500).json({
      status: "Database Connection Failed",
      error: "Failed to connect to HANA",
      details: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Tables status check
app.get("/test-tables", async (req, res) => {
  let conn;
  try {
    conn = await getConnectionAsync();

    const tables = ["Users", "Items", "Bookings", "Reviews", "Chats", "Photos"];
    const results = [];

    const checkTable = (tableName) => {
      return new Promise((resolve) => {
        conn.exec(
          `SELECT COUNT(*) AS count FROM ${tableName}`,
          (err, result) => {
            if (err) {
              results.push({
                table: tableName,
                status: "Error",
                error: err.message,
              });
            } else {
              results.push({
                table: tableName,
                status: "OK",
                count: result[0].COUNT,
              });
            }
            resolve();
          }
        );
      });
    };

    // Check all tables
    for (const table of tables) {
      await checkTable(table);
    }

    const totalRecords = results.reduce(
      (sum, table) => sum + (table.count || 0),
      0
    );

    res.json({
      status: "Database Tables Status",
      database: "SAP HANA Cloud",
      summary: {
        total_tables: tables.length,
        tables_ok: results.filter((r) => r.status === "OK").length,
        total_records: totalRecords,
      },
      tables: results,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Table check error:", err.message);
    res.status(500).json({
      status: "Table Check Failed",
      error: "Failed to check tables",
      details: err.message,
      timestamp: new Date().toISOString(),
    });
  } finally {
    if (conn) conn.disconnect();
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '127.0.0.1'; // Explicitly use IPv4 localhost
app
  .listen(PORT, HOST, () => {
    console.log(`🚀 Circlo Rental API Server running on ${HOST}:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/`);
    console.log(`🧪 Database test: http://localhost:${PORT}/test-hana`);
  })
  .on("error", (err) => {
    console.error("❌ Server failed to start:", err.message);
  });
