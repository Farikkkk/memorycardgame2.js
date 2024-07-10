const path = require("path");
const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();

const filePath = path.join(__dirname, "best-result.json");

fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading the best-result file:", err);
    return;
  }

  try {
    bestResult = JSON.parse(data);
    console.log("Best Result Data:", bestResult);
  } catch (parseErr) {
    console.error("Error parsing JSON:", parseErr);
    return;
  }
});

const allowedOrigins = [
  "https://memory-card-game-bc82cd0751f3.herokuapp.com",

  "https://farikgame.itch.io/memory-card-game",
  "https://html-classic.itch.zone",
  "html-classic.itch.zone/results",
];

const corsOptions = {
  origin: [
    "http://localhost:5000",
    "https://memory-card-game-bc82cd0751f3.herokuapp.com/",
    // "https://floating-meadow-78073-2097b21b377b.herokuapp.com",
    "https://farikgame.itch.io/memory-card-game",
    "https://html-classic.itch.zone",
    "html-classic.itch.zone/results",
  ], // ukazhite vse istochniki, kotorye vy khotite razreshit'
  optionsSuccessStatus: 200,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
};

app.use(cors(corsOptions));

// const corsOptions = {
//   origin: function (origin, callback) {
//     console.log(`Request from origin: ${origin}`); // Add this line
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.indexOf(origin) === -1) {
//       const msg =
//         "The CORS policy for this site does not allow access from the specified Origin.";
//       return callback(new Error(msg), false);
//     }
//     return callback(null, true);
//   },
//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//   allowedHeaders: "Content-Type,Authorization",
//   credentials: true,
//   optionsSuccessStatus: 200, // некоторые браузеры могут требовать установку статуса 200 для корректной обработки CORS
// };

const PORT = process.env.PORT || 5000;

app.use((req, res, next) => {
  console.log(`Incoming request from origin: ${req.headers.origin}`);
  next();
});

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       console.log(`Request from origin: ${origin}`); // Add this line
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.indexOf(origin) === -1) {
//         const msg =
//           "The CORS policy for this site does not allow access from the specified Origin.";
//         return callback(new Error(msg), false);
//       }
//       return callback(null, true);
//     },
//     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//     allowedHeaders: "Content-Type,Authorization",
//     credentials: true,
//   })
// );

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.get("/results", (req, res) => {
  res.json(bestResult);
});

app.post("/results", async (req, res) => {
  const { level, time, steps, username } = req.body;
  if (
    bestResult[level].time > time ||
    (bestResult[level].time === time && bestResult[level].steps > steps)
  ) {
    bestResult[level] = { time, steps, username };
    try {
      await fs.writeFile(filePath, JSON.stringify(bestResult));
      res.status(200).send("New record saved!");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error saving the record.");
    }
  } else {
    res.status(200).send("No new record.");
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
