
import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { combineImages } from './services/geminiService';
import { AppState } from './types';
import { PersonIcon, ClothingIcon, SparklesIcon } from './components/IconComponents';

const App: React.FC = () => {
  const [personImage, setPersonImage] = useState<string | null>(null);
  const [clothingImage, setClothingImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [error, setError] = useState<string | null>(null);

  const handlePersonUpload = (dataUrl: string) => {
    setPersonImage(dataUrl);
    setResultImage(null);
    setError(null);
  };

  const handleClothingUpload = (dataUrl: string) => {
    setClothingImage(dataUrl);
    setResultImage(null);
    setError(null);
  };

  const handleCombineClick = useCallback(async () => {
    if (!personImage || !clothingImage) {
      setError("Please upload both an image of a person and an image of clothing.");
      return;
    }
    
    setAppState(AppState.LOADING);
    setResultImage(null);
    setError(null);

    try {
      const generatedImage = await combineImages(personImage, clothingImage);
      if (generatedImage) {
        setResultImage(`data:image/png;base64,${generatedImage}`);
        setAppState(AppState.SUCCESS);
      } else {
        throw new Error("The model did not return an image. Please try again with different images.");
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to combine images: ${errorMessage}`);
      setAppState(AppState.ERROR);
    }
  }, [personImage, clothingImage]);
  
  const handleReset = () => {
    setPersonImage(null);
    setClothingImage(null);
    setResultImage(null);
    setError(null);
    setAppState(AppState.IDLE);
  }

  const canCombine = personImage && clothingImage && appState !== AppState.LOADING;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans text-slate-800 dark:text-slate-200">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 sm:p-10">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            AI Virtual Try-On
          </h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
            Upload a photo of a person and an item of clothing to see the magic happen!
          </p>
        </header>

        <main>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <ImageUploader 
              id="person-uploader" 
              label="Upload Person" 
              onImageUpload={handlePersonUpload} 
              previewUrl={personImage}
              icon={<PersonIcon />}
            />
            <ImageUploader 
              id="clothing-uploader" 
              label="Upload Clothing" 
              onImageUpload={handleClothingUpload}
              previewUrl={clothingImage}
              icon={<ClothingIcon />}
            />
          </div>

          <div className="flex flex-col items-center justify-center space-y-4 mb-8">
            <button
              onClick={handleCombineClick}
              disabled={!canCombine}
              className="flex items-center justify-center gap-2 w-full max-w-sm px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 disabled:bg-slate-400 disabled:dark:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              <SparklesIcon />
              {appState === AppState.LOADING ? 'Generating...' : 'Combine Images'}
            </button>
            {(resultImage || appState === AppState.LOADING || error) && (
              <button 
                onClick={handleReset}
                className="text-sm text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Start Over
              </button>
            )}
          </div>
          
          <ResultDisplay 
            state={appState}
            resultImage={resultImage}
            error={error}
          />
        </main>
      </div>
       <footer className="text-center mt-8 text-slate-500 dark:text-slate-400 text-sm">
        <p>Powered by Google Gemini. Images are not stored.</p>
      </footer>
    </div>
  );
};

export default App;
