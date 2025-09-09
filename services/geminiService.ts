// This service now calls our OWN backend proxy, not Google's API directly.
// This is much more secure as the API key is never exposed to the browser.

export const combineImages = async (personImageBase64: string, clothingImageBase64: string): Promise<string | null> => {
  try {
    // 1. Make a POST request to our serverless function endpoint.
    const response = await fetch('/api/combine', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personImageBase64,
        clothingImageBase64,
      }),
    });

    // 2. Handle non-successful responses from our endpoint.
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    // 3. Parse the successful JSON response and return the image data.
    const data = await response.json();
    return data.generatedImage || null;

  } catch (error) {
    console.error("Error calling backend service:", error);
    // Re-throw the error so the UI component can catch it and display a message.
    if (error instanceof Error) {
      throw new Error(`Failed to process images: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the server.");
  }
};
