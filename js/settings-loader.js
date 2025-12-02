// Global Settings Loader for Tabit
// This file should be included on ALL pages to ensure consistent theming

class GlobalSettingsLoader {
    constructor() {
        this.loadAndApplySettings();
    }

    loadAndApplySettings() {
        const defaultSettings = {
            darkMode: true,
            compactView: false,
            accentColor: 'blue',
            defaultView: 'month',
            autoFillToday: true,
            showStats: true,
            weekStart: 'sunday',
            autoSave: true,
            dailyPrompts: false,
            fontSize: 'medium',
            wordCount: true,
            dailyReminders: false,
            reminderTime: 'evening',
            weeklySummary: true,
            backupFrequency: 'weekly'
        };

        // Load saved settings or use defaults
        const saved = localStorage.getItem('tabit-settings');
        const settings = saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;

        // Apply all visual settings
        this.applyThemeSettings(settings);
        
        // Make settings available globally
        window.TABIT_SETTINGS = settings;
    }

    applyThemeSettings(settings) {
        const root = document.documentElement;

        // Apply dark/light mode
        if (settings.darkMode) {
            root.style.setProperty('--primary-bg', '#0a0b0d');
            root.style.setProperty('--secondary-bg', '#141518');
            root.style.setProperty('--card-bg', '#1a1b1e');
            root.style.setProperty('--border-color', '#2a2b2e');
            root.style.setProperty('--text-primary', '#f1f3f4');
            root.style.setProperty('--text-secondary', '#9aa0a6');
            root.style.setProperty('--text-muted', '#5f6368');
        } else {
            // Light mode colors
            root.style.setProperty('--primary-bg', '#ffffff');
            root.style.setProperty('--secondary-bg', '#f8f9fa');
            root.style.setProperty('--card-bg', '#ffffff');
            root.style.setProperty('--border-color', '#e1e4e8');
            root.style.setProperty('--text-primary', '#24292f');
            root.style.setProperty('--text-secondary', '#656d76');
            root.style.setProperty('--text-muted', '#8b949e');
        }

        // Apply accent color
        const accentColors = {
            blue: '#4285f4',
            green: '#34a853',
            purple: '#9c27b0',
            red: '#ea4335',
            yellow: '#fbbc04'
        };
        
        const selectedColor = accentColors[settings.accentColor] || accentColors.blue;
        root.style.setProperty('--accent-blue', selectedColor);

        // Apply compact view
        if (settings.compactView) {
            document.body.classList.add('compact-mode');
        } else {
            document.body.classList.remove('compact-mode');
        }

        // Apply font size for journal pages
        if (settings.fontSize && this.isJournalPage()) {
            const fontSizes = {
                small: '0.9rem',
                medium: '1rem',
                large: '1.1rem'
            };
            
            root.style.setProperty('--journal-font-size', fontSizes[settings.fontSize] || fontSizes.medium);
        }
    }

    isJournalPage() {
        return window.location.pathname.includes('journal.html');
    }

    // Method to update settings from any page
    static updateSetting(key, value) {
        const saved = localStorage.getItem('tabit-settings');
        const settings = saved ? JSON.parse(saved) : {};
        settings[key] = value;
        localStorage.setItem('tabit-settings', JSON.stringify(settings));
        
        // Immediately apply the change
        new GlobalSettingsLoader();
        
        // Notify other components if needed
        window.dispatchEvent(new CustomEvent('tabitSettingsChanged', { 
            detail: { key, value, allSettings: settings }
        }));
    }

    // Get a specific setting value
    static getSetting(key) {
        const saved = localStorage.getItem('tabit-settings');
        if (!saved) return null;
        
        const settings = JSON.parse(saved);
        return settings[key];
    }
}

// Auto-load settings when this script is included
document.addEventListener('DOMContentLoaded', () => {
    new GlobalSettingsLoader();
});

// Expose globally for easy access
window.GlobalSettingsLoader = GlobalSettingsLoader;