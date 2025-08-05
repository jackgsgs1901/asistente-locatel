import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.json());
app.use(express.static(__dirname)); // sirve index.html, logo, etc.

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

    console.log('🧾 Respuesta de Groq (texto):', texto);
    res.json({ resultado: texto });
  } catch (error) {
    console.error('❌ Error al llamar Groq:', error);
    res.status(500).json({ resultado: 'Hubo un error al generar la recomendación.' });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
  console.log('🔑 GROQ_API_KEY:', process.env.GROQ_API_KEY);
});
