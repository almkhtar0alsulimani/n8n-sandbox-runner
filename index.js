const express = require('express');
const app = express();

app.use(express.json());

const API_KEY = process.env.SANDBOX_KEY || "my-secret-render-key";

// Middlewares
app.use((req, res, next) => {
  next();
});

// 1. فحص الصحة
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 2. إنشاء الـ Sandbox
app.post('/sandboxes', (req, res) => {
  res.status(201).json({
    id: "sbx-local-123",
    status: "running",
    created_at: new Date().toISOString()
  });
});

// 3. حالة الـ Sandbox
app.get('/sandboxes/:id', (req, res) => {
  res.status(200).json({
    id: req.params.id,
    status: "running"
  });
});

// 4. تنفيذ الأكواد (المسار المحدث والمطلوب من n8n)
app.post('/sandboxes/:id/executions', (req, res) => {
  const { code } = req.body;
  try {
    const result = eval(code || '');
    res.status(200).json({
      stdout: String(result || "success"),
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

// 5. حذف الـ Sandbox
app.delete('/sandboxes/:id', (req, res) => {
  res.status(200).json({ message: "Sandbox deleted" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`n8n Compatible Sandbox running on port ${PORT}`);
});
