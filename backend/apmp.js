// Import the mongoose module
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");


const cors = require("cors");
const app = express();
let port = process.env.PORT || 3000;



const authRouter = require("./routes/auth.routes");
const equipment_router = require("./routes/equipment.routes");
const department_router = require("./routes/department.routes");
const mail_router = require("./routes/mail.routes");

// Set `strictQuery: false` to globally opt into filtering by properties that aren't in the schema
// Included because it removes preparatory warnings for Mongoose 7.
// See: https://mongoosejs.com/docs/migrating_to_6.html#strictquery-is-removed-and-replaced-by-strict
mongoose.set("strictQuery", false);

// Define the database URL to connect to.
const mongoDB = "mongodb://localhost:27017/stage";


mongoose.connect(mongoDB);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: "any_secret_key",
  resave: false,
  saveUninitialized: false,
}));

app.listen(3000, '0.0.0.0');
// Routes
app.get('/', (req, res) => {
  res.send('Backend is running');
  console.log("Server time:", new Date());
});


app.use("/auth", authRouter);
app.use("/equipment", equipment_router); // Add catalog routes to middleware chain.
app.use("/department", department_router);
app.use("/mail", mail_router); 


module.exports = app; // Exporter uniquement app



