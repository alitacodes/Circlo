// backend/routes/api.js - Complete API for Circlo Rental
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { body, validationResult } = require("express-validator");
const { getConnection, getConnectionAsync } = require("../hana");
const multer = require("multer");
const path = require("path");
const Razorpay = require("razorpay");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_your_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_key_secret'
});

// Helper function to execute SQL queries
function executeSQL(conn, sql, params = []) {
  return new Promise((resolve, reject) => {
    console.log("🔍 Executing SQL with parameters:", {
      sql,
      paramCount: params.length,
      params: params.map((p) => (typeof p === "object" ? "[Object]" : p)),
    });

    conn.exec(sql, params, (err, result) => {
      if (err) {
        console.error("❌ SQL execution failed:", {
          error: err.message,
          code: err.code,
          sqlState: err.sqlState,
        });
        reject(err);
      } else {
        console.log("✅ SQL execution successful:", {
          result: Array.isArray(result) ? `${result.length} rows` : result,
        });
        resolve(result);
      }
    });
  });
}

// Helper function to get database connection
async function getDBConnection() {
  try {
    const conn = await getConnectionAsync();
    return conn;
  } catch (err) {
    throw err;
  }
}

// Helper function to check if database is available
async function isDatabaseAvailable() {
  let conn;
  try {
    conn = await getDBConnection();
    // Add a small delay to ensure connection is fully established
    await new Promise((resolve) => setTimeout(resolve, 100));
    await executeSQL(conn, "SELECT 1 FROM DUMMY");
    console.log("✅ Database is available and connected");
    return true;
  } catch (error) {
    console.log("❌ Database not available, using mock data:", error.message);
    return false;
  } finally {
    if (conn) {
      try {
        conn.disconnect();
      } catch (disconnectError) {
        console.error("Error disconnecting:", disconnectError.message);
      }
    }
  }
}

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "your-secret-key",
    (err, user) => {
      if (err) {
        return res.status(403).json({ error: "Invalid token" });
      }
      req.user = user;
      next();
    }
  );
};

// AUTH ENDPOINTS

