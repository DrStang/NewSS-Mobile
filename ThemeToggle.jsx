// ThemeToggle.jsx - Theme switcher component
import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import i18n from '../utils/i18n';

function ThemeToggle({ variant = 'full' }) {
    const { theme, setTheme, isDark } = useTheme();

    const handleThemeChange = async (newTheme) => {
        await Haptics.impact({ style: ImpactStyle.Light });
        setTheme(newTheme);
    };

    // Compact toggle button (for header)
    if (variant === 'compact') {
        return (
            <button
                onClick={() => handleThemeChange(isDark ? 'light' : 'dark')}
                className="p-2 rounded-full bg-paper dark:bg-dark-card border border-line dark:border-dark-border hover:bg-line dark:hover:bg-dark-bg transition-colors active:scale-95"
                aria-label="Toggle theme"
            >
                {isDark ? (
                    <Sun className="w-5 h-5 text-foil-500" />
                ) : (
                    <Moon className="w-5 h-5 text-gray-600" />
                )}
            </button>
        );
    }

    // Full theme selector (for settings page)
    return (
        <div className="bg-surface dark:bg-dark-card border border-line dark:border-dark-border rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-stone-900 dark:text-dark-text mb-4">
                Appearance
            </h3>

            <div className="grid grid-cols-3 gap-3">
                <button
                    onClick={() => handleThemeChange('light')}
                    className={`p-4 rounded-lg border-2 transition-all active:scale-95 ${
                        theme === 'light'
                            ? 'border-ink-500 bg-ink-50 dark:bg-ink-900/40'
                            : 'border-line dark:border-dark-border bg-paper dark:bg-dark-bg'
                    }`}
                >
                    <Sun className={`w-8 h-8 mx-auto mb-2 ${
                        theme === 'light' ? 'text-ink-600' : 'text-stone-400 dark:text-dark-muted'
                    }`} />
                    <p className={`text-sm font-medium ${
                        theme === 'light' ? 'text-ink-600 dark:text-ink-400' : 'text-stone-500 dark:text-dark-muted'
                    }`}>
                        {i18n.t('theme.light')}
                    </p>
                </button>

                <button
                    onClick={() => handleThemeChange('dark')}
                    className={`p-4 rounded-lg border-2 transition-all active:scale-95 ${
                        theme === 'dark'
                            ? 'border-ink-500 bg-ink-50 dark:bg-ink-900/40'
                            : 'border-line dark:border-dark-border bg-paper dark:bg-dark-bg'
                    }`}
                >
                    <Moon className={`w-8 h-8 mx-auto mb-2 ${
                        theme === 'dark' ? 'text-ink-600 dark:text-ink-400' : 'text-stone-400 dark:text-dark-muted'
                    }`} />
                    <p className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-ink-600 dark:text-ink-400' : 'text-stone-500 dark:text-dark-muted'
                    }`}>
                        {i18n.t('theme.dark')}
                    </p>
                </button>

                <button
                    onClick={() => handleThemeChange('system')}
                    className={`p-4 rounded-lg border-2 transition-all active:scale-95 ${
                        theme === 'system'
                            ? 'border-ink-500 bg-ink-50 dark:bg-ink-900/40'
                            : 'border-line dark:border-dark-border bg-paper dark:bg-dark-bg'
                    }`}
                >
                    <Monitor className={`w-8 h-8 mx-auto mb-2 ${
                        theme === 'system' ? 'text-ink-600 dark:text-ink-400' : 'text-stone-400 dark:text-dark-muted'
                    }`} />
                    <p className={`text-sm font-medium ${
                        theme === 'system' ? 'text-ink-600 dark:text-ink-400' : 'text-stone-500 dark:text-dark-muted'
                    }`}>
                        {i18n.t('theme.system')}
                    </p>
                </button>
            </div>

            <p className="mt-4 text-sm text-gray-500 dark:text-stone-400 dark:text-dark-muted">
                {i18n.t('theme.description')}
            </p>
        </div>
    );
}

export default ThemeToggle;