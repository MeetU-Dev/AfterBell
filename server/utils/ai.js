const OpenAI = require('openai');

let client = null;

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';
const MODEL = 'google/gemma-4-26b-a4b-it:free';

function getClient() {
  if (!client && process.env.OPENROUTER_API_KEY) {
    client = new OpenAI({
      baseURL: OPENROUTER_BASE,
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AfterBell',
      },
    });
  }
  return client;
}

function isConfigured() {
  return !!process.env.OPENROUTER_API_KEY;
}

const SYSTEM_PROMPT = `You are AfterBell AI — a friendly, supportive AI study buddy for teenagers (ages 13-19).
You help students learn life skills: mental health, financial literacy, communication, career prep, relationships, and more.

Guidelines:
- Explain concepts simply and clearly
- Use examples teens can relate to
- Be encouraging and motivational
- Never share harmful or inappropriate content
- If asked something outside life skills, gently redirect
- Keep responses concise (under 300 words unless asked for detail)
- Adapt your language to the user's age level`;

async function generateChatResponse(messages, context = {}) {
  const c = getClient();

  if (!c) {
    return mockChatResponse(messages, context);
  }

  const systemContext = context.skillTitle
    ? `${SYSTEM_PROMPT}\n\nThe student is currently learning about: "${context.skillTitle}". Use this context to make your answer relevant.`
    : SYSTEM_PROMPT;

  const apiMessages = [
    { role: 'system', content: systemContext },
    ...messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content,
    })),
  ];

  try {
    const response = await c.chat.completions.create({
      model: MODEL,
      messages: apiMessages,
      max_tokens: 500,
      temperature: 0.7,
    });

    return {
      content: sanitizeResponse(response.choices[0]?.message?.content || 'Sorry, I could not generate a response.'),
      sources: null,
    };
  } catch (err) {
    console.error('OpenRouter API error:', err.message);
    return mockChatResponse(messages, context);
  }
}

async function generateQuiz(topic, count = 5) {
  const c = getClient();

  const prompt = `Generate ${count} multiple-choice quiz questions about "${topic}" for teenagers.
Each question must have exactly 4 options and one correct answer.
Return ONLY a JSON array (no markdown, no code fences):
[
  {
    "question": "Question text?",
    "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
    "correctAnswer": "A) option1"
  }
]`;

  if (c) {
    try {
      const response = await c.chat.completions.create({
        model: MODEL,
        messages: [
          { role: 'system', content: 'You are a quiz generator for teenagers. Return ONLY valid JSON.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0.8,
      });

      const text = response.choices[0]?.message?.content || '';
      const json = JSON.parse(text.replace(/```json|```/g, '').trim());
      return Array.isArray(json) ? json : [];
    } catch (err) {
      console.error('Quiz generation error:', err.message);
    }
  }

  return generateMockQuiz(topic, count);
}

async function summarizeLesson(title, description) {
  const c = getClient();

  if (c) {
    try {
      const response = await c.chat.completions.create({
        model: MODEL,
        messages: [
          { role: 'system', content: 'Summarize the following lesson for a teenager in 3-5 bullet points. Be clear and engaging.' },
          { role: 'user', content: `Title: ${title}\n\nDescription: ${description}` },
        ],
        max_tokens: 300,
        temperature: 0.5,
      });

      return response.choices[0]?.message?.content || 'Summary not available.';
    } catch (err) {
      console.error('Summarize error:', err.message);
    }
  }

  return mockSummary(title, description);
}

async function generateChatResponseStream(onChunk, messages, context = {}) {
  if (!process.env.OPENROUTER_API_KEY) {
    const { content } = await generateChatResponse(messages, context);
    onChunk(content);
    return content;
  }

  const systemContext = context.skillTitle
    ? `${SYSTEM_PROMPT}\n\nThe student is currently learning about: "${context.skillTitle}". Use this context to make your answer relevant.`
    : SYSTEM_PROMPT;

  const apiMessages = [
    { role: 'system', content: systemContext },
    ...messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content,
    })),
  ];

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'AfterBell',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: apiMessages,
      max_tokens: 500,
      temperature: 0.7,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('OpenRouter stream error:', response.status, errText);
    const { content } = await generateChatResponse(messages, context);
    onChunk(content);
    return content;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') continue;
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content || '';
        if (content) {
          full += content;
          onChunk(content);
        }
      } catch {}
    }
  }

  return full;
}

