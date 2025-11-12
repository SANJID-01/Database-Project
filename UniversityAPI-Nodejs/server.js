/*
  This is the complete, fixed backend server.
  It includes the /api/status endpoint and all search features.
*/

// 1. Import the tools
const express = require("express");
const cors = require("cors");
const sql = require("mssql");

// 2. Create the Express app (the "waiter")
const app = express();
const port = 3000;

// 3. Setup middleware
app.use(cors()); // Allow your frontend to call this server
app.use(express.json()); // Allow the server to read JSON data

// 4. *** YOUR DATABASE CONNECTION ***
// This uses your 'web_user' login.
const sqlConfig = {
  user: "web_user",
  password: "web_password123",
  server: "LAPTOP-TTMG6JK1",
  database: "UniversityManagementSystem",
  options: {
    trustServerCertificate: true, // Necessary for local development
  },
};

// --- 5. DEFINE YOUR API ENDPOINTS ---

// === THIS IS THE NEW, CRITICAL ENDPOINT ===
// The frontend calls this to check if the server and database are running.
app.get("/api/status", async (req, res) => {
  try {
    // Try to connect to the database
    let pool = await sql.connect(sqlConfig);
    // If successful, close the connection and send 'ok'
    await pool.close();
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    // If the connection fails, send an error
    res
      .status(500)
      .json({ status: "error", db: "disconnected", message: err.message });
  }
});

// A simple test endpoint
app.get("/", (req, res) => {
  res.send("Welcome to the University Management API!");
});

// --- STUDENT ENDPOINTS ---

