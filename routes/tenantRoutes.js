const express = require("express");
const router = express.Router();

const { getTenantPayments } = require("../controllers/tenantController");

router.get("/payments", getTenantPayments);

module.exports = router;
