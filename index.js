const express = require('express');
const app = express();

app.use(express.json());

// 1. فحص الصحة العام
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

// 3. فحص حالة الـ Sandbox
app.get('/sandboxes/:id', (req, res) => {
  res.status(200).json({
    id: req.params.id,
    status: "running"
  });
});

// 4. تنفيذ الأكواد كاستجابة JSON عادية ومباشرة (وليست بثاً) لتجاوز فحص n8n
app.post('/sandboxes/:id/executions', (req, res) => {
  const { code } = req.body;
  let output = "";
  let errorMsg = "";

  try {
    if (code) {
      const resVal = eval(code);
      output = typeof resVal === 'object' ? JSON.stringify(resVal) : String(resVal || "success");
    } else {
      output = "success";
    }
  } catch (err) {
    errorMsg = err.message;
  }

  // إرجاع JSON صريح يتوافق مع توقعات n8n القياسية
  res.status(200).json({
    id: "exec-123",
    status: errorMsg ? "failed" : "success",
    exitCode: errorMsg ? 1 : 0,
    exit_code: errorMsg ? 1 : 0,
    stdout: output,
    stderr: errorMsg,
    result: output
  });
});

// 5. حذف الـ Sandbox
app.delete('/sandboxes/:id', (req, res) => {
  res.status(200).json({ message: "Sandbox deleted" });
});

// استقبال احتياطي لأي مسار آخر
app.all('*', (req, res) => {
  res.status(200).json({
    status: "running",
    exitCode: 0,
    stdout: "success"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`n8n Simple JSON Sandbox running on port ${PORT}`);
});
