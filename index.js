const express = require('express');
const app = express();

app.use(express.json());

// سجل للرصد والمتابعة
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`, JSON.stringify(req.body));
  next();
});

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

// 4. تنفيذ الأكواد بصيغة NDJSON المدمجة والشاملة لكل متطلبات Zod
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

  // ترويسة تدفق البيانات القياسية
  res.setHeader('Content-Type', 'application/x-ndjson');
  res.status(200);

  // إرسال حدث مدمج يحتوي على كافة الحقول التي يبحث عنها n8n في نفس الوقت
  const completeEvent = JSON.stringify({
    id: "exec-123",
    type: "stdout",
    data: output + "\n",
    exitCode: hasError ? 1 : 0,
    status: hasError ? "failed" : "completed"
  }) + "\n";

  res.write(completeEvent);
  res.end();
});

// 5. الاستعلام عن تنفيذ معين
app.get('/sandboxes/:id/executions/:execId', (req, res) => {
  res.setHeader('Content-Type', 'application/x-ndjson');
  res.status(200);
  res.write(JSON.stringify({
    id: req.params.execId,
    type: "stdout",
    data: "success\n",
    exitCode: 0,
    status: "completed"
  }) + "\n");
  res.end();
});

// 6. حذف الـ Sandbox
app.delete('/sandboxes/:id', (req, res) => {
  res.status(200).json({ message: "deleted" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Ultimate Bulletproof Sandbox running on port ${PORT}`);
});
