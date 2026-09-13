const MODEL = 'inclusionai/ling-3.0-flash-fin:free';

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
  if (!process.env.OPENROUTER_API_KEY) {
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
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Chat OpenRouter error:', response.status, errText);
      return mockChatResponse(messages, context);
    }

    const data = await response.json();
    return {
      content: sanitizeResponse(data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.'),
      sources: null,
    };
  } catch (err) {
    console.error('Chat OpenRouter error:', err.message);
    return mockChatResponse(messages, context);
  }
}

async function generateQuiz(topic, count = 10, details = '') {
  if (!process.env.OPENROUTER_API_KEY) {
    console.log('[quiz] No OPENROUTER_API_KEY, using mock');
    return generateMockQuiz(topic, count);
  }

  const contextBlock = details ? `\n\nHere is the lesson content the student just studied:\n${details}\n\nBase the questions on this specific content.` : '';
  const prompt = `Generate exactly ${count} multiple-choice quiz questions about "${topic}" for teenagers.${contextBlock}
Each question MUST have exactly 4 options and one correct answer.
Return ONLY a JSON array — no explanation, no markdown, no code fences.
Example format:
[{"question":"Q1?","options":["A) opt1","B) opt2","C) opt3","D) opt4"],"correctAnswer":"A) opt1"}]`;

  try {
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
        messages: [
          { role: 'system', content: 'Return ONLY valid JSON arrays. No text before or after.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[quiz] OpenRouter HTTP error:', response.status, errText);
      return generateMockQuiz(topic, count);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || '';
    console.log('[quiz] Raw AI response (first 300):', raw.substring(0, 300));

    // Extract JSON from markdown fences or plain text
    let cleaned = raw.trim();
    // Strip markdown code fences: ```json ... ``` or ``` ... ```
    cleaned = cleaned.replace(/```[\s\S]*?\n([\s\S]*?)\n\s*```/g, '$1');
    // Try to find a JSON array in the response
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      cleaned = arrayMatch[0];
    }

    const json = JSON.parse(cleaned);
    if (Array.isArray(json) && json.length > 0) {
      console.log('[quiz] Parsed', json.length, 'questions');
      return json;
    }
    console.error('[quiz] Response was not a valid array:', cleaned.substring(0, 200));
    return generateMockQuiz(topic, count);
  } catch (err) {
    console.error('[quiz] Parse error:', err.message);
    return generateMockQuiz(topic, count);
  }
}

async function summarizeLesson(title, description) {
  if (!process.env.OPENROUTER_API_KEY) {
    console.log('[summarize] No OPENROUTER_API_KEY, using mock');
    return mockSummary(title, description);
  }

  try {
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
        messages: [
          { role: 'system', content: 'You are a helpful tutor. Summarize the lesson in 3-5 clear bullet points for a teenager.' },
          { role: 'user', content: `Summarize this lesson:\nTitle: ${title}\n\nDescription: ${description}` },
        ],
        max_tokens: 500,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[summarize] OpenRouter HTTP error:', response.status, errText);
      return mockSummary(title, description);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    console.log('[summarize] Raw AI response (first 200):', content.substring(0, 200));

    if (!content || content.trim().length === 0) {
      console.error('[summarize] Empty response from AI');
      return mockSummary(title, description);
    }

    return content;
  } catch (err) {
    console.error('[summarize] Error:', err.message);
    return mockSummary(title, description);
  }
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
    'cannot read',
    'cannot process image',
    'image input is not supported',
    'image inputs are not supported',
    'this model only supports text',
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
