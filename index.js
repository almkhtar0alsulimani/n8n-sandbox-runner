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
    status: "running"
  });
});

// 3. فحص حالة الـ Sandbox
app.get('/sandboxes/:id', (req, res) => {
  res.status(200).json({
    id: req.params.id,
    status: "running"
  });
});

// 4. تنفيذ الأكواد بصيغة NDJSON Streaming المتوافقة مع Zod في n8n
app.post('/sandboxes/:id/executions', (req, res) => {
  const { code } = req.body;
  let output = "success";
  let hasError = false;

  try {
    if (code) {
      const resVal = eval(code);
      output = typeof resVal === 'object' ? JSON.stringify(resVal) : String(resVal || "success");
    }
  } catch (err) {
    output = err.message;
    hasError = true;
  }

  // ضبط الترويسة لتدفق البيانات السطري
  res.setHeader('Content-Type', 'application/x-ndjson');
  res.status(200);

  // إرسال حدث المخرجات (stdout) في سطر مستقل
  res.write(JSON.stringify({ type: "stdout", data: output + "\n" }) + "\n");

  // إرسال حدث الانتهاء (exit) في سطر مستقل
  res.write(JSON.stringify({ type: "exit", exitCode: hasError ? 1 : 0 }) + "\n");

  res.end();
});

// 5. الاستعلام عن تنفيذ معين
app.get('/sandboxes/:id/executions/:execId', (req, res) => {
  res.setHeader('Content-Type', 'application/x-ndjson');
  res.status(200);
  res.write(JSON.stringify({ type: "stdout", data: "success\n" }) + "\n");
  res.write(JSON.stringify({ type: "exit", exitCode: 0 }) + "\n");
  res.end();
});

// 6. حذف الـ Sandbox
app.delete('/sandboxes/:id', (req, res) => {
  res.status(200).json({ message: "deleted" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`NDJSON Stream Sandbox running on port ${PORT}`);
});
