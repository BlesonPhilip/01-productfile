import express from "express";
import morgan from "morgan";
import uniqid from "uniqid";
import fs from "fs";
import cors from "cors";

const app = express();
const filePath = "data.json";

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Read all details
app.get("/detail", (req, res) => {
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err || !data) {
      return res.status(200).json([]); // Return an empty array if the file doesn't exist or is empty
    }
    res.status(200).json(JSON.parse(data));
  });
});

// Read a single detail by ID
app.get("/detail/:id", (req, res) => {
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err || !data) {
      return res.status(404).json({ message: "No data found" });
    }

    const details = JSON.parse(data);
    const detail = details.find((item) => item.id === req.params.id);

    if (!detail) {
      return res.status(404).json({ message: "Detail not found" });
    }

    res.status(200).json(detail);
  });
});

// Create a new detail
app.post("/detail", (req, res) => {
  const { title, description, price } = req.body;
  if (!title || !description || !price) {
    return res
      .status(400)
      .json({ message: "please add title,description and price" });
  }
  const newData = { id: uniqid(), ...req.body };

  fs.readFile(filePath, "utf-8", (err, data) => {
    let existingData = [];
    if (!err && data) {
      existingData = JSON.parse(data);
    }

    existingData.push(newData);

    fs.writeFile(
      filePath,
      JSON.stringify(existingData, null, 2),
      (writeErr) => {
        if (writeErr) {
          return res.status(500).json({ message: "Error writing to file" });
        }
        res
          .status(201)
          .json({ message: "Data added successfully", data: newData });
      }
    );
  });
});

// Update a detail by ID
app.patch("/detail/:id", (req, res) => {
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err || !data) {
      return res.status(404).json({ message: "No data found" });
    }

    let details = JSON.parse(data);
    const index = details.findIndex((item) => item.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: "Detail not found" });
    }

    details[index] = { ...details[index], ...req.body };

    fs.writeFile(filePath, JSON.stringify(details, null, 2), (writeErr) => {
      if (writeErr) {
        return res.status(500).json({ message: "Error updating file" });
      }
      res
        .status(200)
        .json({ message: "Data updated successfully", data: details[index] });
    });
  });
});

// Delete a detail by ID
app.delete("/detail/:id", (req, res) => {
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err || !data) {
      return res.status(404).json({ message: "No data found" });
    }

    let details = JSON.parse(data);
    const filteredDetails = details.filter((item) => item.id !== req.params.id);

    if (details.length === filteredDetails.length) {
      return res.status(404).json({ message: "Detail not found" });
    }

    fs.writeFile(
      filePath,
      JSON.stringify(filteredDetails, null, 2),
      (writeErr) => {
        if (writeErr) {
          return res.status(500).json({ message: "Error deleting data" });
        }
        res.status(200).json({ message: "Data deleted successfully" });
      }
    );
  });
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
