// This file is a serverless function that acts as a secure proxy.
// It's designed to run on platforms like Vercel or Netlify.

const { GoogleGenAI, Modality } = require("@google/genai");

// This is the main handler for the serverless function.
export default async function handler(request, response) {
  // 1. Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. Securely get the API key from server-side environment variables
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
    return response.status(500).json({ error: 'API_KEY environment variable is not set on the server.' });
  }
  
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // 3. Get image data from the request body
  const { personImageBase64, clothingImageBase64 } = request.body;
  if (!personImageBase64 || !clothingImageBase64) {
    return response.status(400).json({ error: 'Missing image data in request.' });
  }

  // Helper functions to process base64 strings
  const base64ToMimeType = (base64) => {
    const mime = base64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
    return (mime && mime.length) ? mime[1] : 'image/png';
  }
  const cleanBase64 = (base64) => base64.split(',')[1];
  
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
    text: "You are an AI stylist. Your task is to take the person from the first image and dress them in the clothing from the second image. Generate a new, realistic image showing the person wearing the specified clothing. Preserve the person's original pose and facial expression as much as possible. The background should be simple or match the original person's image."
  };

  // 5. Call the Gemini API and handle the response
  try {
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
          return response.status(200).json({ generatedImage: part.inlineData.data });
        }
      }
    }
    
    // If no image part was found
    return response.status(500).json({ error: 'The model did not return an image.' });

  } catch (error) {
    console.error("Error calling Gemini API from serverless function:", error);
    return response.status(500).json({ error: 'The request to the AI model failed.' });
  }
}
