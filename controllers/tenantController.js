const jwt = require("jsonwebtoken");

exports.getTenantPayments = (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const tenantId = decoded.id;

    const query = `SELECT * FROM Payments WHERE Tenant_ID = ? ORDER BY Payment_Date DESC`;

    db.query(query, [tenantId], (err, results) => {
      if (err) return res.status(500).json({ error: "Failed to fetch payments", details: err });
      res.json(results);
    });
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
};
