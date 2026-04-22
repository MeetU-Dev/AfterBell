import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../context/UserDataContext';
import { useStories, Story, Comment } from '../context/StoriesContext';
import {
    FiBookOpen,
    FiHeart,
    FiMessageCircle,
    FiShare2,
    FiFilter,
    FiSearch,
    FiPlus,
    FiStar,
    FiClock,
    FiUser,
    FiTag,
    FiThumbsUp,
    FiEye,
    FiEdit3,
    FiTrash2,
    FiFlag,
    FiCheckCircle,
    FiAlertCircle,
    FiTrendingUp,
    FiAward,
    FiTarget,
    FiX
} from 'react-icons/fi';

const RealLifeStoriesPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addActivity } = useUserData();
    const {
        stories,
        comments,
        bookmarkedStories,
        likedStories,
        userRatings,
        addStory,
        likeStory,
        bookmarkStory,
        viewStory,
        addComment,
        rateStory,
        getCommentsByStoryId,
        getRatingByUser
    } = useStories();

    const [filteredStories, setFilteredStories] = useState<Story[]>([]);
    const [showStoryForm, setShowStoryForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const [newStory, setNewStory] = useState({
        title: '',
        content: '',
        category: 'career',
        tags: [] as string[]
    });
    const [newTag, setNewTag] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = [
        { id: 'all', label: 'All Stories', icon: FiBookOpen },
        { id: 'career', label: 'Career', icon: FiTarget },
        { id: 'finance', label: 'Finance', icon: FiTrendingUp },
        { id: 'health', label: 'Health', icon: FiHeart },
        { id: 'mental-health', label: 'Mental Health', icon: FiHeart },
        { id: 'relationships', label: 'Relationships', icon: FiUser },
        { id: 'education', label: 'Education', icon: FiAward },
        { id: 'personal', label: 'Personal Growth', icon: FiStar },
        { id: 'life-skills', label: 'Life Skills', icon: FiStar }
    ];

    const sortOptions = [
        { id: 'newest', label: 'Newest First', icon: FiClock },
        { id: 'oldest', label: 'Oldest First', icon: FiClock },
        { id: 'popular', label: 'Most Popular', icon: FiHeart },
        { id: 'rating', label: 'Highest Rated', icon: FiStar }
    ];

    // Filter and sort stories
    useEffect(() => {
        let filtered = [...stories];

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(story => story.category === selectedCategory);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(story =>
                story.title.toLowerCase().includes(query) ||
                story.content.toLowerCase().includes(query) ||
                story.tags.some(tag => tag.toLowerCase().includes(query)) ||
                story.author.toLowerCase().includes(query)
            );
        }

        // Sort stories
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'popular':
                    return b.likes - a.likes;
                case 'rating':
                    return b.rating - a.rating;
                default:
                    return 0;
            }
        });

        setFilteredStories(filtered);
    }, [stories, selectedCategory, searchQuery, sortBy]);

    const handleStorySubmit = async () => {
        if (!newStory.title.trim() || !newStory.content.trim()) return;

        setIsSubmitting(true);
        try {
            await addStory({
                title: newStory.title,
                content: newStory.content,
                category: newStory.category,
                tags: newStory.tags,
                author: user?.name || 'Anonymous',
                authorId: user?.id || 'anonymous',
                rating: 0,
                totalRatings: 0,
                likes: 0,
                views: 0,
                comments: 0,
                isVerified: false,
                isFeatured: false,
                difficulty: 'beginner',
                readTime: Math.ceil(newStory.content.split(' ').length / 200) // Estimate read time
            });

            setNewStory({
                title: '',
                content: '',
                category: 'career',
                tags: []
            });
            setShowStoryForm(false);
            setNewTag('');

            addActivity('Shared a story', newStory.title, Date.now().toString());
        } catch (error) {
            console.error('Error adding story:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddTag = () => {
        if (newTag.trim() && !newStory.tags.includes(newTag.trim())) {
            setNewStory(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setNewStory(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleLikeStory = async (storyId: string) => {
        await likeStory(storyId);
    };

    const handleBookmarkStory = async (storyId: string) => {
        await bookmarkStory(storyId);
    };

    const handleViewStory = async (story: Story) => {
        // Navigate to story detail page instead of opening modal
        navigate(`/stories/${story.id}`);
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays - 1} days ago`;
        return date.toLocaleDateString();
    };

    const getCategoryIcon = (category: string) => {
        const categoryData = categories.find(cat => cat.id === category);
        return categoryData?.icon || FiBookOpen;
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.sort-dropdown')) {
                setIsSortDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Real Life Stories</h1>
                        <p className="text-slate-400 text-sm md:text-base">Share your experiences and learn from others' journeys</p>
                    </motion.div>

                    {/* Search and Sort */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-6"
                    >
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search Bar */}
                            <div className="flex-1 relative group">
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-secondary-green transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search stories..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-10 py-3 bg-slate-800/50 backdrop-blur-lg rounded-xl border border-slate-700/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-green/50 focus:border-secondary-green/50 transition-all duration-300 hover:bg-slate-600/50"
                                />
                                {searchQuery && (
                                    <AnimatePresence>
                                        <motion.button
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                        >
                                            <FiX className="w-4 h-4" />
                                        </motion.button>
                                    </AnimatePresence>
                                )}
                            </div>

                            {/* Sort Dropdown */}
                            <div className="relative sort-dropdown">
                                <motion.button
                                    onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                                    className="flex items-center space-x-2 px-4 py-3 bg-slate-800/50 backdrop-blur-lg rounded-xl border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {(() => {
                                        const selectedOption = sortOptions.find(option => option.id === sortBy);
                                        const IconComponent = selectedOption?.icon || FiClock;
                                        return <IconComponent className="w-4 h-4" />;
                                    })()}
                                    <span>{sortOptions.find(option => option.id === sortBy)?.label}</span>
                                    <motion.div
                                        animate={{ rotate: isSortDropdownOpen ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </motion.div>
                                </motion.button>

                                <AnimatePresence>
                                    {isSortDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute top-full left-0 right-0 mt-2 bg-slate-800/90 backdrop-blur-lg rounded-xl border border-slate-700/50 shadow-xl z-50"
                                        >
                                            {sortOptions.map((option, index) => {
                                                const IconComponent = option.icon;
                                                return (
                                                    <motion.button
                                                        key={option.id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        onClick={() => {
                                                            setSortBy(option.id);
                                                            setIsSortDropdownOpen(false);
                                                        }}
                                                        className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl ${sortBy === option.id
                                                            ? 'bg-secondary-green/20 text-secondary-green'
                                                            : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                                                            }`}
                                                    >
                                                        <IconComponent className="w-4 h-4" />
                                                        <span className="flex-1">{option.label}</span>
                                                        {sortBy === option.id && (
                                                            <FiCheckCircle className="w-4 h-4 text-secondary-green" />
                                                        )}
                                                    </motion.button>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>

                    {/* Category Filters */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-6"
                    >
                        <div className="flex flex-wrap gap-3">
                            {categories.map((category, index) => {
                                const IconComponent = category.icon;
                                return (
                                    <motion.button
                                        key={category.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${selectedCategory === category.id
                                            ? 'bg-secondary-green text-white shadow-lg shadow-secondary-green/25'
                                            : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white hover:shadow-md'
                                            }`}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <IconComponent className="w-4 h-4" />
                                        <span className="text-sm font-medium">{category.label}</span>
                                        {selectedCategory === category.id && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.1 }}
                                            >
                                                <FiCheckCircle className="w-4 h-4" />
                                            </motion.div>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Share Story Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-8"
                    >
                        <motion.button
                            onClick={() => setShowStoryForm(true)}
                            className="flex items-center space-x-2 px-6 py-3 bg-secondary-green text-white rounded-xl hover:bg-secondary-green/80 transition-all duration-300 shadow-lg"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FiPlus className="w-5 h-5" />
                            <span>Share Your Story</span>
                        </motion.button>
                    </motion.div>

                    {/* Stories Grid */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {filteredStories.map((story, index) => (
                            <motion.div
                                key={story.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 cursor-pointer group"
                                onClick={() => handleViewStory(story)}
                            >
                                {/* Story Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-2">
                                        {(() => {
                                            const CategoryIcon = getCategoryIcon(story.category);
                                            return <CategoryIcon className="w-5 h-5 text-secondary-green" />;
                                        })()}
                                        <span className="text-xs text-slate-400 capitalize">{story.category}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                                        <span className="text-sm text-slate-300">{story.rating.toFixed(1)}</span>
                                    </div>
                                </div>

                                <h3 className="font-semibold text-white mb-3 line-clamp-2 group-hover:text-secondary-green transition-colors">
                                    {story.title}
                                </h3>

                                <p className="text-slate-400 text-sm mb-4 line-clamp-3">
                                    {story.content.substring(0, 120)}...
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {story.tags.slice(0, 3).map((tag, tagIndex) => (
                                        <span
                                            key={tagIndex}
                                            className="px-2 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                    {story.tags.length > 3 && (
                                        <span className="px-2 py-1 bg-slate-700/50 rounded-full text-xs text-slate-400">
                                            +{story.tags.length - 3}
                                        </span>
                                    )}
                                </div>

                                {/* Story Meta */}
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <div className="flex items-center space-x-2">
                                        <FiUser className="w-3 h-3" />
                                        <span>{story.author}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <FiClock className="w-3 h-3" />
                                        <span>{story.readTime} min</span>
                                    </div>
                                </div>

                                {/* Story Stats */}
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-1">
                                            <FiHeart className="w-4 h-4 text-red-400" />
                                            <span className="text-sm text-slate-300">{story.likes}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <FiMessageCircle className="w-4 h-4 text-blue-400" />
                                            <span className="text-sm text-slate-300">{getCommentsByStoryId(story.id).length}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <FiEye className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm text-slate-300">{story.views}</span>
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-500">{formatTimeAgo(story.createdAt)}</span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Empty State */}
                    {filteredStories.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12"
                        >
                            <div className="text-6xl mb-4">📖</div>
                            <h3 className="text-xl font-semibold text-white mb-2">No stories found</h3>
                            <p className="text-slate-400 mb-6">
                                {searchQuery || selectedCategory !== 'all'
                                    ? 'Try adjusting your search or filters'
                                    : 'Be the first to share your story!'
                                }
                            </p>
                            <motion.button
                                onClick={() => setShowStoryForm(true)}
                                className="px-6 py-3 bg-secondary-green text-white rounded-xl hover:bg-secondary-green/80 transition-all duration-300"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Share Your First Story
                            </motion.button>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Story Form Modal */}
            <AnimatePresence>
                {showStoryForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowStoryForm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-800/90 backdrop-blur-lg rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-700/50"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">Share Your Story</h2>
                                <button
                                    onClick={() => setShowStoryForm(false)}
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
                                        value={newStory.title}
                                        onChange={(e) => setNewStory(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Give your story a compelling title..."
                                        className="w-full px-4 py-3 bg-slate-700/50 rounded-xl border border-slate-600/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-green/50 focus:border-secondary-green/50 transition-all duration-300"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                                    <select
                                        value={newStory.category}
                                        onChange={(e) => setNewStory(prev => ({ ...prev, category: e.target.value }))}
                                        className="w-full px-4 py-3 bg-slate-700/50 rounded-xl border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-secondary-green/50"
                                    >
                                        {categories.slice(1).map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Tags</label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {newStory.tags.map(tag => (
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
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Your Story</label>
                                    <textarea
                                        value={newStory.content}
                                        onChange={(e) => setNewStory(prev => ({ ...prev, content: e.target.value }))}
                                        placeholder="Share your experience, what you learned, and any advice you have for others..."
                                        rows={8}
                                        className="w-full px-4 py-3 bg-slate-700/50 rounded-xl border border-slate-600/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-green/50 focus:border-secondary-green/50 transition-all duration-300 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setShowStoryForm(false)}
                                    className="px-6 py-3 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-600/50 hover:text-white transition-all duration-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleStorySubmit}
                                    disabled={!newStory.title.trim() || !newStory.content.trim() || isSubmitting}
                                    className="px-6 py-3 bg-secondary-green text-white rounded-xl hover:bg-secondary-green/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Sharing...' : 'Share Story'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RealLifeStoriesPage;