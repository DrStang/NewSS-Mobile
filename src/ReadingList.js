import React, { useState, useEffect } from 'react';
import { Upload, Book, Trash2, Loader2, AlertCircle, CheckCircle, X, Star, ExternalLink } from 'lucide-react';
import { useAuth } from './AuthContext';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import i18n from "./utils/i18n";

function ReadingList({ isOpen, onClose }) {
  const [readingList, setReadingList] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState(null);
  const [lastImportDate, setLastImportDate] = useState(null);
  const { user, session } = useAuth();
  const platform = Capacitor.getPlatform();
  const isAndroid = platform === 'android';
  const isIOS = platform === 'ios';

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  useEffect(() => {
    if (isOpen && user) {
      loadReadingList();
    }
  }, [isOpen, user]);

  const loadReadingList = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/reading-list`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load reading list');
      }

      setReadingList(data.books || []);
      setFilteredBooks(data.books || []);
      calculateStats(data.books || []);
      if (data.books && data.books.length > 0) {
        const dates = data.books
            .map(book => book.created_at)
            .filter(date => date)
            .sort((a, b) => new Date(b) - new Date(a));
        if (dates.length > 0) {
          setLastImportDate(dates[0]);
        }
      }
    } catch (err) {
      console.error('Error loading reading list:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (books) => {
    const read = books.filter(b => b.exclusive_shelf === 'read').length;
    const currentlyReading = books.filter(b => b.exclusive_shelf === 'currently-reading').length;
    const toRead = books.filter(b => b.exclusive_shelf === 'to-read').length;
    const avgRating = books
        .filter(b => b.my_rating && b.my_rating > 0)
        .reduce((sum, b, _, arr) => sum + b.my_rating / arr.length, 0);

    setStats({
      total: books.length,
      read,
      currentlyReading,
      toRead,
      avgRating: avgRating > 0 ? avgRating.toFixed(1) : 'N/A'
    });
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);

    if (filter === 'all') {
      setFilteredBooks(readingList);
    } else {
      const filtered = readingList.filter(book => book.exclusive_shelf === filter);
      setFilteredBooks(filtered);
    }
  };

  const openGoodreadsExport = async () => {
    await Haptics.impact({ style: ImpactStyle.Light });

    if (Capacitor.isNativePlatform()) {
      await Browser.open({
        url: 'https://www.goodreads.com/review/import',
        presentationStyle: 'popover'
      });
    } else {
      window.open('https://www.goodreads.com/review/import', '_blank', 'noopener,noreferrer');
    }
  };

  const handleFileUpload = async (e) => {
    await Haptics.impact({ style: ImpactStyle.Medium });
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/api/import-goodreads`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        await Haptics.notification({ type: NotificationType.Error });
        throw new Error(data.error || 'Failed to import');
      }

      setSuccess(i18n.t('library.imported', { count: data.imported}));
      await Haptics.notification({ type: NotificationType.Success });
      await loadReadingList();
      setActiveFilter('all');
    } catch (err) {
      console.error('Import error:', err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleClearList = async () => {
    await Haptics.impact({ style: ImpactStyle.Heavy });
    if (!window.confirm(i18n.t('library.clearList'))) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/api/reading-list`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        await Haptics.notification({ type: NotificationType.Error });
        throw new Error(data.error || 'Failed to clear list');
      }

      setSuccess(i18n.t('library.clearedSuccessfully'));
      await Haptics.notification({ type: NotificationType.Success });
      setReadingList([]);
      setFilteredBooks([]);
      setStats(null);
      setActiveFilter('all');
    } catch (err) {
      console.error('Clear error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto px-4">
        <div
            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-[min(100vw-1.5rem,64rem)] max-h-[calc(100dvh-1.5rem-env(safe-area-inset-bottom))] sm:max-h-[calc(100dvh-3rem)-env(safe-area-inset-bottom)] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Book className="w-6 h-6 text-ink-600 dark:text-ink-400" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{i18n.t('library.title')}</h2>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1">
            {/* Import Section */}
            <div className="mb-6 p-4 bg-ink-50 dark:bg-ink-900/30 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                {i18n.t('library.import')}
                {lastImportDate && (
                    <span className="text-sm font-normal text-gray-600 dark:text-gray-400 block mt-1">
                    {i18n.t('library.lastImported', { date: new Date(lastImportDate).toLocaleDateString()})}
                      {new Date() - new Date(lastImportDate) > 14 * 24 * 60 * 60 * 1000 && (
                          <span className="text-amber-600 dark:text-amber-400 ml-2">⚠️ {i18n.t('library.considerReimport')}</span>
                      )}
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                {i18n.t('library.goodreadsRestrictions')}
              </p>

              {isAndroid && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">📚 {i18n.t('library.step1GetExport')}</p>
                    <button
                        onClick={openGoodreadsExport}
                        className="w-full px-4 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <ExternalLink className="w-5 h-5" />
                      {i18n.t('library.openGoodreadsExport')}
                    </button>
                    <ol className="text-gray-600 dark:text-gray-400 space-y-1 ml-4 list-decimal text-xs mt-2">
                      <li>{i18n.t('library.instructionClickExport')}</li>
                      <li>{i18n.t('library.instructionClickExportLibrary')}</li>
                      <li>{i18n.t('library.instructionClickGeneratedLink')}</li>
                      <li>{i18n.t('library.instructionListWillDownload')}</li>
                      <li>{i18n.t('library.instructionReturnToApp')}</li>
                    </ol>
                  </div>
              )}
              {isIOS && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">📚 {i18n.t('library.step1GetExport')}</p>
                    <button
                        onClick={openGoodreadsExport}
                        className="w-full px-4 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <ExternalLink className="w-5 h-5" />
                      {i18n.t('library.openGoodreadsExport')}
                    </button>
                    <ol className="text-gray-600 dark:text-gray-400 space-y-1 ml-4 list-decimal text-xs mt-2">
                      <li>{i18n.t('library.instructionClickExport')}</li>
                      <li>{i18n.t('library.instructionClickExportLibrary')}</li>
                      <li>{i18n.t('library.instructionClickGeneratedLink')}</li>
                      <li>{i18n.t('library.instructionClickMore')}</li>
                      <li>{i18n.t('library.instructionSaveToFiles')}</li>
                      <li>{i18n.t('library.instructionListWillDownload')}</li>
                      <li>{i18n.t('library.instructionReturnToApp')}</li>
                    </ol>
                  </div>
              )}

              <div className="mb-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">📤 {i18n.t('library.step2UploadList')}</p>
              </div>

              <div className="flex gap-3">
                <label className="flex-1 cursor-pointer">
                  <div className="px-4 py-3 bg-ink-600 dark:bg-ink-500 text-white rounded-lg hover:bg-ink-700 dark:hover:bg-ink-600 transition-colors flex items-center justify-center gap-2">
                    {uploading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {i18n.t('library.importing')}
                        </>
                    ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          {i18n.t('library.upload')}
                        </>
                    )}
                  </div>
                  <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                  />
                </label>

                {readingList.length > 0 && (
                    <button
                        onClick={handleClearList}
                        disabled={loading}
                        className="px-4 py-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      {i18n.t('library.clear')}
                    </button>
                )}
              </div>
            </div>

            {/* Messages */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800 dark:text-red-300">Error</p>
                    <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                  </div>
                </div>
            )}

            {success && (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-green-700 dark:text-green-300">{success}</p>
                </div>
            )}

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <button
                      onClick={async() => {
                        await Haptics.impact({ style: ImpactStyle.Light });
                        handleFilterClick('all')
                      }}
                      className={`rounded-lg p-4 text-center transition-all hover:shadow-md ${
                          activeFilter === 'all'
                              ? 'ring-2 ring-ink-500 bg-ink-50 dark:bg-ink-900/50'
                              : 'bg-gray-50 dark:bg-gray-700'
                      }`}
                  >
                    <div className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{i18n.t('library.totalBooks')}</div>
                  </button>

                  <button
                      onClick={async() => {
                        await Haptics.impact({ style: ImpactStyle.Light });
                        handleFilterClick('read')
                      }}
                      className={`rounded-lg p-4 text-center transition-all hover:shadow-md ${
                          activeFilter === 'read'
                              ? 'ring-2 ring-green-500 bg-green-100 dark:bg-green-900/50'
                              : 'bg-green-50 dark:bg-green-900/30'
                      }`}
                  >
                    <div className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.read}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{i18n.t('library.read')}</div>
                  </button>

                  <button
                      onClick={async() => {
                        await Haptics.impact({ style: ImpactStyle.Light });
                        handleFilterClick('currently-reading')
                      }}
                      className={`rounded-lg p-4 text-center transition-all hover:shadow-md ${
                          activeFilter === 'currently-reading'
                              ? 'ring-2 ring-blue-500 bg-blue-100 dark:bg-blue-900/50'
                              : 'bg-blue-50 dark:bg-blue-900/30'
                      }`}
                  >
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.currentlyReading}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{i18n.t('library.reading')}</div>
                  </button>

                  <button
                      onClick={async() => {
                        await Haptics.impact({ style: ImpactStyle.Light });
                        handleFilterClick('to-read')
                      }}
                      className={`rounded-lg p-4 text-center transition-all hover:shadow-md ${
                          activeFilter === 'to-read'
                              ? 'ring-2 ring-amber-500 bg-amber-100 dark:bg-amber-900/50'
                              : 'bg-amber-50 dark:bg-amber-900/30'
                      }`}
                  >
                    <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{stats.toRead}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{i18n.t('library.toRead')}</div>
                  </button>

                  <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-400 flex items-center justify-center gap-1">
                      <Star className="w-5 h-5 fill-purple-700 dark:fill-purple-400" />
                      {stats.avgRating}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{i18n.t('library.avgRating')}</div>
                  </div>
                </div>
            )}

            {/* Reading List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-ink-600 dark:text-ink-400" />
                </div>
            ) : readingList.length === 0 ? (
                <div className="text-center py-12">
                  <Book className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">{i18n.t('library.noBooksYet')}</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">{i18n.t('library.uploadToStart')}</p>
                </div>
            ) : (
                <div>
                  {activeFilter !== 'all' && (
                      <div className="mb-4 flex items-center justify-between bg-ink-50 dark:bg-ink-900/30 px-4 py-2 rounded-lg">
                        <p className="text-sm text-ink-700 dark:text-ink-300">
                          Showing {filteredBooks.length} {
                          activeFilter === 'read' ? 'read' :
                              activeFilter === 'currently-reading' ? 'currently reading' :
                                  'to-read'
                        } books
                        </p>
                        <button
                            onClick={() => handleFilterClick('all')}
                            className="text-sm text-ink-600 dark:text-ink-400 hover:text-ink-800 dark:hover:text-ink-300 font-medium"
                        >
                          {i18n.t('scan.clear')}
                        </button>
                      </div>
                  )}

                  <div className="max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                      {filteredBooks.map((book, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-ink-300 dark:hover:border-ink-600 transition-colors bg-white dark:bg-gray-800">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-800 dark:text-white truncate">{book.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{book.author}</p>
                              <div className="flex items-center gap-3 mt-1">
                                {book.my_rating > 0 && (
                                    <div className="flex items-center gap-1">
                                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{book.my_rating}</span>
                                    </div>
                                )}
                                {book.exclusive_shelf && (
                                    <span className={`text-xs px-2 py-1 rounded ${
                                        book.exclusive_shelf === 'read'
                                            ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                                            : book.exclusive_shelf === 'currently-reading'
                                                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400'
                                                : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400'
                                    }`}>
                              {book.exclusive_shelf === 'currently-reading' ? 'Reading' :
                                  book.exclusive_shelf === 'to-read' ? 'To Read' : 'Read'}
                            </span>
                                )}
                                {book.isbn13 && (
                                    <span className="text-xs text-gray-400 dark:text-gray-500">ISBN: {book.isbn13}</span>
                                )}
                              </div>
                            </div>
                          </div>
                      ))}
                    </div>
                  </div>
                </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-[#F4F2EC] dark:bg-dark-bg">
            <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            >
              {i18n.t('common.close')}
            </button>
          </div>
        </div>
      </div>
  );
}

export default ReadingList;