import React, { useState, useMemo } from 'react';
import { Star, Bookmark, ChevronRight, ArrowUpDown } from 'lucide-react';

/*
  ScanResults — cover-forward results with sort/filter (redesign steps 2–3)
  Presentational + local sort/filter state. All book taps route back through
  onSelectBook(book), wired by the parent to its haptic + openLinkModal flow.

  Props:
    books        : full results array (pass the UNFILTERED `books`, not displayBooks)
    onSelectBook : (book) => void
    t            : (key, opts?) => string   — i18n.t, bound by the parent
    headerRight  : ReactNode                — Edit + Export controls
*/

const CLOTHS = ['#27374D', '#6E2F2F', '#26453A', '#43314E', '#1F4A4E', '#7A3B22', '#39455A', '#432A3E'];

function clothFor(str = '') {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return CLOTHS[h % CLOTHS.length];
}

function fmtCount(n) {
    if (!n) return null;
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return Math.round(n / 1000) + 'k';
    return '' + n;
}

const RIBBON_CLIP = 'polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%)';

function Cover({ book, className = '', textClass = 'text-[11px]' }) {
    if (book.thumbnail) {
        return (
            <img
                src={book.thumbnail}
                alt={book.title}
                loading="lazy"
                className={`object-cover bg-line dark:bg-dark-border ${className}`}
            />
        );
    }
    return (
        <div
            className={`flex flex-col justify-between p-2 pl-3 ${className}`}
            style={{ background: clothFor(book.title) }}
        >
            <span className="block w-4 h-[2px] rounded bg-[#D0B26C]/80" />
            <span className={`font-display font-semibold leading-tight text-[#EFE6CE] line-clamp-4 ${textClass}`}>
        {book.title}
      </span>
            <span className="font-sans text-[9px] text-[#EFE6CE]/75 line-clamp-1">{book.author}</span>
        </div>
    );
}

function RatingSeal({ rating, size = 'sm' }) {
    if (!rating || rating <= 0) return null;
    const pad = size === 'lg' ? 'px-3 py-1.5 text-base gap-1.5' : 'px-2 py-0.5 text-[11px] gap-1';
    const star = size === 'lg' ? 15 : 10;
    return (
        <span className={`inline-flex items-center font-mono font-bold text-white bg-foil-600 rounded-full shadow ${pad}`}>
      <Star size={star} className="fill-white text-white" />
            {rating.toFixed(1)}
    </span>
    );
}

const CHIP_BASE =
    'flex-none font-semibold text-[12.5px] px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap';
const CHIP_OFF =
    'bg-surface dark:bg-dark-card text-stone-500 dark:text-dark-muted border-line dark:border-dark-border';

