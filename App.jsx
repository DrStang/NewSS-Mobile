import React, { useState, useEffect, useCallback } from 'react';
import { Upload, WifiOff, Download, ScanBarcode as Barcode, Book, Star, Loader2, Trash2, AlertCircle, X, Check, RotateCw, Camera, User, LogOut, ChevronRight, History, Globe, BookOpen, Key , Edit3, Share as ShareIcon } from 'lucide-react';
import { useAuth } from './AuthContext';
import AuthModal from './AuthModal';
import ReadingList from './ReadingList';
import LibraryTab from "./components/LibraryTab";
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor} from "@capacitor/core";
import { supabase } from './supabaseClient';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import LinkModal from './LinkModal';
import DescriptModal from './DescriptModal';
import TabBar from './components/TabBar';
import amazonImage from './amazon.png';
import googleImage from './Google_Play_Books_icon_(2023).svg.png';
import goodreadsImage from './Goodreads_logo_2025.png';
import { Share as CapacitorShare } from '@capacitor/share';
import EmptyState from "./components/EmptyState";
import { usePullToRefresh} from "./hooks/usePullToRefresh";
import DeepLinkHandler from "./DeepLinkHandler";
import PwChangeModal from "./PwChangeModal";
import WelcomeModal from "./components/WelcomeModal";
import HelpButton from "./components/HelpButton";
import Cropper from 'react-easy-crop';
import getCroppedImg from './cropImage';
import DeleteAccountModal from "./components/DeleteAccountModal";
import SwipeableScanItem from "./components/SwipeableScanItem";
import PrivacyModal from './PrivacyModal';
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import i18n from "./utils/i18n";
import BarcodeScanner from './components/BarcodeScanner';
import ThemeToggle from './components/ThemeToggle';
import LanguageSelector from './components/LanguageSelector';
import { Preferences } from '@capacitor/preferences';
import ScanDetailModal from './components/ScanDetailModal';
import ExportButton from "./components/ExportButton";
import BulkExportModal from './components/BulkExportModal';
import EditBooksModal from './components/EditBooksModal';
import MyCollection from './components/MyCollection';
import ScanResults from './components/ScanResults';
import ReadingStats from './components/ReadingStats';
import {
  queueScanForSync,
  processPendingScans,
  isOnline,
  getPendingScans,
  cacheBooks
} from "./utils/offlineCache";

i18n.init();

function App() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showReadingList, setShowReadingList] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showDescriptModal, setShowDescriptModal] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [savingScan, setSavingScan] = useState(false);
  const [showOnlyMatches, setShowOnlyMatches] = useState(false);
  const [matchedCount, setMatchedCount] = useState(0);
  const [activeTab, setActiveTab] = useState('scan');
  const [showPwChangeModal, setShowPwChangeModal] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({x:0, y:0});
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isAppReady, setIsAppReady] = useState(!Capacitor.isNativePlatform());
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [isOffline, setIsOffline] = useState(!isOnline());
  const [pendingScans, setPendingScans] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showScanDetailModal, setShowScanDetailModal] = useState(false);
  const [selectedScan, setSelectedScan] = useState(null);
  const [lastScanDate, setLastScanDate] = useState(null);
  const [showBulkExport, setShowBulkExport] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCollectionBook, setEditingCollectionBook] = useState(null);
  const [editingScanId, setEditingScanId] = useState(null);
  const [editingHistoryBooks, setEditingHistoryBooks] = useState(null);

  const {user, session, signOut, loading: authLoading} = useAuth();
  const { isDark } = useTheme();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';


  // Load scan history when user logs in
  useEffect(() => {
    if (user) {
      loadScanHistory();
      setShowAuthModal(false);
    } else {
      setScanHistory([]);
    }
  }, [user]);

  useEffect(() => {
    const setupStatusBar = async () => {
      if (Capacitor.isNativePlatform()) {
        // Set status bar style based on theme
        await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
        // Set status bar background color to match your header
        await StatusBar.setBackgroundColor({ color: isDark ? '#1f2937' : '#ffffff' });
        // Make content go under status bar (then use safe area insets)
        await StatusBar.setOverlaysWebView({overlay: true});
      }
    };

    setupStatusBar();
  }, [isDark]);

  useEffect(() => {
    const initializeApp = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          // Setup StatusBar
          await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
          await StatusBar.setBackgroundColor({ color: isDark ? '#1f2937' : '#ffffff' });
          await StatusBar.setOverlaysWebView({overlay: true});

          // Small delay to let safe areas calculate
          await new Promise(resolve => setTimeout(resolve, 150));

          setIsAppReady(true);
        } catch (err) {
          console.error('App initialization error:', err);
          setIsAppReady(true); // Proceed anyway
        }
      }
    };

    initializeApp();
  }, [isDark]);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

