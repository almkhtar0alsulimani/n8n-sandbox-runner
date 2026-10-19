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

// 4. تنفيذ الأكواد بصيغة البث المطلوب (SSE Stream) التي يتوقعها n8n
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

  // تفعيل بث الأحداث (Server-Sent Events)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // حدث البداية
  res.write(`data: ${JSON.stringify({ type: 'start' })}\n\n`);

  // إرسال المخرجات أو الخطأ
  if (errorMsg) {
    res.write(`data: ${JSON.stringify({ type: 'stderr', data: errorMsg + '\n' })}\n\n`);
  } else {
    res.write(`data: ${JSON.stringify({ type: 'stdout', data: output + '\n' })}\n\n`);
  }

  // حدث الانتهاء
  res.write(`data: ${JSON.stringify({ type: 'exit', exitCode: errorMsg ? 1 : 0 })}\n\n`);
  res.end();
});

// 5. حذف الـ Sandbox
app.delete('/sandboxes/:id', (req, res) => {
  res.status(200).json({ message: "Sandbox deleted" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`n8n SSE Sandbox Proxy running on port ${PORT}`);
});