app.get("/api/students", async (req, res) => {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query("SELECT * FROM Student");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/students", async (req, res) => {
  const { student_name, enrollment_year } = req.body;
  try {
    await sql.connect(sqlConfig);
    const result = await new sql.Request()
      .input("student_name", sql.NVarChar, student_name)
      .input("enrollment_year", sql.Int, enrollment_year)
      .query(
        "INSERT INTO Student (student_name, enrollment_year) OUTPUT INSERTED.* VALUES (@student_name, @enrollment_year)"
      );
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/students/:id", async (req, res) => {
  const { id } = req.params;
  const { student_name, enrollment_year } = req.body;
  try {
    await sql.connect(sqlConfig);
    await new sql.Request()
      .input("id", sql.Int, id)
      .input("student_name", sql.NVarChar, student_name)
      .input("enrollment_year", sql.Int, enrollment_year)
      .query(
        "UPDATE Student SET student_name = @student_name, enrollment_year = @enrollment_year WHERE student_id = @id"
      );
    res.status(204).send(); // 204 means "No Content" (success)
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/api/students/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await sql.connect(sqlConfig);
    await new sql.Request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Student WHERE student_id = @id");
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- COURSE ENDPOINTS ---

app.get("/api/courses", async (req, res) => {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query("SELECT * FROM Course");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/courses", async (req, res) => {
  const { course_id, course_name, credits } = req.body;
  try {
    await sql.connect(sqlConfig);
    const result = await new sql.Request()
      .input("course_id", sql.NVarChar, course_id)
      .input("course_name", sql.NVarChar, course_name)
      .input("credits", sql.Int, credits)
      .query(
        "INSERT INTO Course (course_id, course_name, credits) OUTPUT INSERTED.* VALUES (@course_id, @course_name, @credits)"
      );
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/courses/:id", async (req, res) => {
  const { id } = req.params;
  const { course_name, credits } = req.body;
  try {
    await sql.connect(sqlConfig);
    await new sql.Request()
      .input("id", sql.NVarChar, id)
      .input("course_name", sql.NVarChar, course_name)
      .input("credits", sql.Int, credits)
      .query(
        "UPDATE Course SET course_name = @course_name, credits = @credits WHERE course_id = @id"
      );
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/api/courses/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await sql.connect(sqlConfig);
    await new sql.Request()
      .input("id", sql.NVarChar, id)
      .query("DELETE FROM Course WHERE course_id = @id");
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- ENROLLMENT ENDPOINTS ---

app.get("/api/enrollments", async (req, res) => {
  try {
    await sql.connect(sqlConfig);
    // This is the JOIN query to get readable names
    const result = await sql.query(`
          SELECT e.enrollment_id, e.student_id, e.course_id, 
                 s.student_name as StudentName, c.course_name as CourseName 
          FROM Enrollment e
          JOIN Student s ON e.student_id = s.student_id
          JOIN Course c ON e.course_id = c.course_id
        `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// NEW: Get enrollments for a specific student
app.get("/api/enrollments/student/:student_id", async (req, res) => {
  const { student_id } = req.params;
  try {
    await sql.connect(sqlConfig);
    const result = await new sql.Request().input(
      "student_id",
      sql.Int,
      student_id
    ).query(`
                SELECT e.enrollment_id, e.student_id, e.course_id, 
                       s.student_name as StudentName, c.course_name as CourseName 
                FROM Enrollment e
                JOIN Student s ON e.student_id = s.student_id
                JOIN Course c ON e.course_id = c.course_id
                WHERE e.student_id = @student_id
            `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/enrollments", async (req, res) => {
  const { student_id, course_id } = req.body;
  try {
    await sql.connect(sqlConfig);
    const result = await new sql.Request()
      .input("student_id", sql.Int, student_id)
      .input("course_id", sql.NVarChar, course_id)
      .query(
        "INSERT INTO Enrollment (student_id, course_id) OUTPUT INSERTED.* VALUES (@student_id, @course_id)"
      );
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/enrollments/:id", async (req, res) => {
  const { id } = req.params;
  const { student_id, course_id } = req.body;
  try {
    await sql.connect(sqlConfig);
    await new sql.Request()
      .input("id", sql.Int, id)
      .input("student_id", sql.Int, student_id)
      .input("course_id", sql.NVarChar, course_id)
      .query(
        "UPDATE Enrollment SET student_id = @student_id, course_id = @course_id WHERE enrollment_id = @id"
      );
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/api/enrollments/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await sql.connect(sqlConfig);
    await new sql.Request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Enrollment WHERE enrollment_id = @id");
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- GRADE ENDPOINTS ---

app.get("/api/grades", async (req, res) => {
  try {
    await sql.connect(sqlConfig);
    // This query joins all the tables to get full details
    const result = await sql.query(`
          SELECT g.grade_id, g.enrollment_id, g.grade, 
                 s.student_name as StudentName, c.course_name as CourseName
          FROM Grade g
          JOIN Enrollment e ON g.enrollment_id = e.enrollment_id
          JOIN Student s ON e.student_id = s.student_id
          JOIN Course c ON e.course_id = c.course_id
        `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/grades", async (req, res) => {
  const { enrollment_id, grade } = req.body;
  try {
    await sql.connect(sqlConfig);
    const result = await new sql.Request()
      .input("enrollment_id", sql.Int, enrollment_id)
      .input("grade", sql.NVarChar, grade)
      .query(
        "INSERT INTO Grade (enrollment_id, grade) OUTPUT INSERTED.* VALUES (@enrollment_id, @grade)"
      );
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/grades/:id", async (req, res) => {
  const { id } = req.params;
  const { grade } = req.body;
  try {
    await sql.connect(sqlConfig);
    await new sql.Request()
      .input("id", sql.Int, id)
      .input("grade", sql.NVarChar, grade)
      .query("UPDATE Grade SET grade = @grade WHERE grade_id = @id");
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/api/grades/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await sql.connect(sqlConfig);
    await new sql.Request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Grade WHERE grade_id = @id");
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- GRADE REPORT ENDPOINTS ---

// Get all grade reports
app.get("/api/gradereport", async (req, res) => {
  try {
    await sql.connect(sqlConfig);
    // This is the main report query from your PDF
    const result = await sql.query(`
          SELECT s.student_name as StudentName, c.course_name as CourseName, g.grade, s.student_id as StudentId
          FROM Grade g
          JOIN Enrollment e ON g.enrollment_id = e.enrollment_id
          JOIN Student s ON e.student_id = s.student_id
          JOIN Course c ON e.course_id = c.course_id
        `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// NEW: Get grade report for a specific student
app.get("/api/gradereport/:student_id", async (req, res) => {
  const { student_id } = req.params;
  try {
    await sql.connect(sqlConfig);
    const result = await new sql.Request().input(
      "student_id",
      sql.Int,
      student_id
    ).query(`
                SELECT s.student_name as StudentName, c.course_name as CourseName, g.grade, s.student_id as StudentId
                FROM Grade g
                JOIN Enrollment e ON g.enrollment_id = e.enrollment_id
                JOIN Student s ON e.student_id = s.student_id
                JOIN Course c ON e.course_id = c.course_id
                WHERE s.student_id = @student_id
            `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 6. START THE SERVER ---
app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
