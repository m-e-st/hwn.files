// netlify/functions/send-telegram.js
// 18.02.2026 - netlify function to avoid CORS errors
// author: https://chat.mistral.ai/chat/afa0ab8f-26d0-410f-a565-a920095aee0d
// Use the Built-in fetch for node.js v18++

export const handler = async (event) => {
  const { token, chatId, message } = JSON.parse(event.body);
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });
    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
