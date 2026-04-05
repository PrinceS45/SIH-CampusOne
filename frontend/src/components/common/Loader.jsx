import React from 'react';

/**
 * Premium Loader Component
 * @param {boolean} fullPage - If true, displays a full-screen blurred overlay splash screen
 * @param {string} message - Optional loading message to display
 */
const Loader = ({ fullPage = false, message = "Loading CampusOne..." }) => {
  const loaderContent = (
    <div className="flex flex-col items-center justify-center animate-in fade-in duration-500">
      <div className="relative h-20 w-20">
        {/* Outer glowing orbital */}
        <div className="absolute inset-0 rounded-full border-4 border-blue-500/10 animate-pulse"></div>
        {/* Middle spinning ring */}
        <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-r-transparent border-b-indigo-500 border-l-transparent animate-spin duration-700"></div>
        {/* Inner reverse spinning ring */}
        <div className="absolute inset-4 rounded-full border-4 border-t-transparent border-r-indigo-400 border-b-transparent border-l-blue-300 animate-spin-reverse duration-500"></div>
        {/* Focal point pulse */}
        <div className="absolute inset-8 bg-blue-600 rounded-full shadow-lg shadow-blue-400/50 animate-pulse"></div>
      </div>
      
      {message && (
        <div className="mt-6 flex flex-col items-center">
          <p className="text-sm font-bold text-gray-900 tracking-widest uppercase opacity-80 animate-pulse font-outfit">
            {message}
          </p>
          <div className="mt-2 flex space-x-1">
            <div className="h-1 w-1 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-1 w-1 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-1 w-1 bg-blue-600 rounded-full animate-bounce"></div>
          </div>
        </div>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-md transition-all duration-500">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
        {loaderContent}
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-12">
      {loaderContent}
    </div>
  );
};

export default Loader;
