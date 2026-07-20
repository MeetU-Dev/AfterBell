const ChatMessage = require('../models/ChatMessage');
const { generateChatResponse, generateChatResponseStream, generateQuiz, summarizeLesson, isConfigured } = require('../utils/ai');

const IMAGE_ERROR_PATTERNS = [
  'does not support image input',
  'cannot read image',
  'cannot process image',
  'image input is not supported',
];

function isImageError(text) {
  return IMAGE_ERROR_PATTERNS.some(p => text.toLowerCase().includes(p));
}

function sanitizeResponse(text) {
  if (isImageError(text)) {
    return "I can only process text-based questions. Please describe what you'd like help with in words, and I'll be happy to assist!";
  }
  return text;
}

exports.chat = async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    await ChatMessage.create({
      userId: req.user.id,
      role: 'user',
      content: message.trim(),
      context: context || {},
    });

    const recentMessages = await ChatMessage.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const messages = recentMessages
      .reverse()
      .map(m => ({ role: m.role, content: m.content }));

    const result = await generateChatResponse(messages, context || {});

    await ChatMessage.create({
      userId: req.user.id,
      role: 'assistant',
      content: result.content,
      context: context || {},
    });

    res.status(200).json({
      success: true,
      message: result.content,
      sources: result.sources,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.chatStream = async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    await ChatMessage.create({
      userId: req.user.id,
      role: 'user',
      content: message.trim(),
      context: context || {},
    });

    const recentMessages = await ChatMessage.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const messages = recentMessages
      .reverse()
      .map(m => ({ role: m.role, content: m.content }));

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    let fullContent = '';
    await generateChatResponseStream(
      (chunk) => {
        fullContent += chunk;
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      },
      messages,
      context || {}
    );

    await ChatMessage.create({
      userId: req.user.id,
      role: 'assistant',
      content: sanitizeResponse(fullContent),
      context: context || {},
    });

    if (isImageError(fullContent)) {
      res.write(`data: ${JSON.stringify({ clear: true, content: sanitizeResponse(fullContent) })}\n\n`);
    } else {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    }
    res.end();
  } catch (err) {
    console.error('chatStream error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: err.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
};

exports.getHistory = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const skillId = req.query.skillId;

    const filter = { userId: req.user.id };
    if (skillId) filter['context.skillId'] = skillId;

    const messages = await ChatMessage.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      count: messages.length,
      messages: messages.reverse(),
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.clearHistory = async (req, res) => {
  try {
    await ChatMessage.deleteMany({ userId: req.user.id });
    res.status(200).json({ success: true, message: 'Chat history cleared' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.quiz = async (req, res) => {
  try {
    const { topic, count } = req.body;
    if (!topic?.trim()) {
      return res.status(400).json({ success: false, message: 'Topic is required' });
    }

    const questions = await generateQuiz(topic.trim(), Math.min(count || 5, 10));

    res.status(200).json({
      success: true,
      topic: topic.trim(),
      questions,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.summarize = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    const summary = sanitizeResponse(await summarizeLesson(title.trim(), description.trim()));

    res.status(200).json({
      success: true,
      summary,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.status = async (req, res) => {
  const configs = {
    openai: isConfigured(),
  };

  const usingMock = !Object.values(configs).some(v => v);

  res.status(200).json({
    success: true,
    configs,
    usingMock,
    message: usingMock
      ? 'AI is running in mock mode. Set OPENROUTER_API_KEY in config.env for AI-powered responses.'
      : 'AI is configured and ready.',
  });
};