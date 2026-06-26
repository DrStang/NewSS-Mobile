import React, { useState } from 'react';
import { X, Download, Star, BookOpen, Bookmark, FileText, Table, Share as ShareIcon, ChevronRight, Loader2 } from 'lucide-react';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { Share as CapacitorShare } from '@capacitor/share';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import i18n from '../utils/i18n';

const CLOTHS = ['#27374D', '#6E2F2F', '#26453A', '#43314E', '#1F4A4E', '#7A3B22', '#39455A', '#432A3E'];
const clothFor = (str = '') => {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return CLOTHS[h % CLOTHS.length];
};
const fmtCount = (n) => {
    if (!n) return null;
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return Math.round(n / 1000) + 'k';
    return '' + n;
};

function ScanDetailModal({ isOpen, onClose, scan, onViewBook }) {
    const [exporting, setExporting] = useState(false);
    const [exportFormat, setExportFormat] = useState(null);

    if (!isOpen || !scan) return null;

    const books = scan.books || [];
    const scanDate = new Date(scan.created_at);

    const formatDate = (date) => date.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const formatTime = (date) => date.toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true
    });

    // Generate CSV content
    const generateCSV = () => {
        const headers = ['Title', 'Author', 'Rating', 'Ratings Count', 'ISBN', 'Publish Year', 'On Reading List', 'Goodreads URL', 'Amazon URL'];
        const rows = books.map(book => [
            `"${(book.title || '').replace(/"/g, '""')}"`,
            `"${(book.author || '').replace(/"/g, '""')}"`,
            book.rating || '',
            book.ratingsCount || '',
            book.isbn || '',
            book.publishYear || '',
            book.inReadingList ? 'Yes' : 'No',
            book.goodreadsUrl || '',
            book.amazonUrl || ''
        ]);
        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    };

    // Generate plain text content
    const generateText = () => {
        let content = `Shelf Scan Export\n`;
        content += `${'='.repeat(50)}\n\n`;
        content += `Scan Date: ${formatDate(scanDate)} at ${formatTime(scanDate)}\n`;
        content += `Total Books: ${books.length}\n\n`;
        content += `${'='.repeat(50)}\n\n`;
        books.forEach((book, index) => {
            content += `${index + 1}. ${book.title}\n`;
            content += `   Author: ${book.author || 'Unknown'}\n`;
            content += `   Rating: ${book.rating ? book.rating.toFixed(1) : 'N/A'}`;
            if (book.ratingsCount) content += ` (${book.ratingsCount.toLocaleString()} reviews)`;
            content += '\n';
            if (book.isbn) content += `   ISBN: ${book.isbn}\n`;
            if (book.inReadingList) content += `   On your reading list\n`;
            content += `   Goodreads: ${book.goodreadsUrl || 'N/A'}\n`;
            content += '\n';
        });
        content += `\n${'='.repeat(50)}\n`;
        content += `Exported from Shelf Scan - https://shelfscan.xyz\n`;
        return content;
    };

    // Generate HTML for PDF-like export (clothbound palette)
    const generateHTML = () => {
        const avgRating = books.filter(b => b.rating > 0).reduce((sum, b, _, arr) =>
            sum + b.rating / arr.length, 0);

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Shelf Scan Export - ${formatDate(scanDate)}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: Georgia, 'Times New Roman', serif;
            padding: 40px; max-width: 800px; margin: 0 auto; color: #1b1a17; background: #f4f2ec;
        }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #1e3d34; }
        .header h1 { color: #1e3d34; font-size: 28px; margin-bottom: 10px; }
        .header .date { color: #6b6862; font-size: 14px; }
        .stats { display: flex; justify-content: center; gap: 40px; margin: 20px 0; padding: 20px; background: #ffffff; border: 1px solid #e7e3da; border-radius: 12px; }
        .stat { text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #1e3d34; }
        .stat-label { font-size: 12px; color: #6b6862; }
        .book { display: flex; gap: 20px; padding: 20px; margin: 15px 0; background: #fff; border: 1px solid #e7e3da; border-radius: 12px; }
        .book-rank { width: 44px; height: 44px; background: #1e3d34; color: #fff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; font-family: monospace; font-size: 13px; }
        .book-info { flex: 1; }
        .book-title { font-size: 18px; font-weight: bold; color: #1b1a17; }
        .book-author { color: #6b6862; margin-top: 4px; }
        .book-rating { display: inline-flex; align-items: center; gap: 6px; margin-top: 8px; padding: 4px 12px; background: #fbf6ea; border-radius: 20px; font-size: 14px; }
        .book-rating .star { color: #a87d31; }
        .reading-list-badge { display: inline-block; margin-top: 8px; margin-left: 8px; padding: 4px 12px; background: #f8eceb; color: #8c3b3b; border-radius: 20px; font-size: 12px; }
        .book-links { margin-top: 10px; font-size: 12px; }
        .book-links a { color: #1e3d34; margin-right: 15px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e7e3da; text-align: center; color: #9a968d; font-size: 12px; }
        @media print { body { padding: 20px; background: #fff; } .book { break-inside: avoid; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>Shelf Scan Export</h1>
        <div class="date">${formatDate(scanDate)} at ${formatTime(scanDate)}</div>
    </div>
    <div class="stats">
        <div class="stat"><div class="stat-value">${books.length}</div><div class="stat-label">Books Found</div></div>
        <div class="stat"><div class="stat-value">${avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}</div><div class="stat-label">Avg Rating</div></div>
        <div class="stat"><div class="stat-value">${books.filter(b => b.inReadingList).length}</div><div class="stat-label">On Reading List</div></div>
    </div>
    ${books.map((book, index) => `
        <div class="book">
            <div class="book-rank">No.${String(index + 1).padStart(2, '0')}</div>
            <div class="book-info">
                <div class="book-title">${book.title}</div>
                <div class="book-author">by ${book.author || 'Unknown Author'}</div>
                <div>
                    <span class="book-rating">
                        <span class="star">&#9733;</span>
                        ${book.rating ? book.rating.toFixed(1) : 'N/A'}
                        ${book.ratingsCount ? `(${book.ratingsCount.toLocaleString()} reviews)` : ''}
                    </span>
                    ${book.inReadingList ? '<span class="reading-list-badge">On Your List</span>' : ''}
                </div>
                <div class="book-links">
                    ${book.goodreadsUrl ? `<a href="${book.goodreadsUrl}" target="_blank">Goodreads</a>` : ''}
                    ${book.amazonUrl ? `<a href="${book.amazonUrl}" target="_blank">Amazon</a>` : ''}
                    ${book.isbn ? `<span>ISBN: ${book.isbn}</span>` : ''}
                </div>
            </div>
        </div>
    `).join('')}
    <div class="footer">Exported from Shelf Scan • https://shelfscan.xyz</div>
</body>
</html>`;
    };

    const handleExport = async (format) => {
        if (Capacitor.isNativePlatform()) {
            await Haptics.impact({ style: ImpactStyle.Medium });
        }
        setExporting(true);
        setExportFormat(format);
        try {
            let content, mimeType, filename;
            switch (format) {
                case 'csv':
                    content = generateCSV(); mimeType = 'text/csv';
                    filename = `shelf-scan-${scanDate.toISOString().split('T')[0]}.csv`; break;
                case 'txt':
                    content = generateText(); mimeType = 'text/plain';
                    filename = `shelf-scan-${scanDate.toISOString().split('T')[0]}.txt`; break;
                case 'html':
                    content = generateHTML(); mimeType = 'text/html';
                    filename = `shelf-scan-${scanDate.toISOString().split('T')[0]}.html`; break;
                default:
                    throw new Error('Unknown format');
            }

            if (Capacitor.isNativePlatform()) {
                try {
                    const result = await Filesystem.writeFile({
                        path: filename, data: content, directory: Directory.Cache, encoding: Encoding.UTF8
                    });
                    console.log('File written to:', result.uri);
                    await CapacitorShare.share({ files: [result.uri] });
                    setTimeout(async () => {
                        try {
                            await Filesystem.deleteFile({ path: filename, directory: Directory.Cache });
                        } catch (e) { /* Ignore cleanup errors */ }
                    }, 5000);
                } catch (fsError) {
                    console.error('Filesystem error:', fsError);
                    if (format === 'txt' || format === 'csv') {
                        await CapacitorShare.share({
                            title: `Shelf Scan Export`, text: content, dialogTitle: 'Export Scan Results',
                        });
                    } else { throw fsError; }
                }
            } else {
                const blob = new Blob([content], { type: mimeType });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = filename;
                document.body.appendChild(a); a.click(); document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }

            if (Capacitor.isNativePlatform()) {
                await Haptics.notification({ type: NotificationType.Success });
            }
        } catch (err) {
            console.error('Export error:', err);
            if (Capacitor.isNativePlatform()) {
                await Haptics.notification({ type: NotificationType.Error });
            }
            alert('Export failed. Please try again.');
        } finally {
            setExporting(false);
            setExportFormat(null);
        }
    };

    const handleShareScan = async () => {
        if (Capacitor.isNativePlatform()) {
            await Haptics.impact({ style: ImpactStyle.Light });
        }
        const topBooks = books.slice(0, 3).map((b, i) => `${i + 1}. ${b.title} (${b.rating?.toFixed(1) || 'N/A'}★)`).join('\n');
        try {
            await CapacitorShare.share({
                title: 'My Shelf Scan Results',
                text: `I scanned ${books.length} books!\n\nTop rated:\n${topBooks}\n\nScanned with Shelf Scan`,
                dialogTitle: 'Share Scan Results',
            });
        } catch (err) {
            console.log('Share cancelled or failed:', err);
        }
    };

    const exportBtn =
        'flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-ink-50 dark:bg-ink-900/30 hover:bg-ink-100 dark:hover:bg-ink-900/50 text-ink-700 dark:text-ink-300 rounded-xl font-medium transition-colors disabled:opacity-50';

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-start justify-center z-50 overflow-y-auto" onClick={onClose}>
            <div
                className="bg-surface dark:bg-dark-card border border-line dark:border-dark-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 mt-16 overflow-hidden flex flex-col max-h-[calc(100vh-6rem)]"
                style={{ marginTop: 'max(4rem, calc(env(safe-area-inset-top) + 1rem))' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-surface dark:bg-dark-card border-b border-line dark:border-dark-border px-6 py-4 flex items-center justify-between z-10">
                    <div>
                        <h2 className="font-display text-xl font-semibold text-stone-900 dark:text-dark-text">
                            {i18n.t('scanDetail.title')}
                        </h2>
                        <p className="font-mono text-[11px] text-stone-500 dark:text-dark-muted mt-0.5">
                            {formatDate(scanDate)} • {formatTime(scanDate)}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-paper dark:hover:bg-dark-bg rounded-full transition-colors active:scale-95"
                        aria-label="Close"
                    >
                        <X className="w-6 h-6 text-stone-400 dark:text-dark-muted" />
                    </button>
                </div>

                {/* Stats Bar */}
                <div className="bg-ink-50 dark:bg-ink-900/30 px-6 py-4 flex justify-around">
                    <div className="text-center">
                        <div className="font-display text-2xl font-bold text-ink-700 dark:text-ink-300">{books.length}</div>
                        <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 dark:text-dark-muted mt-1">{i18n.t('scanDetail.booksFound')}</div>
                    </div>
                    <div className="text-center">
                        <div className="font-display text-2xl font-bold text-foil-600 dark:text-foil-300">
                            {books.filter(b => b.rating > 0).length > 0
                                ? (books.filter(b => b.rating > 0).reduce((sum, b) => sum + b.rating, 0) / books.filter(b => b.rating > 0).length).toFixed(1)
                                : 'N/A'}
                        </div>
                        <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 dark:text-dark-muted mt-1">{i18n.t('scanDetail.avgRating')}</div>
                    </div>
                    <div className="text-center">
                        <div className="font-display text-2xl font-bold text-ribbon-600 dark:text-ribbon-300">
                            {books.filter(b => b.inReadingList).length}
                        </div>
                        <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 dark:text-dark-muted mt-1">{i18n.t('scanDetail.onList')}</div>
                    </div>
                </div>

                {/* Export Buttons */}
                <div className="px-6 py-4 border-b border-line dark:border-dark-border">
                    <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-stone-500 dark:text-dark-muted">{i18n.t('scanDetail.exportAs')}</span>
                        <button
                            onClick={handleShareScan}
                            className="flex items-center gap-2 px-4 py-2 bg-ink-50 dark:bg-ink-900/40 hover:bg-ink-100 dark:hover:bg-ink-900/60 rounded-lg text-sm font-medium text-ink-700 dark:text-ink-300 transition-colors active:scale-95"
                        >
                            <ShareIcon className="w-4 h-4" />
                            {i18n.t('scanDetail.share')}
                        </button>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => handleExport('csv')} disabled={exporting} className={exportBtn}>
                            {exporting && exportFormat === 'csv' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Table className="w-5 h-5" />}
                            CSV
                        </button>
                        <button onClick={() => handleExport('html')} disabled={exporting} className={exportBtn}>
                            {exporting && exportFormat === 'html' ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                            HTML/PDF
                        </button>
                        <button onClick={() => handleExport('txt')} disabled={exporting} className={exportBtn}>
                            {exporting && exportFormat === 'txt' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                            TXT
                        </button>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-dark-muted mt-2 text-center">
                        {i18n.t('scanDetail.htmlPdfHint')}
                    </p>
                </div>

                {/* Book List */}
                <div className="px-6 py-4 max-h-96 overflow-y-auto">
                    <h3 className="font-display text-base font-semibold text-stone-900 dark:text-dark-text mb-3">
                        {i18n.t('scanDetail.allBooks')} <span className="font-mono text-xs text-stone-400 dark:text-dark-muted">({books.length})</span>
                    </h3>
                    <div className="space-y-2.5">
                        {books.map((book, index) => (
                            <button
                                key={index}
                                onClick={() => onViewBook && onViewBook(book)}
                                className={`w-full text-left flex items-center gap-3.5 p-3 rounded-xl border transition-all active:scale-[0.98] ${
                                    book.inReadingList
                                        ? 'bg-ribbon-50 dark:bg-ribbon-900/20 border-ribbon-200 dark:border-ribbon-800'
                                        : 'bg-paper dark:bg-dark-bg border-line dark:border-dark-border hover:bg-line dark:hover:bg-dark-card'
                                }`}
                            >
                                {/* Cover */}
                                {book.thumbnail ? (
                                    <img
                                        src={book.thumbnail}
                                        alt={book.title}
                                        loading="lazy"
                                        className="w-10 h-14 object-cover rounded-[3px_5px_5px_3px] shadow-sm flex-none bg-line dark:bg-dark-border"
                                    />
                                ) : (
                                    <div
                                        className="w-10 h-14 rounded-[3px_5px_5px_3px] shadow-sm flex-none flex items-center justify-center"
                                        style={{ background: clothFor(book.title) }}
                                    >
                                        <BookOpen className="w-4 h-4 text-[#EFE6CE] opacity-70" />
                                    </div>
                                )}

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-stone-900 dark:text-dark-text truncate">{book.title}</h4>
                                    <p className="text-sm text-stone-500 dark:text-dark-muted truncate">{book.author || 'Unknown Author'}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        {book.rating > 0 ? (
                                            <span className="inline-flex items-center gap-1 bg-foil-50 dark:bg-foil-900/20 px-2 py-0.5 rounded-full">
                                                <Star className="w-3 h-3 fill-foil-600 text-foil-600" />
                                                <span className="font-mono text-[11px] font-bold text-stone-900 dark:text-dark-text">{book.rating.toFixed(1)}</span>
                                            </span>
                                        ) : (
                                            <span className="font-mono text-[10px] text-stone-400 dark:text-dark-muted">N/A</span>
                                        )}
                                        <span className="font-mono text-[10px] text-stone-400 dark:text-dark-muted">
                                            № {String(index + 1).padStart(2, '0')}
                                            {fmtCount(book.ratingsCount) ? ` · ${fmtCount(book.ratingsCount)}` : ''}
                                        </span>
                                    </div>
                                </div>

                                {book.inReadingList && (
                                    <Bookmark className="w-4 h-4 fill-current text-ribbon-600 dark:text-ribbon-300 flex-none" />
                                )}
                                <ChevronRight className="w-5 h-5 text-stone-400 dark:text-dark-muted flex-none" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-line dark:border-dark-border bg-paper dark:bg-dark-bg">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-ink-700 text-white rounded-xl font-semibold hover:bg-ink-800 transition-colors active:scale-95"
                    >
                        {i18n.t('common.close')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ScanDetailModal;
