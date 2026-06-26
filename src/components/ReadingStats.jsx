import React, { useMemo } from 'react';
import { Sparkles, TrendingUp, Share2 } from 'lucide-react';

/*
  ReadingStats — reading dashboard (redesign step 5)
  Computes everything from scanHistory (already loaded in App.jsx); no new query.

  Props:
    scanHistory : array of { books: [...], created_at }  (your existing state)
    t           : (key, opts?) => string  — i18n.t, bound by the parent
    onShare     : (text) => void          — optional; wire to Capacitor Share
*/

const HIST_BUCKETS = [5, 4.5, 4, 3.5, 3];

export default function ReadingStats({ scanHistory = [], t = (k) => k, onShare }) {
    const stats = useMemo(() => {
        const allBooks = scanHistory.flatMap((s) => s.books || []);
        const rated = allBooks.filter((b) => b.rating > 0);
        const avg = rated.length ? rated.reduce((s, b) => s + b.rating, 0) / rated.length : 0;

        const hist = HIST_BUCKETS.map((b) => ({ label: b, count: 0 }));
        rated.forEach((b) => {
            const step = Math.round(b.rating * 2) / 2;
            const idx = HIST_BUCKETS.findIndex((x) => step >= x);
            if (idx !== -1) hist[idx].count += 1;
            else hist[hist.length - 1].count += 1; // anything below 3.0 → bottom bucket
        });
        const histMax = Math.max(1, ...hist.map((h) => h.count));

        const authorCounts = {};
        allBooks.forEach((b) => {
            const a = (b.author || '').trim();
            if (a) authorCounts[a] = (authorCounts[a] || 0) + 1;
        });
        const topAuthors = Object.entries(authorCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([name, count]) => ({ name, count }));

        return {
            totalScanned: allBooks.length,
            totalScans: scanHistory.length,
            avg,
            highCount: allBooks.filter((b) => b.rating >= 4.5).length,
            onListCount: allBooks.filter((b) => b.inReadingList).length,
            hist,
            histMax,
            topAuthors,
        };
    }, [scanHistory]);

    if (!stats.totalScanned) return null;

    const shareText =
        `${t('stats.shareLead') || "I've scanned"} ${stats.totalScanned} ${t('stats.booksLower') || 'books'} ` +
        `${t('stats.shareWith') || 'with ShelfScan'} — ${stats.avg.toFixed(2)}★ ${t('stats.avgLower') || 'avg'}. ` +
        `${stats.topAuthors[0] ? stats.topAuthors[0].name + ' ' + (t('stats.topsShelf') || 'tops my shelf') + '. ' : ''}` +
        `shelfscan.xyz`;

    return (
        <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
                <Sparkles size={15} className="text-foil-600" />
                <span className="font-mono text-[11px] uppercase tracking-wider text-foil-600">
          {t('stats.title') || 'Your shelf in numbers'}
        </span>
            </div>
            <h3 className="font-display font-semibold text-2xl leading-tight text-stone-900 dark:text-dark-text mb-4">
                {(t('stats.intro') || "You've scanned {{n}} books across {{s}} scans.")
                    .replace('{{n}}', stats.totalScanned)
                    .replace('{{s}}', stats.totalScans)}
            </h3>

            <div className="grid grid-cols-2 gap-3">
                <Stat n={stats.totalScanned} label={t('stats.booksScanned') || 'Books scanned'} color="text-ink-700 dark:text-ink-300" />
                <Stat n={stats.totalScans} label={t('stats.scans') || 'Scans'} />
                <Stat n={stats.avg ? stats.avg.toFixed(2) : '—'} label={t('stats.avgRating') || 'Avg rating found'} color="text-foil-600" />
                <Stat n={stats.highCount} label={t('stats.high') || '4.5★ & up'} color="text-ribbon-600 dark:text-ribbon-300" />

                {/* Rating histogram */}
                <div className="col-span-2 bg-surface dark:bg-dark-card border border-line dark:border-dark-border rounded-2xl p-4">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-stone-500 dark:text-dark-muted mb-3">
                        {t('stats.ratingsDist') || 'Ratings of books you scanned'}
                    </p>
                    {stats.hist.map((h) => (
                        <div key={h.label} className="flex items-center gap-2.5 mb-2 last:mb-0">
                            <span className="font-mono text-[10.5px] text-stone-500 dark:text-dark-muted w-8">{h.label.toFixed(1)}★</span>
                            <span
                                className="h-2.5 rounded-full bg-ink-600 dark:bg-ink-400"
                                style={{ width: `${Math.max(4, (h.count / stats.histMax) * 100)}%`, opacity: 0.55 + (h.label - 3) * 0.22 }}
                            />
                            <span className="font-mono text-[10px] text-stone-400 dark:text-dark-muted">{h.count}</span>
                        </div>
                    ))}
                </div>

                {/* Top authors */}
                {stats.topAuthors.length > 0 && (
                    <div className="col-span-2 bg-surface dark:bg-dark-card border border-line dark:border-dark-border rounded-2xl p-4">
                        <p className="font-mono text-[10px] uppercase tracking-wider text-stone-500 dark:text-dark-muted mb-2.5">
                            {t('stats.topAuthors') || 'Most-scanned authors'}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {stats.topAuthors.map((a, i) => (
                                <span
                                    key={a.name}
                                    className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold bg-ink-50 dark:bg-ink-900/40
                             text-ink-700 dark:text-ink-300 px-2.5 py-1 rounded-full"
                                >
                  {i === 0 && <TrendingUp size={13} />}
                                    {a.name} · {a.count}
                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Share */}
                {onShare && (
                    <button
                        onClick={() => onShare(shareText)}
                        className="col-span-2 flex items-center justify-between bg-ink-700 hover:bg-ink-800 rounded-2xl p-4
                       transition-colors active:scale-[0.99]"
                    >
            <span className="text-left">
              <span className="block font-display font-semibold text-base text-white">
                {t('stats.shareTitle') || 'Share your reading year'}
              </span>
              <span className="block font-mono text-[10.5px] text-white/70 mt-0.5">
                {t('stats.shareSub') || 'A clean summary for your feed'}
              </span>
            </span>
                        <Share2 size={20} className="text-white flex-none" />
                    </button>
                )}
            </div>
        </div>
    );
}

function Stat({ n, label, color = 'text-stone-900 dark:text-dark-text' }) {
    return (
        <div className="bg-surface dark:bg-dark-card border border-line dark:border-dark-border rounded-2xl p-4">
            <div className={`font-display font-bold text-3xl leading-none ${color}`}>{n}</div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 dark:text-dark-muted mt-2">{label}</div>
        </div>
    );
}