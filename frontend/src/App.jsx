import { useState } from 'react';
import SearchBar from './components/SearchBar';
import ResultsCard from './components/ResultsCard';
import { getToken } from 'firebase/app-check';
import { appCheck } from './firebase';

function App() {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleScan = async (url) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      // In production, pointing to the same origin is safer if served together,
      // but for local dev we might need the full URL or proxy.
      // Using relative path assumes the API is served from the same domain (e.g. via Firebase proxy or in prod)
      // or we can use the full URL if we know it.
      // For this hybrid setup, let's try the relative path first, falling back to localhost for dev if needed

      const apiUrl = import.meta.env.PROD
        ? 'https://areyousafe-engine-1001681063314.us-central1.run.app/scan'
        : 'http://localhost:8080/scan';

      let token;
      if (appCheck) {
        try {
          // Get App Check token (forceRefresh = false)
          const result = await getToken(appCheck, false);
          token = result.token;
        } catch (err) {
          console.error("Failed to get App Check token:", err);
          // We'll proceed without token, but backend might reject it
        }
      }

      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['X-Firebase-AppCheck'] = token;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Scan failed. Please check the URL and try again.');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen text-white font-sans selection:bg-neon-blue selection:text-black">
      {/* Mesh Gradient Background */}
      <div className="mesh-bg">
        <div className="mesh-blob blob-1"></div>
        <div className="mesh-blob blob-2"></div>
        <div className="mesh-blob blob-3"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-16 animate-float">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-gray-200 drop-shadow-lg pb-4">
            areyousafe<span className="text-neon-blue">.</span>
          </h1>
          <p className="text-xl md:text-2xl text-glass-300 font-light tracking-wide max-w-2xl mx-auto">
            Next-Gen Serverless Reconnaissance
          </p>
        </div>

        {/* Search */}
        <div className="w-full max-w-3xl mb-12">
          <SearchBar onScan={handleScan} isLoading={isLoading} />
        </div>

        {/* Error */}
        {error && (
          <div className="w-full max-w-2xl mb-12 p-4 glass-panel border-red-500/30 text-red-200 text-center rounded-2xl animate-pulse">
            {error}
          </div>
        )}

        {/* Results */}
        <div className="w-full">
          <ResultsCard results={results} />
        </div>
      </div>
    </div>
  );
}

export default App;