// POST /api/auth/register - User registration
router.post(
  "/auth/register",
  [
    body("name")
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("phone")
      .isMobilePhone("en-IN")
      .withMessage("Valid Indian phone number required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, password, phone, aadhaar } = req.body;

      // Try to use database first
      let conn;
      try {
        conn = await getDBConnection();

        // Check if user already exists
        const existingUser = await executeSQL(
          conn,
          "SELECT id FROM Users WHERE email = ?",
          [email]
        );
        if (existingUser.length > 0) {
          return res
            .status(400)
            .json({ error: "User already exists with this email" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Generate user ID
        const userId = uuidv4();

        // Insert new user
        const insertSQL = `
          INSERT INTO Users (id, name, email, password_hash, phone, aadhaar_encrypted, karma_points, joined_date)
          VALUES (?, ?, ?, ?, ?, ?, 0, CURRENT_DATE)
        `;

        await executeSQL(conn, insertSQL, [
          userId,
          name,
          email,
          hashedPassword,
          phone,
          aadhaar ? Buffer.from(aadhaar).toString("base64") : null,
        ]);

        // Create JWT token
        const token = jwt.sign(
          { id: userId, email, name },
          process.env.JWT_SECRET || "your-secret-key",
          { expiresIn: "24h" }
        );

        res.status(201).json({
          message: "User registered successfully",
          token,
          user: { id: userId, name, email },
        });
      } catch (dbError) {
        console.log(
          "❌ Database error, falling back to mock data:",
          dbError.message
        );

        // Fallback to mock data
        const existingUser = mockData.users.find(
          (user) => user.email === email
        );
        if (existingUser) {
          return res
            .status(400)
            .json({ error: "User already exists with this email" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const userId = uuidv4();

        const newUser = {
          id: userId,
          name,
          email,
          password_hash: hashedPassword,
          phone,
          karma_points: 0,
          joined_date: new Date().toISOString().split("T")[0],
        };

        mockData.users.push(newUser);

        const token = jwt.sign(
          { id: userId, email, name },
          process.env.JWT_SECRET || "your-secret-key",
          { expiresIn: "24h" }
        );

        res.status(201).json({
          message: "User registered successfully (mock data)",
          token,
          user: { id: userId, name, email },
        });
      } finally {
        if (conn) {
          try {
            conn.disconnect();
          } catch (disconnectError) {
            console.error("Error disconnecting:", disconnectError.message);
          }
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  }
);

// POST /api/auth/login - User login
router.post(
  "/auth/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      // Try to use database first
      let conn;
      try {
        console.log("🔍 Login: Attempting database connection...");
        conn = await getDBConnection();
        console.log("✅ Login: Database connected successfully");

        console.log("🔍 Login: Executing SQL query...");
        const result = await executeSQL(
          conn,
          "SELECT * FROM Users WHERE email = ?",
          [email]
        );
        console.log(
          `✅ Login: SQL query successful, found ${result.length} users`
        );

        if (result.length === 0) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        const user = result[0];
        const isValidPassword = await bcrypt.compare(
          password,
          user.PASSWORD_HASH
        );

        if (!isValidPassword) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
          { id: user.ID, email: user.EMAIL, name: user.NAME },
          process.env.JWT_SECRET || "your-secret-key",
          { expiresIn: "24h" }
        );

        res.json({
          message: "Login successful",
          token,
          user: { id: user.ID, name: user.NAME, email: user.EMAIL },
        });
      } catch (dbError) {
        console.log("❌ Database error during login:", dbError.message);
        console.log("❌ Database error stack:", dbError.stack);

        // Don't fall back to mock data - return the actual error
        res.status(500).json({
          error: "Database connection failed",
          details: dbError.message,
        });
        return;
      } finally {
        if (conn) {
          try {
            conn.disconnect();
          } catch (disconnectError) {
            console.error("Error disconnecting:", disconnectError.message);
          }
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  }
);

// ITEMS ENDPOINTS

// GET /api/items - Get all items
router.get("/items", async (req, res) => {
  try {
    const { category, search, location, owner_id } = req.query;

    let conn;
    try {
      conn = await getDBConnection();

      let sql = `
        SELECT i.*, u.name as owner_name, u.karma_points,
               (SELECT COUNT(*) FROM Reviews r WHERE r.item_id = i.id) as review_count,
               (SELECT AVG(rating) FROM Reviews r WHERE r.item_id = i.id) as avg_rating
        FROM Items i
        JOIN Users u ON i.owner_id = u.id
        WHERE 1=1
      `;
      const params = [];

      // Filter by owner if specified
      if (owner_id) {
        sql += " AND i.owner_id = ?";
        params.push(owner_id);
      }

      if (category && category !== "all") {
        sql += " AND i.category = ?";
        params.push(category);
      }

      if (search) {
        sql += " AND (i.title LIKE ? OR i.description LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
      }

      if (location) {
        sql += " AND i.location LIKE ?";
        params.push(`%${location}%`);
      }

      sql += " ORDER BY i.created_at DESC";

      const result = await executeSQL(conn, sql, params);
      
      // Fetch photos for each item
      const itemsWithPhotos = await Promise.all(
        result.map(async (item) => {
          const photosSql = `SELECT url FROM Photos WHERE item_id = ? AND photo_type = 'listing' ORDER BY uploaded_at ASC`;
          const photos = await executeSQL(conn, photosSql, [item.id]);
          return {
            ...item,
            images: photos.map(photo => photo.url)
          };
        })
      );

      console.log("📊 Backend: Items query result:", {
        count: Array.isArray(itemsWithPhotos) ? itemsWithPhotos.length : 0,
        firstItem: Array.isArray(itemsWithPhotos) && itemsWithPhotos.length > 0 ? itemsWithPhotos[0] : null
      });
      res.json(itemsWithPhotos);
    } finally {
      if (conn) conn.disconnect();
    }
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// GET /api/items/my - Get current user's items
router.get("/items/my", authenticateToken, async (req, res) => {
  try {
    let conn;
    try {
      conn = await getDBConnection();

      const sql = `
        SELECT i.*, u.name as owner_name, u.karma_points,
               (SELECT COUNT(*) FROM Reviews r WHERE r.item_id = i.id) as review_count,
               (SELECT AVG(rating) FROM Reviews r WHERE r.item_id = i.id) as avg_rating
        FROM Items i
        JOIN Users u ON i.owner_id = u.id
        WHERE i.owner_id = ?
        ORDER BY i.created_at DESC
      `;

      const result = await executeSQL(conn, sql, [req.user.id]);
      
      // Fetch photos for each item
      const itemsWithPhotos = await Promise.all(
        result.map(async (item) => {
          const photosSql = `SELECT url FROM Photos WHERE item_id = ? AND photo_type = 'listing' ORDER BY uploaded_at ASC`;
          const photos = await executeSQL(conn, photosSql, [item.id]);
          return {
            ...item,
            images: photos.map(photo => photo.url)
          };
        })
      );

      res.json(itemsWithPhotos);
    } finally {
      if (conn) conn.disconnect();
    }
  } catch (error) {
    console.error("Error fetching user items:", error);
    res.status(500).json({ error: "Failed to fetch user items" });
  }
});

// GET /api/items/:id - Get specific item
router.get("/items/:id", async (req, res) => {
  try {
    const { id } = req.params;

    let conn;
    try {
      conn = await getDBConnection();
      const result = await executeSQL(
        conn,
        `SELECT i.*, u.name as owner_name, u.karma_points, u.phone as owner_phone,
                (SELECT COUNT(*) FROM Reviews r WHERE r.item_id = i.id) as review_count,
                (SELECT AVG(rating) FROM Reviews r WHERE r.item_id = i.id) as avg_rating
         FROM Items i
         JOIN Users u ON i.owner_id = u.id
         WHERE i.id = ?`,
        [id]
      );

      if (result.length === 0) {
        return res.status(404).json({ error: "Item not found" });
      }

      const item = result[0];
      
      // Fetch photos for this item
      const photosSql = `SELECT url FROM Photos WHERE item_id = ? AND photo_type = 'listing' ORDER BY uploaded_at ASC`;
      const photos = await executeSQL(conn, photosSql, [id]);
      
      const itemWithPhotos = {
        ...item,
        images: photos.map(photo => photo.url)
      };

      res.json(itemWithPhotos);
    } finally {
      if (conn) conn.disconnect();
    }
  } catch (error) {
    console.error("Error fetching item:", error);
    res.status(500).json({ error: "Failed to fetch item" });
  }
});

// GET /api/listings - Get all listings with filters
router.get("/listings", async (req, res) => {
  try {
    const { section = "browse", page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    if (await isDatabaseAvailable()) {
      let conn;
      try {
        conn = await getDBConnection();

        // Build the WHERE clause based on the section
        const isVault = section === "cultural-vault" ? 1 : 0;

        const listingsSQL = `
          SELECT i.*, u.name as owner_name, u.karma_points,
                 (SELECT COUNT(*) FROM Reviews r WHERE r.item_id = i.id) as review_count,
                 (SELECT AVG(rating) FROM Reviews r WHERE r.item_id = i.id) as avg_rating
          FROM Items i
          JOIN Users u ON i.owner_id = u.id
          WHERE i.is_vault_item = ?
          ORDER BY i.created_at DESC
          LIMIT ? OFFSET ?
        `;

        const countSQL = `
          SELECT COUNT(*) as total
          FROM Items
          WHERE is_vault_item = ?
        `;

        const [listings, countResult] = await Promise.all([
          executeSQL(conn, listingsSQL, [isVault, limit, offset]),
          executeSQL(conn, countSQL, [isVault]),
        ]);

        const totalItems = countResult[0]?.total || 0;
        const totalPages = Math.ceil(totalItems / limit);

        res.json({
          items: listings,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        });
      } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Failed to fetch listings" });
      } finally {
        if (conn) {
          await conn.disconnect();
        }
      }
    } else {
      res.status(503).json({ error: "Database not available" });
    }
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
});

// POST /api/items - Create new item
router.post(
  "/items",
  authenticateToken,
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required"),
    body("price").isNumeric().withMessage("Price must be a number"),
    body("location").trim().notEmpty().withMessage("Location is required"),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        title,
        description,
        category,
        price,
        price_unit,
        location,
        geo_location,
        is_vault_item,
        vault_story,
      } = req.body;

      let conn;
      try {
        conn = await getDBConnection();

        const itemId = uuidv4();
        const insertSQL = `
          INSERT INTO Items (
            id, title, description, category, price, price_unit, 
            location, geo_location, owner_id, is_vault_item, vault_story, created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `;

        await executeSQL(conn, insertSQL, [
          itemId,
          title,
          description,
          category || null,
          price,
          price_unit || 'day',
          location,
          geo_location || null,
          req.user.id,
          is_vault_item ? 1 : 0,
          vault_story || null,
        ]);

        res.status(201).json({
          message: "Item created successfully",
          itemId,
        });
      } finally {
        if (conn) conn.disconnect();
      }
    } catch (error) {
      console.error("Error creating item:", error);
      res.status(500).json({ error: "Failed to create item" });
    }
  }
);

// BOOKING ENDPOINTS

// POST /api/bookings - Create new booking
router.post(
  "/bookings",
  authenticateToken,
  [
    body("item_id").isUUID().withMessage("Valid item ID required"),
    body("start_date").isISO8601().withMessage("Valid start date required"),
    body("end_date").isISO8601().withMessage("Valid end date required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let conn;
    try {
      conn = await getDBConnection();

      const { item_id, start_date, end_date } = req.body;

      // Check if item exists and is not owned by the user
      const itemCheck = await executeSQL(
        conn,
        "SELECT owner_id FROM Items WHERE id = ?",
        [item_id]
      );

      if (itemCheck.length === 0) {
        return res.status(404).json({ error: "Item not found" });
      }

      if (itemCheck[0].OWNER_ID === req.user.id) {
        return res.status(400).json({ error: "Cannot book your own item" });
      }

      // Check for overlapping bookings
      const overlapCheck = await executeSQL(
        conn,
        `
      SELECT id FROM Bookings 
      WHERE item_id = ? 
      AND status NOT IN ('cancelled', 'rejected')
      AND (
        (start_date <= ? AND end_date >= ?) OR
        (start_date <= ? AND end_date >= ?) OR
        (start_date >= ? AND end_date <= ?)
      )
    `,
        [
          item_id,
          start_date,
          start_date,
          end_date,
          end_date,
          start_date,
          end_date,
        ]
      );

      if (overlapCheck.length > 0) {
        return res
          .status(400)
          .json({ error: "Item is not available for selected dates" });
      }

      const bookingId = uuidv4();

      const insertSQL = `
      INSERT INTO Bookings (id, user_id, item_id, start_date, end_date, status, payment_status, created_at)
      VALUES (?, ?, ?, ?, ?, 'pending', 'unpaid', CURRENT_TIMESTAMP)
    `;

      await executeSQL(conn, insertSQL, [
        bookingId,
        req.user.id,
        item_id,
        start_date,
        end_date,
      ]);

      res.status(201).json({
        message: "Booking request created successfully",
        bookingId,
      });
    } catch (err) {
      console.error("Error creating booking:", err);
      res.status(500).json({ error: "Failed to create booking" });
    } finally {
      if (conn) conn.disconnect();
    }
  }
);

// GET /api/bookings - Get user's bookings
router.get("/bookings", authenticateToken, async (req, res) => {
  let conn;
  try {
    conn = await getDBConnection();

    const { type = "renter" } = req.query; // 'renter' or 'owner'

    let sql;
    if (type === "owner") {
      // Bookings for items owned by the user
      sql = `
        SELECT b.*, i.title as item_title, i.price, i.price_unit,
               u.name as renter_name, u.phone as renter_phone
        FROM Bookings b
        JOIN Items i ON b.item_id = i.id
        JOIN Users u ON b.user_id = u.id
        WHERE i.owner_id = ?
        ORDER BY b.created_at DESC
      `;
    } else {
      // Bookings made by the user
      sql = `
        SELECT b.*, i.title as item_title, i.price, i.price_unit,
               u.name as owner_name, u.phone as owner_phone
        FROM Bookings b
        JOIN Items i ON b.item_id = i.id
        JOIN Users u ON i.owner_id = u.id
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC
      `;
    }

    const bookings = await executeSQL(conn, sql, [req.user.id]);

    res.json({ bookings });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  } finally {
    if (conn) conn.disconnect();
  }
});

// PUT /api/bookings/:id/status - Update booking status (for owners)
router.put(
  "/bookings/:id/status",
  authenticateToken,
  [
    body("status")
      .isIn(["confirmed", "rejected", "completed", "cancelled"])
      .withMessage("Invalid status"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let conn;
    try {
      conn = await getDBConnection();

      const { status } = req.body;
      const bookingId = req.params.id;

      // Check if user owns the item for this booking
      const ownerCheck = await executeSQL(
        conn,
        `
        SELECT b.id FROM Bookings b
        JOIN Items i ON b.item_id = i.id
        WHERE b.id = ? AND i.owner_id = ?
      `,
        [bookingId, req.user.id]
      );

      if (ownerCheck.length === 0) {
        return res
          .status(403)
          .json({ error: "Not authorized to update this booking" });
      }

      await executeSQL(conn, "UPDATE Bookings SET status = ? WHERE id = ?", [
        status,
        bookingId,
      ]);

      res.json({ message: "Booking status updated successfully" });
    } catch (err) {
      console.error("Error updating booking:", err);
      res.status(500).json({ error: "Failed to update booking" });
    } finally {
      if (conn) conn.disconnect();
    }
  }
);

// PAYMENT ENDPOINTS

// POST /api/payments/process - Process payment for booking
router.post("/payments/process", authenticateToken, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let conn;
  try {
    conn = await getDBConnection();

    const { booking_id, payment_method, payment_details } = req.body;

    // Validate required fields
    if (!booking_id || !payment_method || !payment_details) {
      return res.status(400).json({
        error: "Missing required fields",
        details: {
          booking_id: !booking_id,
          payment_method: !payment_method,
          payment_details: !payment_details,
        },
      });
    }

    // Check if booking exists and belongs to user
    const bookingCheck = await executeSQL(
      conn,
      `
      SELECT b.*, i.title as item_title, i.price, i.price_unit,
             DATEDIFF(b.end_date, b.start_date) as days
      FROM Bookings b
      JOIN Items i ON b.item_id = i.id
      WHERE b.id = ? AND b.user_id = ?
    `,
      [booking_id, req.user.id]
    );

    if (bookingCheck.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const booking = bookingCheck[0];
    
    // Calculate total amount
    const days = booking.DAYS || 1;
    const pricePerUnit = parseFloat(booking.PRICE);
    const totalAmount = days * pricePerUnit;

    // Simulate payment processing (in real app, integrate with Stripe/PayPal/etc.)
    const paymentId = uuidv4();
    const paymentStatus = "completed"; // Simulate successful payment

    // Update booking payment status
    await executeSQL(
      conn,
      "UPDATE Bookings SET payment_status = ? WHERE id = ?",
      [paymentStatus, booking_id]
    );

    // Create payment record (you might want to create a Payments table)
    const paymentRecord = {
      id: paymentId,
      booking_id: booking_id,
      amount: totalAmount,
      payment_method: payment_method,
      payment_details: JSON.stringify(payment_details),
      status: paymentStatus,
      processed_at: new Date().toISOString(),
    };

    res.status(200).json({
      message: "Payment processed successfully",
      payment: {
        id: paymentId,
        amount: totalAmount,
        status: paymentStatus,
        booking_id: booking_id,
      },
    });
  } catch (err) {
    console.error("Error processing payment:", err);
    res.status(500).json({ error: "Failed to process payment" });
  } finally {
    if (conn) conn.disconnect();
  }
});

// GET /api/payments/methods - Get available payment methods
router.get("/payments/methods", (req, res) => {
  // Return available payment methods
  res.json({
    methods: [
      {
        id: "card",
        name: "Credit/Debit Card",
        icon: "💳",
        description: "Pay with Visa, Mastercard, or American Express",
      },
      {
        id: "upi",
        name: "UPI",
        icon: "📱",
        description: "Pay using UPI apps like Google Pay, PhonePe",
      },
      {
        id: "netbanking",
        name: "Net Banking",
        icon: "🏦",
        description: "Pay using your bank account",
      },
      {
        id: "wallet",
        name: "Digital Wallet",
        icon: "👛",
        description: "Pay using Paytm, Amazon Pay, or other wallets",
      },
    ],
  });
});

// REVIEW ENDPOINTS

// POST /api/reviews - Create review
router.post(
  "/reviews",
  authenticateToken,
  [
    body("item_id").isUUID().withMessage("Valid item ID required"),
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("comment")
      .isLength({ min: 10 })
      .withMessage("Comment must be at least 10 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let conn;
    try {
      conn = await getDBConnection();

      const { item_id, rating, comment } = req.body;

      // Check if user has a completed booking for this item
      const bookingCheck = await executeSQL(
        conn,
        `
        SELECT id FROM Bookings 
        WHERE user_id = ? AND item_id = ? AND status = 'completed'
      `,
        [req.user.id, item_id]
      );

      if (bookingCheck.length === 0) {
        return res
          .status(400)
          .json({ error: "Can only review items you have rented" });
      }

      // Check if user already reviewed this item
      const existingReview = await executeSQL(
        conn,
        "SELECT id FROM Reviews WHERE user_id = ? AND item_id = ?",
        [req.user.id, item_id]
      );

      if (existingReview.length > 0) {
        return res
          .status(400)
          .json({ error: "You have already reviewed this item" });
      }

      const reviewId = uuidv4();

      await executeSQL(
        conn,
        `
        INSERT INTO Reviews (id, user_id, item_id, rating, comment, created_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `,
        [reviewId, req.user.id, item_id, rating, comment]
      );

      res.status(201).json({
        message: "Review created successfully",
        reviewId,
      });
    } catch (err) {
      console.error("Error creating review:", err);
      res.status(500).json({ error: "Failed to create review" });
    } finally {
      if (conn) conn.disconnect();
    }
  }
);

// USER PROFILE ENDPOINTS

// GET /api/profile - Get user profile
router.get("/profile", authenticateToken, async (req, res) => {
  let conn;
  try {
    conn = await getDBConnection();

    const userSql = `
      SELECT id, name, email, phone, karma_points, joined_date, avatar_url
      FROM Users WHERE id = ?
    `;

    const users = await executeSQL(conn, userSql, [req.user.id]);

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user's items count
    const itemsCount = await executeSQL(
      conn,
      "SELECT COUNT(*) as count FROM Items WHERE owner_id = ?",
      [req.user.id]
    );

    // Get user's bookings count
    const bookingsCount = await executeSQL(
      conn,
      "SELECT COUNT(*) as count FROM Bookings WHERE user_id = ?",
      [req.user.id]
    );

    const user = users[0];
    user.items_count = itemsCount[0].COUNT;
    user.bookings_count = bookingsCount[0].COUNT;

    res.json({ user });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  } finally {
    if (conn) conn.disconnect();
  }
});

// GET /api/user/profile - Get user profile
router.get("/user/profile", authenticateToken, async (req, res) => {
  let conn;
  try {
    conn = await getDBConnection();

    const user = await executeSQL(
      conn,
      "SELECT id, name, email, phone, avatar_url, karma_points, joined_date FROM Users WHERE id = ?",
      [req.user.id]
    );

    if (user.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: user[0].ID,
        name: user[0].NAME,
        email: user[0].EMAIL,
        phone: user[0].PHONE,
        avatar_url: user[0].AVATAR_URL,
        karma_points: user[0].KARMA_POINTS,
        joined_date: user[0].JOINED_DATE,
      },
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Failed to fetch user profile" });
  } finally {
    if (conn) conn.disconnect();
  }
});

// GET /api/categories - Get all categories
router.get("/categories", async (req, res) => {
  let conn;
  try {
    conn = await getDBConnection();

    const sql = `
      SELECT DISTINCT category, COUNT(*) as count 
      FROM Items 
      WHERE category IS NOT NULL 
      GROUP BY category 
      ORDER BY count DESC
    `;

    const categories = await executeSQL(conn, sql);

    res.json({ categories });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  } finally {
    if (conn) conn.disconnect();
  }
});

// POST /api/auth/logout - User logout
router.post("/auth/logout", authenticateToken, (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // But we can log the logout event for audit purposes
  res.json({
    message: "Logout successful",
    timestamp: new Date().toISOString(),
  });
});

// GET /api/auth/me - Get current user info
router.get("/auth/me", authenticateToken, async (req, res) => {
  try {
    if (await isDatabaseAvailable()) {
      let conn;
      try {
        conn = await getDBConnection();

        const result = await executeSQL(
          conn,
          "SELECT id, name, email, phone, karma_points, joined_date, avatar_url FROM Users WHERE id = ?",
          [req.user.id]
        );

        if (result.length === 0) {
          return res.status(404).json({ error: "User not found" });
        }

        res.json({ user: result[0] });
      } finally {
        if (conn) conn.disconnect();
      }
    } else {
      // Mock data implementation
      const user = mockData.users.find((u) => u.id === req.user.id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ user });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "API is healthy",
    timestamp: new Date().toISOString(),
    database: "Available (with fallback)",
  });
});

// POST /api/items - Create a new listing
router.post("/items", async (req, res) => {
  console.log("📝 Creating new listing with data:", {
    ...req.body,
    images: req.body.images ? `${req.body.images.length} images` : "none",
  });

  let conn;
  let useMockData = false;

  try {
    const {
      title,
      description,
      category,
      price,
      price_unit,
      location,
      condition,
      is_vault_item,
      vault_story,
      images,
      availability,
    } = req.body;

    // Validate required fields
    if (!title || !price || !category || !condition || !location) {
      return res.status(400).json({
        error: "Missing required fields",
        details: {
          title: !title,
          price: !price,
          category: !category,
          condition: !condition,
          location: !location,
        },
      });
    }

    const itemId = uuidv4();
    // For development, use a default owner ID if auth is not set up
    const ownerId = req.user?.id || "1"; // Default to user 1 for development

    // Convert price to number and validate before any DB operations
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) {
      return res.status(400).json({ error: "Invalid price format" });
    }

    // Try to get database connection
    try {
      conn = await getDBConnection();
      console.log("🔌 Database connection attempt completed");
    } catch (err) {
      console.log(
        "📝 Using mock data due to database connection error:",
        err.message
      );
      useMockData = true;
    }

    // If database connection failed, use mock data
    if (useMockData || !conn) {
      console.log("📝 Creating item in mock data");
      const newItem = {
        id: itemId,
        owner_id: ownerId,
        title,
        description: description || "",
        category,
        price: numericPrice,
        price_unit: price_unit || "day",
        location: location || "",
        condition: condition || "",
        is_vault_item: is_vault_item || false,
        vault_story: vault_story || "",
        created_at: new Date().toISOString(),
        rating: 0,
        review_count: 0,
      };

      // Try to add to mock data
      try {
        mockData.items.push(newItem);
        console.log("✅ Item added to mock data successfully");

        return res.status(201).json({
          success: true,
          message: "Listing created successfully (mock)",
          data: {
            itemId: itemId,
            item: newItem,
          },
        });
      } catch (mockError) {
        console.error("❌ Error in mock data handling:", mockError);
        return res.status(500).json({
          error: "Failed to create listing in mock data",
          details: mockError.message,
        });
      }
    }

    const sql = `INSERT INTO Items (
      id,
      owner_id,
      title,
      description,
      category,
      price,
      price_unit,
      location,
      item_condition,
      is_vault_item,
      vault_story
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    // Log the query and parameters for debugging
    console.log("🔍 SQL Query:", sql);

    const params = [
      itemId,
      ownerId,
      title,
      description || "",
      category,
      parseFloat(price),
      price_unit || "day",
      location || "",
      condition || "",
      is_vault_item ? 1 : 0,
      vault_story || "",
    ];

    console.log("📝 Query Parameters:", params);

    await executeSQL(conn, sql, params);

    // Handle image uploads by inserting into Photos table
    if (images && Array.isArray(images)) {
      const photoSql = `INSERT INTO Photos (id, item_id, url, photo_type) VALUES (?, ?, ?, ?)`;
      for (const imageUrl of images) {
        // If it's a base64 image, save it as a file
        let finalImageUrl = imageUrl;
        if (imageUrl.startsWith('data:image/')) {
          try {
            const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const filename = `image-${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
            const filepath = path.join(__dirname, '../uploads', filename);
            
            // Write file to uploads directory
            require('fs').writeFileSync(filepath, buffer);
            finalImageUrl = `/uploads/${filename}`;
          } catch (fileError) {
            console.error("Error saving image file:", fileError);
            // Continue with original URL if file save fails
          }
        }
        
        await executeSQL(conn, photoSql, [
          uuidv4(),
          itemId,
          finalImageUrl,
          "listing",
        ]);
      }
    }

    res.status(201).json({
      message: "Listing created successfully",
      itemId: itemId,
    });
  } catch (error) {
    console.error("❌ Error creating listing:", {
      message: error.message,
      stack: error.stack,
      requestBody: {
        ...req.body,
        // Don't log sensitive data if any
        images: req.body.images ? `${req.body.images.length} images` : "none",
      },
    });

    // Send more detailed error message
    res.status(500).json({
      error: "Failed to create listing",
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  } finally {
    if (conn) {
      try {
        console.log("🔌 Attempting to disconnect from database");
        await conn.disconnect();
        console.log("✅ Database disconnected successfully");
      } catch (disconnectError) {
        console.error("❌ Error disconnecting from database:", disconnectError);
      }
    }
  }
});

// PAYMENT ENDPOINTS

// POST /api/payments/create-order - Create Razorpay order
router.post("/payments/create-order", authenticateToken, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { booking_id, item_id, start_date, end_date } = req.body;

    // Get item details to calculate payment
    let conn;
    try {
      conn = await getDBConnection();
      
      const itemDetails = await executeSQL(
        conn,
        "SELECT price, price_unit FROM Items WHERE id = ?",
        [item_id]
      );

      if (itemDetails.length === 0) {
        return res.status(404).json({ error: "Item not found" });
      }

      // Calculate rental duration and costs
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      
      const rentPayment = Math.ceil(itemDetails[0].PRICE * daysDiff);
      const platformFee = Math.ceil(rentPayment * 0.15); // 15% platform fee
      const safetyDeposit = 200; // Fixed safety deposit
      const totalAmount = rentPayment + platformFee + safetyDeposit;

      // Create Razorpay order
      const order = await razorpay.orders.create({
        amount: totalAmount * 100, // Razorpay expects amount in paise
        currency: 'INR',
        receipt: `booking_${booking_id}`,
        notes: {
          booking_id: booking_id,
          item_id: item_id,
          start_date: start_date,
          end_date: end_date,
          rent_payment: rentPayment,
          platform_fee: platformFee,
          safety_deposit: safetyDeposit
        }
      });

      res.json({
        success: true,
        order_id: order.id,
        amount: totalAmount,
        currency: 'INR',
        breakdown: {
          rent_payment: rentPayment,
          platform_fee: platformFee,
          safety_deposit: safetyDeposit,
          total: totalAmount
        }
      });
    } finally {
      if (conn) conn.disconnect();
    }
  } catch (err) {
    console.error("Error creating payment order:", err);
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

// POST /api/payments/verify - Verify payment signature
router.post("/payments/verify", authenticateToken, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = req.body;

    // Verify payment signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const crypto = require('crypto');
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'your_key_secret')
      .update(text)
      .digest('hex');

    if (signature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    // Update booking status
    let conn;
    try {
      conn = await getDBConnection();
      
      await executeSQL(
        conn,
        "UPDATE Bookings SET status = 'confirmed', payment_status = 'paid' WHERE id = ?",
        [booking_id]
      );

      res.json({
        success: true,
        message: "Payment verified and booking confirmed",
        payment_id: razorpay_payment_id
      });
    } finally {
      if (conn) conn.disconnect();
    }
  } catch (err) {
    console.error("Error verifying payment:", err);
    res.status(500).json({ error: "Failed to verify payment" });
  }
});

module.exports = router;
