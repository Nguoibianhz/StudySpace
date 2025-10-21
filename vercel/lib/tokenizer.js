export function estimateTokensFromMessages(messages = []) {
  if (!Array.isArray(messages)) return 0;
  const text = messages
    .map((message) => {
      if (typeof message === 'string') return message;
      if (message?.content) {
        return Array.isArray(message.content)
          ? message.content.map((c) => c.text || '').join(' ')
          : message.content;
      }
      if (message?.parts) {
        return message.parts
          .map((part) => {
            if (typeof part === 'string') return part;
            if (part.text) return part.text;
            return '';
          })
          .join(' ');
      }
      return '';
    })
    .join(' ');
  return Math.ceil(text.length / 4);
}
