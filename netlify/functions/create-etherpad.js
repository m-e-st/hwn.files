// netlify/functions/create-etherpad.js
// 11.10.2026 - netlify function to avoid CORS errors
// Use the Built-in fetch for node.js v18++

export const handler = async (event) => {
  const { token, padname } = JSON.parse(event.body);
  const url = `https://pad.hwn.de/api/1.2.15/createPad --data-urlencode "${token}" --data-urlencode "padID=verify-${padname}`;

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
