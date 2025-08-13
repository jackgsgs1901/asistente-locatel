import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname)); // para servir index.html y assets

app.post('/recomendar', async (req, res) => {
  const { nombre, edad, sexo, alergias, medicamentos } = req.body;

  const prompt = `
Eres un experto en farmacia. Basado en los datos del cliente:
Nombre: ${nombre}
Edad: ${edad}
Sexo: ${sexo}
Alergias: ${alergias || 'Ninguna'}
Medicamentos: ${medicamentos || 'Ninguno'}

Recomienda al menos 3 suplementos o vitaminas, indicando:
- Nombre del producto
- Dosis diaria recomendada
- Justificación médica/farmacológica clara

Hazlo en tono profesional y fácil de entender.
`;

  try {
    const respuesta = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await respuesta.json();
    const texto = data.choices?.[0]?.message?.content || 'No se pudo generar recomendación.';
    res.json({ resultado: texto });
  } catch (error) {
    console.error('❌ Error en la petición a Groq:', error);
    res.status(500).json({ resultado: 'Hubo un error al generar la recomendación.' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${port}`);
});
