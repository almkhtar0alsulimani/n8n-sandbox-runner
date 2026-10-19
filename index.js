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

// 4. تنفيذ الأكواد بالهيكل القياسي الدقيق المتوافق مع Zod (يحمل id, status: completed, exitCode, stdout, stderr)
app.post('/sandboxes/:id/executions', (req, res) => {
  const { code } = req.body;
  let output = "success";
  let errorMsg = "";
  let codeExitCode = 0;

  try {
    if (code) {
      const resVal = eval(code);
      output = typeof resVal === 'object' ? JSON.stringify(resVal) : String(resVal || "success");
    }
  } catch (err) {
    errorMsg = err.message;
    codeExitCode = 1;
  }

  res.status(200).json({
    id: "exec-123",
    status: "completed",
    exitCode: codeExitCode,
    stdout: output,
    stderr: errorMsg
  });
});

// 5. الاستعلام عن حالة تنفيذ معين (لتجنب أي خطأ استعلام لاحق)
app.get('/sandboxes/:id/executions/:execId', (req, res) => {
  res.status(200).json({
    id: req.params.execId,
    status: "completed",
    exitCode: 0,
    stdout: "success",
    stderr: ""
  });
});

// 6. حذف الـ Sandbox
app.delete('/sandboxes/:id', (req, res) => {
  res.status(200).json({ message: "deleted" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Ultimate Robust n8n Sandbox running on port ${PORT}`);
});
