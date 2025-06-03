const express = require("express");
const cors = require("cors");
require("dotenv").config();

const tenantRoutes = require("./routes/tenantRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/tenant", tenantRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
