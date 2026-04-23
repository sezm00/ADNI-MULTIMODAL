const fs = require('fs');
const path = require('path');

const LOG_PATH = path.join(__dirname, '..', 'audit.log');

module.exports = function auditLog(req, res, next) {
  const start = Date.now();
  const origJson = res.json.bind(res);

  res.json = function (body) {
    const entry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      route: req.originalUrl,
      userId: req.user?.id || 'anonymous',
      role: req.user?.role || 'unknown',
      ip: req.ip || req.socket?.remoteAddress || 'unknown',
      status: res.statusCode,
      durationMs: Date.now() - start
    };
    try {
      fs.appendFileSync(LOG_PATH, JSON.stringify(entry) + '\n');
    } catch (_) {}
    return origJson(body);
  };

  next();
};
