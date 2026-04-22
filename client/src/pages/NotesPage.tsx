import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotes } from '../context/NotesContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    FiPlus,
    FiSearch,
    FiFilter,
    FiGrid,
    FiList,
    FiBookmark,
    FiHeart,
    FiEdit3,
    FiTrash2,
    FiTag,
    FiBookOpen,
    FiFileText,
    FiTarget,
    FiMoreVertical,
    FiX,
    FiSave,
    FiEye,
    FiEyeOff,
    FiStar,
    FiClock,
    FiCalendar
} from 'react-icons/fi';

const NotesPage: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const {
        notes,
        templates,
        searchQuery,
        selectedTags,
        selectedType,
        sortBy,
        addNote,
        updateNote,
        deleteNote,
        pinNote,
        unpinNote,
        favoriteNote,
        unfavoriteNote,
        useTemplate,
        getFilteredNotes,
        getAllTags,
        setSearchQuery,
        setSelectedTags,
        setSelectedType,
        setSortBy
    } = useNotes();

    const [showNewNoteModal, setShowNewNoteModal] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [editingNote, setEditingNote] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // New note form state
    const [newNote, setNewNote] = useState({
        title: '',
        content: '',
        type: 'general' as 'story' | 'skill' | 'general',
        tags: [] as string[],
        color: 'default' as 'default' | 'blue' | 'green' | 'yellow' | 'red' | 'purple',
        relatedId: ''
    });

    // Auto-save functionality
    useEffect(() => {
        if (editingNote && newNote.content) {
            const autoSaveTimer = setTimeout(() => {
                handleAutoSave();
            }, 2000); // Auto-save after 2 seconds of inactivity

            return () => clearTimeout(autoSaveTimer);
        }
    }, [newNote.content, editingNote]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [newNote.content]);

    const handleAutoSave = async () => {
        if (!editingNote || !newNote.content.trim()) return;

        setIsAutoSaving(true);
        try {
            await updateNote(editingNote, {
                title: newNote.title,
                content: newNote.content,
                type: newNote.type,
                tags: newNote.tags,
                color: newNote.color,
                relatedId: newNote.relatedId
            });
        } catch (error) {
            showToast('Auto-save failed', 'error');
        } finally {
            setIsAutoSaving(false);
        }
    };

    const handleCreateNote = async () => {
        if (!newNote.title.trim() || !newNote.content.trim()) {
            showToast('Please fill in both title and content', 'error');
            return;
        }

        try {
            const noteId = await addNote({
                title: newNote.title,
                content: newNote.content,
                type: newNote.type,
                tags: newNote.tags,
                color: newNote.color,
                relatedId: newNote.relatedId
            });

            console.log('Note created with ID:', noteId);
            showToast('Note created successfully!', 'success');

            // Reset form
            setNewNote({
                title: '',
                content: '',
                type: 'general',
                tags: [],
                color: 'default',
                relatedId: ''
            });

            // Close modal
            setShowNewNoteModal(false);

            // Ensure we stay on the notes page
            window.history.replaceState(null, '', '/notes');

        } catch (error) {
            console.error('Error creating note:', error);
            showToast('Failed to create note', 'error');
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (window.confirm('Are you sure you want to delete this note?')) {
            try {
                await deleteNote(noteId);
                showToast('Note deleted successfully', 'success');
            } catch (error) {
                showToast('Failed to delete note', 'error');
            }
        }
    };

    const handleExportNotes = async () => {
        setIsExporting(true);
        try {
            const notesData = {
                exportedAt: new Date().toISOString(),
                totalNotes: notes.length,
                notes: notes.map(note => ({
                    title: note.title,
                    content: note.content,
                    type: note.type,
                    tags: note.tags,
                    color: note.color,
                    createdAt: note.createdAt,
                    updatedAt: note.updatedAt,
                    isPinned: note.isPinned,
                    isFavorite: note.isFavorite
                }))
            };

            const dataStr = JSON.stringify(notesData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `notes-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            showToast('Notes exported successfully!', 'success');
        } catch (error) {
            showToast('Failed to export notes', 'error');
        } finally {
            setIsExporting(false);
        }
    };

    const [newTag, setNewTag] = useState('');

    const filteredNotes = getFilteredNotes();
    const allTags = getAllTags();
    const pinnedNotes = filteredNotes.filter(note => note.isPinned);
    const regularNotes = filteredNotes.filter(note => !note.isPinned);

    const handleUseTemplate = async (templateId: string) => {
        await useTemplate(templateId);
        setShowTemplateModal(false);
    };

    const handleAddTag = () => {
        if (newTag.trim() && !newNote.tags.includes(newTag.trim())) {
            setNewNote(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setNewNote(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleToggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const getColorClasses = (color: string) => {
        const colorMap = {
            default: 'bg-slate-800/50 border-slate-700/50',
            blue: 'bg-blue-900/30 border-blue-700/50',
            green: 'bg-green-900/30 border-green-700/50',
            yellow: 'bg-yellow-900/30 border-yellow-700/50',
            red: 'bg-red-900/30 border-red-700/50',
            purple: 'bg-purple-900/30 border-purple-700/50'
        };
        return colorMap[color as keyof typeof colorMap] || colorMap.default;
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'story': return <FiBookOpen className="w-4 h-4" />;
            case 'skill': return <FiTarget className="w-4 h-4" />;
            default: return <FiFileText className="w-4 h-4" />;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays - 1} days ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="min-h-screen bg-[#0D1117] relative overflow-hidden">
            {/* Video Background */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="fixed inset-0 w-full h-full object-cover opacity-20 z-0"
            >
                <source src="/Afterbell-bg.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Background overlay */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 z-0" />

            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden z-0">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-secondary-green/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 pt-20 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">My Notes</h1>
                                <p className="text-slate-400 text-sm md:text-base">Capture your thoughts and learning insights</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <motion.button
                                    onClick={() => setShowTemplateModal(true)}
                                    className="px-4 py-2 bg-slate-800/50 backdrop-blur-lg rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300 border border-slate-700/50"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FiGrid className="w-4 h-4 mr-2 inline" />
                                    Templates
                                </motion.button>
                                <motion.button
                                    onClick={() => setShowNewNoteModal(true)}
                                    className="px-6 py-2 bg-secondary-green text-white rounded-xl hover:bg-secondary-green/80 transition-all duration-300 flex items-center space-x-2"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FiPlus className="w-4 h-4" />
                                    <span>New Note</span>
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Search and Filters */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-6"
                    >
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search Bar */}
                            <div className="flex-1 relative">
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search notes..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 backdrop-blur-lg rounded-xl border border-slate-700/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-green/50 focus:border-secondary-green/50 transition-all duration-300"
                                />
                            </div>

                            {/* Filter Controls */}
                            <div className="flex items-center space-x-3">
                                <motion.button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`px-4 py-3 rounded-xl border transition-all duration-300 flex items-center space-x-2 ${showFilters || selectedType !== 'all' || selectedTags.length > 0
                                        ? 'bg-secondary-green/20 border-secondary-green/50 text-secondary-green'
                                        : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700/50'
                                        }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FiFilter className="w-4 h-4" />
                                    <span>Filters</span>
                                </motion.button>

                                <div className="flex items-center bg-slate-800/50 backdrop-blur-lg rounded-xl border border-slate-700/50 p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'bg-secondary-green text-white' : 'text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        <FiGrid className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'list' ? 'bg-secondary-green text-white' : 'text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        <FiList className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Filter Panel */}
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-4 bg-slate-800/50 backdrop-blur-lg rounded-xl border border-slate-700/50 p-4"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Type Filter */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                                            <select
                                                value={selectedType}
                                                onChange={(e) => setSelectedType(e.target.value as any)}
                                                className="w-full px-3 py-2 bg-slate-700/50 rounded-lg border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-secondary-green/50"
                                            >
                                                <option value="all">All Types</option>
                                                <option value="general">General</option>
                                                <option value="story">Story Notes</option>
                                                <option value="skill">Skill Notes</option>
                                            </select>
                                        </div>

                                        {/* Sort By */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">Sort By</label>
                                            <select
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value as any)}
                                                className="w-full px-3 py-2 bg-slate-700/50 rounded-lg border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-secondary-green/50"
                                            >
                                                <option value="newest">Newest First</option>
                                                <option value="oldest">Oldest First</option>
                                                <option value="title">Title A-Z</option>
                                                <option value="updated">Recently Updated</option>
                                            </select>
                                        </div>

                                        {/* Tags */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">Tags</label>
                                            <div className="flex flex-wrap gap-2">
                                                {allTags.map(tag => (
                                                    <button
                                                        key={tag}
                                                        onClick={() => handleToggleTag(tag)}
                                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${selectedTags.includes(tag)
                                                            ? 'bg-secondary-green text-white'
                                                            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white'
                                                            }`}
                                                    >
                                                        {tag}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Notes Grid/List */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                    >
                        {/* Pinned Notes */}
                        {pinnedNotes.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                                    <FiBookmark className="w-5 h-5 mr-2 text-secondary-green" />
                                    Pinned Notes
                                </h2>
                                <div className={`grid gap-4 ${viewMode === 'grid'
                                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                                    : 'grid-cols-1'
                                    }`}>
                                    {pinnedNotes.map((note, index) => (
                                        <motion.div
                                            key={note.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`${getColorClasses(note.color)} backdrop-blur-lg rounded-xl border p-4 hover:shadow-lg transition-all duration-300 ${viewMode === 'list' ? 'flex items-start space-x-4' : ''
                                                }`}
                                        >
                                            {viewMode === 'list' ? (
                                                <>
                                                    <div className="flex-shrink-0">
                                                        <div className="p-2 bg-slate-700/50 rounded-lg">
                                                            {getTypeIcon(note.type)}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <h3 className="font-semibold text-white truncate">{note.title}</h3>
                                                            <div className="flex items-center space-x-2 ml-2">
                                                                {note.isPinned && <FiBookmark className="w-4 h-4 text-secondary-green" />}
                                                                {note.isFavorite && <FiHeart className="w-4 h-4 text-red-400" />}
                                                            </div>
                                                        </div>
                                                        <p className="text-slate-400 text-sm mb-3 line-clamp-2">{note.content}</p>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-2">
                                                                {note.tags.slice(0, 3).map(tag => (
                                                                    <span key={tag} className="px-2 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300">
                                                                        {tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            <span className="text-xs text-slate-500">{formatDate(note.updatedAt)}</span>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="p-1.5 bg-slate-700/50 rounded-lg">
                                                                {getTypeIcon(note.type)}
                                                            </div>
                                                            <span className="text-xs text-slate-400 capitalize">{note.type}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            {note.isPinned && <FiBookmark className="w-4 h-4 text-secondary-green" />}
                                                            {note.isFavorite && <FiHeart className="w-4 h-4 text-red-400" />}
                                                        </div>
                                                    </div>
                                                    <h3 className="font-semibold text-white mb-2 line-clamp-2">{note.title}</h3>
                                                    <p className="text-slate-400 text-sm mb-4 line-clamp-3">{note.content}</p>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex flex-wrap gap-1">
                                                            {note.tags.slice(0, 2).map(tag => (
                                                                <span key={tag} className="px-2 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <span className="text-xs text-slate-500">{formatDate(note.updatedAt)}</span>
                                                    </div>
                                                </>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Regular Notes */}
                        {regularNotes.length > 0 && (
                            <div>
                                {pinnedNotes.length > 0 && (
                                    <h2 className="text-lg font-semibold text-white mb-4">All Notes</h2>
                                )}
                                <div className={`grid gap-4 ${viewMode === 'grid'
                                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                                    : 'grid-cols-1'
                                    }`}>
                                    {regularNotes.map((note, index) => (
                                        <motion.div
                                            key={note.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`${getColorClasses(note.color)} backdrop-blur-lg rounded-xl border p-4 hover:shadow-lg transition-all duration-300 ${viewMode === 'list' ? 'flex items-start space-x-4' : ''
                                                }`}
                                        >
                                            {viewMode === 'list' ? (
                                                <>
                                                    <div className="flex-shrink-0">
                                                        <div className="p-2 bg-slate-700/50 rounded-lg">
                                                            {getTypeIcon(note.type)}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <h3 className="font-semibold text-white truncate">{note.title}</h3>
                                                            <div className="flex items-center space-x-2 ml-2">
                                                                {note.isPinned && <FiBookmark className="w-4 h-4 text-secondary-green" />}
                                                                {note.isFavorite && <FiHeart className="w-4 h-4 text-red-400" />}
                                                            </div>
                                                        </div>
                                                        <p className="text-slate-400 text-sm mb-3 line-clamp-2">{note.content}</p>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-2">
                                                                {note.tags.slice(0, 3).map(tag => (
                                                                    <span key={tag} className="px-2 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300">
                                                                        {tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            <span className="text-xs text-slate-500">{formatDate(note.updatedAt)}</span>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="p-1.5 bg-slate-700/50 rounded-lg">
                                                                {getTypeIcon(note.type)}
                                                            </div>
                                                            <span className="text-xs text-slate-400 capitalize">{note.type}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            {note.isPinned && <FiBookmark className="w-4 h-4 text-secondary-green" />}
                                                            {note.isFavorite && <FiHeart className="w-4 h-4 text-red-400" />}
                                                        </div>
                                                    </div>
                                                    <h3 className="font-semibold text-white mb-2 line-clamp-2">{note.title}</h3>
                                                    <p className="text-slate-400 text-sm mb-4 line-clamp-3">{note.content}</p>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex flex-wrap gap-1">
                                                            {note.tags.slice(0, 2).map(tag => (
                                                                <span key={tag} className="px-2 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <span className="text-xs text-slate-500">{formatDate(note.updatedAt)}</span>
                                                    </div>
                                                </>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {filteredNotes.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12"
                            >
                                <div className="text-6xl mb-4">📝</div>
                                <h3 className="text-xl font-semibold text-white mb-2">No notes found</h3>
                                <p className="text-slate-400 mb-6">
                                    {searchQuery || selectedTags.length > 0 || selectedType !== 'all'
                                        ? 'Try adjusting your filters or search terms'
                                        : 'Start by creating your first note'
                                    }
                                </p>
                                <motion.button
                                    onClick={() => setShowNewNoteModal(true)}
                                    className="px-6 py-3 bg-secondary-green text-white rounded-xl hover:bg-secondary-green/80 transition-all duration-300"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Create Your First Note
                                </motion.button>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* New Note Modal */}
            <AnimatePresence>
                {showNewNoteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-800/90 backdrop-blur-lg rounded-2xl border border-slate-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-white">Create New Note</h2>
                                    <button
                                        onClick={() => setShowNewNoteModal(false)}
                                        className="p-2 text-slate-400 hover:text-white transition-colors"
                                    >
                                        <FiX className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                                        <input
                                            type="text"
                                            value={newNote.title}
                                            onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                                            placeholder="Enter note title..."
                                            className="w-full px-4 py-3 bg-slate-700/50 rounded-xl border border-slate-600/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-green/50 focus:border-secondary-green/50 transition-all duration-300"
                                        />
                                    </div>

                                    {/* Type and Color */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                                            <select
                                                value={newNote.type}
                                                onChange={(e) => setNewNote(prev => ({ ...prev, type: e.target.value as any }))}
                                                className="w-full px-4 py-3 bg-slate-700/50 rounded-xl border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-secondary-green/50"
                                            >
                                                <option value="general">General</option>
                                                <option value="story">Story Notes</option>
                                                <option value="skill">Skill Notes</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">Color</label>
                                            <select
                                                value={newNote.color}
                                                onChange={(e) => setNewNote(prev => ({ ...prev, color: e.target.value as any }))}
                                                className="w-full px-4 py-3 bg-slate-700/50 rounded-xl border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-secondary-green/50"
                                            >
                                                <option value="default">Default</option>
                                                <option value="blue">Blue</option>
                                                <option value="green">Green</option>
                                                <option value="yellow">Yellow</option>
                                                <option value="red">Red</option>
                                                <option value="purple">Purple</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Tags</label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {newNote.tags.map(tag => (
                                                <span
                                                    key={tag}
                                                    className="px-3 py-1 bg-secondary-green/20 text-secondary-green rounded-full text-sm flex items-center space-x-2"
                                                >
                                                    <span>{tag}</span>
                                                    <button
                                                        onClick={() => handleRemoveTag(tag)}
                                                        className="text-secondary-green hover:text-white"
                                                    >
                                                        <FiX className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={newTag}
                                                onChange={(e) => setNewTag(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                                                placeholder="Add a tag..."
                                                className="flex-1 px-4 py-3 bg-slate-700/50 rounded-xl border border-slate-600/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-green/50 focus:border-secondary-green/50 transition-all duration-300"
                                            />
                                            <button
                                                onClick={handleAddTag}
                                                className="px-4 py-3 bg-secondary-green text-white rounded-xl hover:bg-secondary-green/80 transition-all duration-300"
                                            >
                                                <FiPlus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Content</label>
                                        <textarea
                                            value={newNote.content}
                                            onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                                            placeholder="Write your note content here..."
                                            rows={8}
                                            className="w-full px-4 py-3 bg-slate-700/50 rounded-xl border border-slate-600/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-green/50 focus:border-secondary-green/50 transition-all duration-300 resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end space-x-3 mt-6">
                                    <button
                                        onClick={() => setShowNewNoteModal(false)}
                                        className="px-6 py-3 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-600/50 hover:text-white transition-all duration-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreateNote}
                                        disabled={!newNote.title.trim() || !newNote.content.trim()}
                                        className="px-6 py-3 bg-secondary-green text-white rounded-xl hover:bg-secondary-green/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                    >
                                        <FiSave className="w-4 h-4" />
                                        <span>Create Note</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Template Modal */}
            <AnimatePresence>
                {showTemplateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-800/90 backdrop-blur-lg rounded-2xl border border-slate-700/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-white">Note Templates</h2>
                                    <button
                                        onClick={() => setShowTemplateModal(false)}
                                        className="p-2 text-slate-400 hover:text-white transition-colors"
                                    >
                                        <FiX className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {templates.map((template) => (
                                        <motion.div
                                            key={template.id}
                                            whileHover={{ scale: 1.02 }}
                                            className="bg-slate-700/30 rounded-xl border border-slate-600/50 p-4 hover:border-secondary-green/50 transition-all duration-300 cursor-pointer"
                                            onClick={() => handleUseTemplate(template.id)}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <h3 className="font-semibold text-white">{template.name}</h3>
                                                <span className="px-2 py-1 bg-slate-600/50 rounded-full text-xs text-slate-300 capitalize">
                                                    {template.category}
                                                </span>
                                            </div>
                                            <p className="text-slate-400 text-sm mb-3">{template.description}</p>
                                            <div className="text-xs text-slate-500 bg-slate-800/50 rounded-lg p-2 max-h-20 overflow-hidden">
                                                {template.content.substring(0, 100)}...
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotesPage;
