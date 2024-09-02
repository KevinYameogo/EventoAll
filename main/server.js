const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

// Enable CORS for all routes
app.use(cors());

app.get("/api/events", async (req, res) => {
  const { countryCode } = req.query;
  const apiKey = process.env.TICKETMASTER_API_KEY;
  const url = `https://app.ticketmaster.com/discovery/v2/events.json?countryCode=${countryCode}&apikey=${apiKey}`;

  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
