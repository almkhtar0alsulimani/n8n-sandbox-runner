const express = require('express');
const app = express();

app.use(express.json());

// 1. Health check
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 2. Create Sandbox
app.post('/sandboxes', (req, res) => {
  res.status(201).json({ id: "sbx-local-123", status: "running" });
});

// 3. Sandbox Status
app.get('/sandboxes/:id', (req, res) => {
  res.status(200).json({ id: req.params.id, status: "running" });
});

// 4. Execution Stream payload (Complete Event Object)
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

  res.setHeader('Content-Type', 'application/x-ndjson');
  res.status(200);

  // إرسال الحدث كاملاً بجميع خصائصه لمنع اعتراض Zod Validator
  const payload = JSON.stringify({
    type: "stdout",
    data: output + "\n",
    exitCode: hasError ? 1 : 0
  }) + "\n";

  res.write(payload);
  res.end();
});

// 5. Delete Sandbox
app.delete('/sandboxes/:id', (req, res) => {
  res.status(200).json({ message: "deleted" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Sandbox running on port ${PORT}`);
});
