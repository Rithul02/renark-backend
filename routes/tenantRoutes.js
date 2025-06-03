const { getTenantPayments } = require("../controllers/tenantController");

router.get("/payments", getTenantPayments);
