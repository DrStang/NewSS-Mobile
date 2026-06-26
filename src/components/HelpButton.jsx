import React, { useState } from 'react';
import { HelpCircle, X, Camera, BookOpen, History, User, Download, Pencil, Library } from 'lucide-react';
import { Capacitor } from "@capacitor/core";
import i18n from '../utils/i18n';

const HelpButton = () => {
    const [showHelp, setShowHelp] = useState(false);
    const platform = Capacitor.getPlatform();
    const isAndroid = platform === 'android';
    const isIOS = platform === 'ios';

    return (
        <>
            {/* Help Button - Fixed Position */}
            <button
                onClick={() => setShowHelp(true)}
                className="fixed bottom-24 right-6 w-14 h-14 bg-ink-600 text-white rounded-full shadow-lg hover:bg-ink-700 transition-all hover:scale-110 z-40 flex items-center justify-center"
                aria-label="Help"
            >
                <HelpCircle className="w-6 h-6" />
            </button>

            {/* Help Modal/Sidebar */}
            {showHelp && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50"
                        onClick={() => setShowHelp(false)}
                    />

                    {/* Slide-in Panel */}
                    <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto"
                         style={{ WebkitOverflowScrolling: 'touch' }}>
                        {/* Header - Sticky with safe area */}
                        <div className="sticky top-0 bg-gradient-to-br from-ink-600 to-ink-700 text-white shadow-md z-10"
                             style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))', paddingBottom: '1.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold mb-1">
                                        {i18n.t('help.title')}
                                    </h2>
                                    <p className="text-ink-100 text-sm">
                                        {i18n.t('help.subtitle')}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowHelp(false)}
                                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6"
                             style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>

                            {/* How It Works */}
                            <section>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                                    {i18n.t('help.quickStart')}
                                </h3>
                                <div className="space-y-3">
                                    <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-600 dark:border-blue-400 p-4 rounded">
                                        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                            {i18n.t('help.step1Title')}
                                        </p>
                                        <p className="text-sm text-blue-800 dark:text-blue-200">
                                            {i18n.t('help.step1Desc')}
                                        </p>
                                    </div>
                                    <div className="bg-purple-50 dark:bg-purple-900/30 border-l-4 border-purple-600 dark:border-purple-400 p-4 rounded">
                                        <p className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                                            {i18n.t('help.step2Title')}
                                        </p>
                                        <p className="text-sm text-purple-800 dark:text-purple-200">
                                            {i18n.t('help.step2Desc')}
                                        </p>
                                    </div>
                                    <div className="bg-ink-50 dark:bg-ink-900/30 border-l-4 border-ink-600 dark:border-ink-400 p-4 rounded">
                                        <p className="font-semibold text-ink-900 dark:text-ink-100 mb-2">
                                            {i18n.t('help.step3Title')}
                                        </p>
                                        <p className="text-sm text-ink-800 dark:text-ink-200">
                                            {i18n.t('help.step3Desc')}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Pro Tips */}
                            <section>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                                    {i18n.t('help.proTips')}
                                </h3>
                                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4">
                                    <p className="font-semibold text-green-800 dark:text-green-200 mb-2">
                                        {i18n.t('help.bestResults')}
                                    </p>
                                    <ul className="text-sm text-green-700 dark:text-green-300 space-y-1 ml-4">
                                        <li>• {i18n.t('help.tip1')}</li>
                                        <li>• {i18n.t('help.tip2')}</li>
                                        <li>• {i18n.t('help.tip3')}</li>
                                        <li>• {i18n.t('help.tip4')}</li>
                                    </ul>
                                </div>
                            </section>

                            {/* Optional Features (account) */}
                            <section>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                                    {i18n.t('help.optionalFeatures')}
                                </h3>
                                <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-3">
                                    <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                                        <strong>{i18n.t('help.noAccountNeeded')}</strong>
                                    </p>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                    {i18n.t('help.createAccountToUnlock')}
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <History className="w-5 h-5 text-ink-600 dark:text-ink-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                                                {i18n.t('help.featureScanHistory')}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                {i18n.t('help.featureScanHistoryDesc')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <BookOpen className="w-5 h-5 text-ink-600 dark:text-ink-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                                                {i18n.t('help.featureGoodreads')}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                {i18n.t('help.featureGoodreadsDesc')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <User className="w-5 h-5 text-ink-600 dark:text-ink-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                                                {i18n.t('help.featureLibrary')}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                {i18n.t('help.featureLibraryDesc')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* ===== NEW: Export Scans ===== */}
                            <section>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                                    {i18n.t('help.exportTitle')}
                                </h3>
                                <div className="bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-700 rounded-lg p-4">
                                    <p className="text-sm text-sky-800 dark:text-sky-200 mb-3">
                                        {i18n.t('help.exportDesc')}
                                    </p>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-3 p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                                            <Download className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                                                    {i18n.t('help.exportSingleTitle')}
                                                </p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    {i18n.t('help.exportSingleDesc')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                                            <Download className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                                                    {i18n.t('help.exportBulkTitle')}
                                                </p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    {i18n.t('help.exportBulkDesc')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-sky-700 dark:text-sky-300 mt-3 italic">
                                        {i18n.t('help.exportFormats')}
                                    </p>
                                </div>
                            </section>

                            {/* ===== NEW: Edit & Add Books ===== */}
                            <section>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                                    {i18n.t('help.editBooksTitle')}
                                </h3>
                                <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
                                    <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
                                        {i18n.t('help.editBooksDesc')}
                                    </p>
                                    <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-2 ml-4">
                                        <li>• <strong>{i18n.t('help.editBooksCorrect')}</strong> — {i18n.t('help.editBooksCorrectDesc')}</li>
                                        <li>• <strong>{i18n.t('help.editBooksAdd')}</strong> — {i18n.t('help.editBooksAddDesc')}</li>
                                        <li>• <strong>{i18n.t('help.editBooksRemove')}</strong> — {i18n.t('help.editBooksRemoveDesc')}</li>
                                        <li>• <strong>{i18n.t('help.editBooksBarcode')}</strong> — {i18n.t('help.editBooksBarcodeDesc')}</li>
                                    </ul>
                                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-3 italic">
                                        {i18n.t('help.editBooksHint')}
                                    </p>
                                </div>
                            </section>

                            {/* ===== NEW: Collection & Shelves ===== */}
                            <section>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                                    {i18n.t('help.collectionTitle')}
                                </h3>
                                <div className="bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700 rounded-lg p-4">
                                    <p className="text-sm text-violet-800 dark:text-violet-200 mb-3">
                                        {i18n.t('help.collectionDesc')}
                                    </p>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-3 p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                                            <Library className="w-4 h-4 text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                                                    {i18n.t('help.collectionShelvesTitle')}
                                                </p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    {i18n.t('help.collectionShelvesDesc')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                                            <Pencil className="w-4 h-4 text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                                                    {i18n.t('help.collectionSearchTitle')}
                                                </p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    {i18n.t('help.collectionSearchDesc')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <ul className="text-sm text-violet-700 dark:text-violet-300 space-y-1 ml-4 mt-3">
                                        <li>• {i18n.t('help.collectionImport')}</li>
                                        <li>• {i18n.t('help.collectionDuplicates')}</li>
                                        <li>• {i18n.t('help.collectionStats')}</li>
                                    </ul>
                                </div>
                            </section>

                            {/* Goodreads Import - Android */}
                            {isAndroid && (
                                <section>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                                        {i18n.t('help.importGoodreads')}
                                    </h3>
                                    <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-lg p-4">
                                        <p className="text-sm text-emerald-800 dark:text-emerald-200 mb-3">
                                            {i18n.t('help.importDesc')}
                                        </p>
                                        <div className="space-y-2 text-sm text-emerald-700 dark:text-emerald-300">
                                            <ol className="ml-4 space-y-1 list-decimal">
                                                <li>{i18n.t('help.importAndroid1')}</li>
                                                <li>{i18n.t('help.importAndroid2')}</li>
                                                <li>{i18n.t('help.importAndroid3')}</li>
                                                <li>{i18n.t('help.importAndroid4')}</li>
                                                <li>{i18n.t('help.importAndroid5')}</li>
                                                <li>{i18n.t('help.importAndroid6')}</li>
                                            </ol>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Goodreads Import - iOS */}
                            {isIOS && (
                                <section>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                                        {i18n.t('help.importGoodreads')}
                                    </h3>
                                    <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-lg p-4">
                                        <p className="text-sm text-emerald-800 dark:text-emerald-200 mb-3">
                                            {i18n.t('help.importDesc')}
                                        </p>
                                        <div className="space-y-2 text-sm text-emerald-700 dark:text-emerald-300">
                                            <ol className="ml-4 space-y-1 list-decimal">
                                                <li>{i18n.t('help.importIOS1')}</li>
                                                <li>{i18n.t('help.importIOS2')}</li>
                                                <li>{i18n.t('help.importIOS3')}</li>
                                                <li>{i18n.t('help.importIOS4')}</li>
                                                <li>{i18n.t('help.importIOS5')}</li>
                                                <li>{i18n.t('help.importIOS6')}</li>
                                                <li>{i18n.t('help.importIOS7')}</li>
                                            </ol>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Troubleshooting */}
                            <section>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                                    {i18n.t('help.troubleshooting')}
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                                            {i18n.t('help.troubleNotRecognized')}
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {i18n.t('help.troubleNotRecognizedDesc')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                                            {i18n.t('help.troubleWrongResults')}
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {i18n.t('help.troubleWrongResultsDesc')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                                            {i18n.t('help.troubleNetwork')}
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {i18n.t('help.troubleNetworkDesc')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                                            {i18n.t('help.troubleTooMany')}
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {i18n.t('help.troubleTooManyDesc')}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Contact */}
                            <section className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                    {i18n.t('help.needMoreHelp')}{' '}
                                    <a
                                        href="mailto:admin@shelfscan.xyz"
                                        className="text-ink-600 dark:text-ink-400 hover:text-ink-700 dark:hover:text-ink-300 font-semibold"
                                    >
                                        {i18n.t('help.contactUs')}
                                    </a>
                                </p>
                            </section>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default HelpButton;