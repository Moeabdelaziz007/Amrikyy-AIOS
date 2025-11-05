const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const app = express();
const PORT = 3001;

// Load OpenAPI spec
const openApiSpec = YAML.load(path.join(__dirname, '../openapi.yaml'));

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

// Mock endpoints
app.post('/api/speech/synthesize', (req, res) => {
  res.json({ audioContent: 'MockedAudioBase64' });
});

app.post('/api/speech/transcribe', (req, res) => {
  res.json({ transcript: 'Mocked transcript' });
});

app.listen(PORT, () => {
  console.log(`Mock server running at http://localhost:${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});
