const apiKey = "AIzaSyBwltHavql4IeU8Ls-4-FKyq7EwA6Da3dg"; // твой ключ

const generateGeminiResponse = async (prompt, images = []) => {
  console.log("Sending prompt to Gemini:", prompt);

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

  const parts = [];

  // текст
  if (prompt && prompt.trim()) {
    parts.push({ text: prompt });
  }

  // фото
  if (images && images.length) {
    images.forEach(img => {
      if (img.base64 && img.mime) {
        parts.push({
          inline_data: {
            mime_type: img.mime,
            data: img.base64
          }
        });
      }
    });
  }

  const body = { contents: [{ parts }] };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(body),
    });

    console.log("Response status:", res.status);

    if (!res.ok) {
      const error = await res.json();
      console.error("Error from API:", error);
      return error?.error?.message
        ? `Error: ${error.error.message}`
        : "An error occurred.";
    }

    const data = await res.json();
    console.log("Full API response:", data);

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No valid response from AI.";
    console.log("Extracted AI text:", text);

    return text;
  } catch (err) {
    console.error("Fetch error:", err);
    return `Network or fetch error: ${err.message}`;
  }
};

export default generateGeminiResponse;