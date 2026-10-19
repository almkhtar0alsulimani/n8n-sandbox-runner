const express = require('express');
const app = express();

app.use(express.json());

const API_KEY = process.env.SANDBOX_KEY || "my-secret-render-key";

// التحقق من مفتاح الأمان
app.use((req, res, next) => {
  const auth = req.headers['authorization'] || req.headers['x-api-key'];
  if (auth !== API_KEY && req.path !== '/healthz') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// فحص الحالة
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

// تنفيذ الكود
app.post('/execute', (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'No code provided' });

  try {
    const result = eval(code);
    res.json({ output: String(result) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Sandbox running on port ${PORT}`);
});
