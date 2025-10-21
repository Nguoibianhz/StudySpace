import { getModeById } from '../../../lib/aiModes';
import { estimateTokensFromMessages } from '../../../lib/tokenizer';
import { DAILY_LIMIT, usageStore } from '../../../lib/usageStore';

const API_KEYS = [
  'AIzaSyDoBnX7xaGKecUJFiWtGSr0onDLStY8oRU',
  'AIzaSyDvQESs-E2WFm1yFOYCRiWVrdRJqmWfSdA',
  'AIzaSyCSVdmwRiZ6zcVDuML-WaZRDh7HI0U8_zQ',
  'AIzaSyC5Bc1gJA7f8-g0O2PTkfai0aMNy96nBS0',
  'AIzaSyBrf7DiHhFfZaR-hB8Mgaz3JzSoqu9w3lA',
  'AIzaSyAdyiyOEI8EEt3vblK9PI_h28YRT0pXo8Y',
  'AIzaSyAgrkwZcKiDOA5NS0rrUGrkdUsGrnU2fH8',
  'AIzaSyB78ewOYF38HpoHAcIcYoZN_pD4xx3pI8M',
  'AIzaSyA9c83kon1ZZ2S9jxOeZ3j3rzcscyaiYLI',
  'AIzaSyCEwCetfOBY41Dxaj-e-xgACyw_wljdA10',
  'AIzaSyAyMxYPTGv_dvbcoCOMLwPvjoTV2e_QyM4',
  'AIzaSyDGrPmq9j-p0kGo2EekITVwbgaGjcnW3bM',
  'AIzaSyDu9InjbtHQrFSWVr-9nI5OUeHjW4R-goc',
  'AIzaSyCbhkdOqwtScZgtCqF2q4QEoDQH8i7hvqE',
  'AIzaSyAxBcmAzlQ28wj2EjJ_sUQPHI2d_0HJHg0',
  'AIzaSyCbTWQaNJoFggrvbCyBKbq8Kf10PeBQFI4',
];

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { messages = [], modeId = 'auto', user } = req.body || {};
  const userId = user?.id || user?.email || 'guest';

  if (!usageStore.canUse(userId)) {
    return res.status(429).json({
      message: `Bạn đã dùng hết ${DAILY_LIMIT} lượt miễn phí trong ngày hôm nay.`,
    });
  }

  const estimatedTokens = estimateTokensFromMessages(messages);
  if (estimatedTokens > 20000) {
    return res.status(400).json({ message: 'Giới hạn 20k tokens cho mỗi yêu cầu.' });
  }

  const key = API_KEYS[Math.floor(Math.random() * API_KEYS.length)];
  const mode = getModeById(modeId);
  const hasImage = messages.some((message) =>
    message.parts?.some((part) => part.inline_data && part.inline_data.mime_type?.startsWith('image/'))
  );

  const endpoint = hasImage
    ? 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse'
    : 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse';

  const payload = {
    systemInstruction: {
      role: 'system',
      parts: [{ text: mode.systemPrompt }],
    },
    contents: messages,
    generationConfig: {
      temperature: 0.8,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  };

  usageStore.increment(userId);

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  try {
    const response = await fetch(`${endpoint}&key=${key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok || !response.body) {
      const errorText = await response.text();
      throw new Error(errorText || 'Gemini API trả về lỗi.');
    }

    for await (const chunk of response.body) {
      res.write(chunk);
    }

    res.write('event: done\n');
    res.write('data: {"done":true}\n\n');
  } catch (error) {
    const message = error.message || 'Gemini stream bị lỗi.';
    res.write('event: error\n');
    res.write(`data: ${JSON.stringify({ message })}\n\n`);
  } finally {
    res.end();
  }
}