// COMPLETE REPLACEMENT for your online/offline useEffect in App.jsx
// Find your existing useEffect that handles 'online' and 'offline' events
// (around lines 137-169) and replace the ENTIRE thing with this:

  useEffect(() => {
    const handleOnline = async () => {
      console.log('📶 Coming back online...');
      setIsOffline(false);
      await Haptics.notification({ type: NotificationType.Success });

      const pending = await getPendingScans();
      console.log(`Found ${pending.length} pending scans to process`);

      if (pending.length > 0) {
        setSyncing(true);

        let lastSuccessfulResult = null;
        let processedCount = 0;
        let failedCount = 0;

        // Process each pending scan
        for (let i = 0; i < pending.length; i++) {
          const scan = pending[i];
          console.log(`Processing scan ${i + 1}/${pending.length}`, scan.id);

          try {
            // Call the API directly with the queued image data
            const response = await fetch(`${API_URL}/api/scan`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                image: scan.image,
                userId: scan.userId
              })
            });

            if (!response.ok) {
              throw new Error(`Server error (${response.status})`);
            }

            const result = await response.json();

            if (result.success && result.books) {
              console.log(`✅ Scan ${scan.id} processed successfully, got ${result.books?.length} books`);
              lastSuccessfulResult = result;
              processedCount++;

              // Cache books for offline access
              await cacheBooks(result.books);

              // Save scan for logged-in users
              if (scan.userId && user) {
                try {
                  await supabase
                      .from('scans')
                      .insert({
                        user_id: user.id,
                        books: result.books,
                        created_at: new Date().toISOString()
                      });
                } catch (saveErr) {
                  console.error('Error saving synced scan:', saveErr);
                }
              }

              // Remove this scan from pending
              const currentPending = await getPendingScans();
              const filtered = currentPending.filter(p => p.id !== scan.id);
              await Preferences.set({
                key: 'pending_scans',
                value: JSON.stringify(filtered)
              });
            }
          } catch (err) {
            console.error(`❌ Failed to process queued scan ${scan.id}:`, err);
            failedCount++;
          }
        }

        setSyncing(false);

        // Update pending scans count
        const remainingPending = await getPendingScans();
        setPendingScans(remainingPending);

        // Show the results from the last successful scan in the UI
        if (lastSuccessfulResult && lastSuccessfulResult.books) {
          console.log(`📚 Displaying ${lastSuccessfulResult.books.length} books from synced scan`);
          setBooks(lastSuccessfulResult.books);
          setMatchedCount(lastSuccessfulResult.matchedInReadingList || 0);
          await Haptics.notification({ type: NotificationType.Success });
        }

        // Show sync summary
        if (processedCount > 0) {
          alert(i18n.t('offline.syncComplete', { count: processedCount }));
        }
        if (failedCount > 0) {
          console.warn(`${failedCount} scans failed to process`);
        }
      }
    };

    const handleOffline = () => {
      console.log('📴 Going offline...');
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user, API_URL]);

  useEffect(() => {
    const loadPending = async () => {
      const pending = await getPendingScans();
      setPendingScans(pending);
    };
    loadPending();
  }, []);


  const handleCloseWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  const loadScanHistory = async () => {
    if (!user) return;

    try {
      const {data, error} = await supabase
          .from('scans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', {ascending: false})
          .limit(50);

      if (error) throw error;
      setScanHistory(data || []);
    } catch (err) {
      console.error('Error loading scan history:', err);
    }
  };

  const handleSelectBook = async (book) => {
    await Haptics.impact({ style: ImpactStyle.Light });
    openLinkModal(book);
  }

  const saveScan = async (booksData) => {
    if (!user) return;

    setSavingScan(true);
    try {
      const { data: newScan, error} = await supabase
          .from('scans')
          .insert({
            user_id: user.id,
            books: booksData,
            created_at: new Date().toISOString()
          })
          .select('id')
          .single();

      if (error) throw error;

      if (newScan) {
        try {
          const resp = await fetch(`${API_URL}/api/user-books/extract-from-scan/${newScan.id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token}`,
            },
          });
          const bodyText = await resp.text();
          if (!resp.ok) {
            console.error(`❌ extract-from-scan ${resp.status}:`, bodyText.slice(0, 300));
          } else {
            console.log('✅ extract-from-scan:', bodyText.slice(0, 200));
          }
        } catch (extractErr) {
          console.error('❌ extract-from-scan network error:', extractErr);
        }
      }
      await loadScanHistory();
    } catch (err) {
      console.error('Error saving scan:', err);
    } finally {
      setSavingScan(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file) => {
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageToCrop(event.target.result);
      setShowCropModal(true);
      setBooks([]);
      setError('');
      setIsNetworkError(false);
    };
    reader.onerror = () => {
      setError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const scanBooks = async () => {
    await Haptics.impact({style: ImpactStyle.Medium});
    if (!image) return;

    setLoading(true);
    setError('');
    setIsNetworkError(false);
    setBooks([]);
    setMatchedCount(0);

    // Check if offline
    if (!isOnline()) {
      // Queue for later sync
      await queueScanForSync({
        id: Date.now().toString(),
        image: image,
        userId: user?.id,
        timestamp: new Date().toISOString(),
        status: 'pending'
      });

      const pending = await getPendingScans();
      setPendingScans(pending);

      setError(i18n.t('offline.scanQueued'));
      setLoading(false);
      await Haptics.notification({type: NotificationType.Warning});
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image,
          userId: user?.id
        })
      }).catch(err => {
        setIsNetworkError(true);
        throw new Error(`Cannot connect to backend at ${API_URL}. Make sure the backend server is running.`);
      });

      let data;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (jsonError) {
          throw new Error('Backend returned invalid JSON. Check backend logs for errors.');
        }
      } else {
        const text = await response.text();
        throw new Error(`Backend error: ${text.substring(0, 200)}`);
      }

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Too many requests. Please wait a few minutes and try again.');
        }

        throw new Error(data.error || `Server error (${response.status})`);
      }

      if (data.success && data.books) {
        setBooks(data.books);
        setLastScanDate(new Date());
        setMatchedCount(data.matchedInReadingList || 0);
        await Haptics.notification({type: NotificationType.Success});

        // Cache books for offline access
        await cacheBooks(data.books);

        // Auto-save scan for logged-in users
        if (user) {
          await saveScan(data.books);
        }

        if (data.totalProcessed < data.totalFound) {
          setError(`Found ${data.totalFound} books, but could only get ratings for ${data.totalProcessed}`);
        }
      } else {
        throw new Error('Unexpected response from server');
      }

    } catch (err) {
      console.error('Scan error:', err);
      setError(err.message || 'An error occurred while scanning books');
      await Haptics.notification({type: NotificationType.Error});
    } finally {
      setLoading(false);
    }
  };

  const handleEditCurrentScan = async (updatedBooks) => {
    setBooks(updatedBooks);
    setShowEditModal(false);

    if (user && scanHistory.length > 0) {
      try {
        const latestScan = scanHistory[0];
        const response = await fetch(`${API_URL}/api/scans/${latestScan.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({books: updatedBooks})
        });

        if (response.ok) {
          await loadScanHistory();
          console.log('✅ Updated scan in database');
        }
      } catch (err) {
        console.error('Failed to update scan in DB:', err);

      }
    }
  };

  const handleEditCollectionBook = (book) => {
    setEditingCollectionBook(book);
  };

  const handleSaveCollectionBookEdit = async(updatedBooks) => {
    if (!updatedBooks || updatedBooks.length === 0 || !editingCollectionBook) return;

    const updatedBook = updatedBooks[0];

    try {
      const { error } = await supabase
          .from('user_books')
          .update({
              title: updatedBook.title,
              author: updatedBook.author,
              isbn: updatedBook.isbn || null,
              rating: updatedBook.rating || null,
              ratings_count: updatedBook.ratingsCount || updatedBook.ratings_count || 0,
              description: updatedBook.description || null,
              thumbnail: updatedBook.thumbnail || null,
              sources: updatedBook.sources || [],
          })
          .eq('id', editingCollectionBook.id)
          .eq('user_id', user.id);

      if (error) {
        if (error.code === '23505') {
          throw new Error(i18n.t('editBooks.duplicateInCollection'));
        }
        throw error;

      }

      console.log('✅ Collection book updated:', updatedBook.title);
      setEditingCollectionBook(null);
      await loadScanHistory()

    } catch (err) {
        console.error('Failed to update collection book:', err);
        throw err;
    }
  };

  const handleEditHistoryScan = (scan) => {
    setEditingScanId(scan.id);
    setEditingHistoryBooks(scan.books);
  };

  const handleSaveHistoryEdit = async (updatedBooks) => {
    if (!editingScanId || !user) return;

    try {
      const response = await fetch(`${API_URL}/api/scans/${editingScanId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ books: updatedBooks })
      });

      if (!response.ok) {
        throw new Error('Failed to update scan');
      }

      await loadScanHistory();
      setEditingScanId(null);
      setEditingHistoryBooks(null);
      console.log('✅ History scan updated');

    } catch (err) {
      console.error('Failed to update history scan:', err);
      throw err;
    }
  };

  const processSingleScan = async (scanData) => {
    const imageToProcess = scanData.image?.image || scanData.image;
    const userIdToUse = scanData.image?.userId || scanData.userId || user?.id;

    try {
      const response = await fetch(`${API_URL}/api/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageToProcess,
          userId: userIdToUse,
        })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error (${response.status})`);
      }
      const data = await response.json();

      if (data.success && data.books) {
        await cacheBooks(data.books);
        if (user) {
          await saveScan(data.books);
        }
        return data;
      }
      throw new Error('Unexpected response from server');
    } catch (err) {
      console.error('Process scan error:', err);
      throw err;
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setShowHistory(false);
  };

  const displayBooks = showOnlyMatches
      ? books.filter(book => book.inReadingList)
      : books;

  const openLinkModal = (bookData) => {
    setSelectedBook(bookData);
    setShowLinkModal(true);
  };

  const openDescriptModal = (bookData) => {
    setSelectedBook(bookData);
    setShowDescriptModal(true);
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropConfirm = async () => {
    try {
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels, rotation);
      setImage(croppedImage);
      setShowCropModal(false);
      setImageToCrop(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    } catch (e) {
      console.error('Error cropping image:', e);
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setImageToCrop(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleDeleteAccount = async () => {
    try {
      const token = session?.access_token;
      if (!token) {
        throw new Error('Not authenticated');
      }
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      await signOut();
      setShowDeleteAccountModal(false);

      alert(i18n.t('account.scheduledForDeletion'));

    } catch (err) {
      console.error('Delete account error:', err);
      throw err;
    }
  };

  const handleDeleteScan = async (scanId) => {
    try {
      const token = session?.access_token;
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/scans/${scanId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || i18n.t('error.failedToDeleteScan'));
      }

      setScanHistory(prevHistory => prevHistory.filter(scan => scan.id !== scanId));

      if (Capacitor.isNativePlatform()) {
        await Haptics.notification({ type: NotificationType.Success });
      }

    } catch (error) {
      console.error('Error deleting scan:', error);
      alert(i18n.t('error.failedToDeleteScan'));
      throw error;
    }
  };

  const handleViewScanDetail = (scan) => {
    setSelectedScan(scan);
    setShowScanDetailModal(true);
  };

  const handleViewBookFromDetail = (book) => {
    setShowScanDetailModal(false);
    setSelectedBook(book);
    setShowLinkModal(true);
  }

  const takeNativePhoto = async () => {
    await Haptics.impact({style: ImpactStyle.Light});
    setLoading(true);
    try {
      const photo = await CapacitorCamera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        quality: 90,
        saveToGallery: false,
        webUseInput: false
      });

      setImageToCrop(photo.dataUrl);
      setShowCropModal(true);
      setBooks([]);
      setError('');
      setIsNetworkError(false);
    } catch (err) {
      if (err.message !== 'User cancelled photos app') {
        console.error('Camera error:', err);
        setError(i18n.t('error.somethingWentWrong'));
        setIsNetworkError(false);
      }
    } finally {
      setLoading(false);
    }
  };
  const handleShareStats = async (text) => {
    try {
      await CapacitorShare.share({title: 'My ShelfScan stats', text});
    } catch (_) { /* user dismissed the sheet */ }
  };

  const shareBook = async (book) => {
    await Haptics.impact({ style: ImpactStyle.Light });

    try {
      await CapacitorShare.share({
        title: book.title,
        text: `Check out "${book.title}" by ${book.author} - ${book.rating}★ rating!`,
        url: book.goodreadsUrl,
        dialogTitle: 'Share this book',
      });
    } catch (err) {
      console.log('Share cancelled or failed:', err);
    }
  };

  const handleRefresh = async () => {
    await Haptics.impact({ style: ImpactStyle.Medium });
    await loadScanHistory();
  };

  const { pulling, pullDistance } = usePullToRefresh(handleRefresh);

  const topThreeBooks = displayBooks.slice(0, 3);

  return (
      <>
        <DeepLinkHandler/>
        {isOffline && (
            <div className="bg-orange-500 text-white px-4 py-2 text-center text-sm">
              <div className="flex items-center justify-center gap-2">
                <WifiOff className="w-4 h-4" />
                <span>{i18n.t('offline.description')}</span>
                {pendingScans.length > 0 && (
                    <span className="ml-2 bg-orange-600 px-2 py-1 rounded-full">
                      {i18n.t('offline.pendingScans', { count: pendingScans.length})}
                    </span>
                )}
              </div>
            </div>
        )}
        {syncing && (
            <div className="bg-blue-500 text-white px-4 py-2 text-center text-sm">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{i18n.t('offline.processing')}</span>
              </div>
            </div>
        )}
        {!isAppReady ? (
            <div className="h-screen flex items-center justify-center bg-[#F4F2EC] dark:bg-dark-bg">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-ink-600 dark:text-ink-400 animate-spin mx-auto mb-4"/>
                <p className="text-gray-600 dark:text-gray-300">Loading Shelf Scan...</p>
              </div>
            </div>
        ) : (
            <div className="fixed inset-0 bg-[#F4F2EC] dark:bg-dark-bg flex flex-col">
              <div className="flex-1 overflow-hidden pb-16">
                {/* SCAN TAB */}
                {activeTab === 'scan' && (
                    <div className="h-full overflow-y-auto"
                         style={{
                           WebkitOverflowScrolling: 'touch',
                           overscrollBehavior: 'contain'
                         }}>
                      <div className="max-w-6xl mx-auto p-8 pb-8 min-h-full">
                        {/* Description text */}
                        <div className="text-center mb-6 sm:mb-8">
                          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 px-4">{i18n.t('scan.description')}</p>
                          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 px-4">{i18n.t('scan.loginDescription')}</p>

                          {savingScan && (
                              <div className="mt-2 text-sm text-ink-600 dark:text-ink-400">
                                💾 {i18n.t('status.savingScan')}
                              </div>
                          )}
                        </div>

                        {/* Match notification */}
                        {user && matchedCount > 0 && (
                            <div className="mt-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-lg p-4 mb-8">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400"/>
                                  <span className="font-semibold text-emerald-800 dark:text-emerald-200">
                                    {i18n.t('scan.foundFromList', { count: matchedCount})}
                                  </span>
                                </div>
                              </div>
                            </div>
                        )}

                        {/* Upload area */}
                        <div className="bg-surface dark:bg-dark-card border border-line dark:border-dark-border rounded-2xl p-8 mb-8">
                          <div className="flex flex-col items-center gap-4">
                            <label className="w-full cursor-pointer">
                              <div className="border-4 border-dashed border-ink-200 dark:border-ink-700 rounded-lg p-12 text-center hover:border-ink-400 dark:hover:border-ink-500 transition-colors">
                                {image ? (
                                    <img src={image} alt="Uploaded books" className="max-h-96 mx-auto rounded-lg"/>
                                ) : (
                                    <div className="flex flex-col items-center gap-3">
                                      <Upload className="w-16 h-16 text-ink-400 dark:text-ink-500"/>
                                      <p className="text-lg text-gray-600 dark:text-gray-300">{i18n.t('upload.clickToUpload')}</p>
                                      <p className="text-sm text-gray-400 dark:text-gray-500">{i18n.t('upload.fileLimit')}</p>
                                    </div>
                                )}
                              </div>
                              <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  className="hidden"
                              />
                            </label>

                            {!image && (
                                <div className="w-full max-w-md space-y-3">
                                  {/* Primary row: Take Photo and Scan Barcode */}
                                  <div className="flex gap-3">
                                    <button
                                        onClick={takeNativePhoto}
                                        className="flex-1 px-4 py-3 bg-ink-600 dark:bg-ink-500 text-white rounded-full transition-transform active:scale-95 font-semibold hover:bg-ink-700 dark:hover:bg-ink-600 flex items-center justify-center gap-2 text-sm sm:text-base"
                                    >
                                      <Camera className="w-5 h-5 flex-shrink-0"/>
                                      <span className="whitespace-nowrap">{i18n.t('scan.takePhoto')}</span>
                                    </button>

                                    {/*<button
                                        onClick={() => setShowBarcodeScanner(true)}
                                        className="flex-1 px-4 py-3 bg-green-600 dark:bg-green-500 text-white rounded-full font-semibold hover:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                                    >
                                      <Barcode className="w-5 h-5 flex-shrink-0"/>
                                      <span className="whitespace-nowrap">{i18n.t('scan.scanBarcode')}</span>
                                    </button>*/}
                                  </div>

                                  {/* Secondary row: Upload File */}
                                  <label className="block cursor-pointer">
                                    <div className="w-full px-4 py-3 bg-gray-600 dark:bg-gray-700 text-white rounded-full font-semibold hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base">
                                      <Upload className="w-5 h-5 flex-shrink-0"/>
                                      <span>{i18n.t('scan.uploadFile')}</span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                  </label>
                                </div>
                            )}

                            {image && (
                                <div className="flex gap-3">
                                  <button
                                      onClick={scanBooks}
                                      disabled={loading}
                                      className="px-8 py-3 bg-ink-600 dark:bg-ink-500 text-white rounded-full font-semibold hover:bg-ink-700 dark:hover:bg-ink-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95 transition-transform"
                                  >
                                    {loading ? (
                                        <>
                                          <Loader2 className="w-5 h-5 animate-spin"/>
                                          {i18n.t('scan.scanning')}
                                        </>
                                    ) : (
                                        <>
                                          <Book className="w-5 h-5"/>
                                          {i18n.t('scan.scanRateBooks')}
                                        </>
                                    )}
                                  </button>

                                  <button
                                      onClick={() => {
                                        setImage(null);
                                        setBooks([]);
                                        setError('');
                                      }}
                                      disabled={loading}
                                      className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-transform active:scale-95"
                                  >
                                    {i18n.t('scan.clear')}
                                  </button>
                                </div>
                            )}
                          </div>

                          {error && (
                              <div className="mt-4 p-4 border rounded-lg flex items-start gap-3 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5"/>
                                <p>{error}</p>
                              </div>
                          )}
                        </div>

                        {/* Help Text Disclaimer */}
                        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <span className="text-lg">📸</span>
                              <p className="text-sm text-blue-800 dark:text-blue-200">
                                {i18n.t('upload.photoTips')}
                              </p>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-lg">❓</span>
                              <p className="text-sm text-blue-800 dark:text-blue-200">
                                {i18n.t('upload.somethingWrongTryAgain')}
                              </p>
                            </div>
                          </div>
                        </div>
                        {loading && <ScanResults loading t={i18n.t.bind(i18n)} />}
                        {!loading && displayBooks.length > 0 && (

                            <ScanResults
                              books = {books}
                              onSelectBook={handleSelectBook}
                              t={i18n.t.bind(i18n)}
                              headerRight={
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setShowEditModal(true)}
                                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-ink-600 dark:text-ink-300
                                              bg-ink-50 dark:bg-ink-900/40 rounded-lg hover:bg-ink-100 transition-colors active:scale-95"
                                  >
                                    <Edit3 className="w-4 h-4"/>
                                    {i18n.t('editBooks.editBooks') || 'Edit'}
                                  </button>
                                  <ExportButton books={books} scanDate={lastScanDate || new Date()} />
                                </div>
                              }
                            />
                        )}
                      </div>
                    </div>
                )}
                {/* LIBRARY TAB */}
                {activeTab === 'library' && (
                    <div className="h-full overflow-y-auto"
                         style={{
                           WebkitOverflowScrolling: 'touch',
                           overscrollBehavior: 'contain'
                         }}>
                      <div className="max-w-6xl mx-auto p-4 pb-8 sm:p-8 sm:pb-8">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{i18n.t('collection.title')}</h2>
                        {user ? (
                            <LibraryTab session={session} scanHistory={scanHistory} onEditBook={handleEditCollectionBook} />
                        ) : (
                            <EmptyState
                                type="library"
                                onAction={() => setShowAuthModal(true)}
                                actionLabel={i18n.t('auth.signIn')}

                            />
                        )}
                      </div>
                    </div>
                )}

                {/* HISTORY TAB */}
                {activeTab === 'history' && (
                    <div className="h-full overflow-y-auto"
                         style={{
                           WebkitOverflowScrolling: 'touch',
                           overscrollBehavior: 'contain'
                         }}>
                      <div className="max-w-6xl mx-auto p-8 pb-8">
                        {pulling && pullDistance > 40 && (
                            <div
                                className="fixed top-0 left-0 right-0 flex justify-center transition-all"
                                style={{
                                  transform: `translateY(${Math.min(pullDistance - 40, 60)}px)`,
                                  paddingTop: 'env(safe-area-inset-top)'
                                }}
                            >
                              <div className="bg-surface dark:bg-dark-card border border-line dark:border-dark-border rounded-full p-3">
                                <Loader2 className={`w-6 h-6 text-ink-600 dark:text-ink-400 ${pullDistance > 80 ? 'animate-spin' : ''}`} />
                              </div>
                            </div>
                        )}
                        <h2 className="font-display text-3xl font-semibold text-stone-900 dark:text-dark-text mb-6">{i18n.t('history.title')}</h2>
                        {user && scanHistory.length > 0 && (
                            <button
                              onClick={() => setShowBulkExport(true)}
                              className="flex items-center gap-2 px-4 py-2 bg-ink-100 dark:bg-ink-900/30 text-ink-700 dark:text-ink-300 rounded-xl font-medium hover:bg-ink-200 dark:hover:bg-ink-900/50 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              Export All
                            </button>
                        )}
                        {user ? (
                            scanHistory.length === 0 ? (
                                <div className="bg-surface dark:bg-dark-card border border-line dark:border-dark-border rounded-2xl p-8 text-center">
                                  <History className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"/>
                                  <p className="text-gray-500 dark:text-gray-400">{i18n.t('history.empty')}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                  {scanHistory.map((scan) => (
                                      <SwipeableScanItem
                                          key={scan.id}
                                          scan={scan}
                                          onDelete={handleDeleteScan}
                                          onViewDetail={handleViewScanDetail}
                                          onEdit={handleEditHistoryScan}
                                      />
                                  ))}
                                </div>
                            )
                        ) : (
                            <div className="bg-surface dark:bg-dark-card border border-line dark:border-dark-border rounded-2xl p-8 text-center">
                              <p className="text-gray-600 dark:text-gray-300 mb-4">{i18n.t('account.signInToViewHistory')}</p>
                              <button
                                  onClick={() => setShowAuthModal(true)}
                                  className="px-6 py-3 bg-ink-600 dark:bg-ink-500 text-white rounded-full transition-transform active:scale-95 font-semibold hover:bg-ink-700 dark:hover:bg-ink-600"
                              >
                                {i18n.t('profile.signIn')}
                              </button>
                            </div>
                        )}
                      </div>
                    </div>
                )}
                {/* PROFILE TAB */}
                {activeTab === 'profile' && (
                    <div className="h-full overflow-y-auto"
                         style={{
                           WebkitOverflowScrolling: 'touch',
                           overscrollBehavior: 'contain'
                         }}>
                      <div className="max-w-6xl mx-auto p-8 pb-8">
                        <h2 className="font-display text-3xl font-semibold text-stone-900 dark:text-dark-text mb-6">
                          {i18n.t('profile.title')}
                        </h2>
                        {user ? (
                            <div className="space-y-4">
                              {scanHistory.length > 0 && (
                                  <ReadingStats
                                      scanHistory={scanHistory}
                                      t={i18n.t.bind(i18n)}
                                      onShare={handleShareStats}
                                  />
                              )}

                              <div className="bg-surface dark:bg-dark-card border border-line dark:border-dark-border rounded-2xl p-6">
                                <div className="flex items-center gap-4 mb-4">
                                  <div className="w-16 h-16 bg-ink-100 dark:bg-ink-900/50 rounded-full flex items-center justify-center">
                                    <User className="w-8 h-8 text-ink-700 dark:text-ink-300"/>
                                  </div>
                                  <div>
                                    <p className="text-sm text-stone-500 dark:text-dark-muted">{i18n.t('profile.signedInAs')}</p>
                                    <p className="font-semibold text-stone-900 dark:text-dark-text">{user.email}</p>
                                  </div>
                                </div>

                                <div className="border-t border-line dark:border-dark-border pt-4 space-y-3">
                                  <button
                                      onClick={() => setActiveTab('library')}
                                      className="w-full text-left px-4 py-3 bg-paper dark:bg-dark-bg border border-line dark:border-dark-border rounded-xl flex items-center justify-between active:scale-95 transition-transform"
                                  >
                                    <span className="font-medium text-stone-900 dark:text-dark-text">{i18n.t('library.title')}</span>
                                    <BookOpen className="w-5 h-5 text-stone-400 dark:text-dark-muted"/>
                                  </button>

                                  <button
                                      onClick={() => setActiveTab('history')}
                                      className="w-full text-left px-4 py-3 bg-paper dark:bg-dark-bg border border-line dark:border-dark-border rounded-xl flex items-center justify-between active:scale-95 transition-transform"
                                  >
                                    <span className="font-medium text-stone-900 dark:text-dark-text">{i18n.t('history.title')}</span>
                                    <History className="w-5 h-5 text-stone-400 dark:text-dark-muted"/>
                                  </button>

                                  <button
                                      onClick={() => setShowPwChangeModal(true)}
                                      className="w-full text-left px-4 py-3 bg-paper dark:bg-dark-bg border border-line dark:border-dark-border rounded-xl flex items-center justify-between active:scale-95 transition-transform"
                                  >
                                    <span className="font-medium text-stone-900 dark:text-dark-text">{i18n.t('account.changePassword')}</span>
                                    <Key className="w-5 h-5 text-stone-400 dark:text-dark-muted"/>
                                  </button>
                                </div>
                              </div>

                              {/* Sign Out and Delete Account */}
                              <div className="space-y-3">
                                <button
                                    onClick={handleSignOut}
                                    className="w-full px-4 py-3 bg-surface dark:bg-dark-card border border-line dark:border-dark-border text-stone-700 dark:text-dark-text rounded-full font-semibold hover:bg-paper dark:hover:bg-dark-bg transition-colors active:scale-95 flex items-center justify-center gap-2"
                                >
                                  <LogOut className="w-4 h-4" />
                                  {i18n.t('profile.signOut')}
                                </button>

                                <button
                                    onClick={() => setShowDeleteAccountModal(true)}
                                    className="w-full px-4 py-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full font-semibold hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors active:scale-95 flex items-center justify-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  {i18n.t('account.deleteAccount')}
                                </button>
                              </div>

                              {/* Privacy Notice */}
                              <div className="bg-paper dark:bg-dark-bg border border-line dark:border-dark-border rounded-xl p-4">
                                <p className="text-sm text-stone-600 dark:text-dark-muted">
                                  {i18n.t('privacy.dataPrivacy')}
                                </p>
                              </div>
                            </div>
                        ) : (
                            <div className="bg-surface dark:bg-dark-card border border-line dark:border-dark-border rounded-2xl p-8 text-center">
                              <User className="w-16 h-16 text-stone-300 dark:text-dark-border mx-auto mb-4"/>
                              <p className="text-stone-600 dark:text-dark-muted mb-4">{i18n.t('profile.signInDescription')}</p>
                              <button
                                  onClick={() => setShowAuthModal(true)}
                                  className="px-6 py-3 bg-ink-700 text-white rounded-full transition-transform active:scale-95 font-semibold hover:bg-ink-800"
                              >
                                {i18n.t('profile.signIn')}
                              </button>
                            </div>
                        )}

                        {/* Theme and Language Settings */}
                        <div className="bg-surface dark:bg-dark-card border border-line dark:border-dark-border rounded-2xl p-6 mt-4">
                          <h3 className="font-display text-lg font-semibold text-stone-900 dark:text-dark-text mb-4">{i18n.t('account.settings')}</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <ThemeToggle />
                            </div>
                            <div className="flex items-center justify-between">
                              <LanguageSelector />
                            </div>
                          </div>
                        </div>

                        {/* Thank you message - VISIBLE TO EVERYONE */}
                        <div className="text-center mt-6">
                          <p className="text-sm text-stone-600 dark:text-dark-muted">
                            <a href="mailto:admin@shelfscan.xyz" className="text-ink-700 dark:text-ink-300 hover:underline">
                              {i18n.t('feedback.thanksForUsing')}
                            </a>
                          </p>
                        </div>
                        <div className="text-center mt-6">
                          <a href="#"
                             onClick={(e) => {
                               e.preventDefault();
                               setShowPrivacyModal(true)
                             }}
                             className="text-xs text-ink-700 dark:text-ink-300 hover:text-ink-800 dark:hover:text-ink-200 hover:underline"
                          >
                            {i18n.t('privacy.privacyPolicy')}
                          </a>
                        </div>
                      </div>
                    </div>
                )}

                {/* Crop Modal */}
                {showCropModal && (
                    <div className="fixed inset-0 bg-black z-50 flex flex-col">
                      {/* Crop Header */}
                      <div className="bg-gray-900 text-white px-4 py-3 pt-safe flex justify-between items-center flex-shrink-0">
                        <button
                            onClick={handleCropCancel}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors active:scale-95"
                        >
                          <X className="w-6 h-6" />
                        </button>
                        <h3 className="text-lg font-semibold">{i18n.t('imageEditor.adjustPhoto')}</h3>
                        <button
                            onClick={handleCropConfirm}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors active:scale-95"
                        >
                          <Check className="w-6 h-6 text-green-400" />
                        </button>
                      </div>

                      {/* Crop Area - Takes remaining space */}
                      <div className="flex-1 relative min-h-0 overflow-hidden">
                        <Cropper
                            image={imageToCrop}
                            crop={crop}
                            zoom={zoom}
                            rotation={rotation}
                            aspect={undefined}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                            objectFit="contain"
                        />
                      </div>

                      {/* Crop Controls - Fixed at bottom with safe area padding */}
                      <div className="bg-gray-900 text-white px-4 pt-4 space-y-4 flex-shrink-0" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 3.5rem)' }}>
                        {/* Zoom Control */}
                        <div>
                          <label className="block text-sm mb-2">{i18n.t('imageEditor.zoom')}</label>
                          <input
                              type="range"
                              min={1}
                              max={3}
                              step={0.1}
                              value={zoom}
                              onChange={(e) => setZoom(parseFloat(e.target.value))}
                              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-ink-600"
                          />
                        </div>

                        {/* Rotate Button */}
                        <button
                            onClick={handleRotate}
                            className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors active:scale-95 flex items-center justify-center gap-2"
                        >
                          <RotateCw className="w-5 h-5" />
                          {i18n.t('imageEditor.rotate90')}
                        </button>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pb-4">
                          <button
                              onClick={handleCropCancel}
                              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors active:scale-95 font-semibold"
                          >
                            {i18n.t('common.cancel')}
                          </button>
                          <button
                              onClick={handleCropConfirm}
                              className="flex-1 px-4 py-3 bg-ink-600 hover:bg-ink-700 rounded-lg transition-colors active:scale-95 font-semibold"
                          >
                            {i18n.t('imageEditor.usePhoto')}
                          </button>
                        </div>
                      </div>
                    </div>
                )}
              </div>
              {/* Tab Bar - MUST be outside the scrolling container to stay fixed */}
              <TabBar activeTab={activeTab} onTabChange={setActiveTab}/>
            </div>
        )}

        {/* Modals - outside main container */}
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

        <LinkModal
            show={showLinkModal}
            onClose={() => setShowLinkModal(false)}
            book={selectedBook}
        />
        <DescriptModal
            show={showDescriptModal}
            onClose={() => setShowDescriptModal(false)}
            book={selectedBook}
        />
        <PrivacyModal
            isOpen={showPrivacyModal}
            onClose={() => setShowPrivacyModal(false)}
        />
        <PwChangeModal
            isOpen={showPwChangeModal}
            onClose={() => setShowPwChangeModal(false)}
        />
        <WelcomeModal
            isOpen={showWelcome}
            onClose={handleCloseWelcome}
        />
        <DeleteAccountModal
            isOpen={showDeleteAccountModal}
            onClose={() => setShowDeleteAccountModal(false)}
            onConfirmDelete={handleDeleteAccount}
            userEmail={user?.email}
        />
        <ScanDetailModal
          isOpen={showScanDetailModal}
          onClose={() => setShowScanDetailModal(false)}
          scan={selectedScan}
          onViewBook={handleViewBookFromDetail}
        />
        <BulkExportModal
          isOpen={showBulkExport}
          onClose={() => setShowBulkExport(false)}
          scanHistory={scanHistory}
        />

        {showEditModal && books.length > 0 && (
            <EditBooksModal
              books={books}
              onSave={handleEditCurrentScan}
              onClose={() => setShowEditModal(false)}
              userId={user?.id}
            />
        )}

        {editingHistoryBooks && (
            <EditBooksModal
              books={editingHistoryBooks}
              onSave={handleSaveHistoryEdit}
              onClose={() => {
                setEditingScanId(null);
                setEditingHistoryBooks(null);
              }}
              userId={user?.id}
            />
        )}

        {editingCollectionBook && (
            <EditBooksModal
              books={[editingCollectionBook]}
              onSave={handleSaveCollectionBookEdit}
              onClose={() => setEditingCollectionBook(null)}
              userId={user?.id}
            />
        )}

        <BarcodeScanner
            show={showBarcodeScanner}
            onClose={() => setShowBarcodeScanner(false)}
            onScanComplete={(books) => {
              setBooks(books);
              setShowBarcodeScanner(false);
            }}
            API_URL={API_URL}
            user={user}
        />
        <HelpButton />
      </>
  );
}

function AppWrapper() {
  return (
      <ThemeProvider>
        <App />
      </ThemeProvider>
  );
}

export default AppWrapper;