export default function ScanResults({ books = [], onSelectBook, t = (k) => k, headerRight = null, loading = false }) {
    const [sortKey, setSortKey] = useState('rating');
    const [filterKey, setFilterKey] = useState('all');

    const hasMatches = useMemo(() => books.some((b) => b.inReadingList), [books]);

    const sorts = [
        { key: 'rating', label: t('results.sortRating') || 'Rating' },
        { key: 'reviews', label: t('results.sortReviews') || 'Most reviewed' },
        { key: 'title', label: t('results.sortTitle') || 'Title A–Z' },
    ];

    const list = useMemo(() => {
        let arr = books.filter((b) => (filterKey === 'list' ? b.inReadingList : true));
        arr = [...arr].sort((a, b) => {
            if (sortKey === 'title') return (a.title || '').localeCompare(b.title || '');
            if (sortKey === 'reviews') return (b.ratingsCount || 0) - (a.ratingsCount || 0);
            return (b.rating || 0) - (a.rating || 0) || (b.ratingsCount || 0) - (a.ratingsCount || 0);
        });
        return arr;
    }, [books, sortKey, filterKey]);

    if (loading) return <SkeletonResults t={t} />;
    if (!books.length) return null;

    const hero = list[0];
    const shelf = list.slice(1);
    const activeSort = sorts.find((s) => s.key === sortKey);

    return (
        <div className="px-4 pb-6">
            {/* Header */}
            <div className="flex items-end justify-between gap-3 py-4">
                <div>
                    <h2 className="font-display font-semibold text-2xl leading-none text-stone-900 dark:text-dark-text tracking-tight">
                        {t('scan.topRated')}
                    </h2>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-stone-500 dark:text-dark-muted mt-2">
                        {filterKey === 'all' ? t('scan.found', { count: list.length }) : `${list.length} / ${books.length}`}
                        {' · '}
                        {activeSort?.label}
                    </p>
                </div>
                {headerRight}
            </div>

            {/* Sort / filter chips */}
            <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 items-center">
                <ArrowUpDown size={13} className="flex-none text-stone-400 dark:text-dark-muted" />
                {sorts.map((s) => (
                    <button
                        key={s.key}
                        onClick={() => setSortKey(s.key)}
                        aria-pressed={sortKey === s.key}
                        className={`${CHIP_BASE} ${sortKey === s.key ? 'bg-ink-700 text-white border-ink-700' : CHIP_OFF}`}
                    >
                        {s.label}
                    </button>
                ))}

                {hasMatches && (
                    <>
                        <span className="flex-none w-px h-5 bg-line dark:bg-dark-border mx-1" />
                        <button
                            onClick={() => setFilterKey('all')}
                            aria-pressed={filterKey === 'all'}
                            className={`${CHIP_BASE} ${filterKey === 'all' ? 'bg-foil-600 text-white border-foil-600' : CHIP_OFF}`}
                        >
                            {t('filter.all') || 'All'}
                        </button>
                        <button
                            onClick={() => setFilterKey('list')}
                            aria-pressed={filterKey === 'list'}
                            className={`${CHIP_BASE} inline-flex items-center gap-1 ${
                                filterKey === 'list' ? 'bg-foil-600 text-white border-foil-600' : CHIP_OFF
                            }`}
                        >
                            <Bookmark size={12} className={filterKey === 'list' ? 'fill-current' : ''} />
                            {t('filter.onMyList') || 'On my list'}
                        </button>
                    </>
                )}
            </div>

            {/* Empty state (only reachable via filter) */}
            {list.length === 0 ? (
                <div className="text-center py-10 text-sm text-stone-500 dark:text-dark-muted">
                    {t('filter.noneOnList') || 'None of these are on your list yet.'}
                </div>
            ) : (
                <>
                    {/* HERO */}
                    <button
                        onClick={() => onSelectBook?.(hero)}
                        aria-label={`${hero.title} — view details`}
                        className="w-full text-left bg-surface dark:bg-dark-card border border-line dark:border-dark-border
                       rounded-2xl p-4 mt-3 transition-transform active:scale-[0.98]"
                    >
                        <div className="flex items-center justify-between mb-3">
              <span className="font-mono font-bold text-[11px] tracking-wide text-ink-700 dark:text-ink-300 bg-ink-50 dark:bg-ink-900/40 px-2 py-1 rounded-md">
                № 01{sortKey === 'rating' ? ' · ' + (t('results.topRatedTag') || 'TOP RATED') : ''}
              </span>
                            {hero.inReadingList && (
                                <span className="inline-flex items-center gap-1 font-mono font-bold text-[11px] text-ribbon-600 dark:text-ribbon-300">
                  <Bookmark size={13} className="fill-current" /> {t('scan.onReadingList')}
                </span>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <div className="relative flex-none">
                                <Cover
                                    book={hero}
                                    className="w-28 aspect-[2/3] rounded-[4px_8px_8px_4px] shadow-lg"
                                    textClass="text-sm"
                                />
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col">
                                <h3 className="font-display font-semibold text-xl leading-tight text-stone-900 dark:text-dark-text">
                                    {hero.title}
                                </h3>
                                <p className="text-sm text-stone-500 dark:text-dark-muted mt-0.5 mb-3">{hero.author}</p>

                                <div className="flex items-center gap-2 flex-wrap mb-auto">
                                    <RatingSeal rating={hero.rating} size="lg" />
                                    {fmtCount(hero.ratingsCount) && (
                                        <span className="font-mono text-[10px] leading-tight text-stone-500 dark:text-dark-muted">
                      {fmtCount(hero.ratingsCount)} {t('scan.ratings') || 'ratings'}
                                            {hero.sources?.length ? <><br />{hero.sources.join(' + ')}</> : null}
                    </span>
                                    )}
                                </div>

                                <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-ink-700 dark:text-ink-300 mt-3">
                  {t('book.more') || 'Details & links'} <ChevronRight size={15} />
                </span>
                            </div>
                        </div>
                    </button>

                    {/* THE SHELF */}
                    {shelf.length > 0 && (
                        <>
                            <div className="flex items-baseline justify-between mt-7 mb-3">
                                <h3 className="font-display font-semibold text-lg text-stone-900 dark:text-dark-text">
                                    {t('results.moreBooksFound') || 'The shelf'}
                                </h3>
                                <span className="font-mono text-[10px] uppercase tracking-wider text-stone-500 dark:text-dark-muted">
                  {shelf.length} {t('results.more') || 'more'}
                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {shelf.map((book, i) => (
                                    <button
                                        key={book.isbn || book.title + i}
                                        onClick={() => onSelectBook?.(book)}
                                        aria-label={`${book.title} — view details`}
                                        className="text-left group"
                                    >
                                        <div className="relative">
                                            <Cover
                                                book={book}
                                                className="w-full aspect-[2/3] rounded-[3px_7px_7px_3px] shadow-md transition-transform group-active:translate-y-0.5"
                                            />
                                            {book.rating > 0 ? (
                                                <span className="absolute top-1.5 right-1.5">
                          <RatingSeal rating={book.rating} />
                        </span>
                                            ) : (
                                                <span className="absolute top-1.5 right-1.5 bg-stone-400/90 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-full">
                          N/A
                        </span>
                                            )}
                                            {book.inReadingList && (
                                                <span
                                                    className="absolute -top-px left-3 w-3 h-5 bg-ribbon-600 shadow"
                                                    style={{ clipPath: RIBBON_CLIP }}
                                                    aria-hidden
                                                />
                                            )}
                                        </div>
                                        <p className="font-sans text-[11px] font-semibold leading-tight text-stone-900 dark:text-dark-text line-clamp-2 mt-1.5">
                                            {book.title}
                                        </p>
                                        <p className="font-mono text-[9px] text-stone-500 dark:text-dark-muted mt-0.5">
                                            № {String(i + 2).padStart(2, '0')}
                                            {fmtCount(book.ratingsCount) ? ` · ${fmtCount(book.ratingsCount)}` : ''}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}

/* Loading state — shimmer covers materializing while the scan resolves */
function SkeletonResults({ t = (k) => k }) {
    const sk = 'bg-line dark:bg-dark-border animate-pulse';
    return (
        <div className="px-4 pb-6">
            <div className="py-4">
                <div className={`h-7 w-44 rounded ${sk}`} />
                <p className="font-mono text-[11px] uppercase tracking-wider text-stone-500 dark:text-dark-muted mt-3">
                    {t('scan.scanning') || 'Reading the spines…'}
                </p>
            </div>

            {/* hero skeleton */}
            <div className="bg-surface dark:bg-dark-card border border-line dark:border-dark-border rounded-2xl p-4">
                <div className="flex gap-4">
                    <div className={`w-28 aspect-[2/3] rounded-[4px_8px_8px_4px] ${sk}`} />
                    <div className="flex-1 space-y-3 pt-1">
                        <div className={`h-5 w-3/4 rounded ${sk}`} />
                        <div className={`h-3 w-1/2 rounded ${sk}`} />
                        <div className={`h-9 w-24 rounded-xl ${sk}`} />
                    </div>
                </div>
            </div>

            {/* shelf skeleton */}
            <div className="grid grid-cols-3 gap-3 mt-7">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i}>
                        <div className={`w-full aspect-[2/3] rounded-[3px_7px_7px_3px] ${sk}`} style={{ animationDelay: `${i * 90}ms` }} />
                        <div className={`h-2.5 w-5/6 rounded mt-1.5 ${sk}`} />
                    </div>
                ))}
            </div>
        </div>
    );
}