async function generateChatResponseWithSource(messages, context = {}) {
  return generateChatResponse(messages, context);
}

module.exports = {
  generateChatResponse,
  generateChatResponseStream,
  generateQuiz,
  summarizeLesson,
  isConfigured,
};

function sanitizeResponse(text) {
  const imageErrors = [
    'does not support image input',
    'cannot read image',
    'cannot process image',
    'image input is not supported',
  ];
  if (imageErrors.some(e => text.toLowerCase().includes(e))) {
    return "I can only process text-based questions. Please describe what you'd like help with in words, and I'll be happy to assist!";
  }
  return text;
}

function mockChatResponse(messages, context) {
  const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
  const skill = context.skillTitle || 'this topic';

  if (lastMsg.includes('quiz') || lastMsg.includes('test') || lastMsg.includes('practice')) {
    return {
      content: `Great idea! Here's a quick practice question about ${skill}:\n\n**Q:** What is the most important first step when learning ${skill}?\n\nThink about it, and I'll give you feedback on your answer!`,
      sources: null,
    };
  }

  if (lastMsg.includes('example') || lastMsg.includes('instance') || lastMsg.includes('show me')) {
    return {
      content: `Here's a real-world example for ${skill}:\n\nLet's say you're learning about ${skill}. A great way to practice is to start small — pick one aspect and apply it to your daily life. For instance, if you're learning time management, try the Pomodoro Technique: work for 25 minutes, then take a 5-minute break.\n\nWould you like more examples or a different scenario?`,
      sources: null,
    };
  }

  if (lastMsg.includes('motivat') || lastMsg.includes('encourage') || lastMsg.includes('give up') || lastMsg.includes('hard')) {
    return {
      content: `You've got this! 💪 Learning new skills takes time, and every expert was once a beginner. The fact that you're here, putting in the effort, already shows incredible initiative.\n\nRemember: progress, not perfection. Celebrate small wins along the way. You're building skills that will serve you for life!\n\nWhat part of ${skill} would you like to explore next?`,
      sources: null,
    };
  }

  const responses = [
    `That's a great question about ${skill}! Here's what you should know:\n\n${skill} is all about building practical abilities you can use every day. Start by understanding the core concepts, then practice regularly. Even 10 minutes a day can make a big difference over time.\n\nWhat specific aspect would you like me to dive deeper into?`,
    `Great topic! When it comes to ${skill}, the key is consistent practice. Research shows that spending just 15-20 minutes a day on a new skill leads to significant improvement over a few weeks.\n\nHere are 3 quick tips:\n1. Start with the basics\n2. Practice daily\n3. Reflect on what you learned\n\nWant me to elaborate on any of these?`,
    `I love your curiosity about ${skill}! Here's an interesting perspective: ${skill} isn't just about knowing the theory — it's about applying it in real situations.\n\nTry this: think of one small way you can use ${skill} today. Then reflect on how it went. This reflection is where the real learning happens!\n\nWould you like some specific strategies?`,
  ];

  return {
    content: responses[Math.floor(Math.random() * responses.length)],
    sources: null,
  };
}

function generateMockQuiz(topic, count) {
  const quizzes = [];
  for (let i = 0; i < count; i++) {
    quizzes.push({
      question: `What is a key principle of ${topic}?`,
      options: [
        'A) Understanding the fundamentals',
        'B) Memorizing without practice',
        'C) Avoiding mistakes',
        'D) Learning alone',
      ],
      correctAnswer: 'A) Understanding the fundamentals',
    });
  }
  return quizzes;
}

function mockSummary(title, description) {
  return `Here's a quick summary of "${title}":\n\n` +
    `• ${title} is about building practical life skills that help you navigate real-world situations\n` +
    `• The key concepts include understanding core principles and applying them consistently\n` +
    `• Practice and reflection are essential for mastering these skills\n` +
    `• You can start applying what you learn today in small ways\n\n` +
    `Want me to explain any part of this in more detail?`;
}
