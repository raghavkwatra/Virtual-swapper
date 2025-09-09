// This file is a serverless function that acts as a secure proxy.
// It's designed to run on platforms like Vercel.

const { GoogleGenAI, Modality } = require("@google/genai");

// Helper functions to process base64 strings
const base64ToMimeType = (base64) => {
  const mime = base64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
  return (mime && mime.length) ? mime[1] : 'image/png';
}
const cleanBase64 = (base64) => base64.split(',')[1];

// This is the main handler for the Vercel serverless function.
// It uses the (req, res) signature, similar to Express.js.
module.exports = async (req, res) => {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 2. Securely get the API key from server-side environment variables
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
      console.error("API_KEY environment variable is not set.");
      return res.status(500).json({ error: 'API_KEY environment variable is not set on the server.' });
    }
    
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    // 3. Get image data from the request body (Vercel automatically parses JSON)
    const { personImageBase64, clothingImageBase64 } = req.body;

    if (!personImageBase64 || !clothingImageBase64) {
      return res.status(400).json({ error: 'Missing image data in request.' });
    }
    
    // 4. Prepare the request for the Gemini API
    const model = 'gemini-2.5-flash-image-preview';
    const personImagePart = {
      inlineData: {
        data: cleanBase64(personImageBase64),
        mimeType: base64ToMimeType(personImageBase64),
      },
    };
    const clothingImagePart = {
      inlineData: {
        data: cleanBase64(clothingImageBase64),
        mimeType: base64ToMimeType(clothingImageBase64),
      },
    };
    const textPart = {
      text: "Generate an image of the person from the first image wearing the clothes from the second image. The person's face, pose, and the background should remain the same as the first image."
    };

    // 5. Call the Gemini API and handle the response
    const result = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [personImagePart, clothingImagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    if (result.candidates && result.candidates[0].content.parts) {
      for (const part of result.candidates[0].content.parts) {
        if (part.inlineData) {
          // Send the successful result back to the frontend
          return res.status(200).json({ generatedImage: part.inlineData.data });
        }
      }
    }
    
    // If no image part was found
    console.error("Model did not return an image part.");
    return res.status(500).json({ error: 'The model did not return an image.' });

  } catch (error) {
    console.error("Error in serverless function:", error);
    return res.status(500).json({ error: 'The request to the AI model failed.' });
  }
};