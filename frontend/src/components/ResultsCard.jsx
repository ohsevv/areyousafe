export default function ResultsCard({ results }) {
    if (!results) return null;

    const { security_score, headers, ports, ssl, target } = results;

    // Logic for dynamic styling based on score
    const getScoreColor = (score) => {
        if (['A+', 'A'].includes(score)) return 'text-neon-green border-neon-green/50 shadow-[0_0_30px_rgba(10,255,104,0.3)]';
        if (['B', 'C'].includes(score)) return 'text-yellow-400 border-yellow-400/50 shadow-[0_0_30px_rgba(250,204,21,0.3)]';
        return 'text-red-500 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]';
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-min animate-fade-in-up">

            {/* 1. Main Score Card (Large Square) */}
            <div className="md:col-span-2 md:row-span-2 glass-panel rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <h3 className="text-glass-300 uppercase tracking-[0.2em] text-sm mb-6 z-10">Overall Security Score</h3>
                <div className={`w-40 h-40 flex items-center justify-center rounded-full border-4 text-8xl font-black bg-black/20 backdrop-blur-md z-10 transition-all duration-500 hover:scale-110 ${getScoreColor(security_score)}`}>
                    <span className="mt-2 leading-none">{security_score}</span>
                </div>
                <p className="mt-6 text-xl font-light text-white/80 z-10 tracking-wide">{target}</p>
            </div>

            {/* 2. SSL/TLS Status (Wide Rectangle) */}
            <div className="md:col-span-2 glass-panel rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c1.4 0 2.8 1.1 2.8 2.5V11h-6V9.5C8.8 8.1 10.2 7 12 7zm0 13c-3 .7-6.2-1.7-7-2.9V11h14v6.1c-1 1.2-4.1 3.6-7 2.9z" /></svg>
                </div>
                <h3 className="text-glass-300 uppercase tracking-widest text-xs mb-4">SSL Configuration</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="block text-xs text-white/40 mb-1">Status</span>
                        <span className={`text-lg font-medium ${ssl.valid ? 'text-neon-green' : 'text-red-500'}`}>
                            {ssl.valid ? 'Secure' : 'Insecure'}
                        </span>
                    </div>
                    <div>
                        <span className="block text-xs text-white/40 mb-1">Days Remaining</span>
                        <span className="text-lg font-mono text-white/90">{ssl.days_until_expiry || 'N/A'}</span>
                    </div>
                    <div className="col-span-2">
                        <span className="block text-xs text-white/40 mb-1">Issuer</span>
                        <span className="text-sm text-white/70 font-mono truncate block">
                            {ssl.issuer?.organizationName || 'Unknown'}
                        </span>
                    </div>
                </div>
            </div>

            {/* 3. Open Ports (Vertical List) */}
            <div className="md:row-span-2 glass-panel rounded-3xl p-6">
                <h3 className="text-glass-300 uppercase tracking-widest text-xs mb-4">Open Ports</h3>
                <div className="flex flex-wrap gap-3">
                    {ports.length > 0 ? ports.map(port => (
                        <div key={port} className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg font-mono text-sm text-neon-blue hover:bg-neon-blue/20 transition-colors cursor-default">
                            :{port}
                        </div>
                    )) : (
                        <p className="text-sm text-white/30 italic">No common ports found</p>
                    )}
                </div>
            </div>

            {/* 4. Security Headers (List) */}
            <div className="md:col-span-1 md:row-span-2 glass-panel rounded-3xl p-6">
                <h3 className="text-glass-300 uppercase tracking-widest text-xs mb-4">Headers</h3>
                <div className="space-y-3">
                    {Object.entries(headers).map(([header, status]) => (
                        <div key={header} className="group flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded -mx-2 transition-colors">
                            <span className="text-white/60 truncate mr-2" title={header}>
                                {header.replace('Content-Security-Policy', 'CSP').replace('Strict-Transport-Security', 'HSTS')}
                            </span>
                            <div className={`w-2 h-2 rounded-full shadow-[0_0_5px] ${status === 'Present'
                                ? 'bg-neon-green shadow-neon-green/50'
                                : 'bg-red-500 shadow-red-500/50'
                                }`}></div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
