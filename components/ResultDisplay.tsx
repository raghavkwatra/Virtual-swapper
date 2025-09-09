import React from 'react';
import { AppState } from '../types';
import { Spinner } from './Spinner';
import { DownloadIcon } from './IconComponents';

interface ResultDisplayProps {
  state: AppState;
  resultImage: string | null;
  error: string | null;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ state, resultImage, error }) => {
  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = 'ai-try-on-result.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderContent = () => {
    switch (state) {
      case AppState.LOADING:
        return (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <Spinner />
            <p className="text-lg font-semibold mt-4 text-slate-600 dark:text-slate-300">Working our AI magic...</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">This can take a moment, please wait.</p>
          </div>
        );
      case AppState.SUCCESS:
        if (resultImage) {
          return (
            <div className="flex flex-col items-center gap-4">
                <h2 className="text-2xl font-bold text-center mb-4 text-slate-800 dark:text-slate-200">Here's your new look!</h2>
                <img src={resultImage} alt="Generated result" className="rounded-xl shadow-lg max-w-full lg:max-w-md mx-auto" />
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2 mt-2 px-6 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 transition-all duration-300"
                >
                  <DownloadIcon />
                  Download Image
                </button>
            </div>
          );
        }
        return null;
      case AppState.ERROR:
        return (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-center" role="alert">
            <strong className="font-bold">Oh no! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        );
      case AppState.IDLE:
      default:
        return null;
    }
  };

  if(state === AppState.IDLE) return null;

  return (
    <div className="w-full min-h-[200px] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl mt-8">
        {renderContent()}
    </div>
  );
};