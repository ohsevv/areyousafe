import { useState } from 'react';

export default function SearchBar({ onScan, isLoading }) {
    const [url, setUrl] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (url) onScan(url);
    };

    return (
        <form onSubmit={handleSubmit} className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt blur"></div>
            <div className="relative flex items-stretch bg-black rounded-full overflow-hidden">
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter target URL (e.g. google.com)"
                    className="w-full px-8 py-4 text-xl bg-black/50 text-white placeholder-gray-500 focus:outline-none focus:ring-0 font-light tracking-wider"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-10 bg-white text-black font-bold hover:bg-neon-blue hover:text-white transition-all duration-300 disabled:opacity-50 disabled:hover:bg-white disabled:cursor-not-allowed uppercase tracking-widest text-sm flex items-center justify-center"
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></span>
                            Scanning
                        </span>
                    ) : (
                        'Scan'
                    )}
                </button>
            </div>
        </form>
    );
}
