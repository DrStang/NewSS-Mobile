// ============================================================
// LibraryTab.jsx - Library tab with subtabs (i18n version)
// Replace: frontend/src/components/LibraryTab.jsx
// ============================================================

import React, { useState } from 'react';
import { Library, BookOpen } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import MyCollection from './MyCollection';
import ReadingList from '../ReadingList';
import i18n from '../utils/i18n';

function LibraryTab({ session, scanHistory, onEditBook }) {
    const [activeSubtab, setActiveSubtab] = useState('collection');

    const handleTabSwitch = async (tab) => {
        if (tab === activeSubtab) return;
        if (Capacitor.isNativePlatform()) {
            await Haptics.impact({ style: ImpactStyle.Light });
        }
        setActiveSubtab(tab);
    };

    const tabClass = (active) =>
        `flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
            active
                ? 'bg-surface dark:bg-dark-card text-ink-700 dark:text-ink-300 shadow-sm'
                : 'text-stone-500 dark:text-dark-muted hover:text-stone-700 dark:hover:text-dark-text'
        }`;

    return (
        <div className="space-y-4">
            {/* Subtab Toggle */}
            <div className="flex bg-paper dark:bg-dark-bg border border-line dark:border-dark-border rounded-xl p-1">
                <button onClick={() => handleTabSwitch('collection')} className={tabClass(activeSubtab === 'collection')}>
                    <Library className="w-4 h-4" />
                    {i18n.t('collection.myCollection')}
                </button>
                <button onClick={() => handleTabSwitch('goodreads')} className={tabClass(activeSubtab === 'goodreads')}>
                    <BookOpen className="w-4 h-4" />
                    {i18n.t('collection.goodreadsImport')}
                </button>
            </div>

            {/* Subtab Content */}
            {activeSubtab === 'collection' ? (
                <MyCollection session={session} scanHistory={scanHistory} onEditBook={onEditBook} />
            ) : (
                <ReadingList isOpen={true} onClose={() => setActiveSubtab('collection')} />
            )}
        </div>
    );
}

export default LibraryTab;