const express = require('express');
const axios = require('axios');
const router = express.Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// POST /api/ai/chat - Send message to Llama 3
router.post('/chat', async (req, res) => {
  try {
    const { message, temperature = 1.0, max_tokens = 1024, top_p = 1.0 } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'user', content: message }
        ],
        temperature: parseFloat(temperature),
        max_tokens: parseInt(max_tokens),
        top_p: parseFloat(top_p)
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    const assistantMessage = response.data.choices[0]?.message?.content;
    
    if (!assistantMessage) {
      return res.status(500).json({ error: 'No response from Llama 3' });
    }

    res.json({ response: assistantMessage });

  } catch (error) {
    console.error('Groq API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid API key. Please check your GROQ_API_KEY.' });
    }
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({ error: 'Cannot connect to Groq API. Please check your internet connection.' });
    }

    res.status(500).json({ 
      error: error.response?.data?.error?.message || 'Failed to get response from Llama 3' 
    });
  }
});

module.exports = router;
