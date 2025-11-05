                className="w-full h-full md:max-w-6xl md:h-[80vh] bg-bg-primary/80 rounded-none md:rounded-2xl border border-border-color shadow-2xl flex flex-col p-4 sm:p-6 animate-slide-up"
import { AppID } from '../types';
import { SparklesIcon } from './Icons';
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-text-primary">App Launcher</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        aria-label="Close app launcher"
                    >
                        ✕
                    </button>
                </div>

                {/* Search */}

/**
                    <label htmlFor="app-search-input" className="sr-only">Search apps and agents</label>
 */
                        id="app-search-input"
    /** The unique identifier for the application. */
    id: AppID;
    /** The display name of the application. */
    name: string;
    /** A short description of what the app does. */
    description: string;
                        role="searchbox"
    category: string;
    /** The React component for the application's icon. */

                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                                selectedCategory === category
                                    ? 'bg-primary-blue text-white'
                                    : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-text-primary'
                            }`}
                        >
                            {category === 'all' ? 'All Apps' : category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Apps Grid */}
    icon: React.FC<{ className: string }>;
                    {Object.entries(appsByCategory).map(([category, apps]) => (
                        <div key={category} className="mb-8">
                            <h3 className="text-lg font-semibold text-text-primary mb-4 capitalize">
                                {category}
                            </h3>
                            <div role="grid" aria-label={`${category} applications`} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {apps.map(app => {
                                    const Icon = app.icon;
                                    return (
                                        <button
                                            key={app.id}
                                            onClick={() => onOpen(app.id)}
                                            className="group flex flex-col items-center justify-start gap-3 text-center p-4 rounded-xl bg-bg-secondary hover:bg-bg-tertiary transition-all duration-200 hover:scale-105"
                                            aria-label={`Open ${app.name}`}
                                            title={app.description}
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-bg-primary flex items-center justify-center text-text-secondary group-hover:text-text-primary transition-colors">
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-sm font-medium text-text-primary leading-tight">
                                                    {app.name}
                                                </span>
                                                <span className="text-xs text-text-muted leading-tight line-clamp-2">
                                                    {app.description}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {filteredApps.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <SparklesIcon className="w-12 h-12 text-text-muted mb-4" />
                            <p className="text-center text-text-muted">
                                {searchTerm ? 'No apps found matching your search.' : 'No apps in this category.'}
                            </p>
                        </div>
                    )}
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    /**
     * Get unique categories from all apps.
     */
    const categories = useMemo(() => {
        const cats = ['all', ...Array.from(new Set(allApps.map(app => app.category)))];
        return cats;
    }, [allApps]);

    /**
     * Memoized list of applications, filtered by search term and category.
     */
    const filteredApps = useMemo(() => {
        let apps = allApps;

        if (selectedCategory !== 'all') {
            apps = apps.filter(app => app.category === selectedCategory);
        }

        if (searchTerm) {
            apps = apps.filter(app =>
                app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return apps;
    }, [searchTerm, selectedCategory, allApps]);

    /**
     * Group filtered apps by category for display.
     */
    const appsByCategory = useMemo(() => {
        const grouped: Record<string, AppDef[]> = {};
        filteredApps.forEach(app => {
            if (!grouped[app.category]) {
                grouped[app.category] = [];
            }
            grouped[app.category].push(app);
        });
        return grouped;
    }, [filteredApps]);

    return (
        <div 
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xl flex items-center justify-center animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="App Launcher"
        >
            <div 
                className="w-full h-full md:max-w-2xl md:h-[70vh] bg-bg-primary/80 rounded-none md:rounded-2xl border border-border-color shadow-2xl flex flex-col p-4 sm:p-6 animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative mb-6">
                    <SparklesIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <label htmlFor="app-search-input" className="sr-only">Search apps and agents</label> {/* Accessible label for search input */}
                    <input 
                        id="app-search-input" // Connect label to input
                        type="text"
                        placeholder="Search apps and agents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-12 bg-white/5 border border-border-color rounded-lg pl-12 pr-4 text-text-primary focus:ring-2 focus:ring-accent focus:outline-none text-base"
                        autoFocus
                        role="searchbox" // ARIA role for a search input
                    />
                </div>
                <div className="flex-grow overflow-y-auto pr-2">
                     <div role="grid" aria-label="Applications" className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-6">
                        {filteredApps.map(app => {
                            const Icon = app.icon;
                            return (
                                <button
                                    key={app.id}
                                    onClick={() => onOpen(app.id)}
                                    className="flex flex-col items-center justify-start gap-2 text-center group"
                                    aria-label={`Open ${app.name}`} // Accessible label for each app button
                                >
                                    <div className="w-16 h-16 rounded-xl bg-bg-secondary flex items-center justify-center text-text-secondary shadow-lg group-hover:scale-110 group-hover:text-text-primary transition-all duration-200">
                                        <Icon className="w-8 h-8" />
                                    </div>
                                    <span className="text-xs font-medium text-text-primary">{app.name}</span>
                                </button>
                            );
                        })}
                     </div>
                     {filteredApps.length === 0 && (
                        <p className="text-center text-text-muted py-8" role="status">No apps found matching your search.</p>
                     )}
                </div>
            </div>
        </div>
    );
};

export default AppLauncher;