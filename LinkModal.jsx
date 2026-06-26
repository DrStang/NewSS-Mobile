import React from 'react';
import { X, Share2, Star } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import amazonImage from './amazon.png';
import googleImage from './Google_Play_Books_icon_(2023).svg.png';
import goodreadsImage from './Goodreads_logo_2025.png';

const fmtCount = (n) => {
    if (!n) return null;
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return Math.round(n / 1000) + 'k';
    return '' + n;
};

const LinkModal = ({ show, onClose, book }) => {
    if (!show || !book) return null;

    const shareBook = async () => {
        if (Capacitor.isNativePlatform()) {
            await Haptics.impact({ style: ImpactStyle.Light });
        }
        try {
            await Share.share({
                title: book.title,
                text: `Check out "${book.title}" by ${book.author} - ${book.rating ? book.rating.toFixed(1) + '★' : ''} rating!`,
                url: book.goodreadsUrl || book.amazonUrl,
                dialogTitle: 'Share this book',
            });
        } catch (err) {
            console.log('Share cancelled or failed:', err);
        }
    };

    const handleLinkClick = async () => {
        if (Capacitor.isNativePlatform()) {
            await Haptics.impact({ style: ImpactStyle.Light });
        }
    };

    const cleanDesc = book.description ? book.description.replace(/<[^>]*>/g, '') : '';

    const linkClass =
        'flex items-center justify-center px-4 py-3 bg-white dark:bg-stone-100 border border-line dark:border-stone-300 rounded-xl hover:border-ink-400 transition-all active:scale-95';

    return (
        <div
            className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-end sm:items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="relative bg-surface dark:bg-dark-card border-t sm:border border-line dark:border-dark-border
                   rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 bg-line dark:bg-dark-border rounded-full" />
                </div>

                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full text-stone-400 dark:text-dark-muted
                     hover:bg-paper dark:hover:bg-dark-bg transition-all active:scale-95"
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="px-6 pb-6 pt-2">
                    {/* Header */}
                    <div className="flex gap-4 mb-6">
                        {book.thumbnail ? (
                            <img
                                src={book.thumbnail}
                                alt={book.title}
                                className="w-20 aspect-[2/3] object-cover rounded-[4px_8px_8px_4px] shadow-lg flex-none bg-line dark:bg-dark-border"
                            />
                        ) : (
                            <div className="w-20 aspect-[2/3] rounded-[4px_8px_8px_4px] bg-line dark:bg-dark-border flex-none" />
                        )}
                        <div className="min-w-0 flex-1">
                            <h2 className="font-display font-semibold text-xl leading-tight text-stone-900 dark:text-dark-text line-clamp-3">
                                {book.title}
                            </h2>
                            <p className="text-sm text-stone-500 dark:text-dark-muted mt-1">
                                by {book.author || 'Unknown Author'}
                            </p>
                            {book.rating > 0 && (
                                <div className="inline-flex items-center gap-1.5 mt-3 bg-foil-50 dark:bg-foil-900/20
                                border border-foil-600/30 px-2.5 py-1 rounded-lg">
                                    <Star className="w-4 h-4 fill-foil-600 text-foil-600" />
                                    <span className="font-display font-bold text-base text-stone-900 dark:text-dark-text">
                                        {book.rating.toFixed(1)}
                                    </span>
                                    {fmtCount(book.ratingsCount) && (
                                        <span className="font-mono text-[10px] text-stone-500 dark:text-dark-muted">
                                            ({fmtCount(book.ratingsCount)})
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Links */}
                    <p className="font-mono text-[10px] uppercase tracking-wider text-stone-500 dark:text-dark-muted mb-2.5">
                        View on
                    </p>
                    <div className="flex flex-wrap gap-3 mb-6">
                        {book.amazonUrl && (
                            <a href={book.amazonUrl} target="_blank" rel="noopener noreferrer" onClick={handleLinkClick} className={linkClass}>
                                <img src={amazonImage} alt="Amazon" className="h-8 w-auto dark:brightness-110" />
                            </a>
                        )}
                        {book.goodreadsUrl && (
                            <a href={book.goodreadsUrl} target="_blank" rel="noopener noreferrer" onClick={handleLinkClick} className={linkClass}>
                                <img src={goodreadsImage} alt="Goodreads" className="h-8 w-auto dark:brightness-110" />
                            </a>
                        )}
                        {book.infoLink && (
                            <a href={book.infoLink} target="_blank" rel="noopener noreferrer" onClick={handleLinkClick} className={linkClass}>
                                <img src={googleImage} alt="Google Books" className="h-8 w-auto" />
                            </a>
                        )}
                    </div>

                    {/* About */}
                    {cleanDesc && (
                        <>
                            <p className="font-mono text-[10px] uppercase tracking-wider text-stone-500 dark:text-dark-muted mb-2">
                                About
                            </p>
                            <p className="text-sm text-stone-600 dark:text-dark-muted leading-relaxed line-clamp-4 mb-6">
                                {cleanDesc.substring(0, 280)}{cleanDesc.length > 280 ? '…' : ''}
                            </p>
                        </>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={shareBook}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold
                         bg-ink-50 dark:bg-ink-900/40 text-ink-700 dark:text-ink-300 transition-transform active:scale-95"
                        >
                            <Share2 className="w-4 h-4" /> Share
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl font-semibold bg-ink-700 text-white transition-transform active:scale-95"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LinkModal;