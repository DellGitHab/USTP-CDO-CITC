const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const WebSocket = require('ws');

// Initialize Express app
const app = express();
const port = 3000;

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Create a MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: '', 
  database: 'ezmonitoring_bd', 
});

// Connect to the MySQL database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL database');
});

// Create an HTTP server to handle both Express and WebSocket connections
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Create a WebSocket server and attach it to the HTTP server
const wss = new WebSocket.Server({ noServer: true });

// Broadcast function to send data to all connected WebSocket clients
function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'update', logs: [data] }));
    }
  });
}

// Handle WebSocket connection
wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  
  ws.on('message', (message) => {
    console.log('Received message:', message);
  });
  
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// Handle WebSocket upgrade request (critical for WebSocket functionality)
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// Helper function to format date and time
function formatDateTime(date) {
  const d = new Date(date);
  const datePart = d.toISOString().split('T')[0];
  const timePart = d.toTimeString().split(' ')[0];
  return { date: datePart, time: timePart };
}

app.post('/api/rfid', async (req, res) => {
  const { rfid_number, device_id } = req.body;

  if (!rfid_number || !device_id) {
    return res.status(400).json({ success: false, message: 'RFID number and device ID are required.' });
  }

  try {
    let sector = device_id === "entrance" ? "entrance" : "Unknown";

    // Check if RFID belongs to personnel
    let [rows] = await db.promise().query("SELECT * FROM employees WHERE rfid_number = ?", [rfid_number]);

    if (rows.length > 0) {
      const employee = rows[0];

      // Check if the scanned device_id matches the employee's sector
      if (device_id !== "entrance" && parseInt(device_id) !== parseInt(employee.sector)) {
        sector = device_id; // The unauthorized sector

        // Check for an open unauthorized session
        [rows] = await db.promise().query(
          "SELECT * FROM monitoring WHERE rfid_number = ? AND time_out IS NULL AND sector = ? AND identification = 'unauth_pers'",
          [rfid_number, sector]
        );

        if (rows.length > 0) {
          // Close the unauthorized session
          const entry = rows[0];
          await db.promise().query("UPDATE monitoring SET time_out = NOW() WHERE id = ?", [entry.id]);

          const { date, time } = formatDateTime(new Date());
          const log = {
            id: entry.id,
            rfid_number,
            fullname: employee.fullname,
            contact: employee.contact,
            date_entered: entry.date_entered,
            time_in: entry.time_in,
            time_out: time,
            identification: 'unauth_pers',
            sector,
            device_id,
          };

          broadcast(log);
          return res.status(403).json({ success: false, message: 'Unauthorized' });
        } else {
          // Log the unauthorized access attempt
          const { date, time } = formatDateTime(new Date());
          const [insertResult] = await db.promise().query(
            "INSERT INTO monitoring (rfid_number, fullname, contact, date_entered, time_in, identification, sector, device_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [rfid_number, employee.fullname, employee.contact, date, time, 'unauth_pers', sector, device_id]
          );

          const log = {
            id: insertResult.insertId,
            rfid_number,
            fullname: employee.fullname,
            contact: employee.contact,
            date_entered: date,
            time_in: time,
            time_out: null,
            identification: 'unauth_pers',
            sector,
            device_id,
          };

          broadcast(log);
          return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
      }

      sector = device_id === "entrance" ? "entrance" : employee.sector;

      // Check for an open session (time_out IS NULL) at the SAME SECTOR
      [rows] = await db.promise().query(
        "SELECT * FROM monitoring WHERE rfid_number = ? AND time_out IS NULL AND sector = ? AND identification = 'personnel'",
        [rfid_number, sector]
      );

      if (rows.length > 0) {
        // Logout the user (close the session)
        const entry = rows[0];
        await db.promise().query("UPDATE monitoring SET time_out = NOW() WHERE id = ?", [entry.id]);

        const { date, time } = formatDateTime(new Date());
        const log = {
          id: entry.id,
          rfid_number,
          fullname: employee.fullname,
          contact: employee.contact,
          date_entered: entry.date_entered,
          time_in: entry.time_in,
          time_out: time,
          identification: 'personnel',
          sector,
          device_id,
        };

        broadcast(log);
        return res.status(200).json({ success: true, message: 'Logged Out' });
      } else {
        // Log the user in (create a new session)
        const { date, time } = formatDateTime(new Date());
        const [insertResult] = await db.promise().query(
          "INSERT INTO monitoring (rfid_number, fullname, contact, date_entered, time_in, identification, sector, device_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [rfid_number, employee.fullname, employee.contact, date, time, "personnel", sector, device_id]
        );

        const log = {
          id: insertResult.insertId,
          rfid_number,
          fullname: employee.fullname,
          contact: employee.contact,
          date_entered: date,
          time_in: time,
          time_out: null,
          identification: 'personnel',
          sector,
          device_id,
        };

        broadcast(log);
        return res.status(200).json({ success: true, message: 'Logged In' });
      }
    }

    // Check if RFID belongs to a visitor using visitor_rfid table
    [rows] = await db.promise().query(
      `SELECT v.*, vr.expiration_datetime 
       FROM visitor_rfid vr 
       JOIN visitors v ON vr.last_visitor_id = v.id 
       WHERE vr.rfid_number = ?`, 
      [rfid_number]
    );

    if (rows.length > 0) {
      const visitor = rows[0];

      // Check if RFID is expired
      const currentTime = new Date();
      const expirationTime = new Date(visitor.expiration_datetime);
      if (currentTime > expirationTime) {
        return res.status(403).json({ success: false, message: 'Expired' });
      }

      // Check if the scanned device_id matches the visitor's sector
      if (device_id !== "entrance" && parseInt(device_id) !== parseInt(visitor.sector)) {
        sector = device_id;

        [rows] = await db.promise().query(
          "SELECT * FROM monitoring WHERE rfid_number = ? AND time_out IS NULL AND sector = ? AND identification = 'unauth_vis'",
          [rfid_number, sector]
        );

        if (rows.length > 0) {
          const entry = rows[0];
          await db.promise().query("UPDATE monitoring SET time_out = NOW() WHERE id = ?", [entry.id]);

          const { date, time } = formatDateTime(new Date());
          const log = {
            id: entry.id,
            rfid_number,
            fullname: visitor.fullname,
            contact: visitor.contact,
            date_entered: entry.date_entered,
            time_in: entry.time_in,
            time_out: time,
            identification: 'unauth_vis',
            sector,
            device_id,
          };

          broadcast(log);
          return res.status(403).json({ success: false, message: 'Unauthorized' });
        } else {
          const { date, time } = formatDateTime(new Date());
          const [insertResult] = await db.promise().query(
            "INSERT INTO monitoring (rfid_number, fullname, contact, date_entered, time_in, identification, sector, device_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [rfid_number, visitor.fullname, visitor.contact, date, time, 'unauth_vis', sector, device_id]
          );
          const log = {
            id: insertResult.insertId,
            rfid_number,
            fullname: visitor.fullname,
            contact: visitor.contact,
            date_entered: date,
            time_in: time,
            time_out: null,
            identification: 'unauth_vis',
            sector,
            device_id,
          };

          broadcast(log);
          return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
      }
      sector = device_id === "entrance" ? "entrance" : visitor.sector;

      // Check for an open session (time_out IS NULL) at the SAME SECTOR
      [rows] = await db.promise().query(
        "SELECT * FROM monitoring WHERE rfid_number = ? AND time_out IS NULL AND sector = ? AND identification = 'visitor'",
        [rfid_number, sector]
      );

      if (rows.length > 0) {
        // Logout the visitor (close the session)
        const entry = rows[0];
        await db.promise().query("UPDATE monitoring SET time_out = NOW() WHERE id = ?", [entry.id]);

        const { date, time } = formatDateTime(new Date());
        const log = {
          id: entry.id,
          rfid_number,
          fullname: visitor.fullname,
          contact: visitor.contact,
          date_entered: entry.date_entered,
          time_in: entry.time_in,
          time_out: time,
          identification: 'visitor',
          sector,
          device_id,
        };

        broadcast(log);
        return res.status(200).json({ success: true, message: 'Logged Out' });
      } else {
        // Log the visitor in (create a new session)
        const { date, time } = formatDateTime(new Date());
        const [insertResult] = await db.promise().query(
          "INSERT INTO monitoring (rfid_number, fullname, contact, date_entered, time_in, identification, sector, device_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [rfid_number, visitor.fullname, visitor.contact, date, time, "visitor", sector, device_id]
        );

        const log = {
          id: insertResult.insertId,
          rfid_number,
          fullname: visitor.fullname,
          contact: visitor.contact,
          date_entered: date,
          time_in: time,
          time_out: null,
          identification: 'visitor',
          sector,
          device_id,
        };

        broadcast(log);
        return res.status(200).json({ success: true, message: 'Logged In' });
      }
    }

    return res.status(404).json({ success: false, message: 'RFID not found in the system.' });
  } catch (error) {
    console.error("Error handling RFID:", error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});
