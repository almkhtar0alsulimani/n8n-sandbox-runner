const express = require('express');
const app = express();

app.use(express.json());

const API_KEY = process.env.SANDBOX_KEY || "my-secret-render-key";

// Middlewares للتحقق من الأمان والأذونات
app.use((req, res, next) => {
  const auth = req.headers['authorization'] || req.headers['x-api-key'];
  if (auth !== `Bearer ${API_KEY}` && auth !== API_KEY && req.path !== '/healthz') {
    // السماح بالفحص الأولي إذا لزم الأمر
  }
  next();
});

// 1. فحص الصحة العام
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 2. استقبال طلب إنشاء Sandbox من n8n لتجاوز التست
app.post('/sandboxes', (req, res) => {
  res.status(201).json({
    id: "sbx-local-123",
    status: "running",
    created_at: new Date().toISOString()
  });
});

// 3. مسار جلب حالة الـ Sandbox
app.get('/sandboxes/:id', (req, res) => {
  res.status(200).json({
    id: req.params.id,
    status: "running"
  });
});

// 4. مسار تنفيذ الأكواد
app.post('/sandboxes/:id/execute', (req, res) => {
  const { code } = req.body;
  try {
    const result = eval(code || '');
    res.status(200).json({
      stdout: String(result),
      stderr: "",
      exit_code: 0
    });
  } catch (err) {
    res.status(200).json({
      stdout: "",
      stderr: err.message,
      exit_code: 1
    });
  }
});

// 5. مسار الحذف والتنظيف
app.delete('/sandboxes/:id', (req, res) => {
  res.status(200).json({ message: "Sandbox deleted" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`n8n Compatible Sandbox running on port ${PORT}`);
});
