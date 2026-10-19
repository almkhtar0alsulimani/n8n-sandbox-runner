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
    id: "sbx-local-123"
  });
});

// 3. فحص حالة الـ Sandbox
app.get('/sandboxes/:id', (req, res) => {
  res.status(200).json({
    id: req.params.id,
    status: "running"
  });
});

// 4. تنفيذ الأكواد بصيغة الحدث المدمج المقبولة لدى n8n
app.post('/sandboxes/:id/executions', (req, res) => {
  const { code } = req.body;
  let output = "success";
  let errorMsg = "";

  try {
    if (code) {
      const resVal = eval(code);
      output = typeof resVal === 'object' ? JSON.stringify(resVal) : String(resVal || "success");
    }
  } catch (err) {
    errorMsg = err.message;
  }

  // إرجاع مصفوفة تحتوي على حدث التنفيذ المدمج المطلوب
  res.status(200).json([
    {
      type: "result",
      stdout: output,
      stderr: errorMsg,
      exitCode: errorMsg ? 1 : 0
    }
  ]);
});

// 5. حذف الـ Sandbox
app.delete('/sandboxes/:id', (req, res) => {
  res.status(200).json({ message: "deleted" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`n8n Final Exec Event Sandbox running on port ${PORT}`);
});
