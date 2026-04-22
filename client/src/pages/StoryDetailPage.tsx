import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStories } from '../context/StoriesContext';
import { useUserData } from '../context/UserDataContext';
import {
    FiArrowLeft,
    FiHeart,
    FiBookmark,
    FiShare2,
    FiMessageCircle,
    FiStar,
    FiClock,
    FiUser,
    FiEye,
    FiThumbsUp,
    FiTag,
    FiChevronRight,
    FiCalendar,
    FiTrendingUp
} from 'react-icons/fi';

const StoryDetailPage: React.FC = () => {
    const { storyId } = useParams<{ storyId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { stories, comments, bookmarkedStories, likedStories, addComment, likeStory, bookmarkStory, viewStory, rateStory, getCommentsByStoryId, getRatingByUser } = useStories();
    const { addActivity } = useUserData();

    const [newComment, setNewComment] = useState('');
    const [newRating, setNewRating] = useState(0);
    const [newReview, setNewReview] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);

    const story = stories.find(s => s.id === storyId);
    const storyComments = getCommentsByStoryId(storyId || '');
    const userRating = getRatingByUser(storyId || '', user?.id || '');
    const isLiked = likedStories.includes(storyId || '');
    const isBookmarked = bookmarkedStories.includes(storyId || '');

    // Get recommended stories (similar category, excluding current story)
    const recommendedStories = stories
        .filter(s => s.id !== storyId && s.category === story?.category)
        .slice(0, 3);

    useEffect(() => {
        if (story) {
            viewStory(story.id);
            addActivity('Viewed story', story.title, story.id);
        }
    }, [story, viewStory, addActivity]);

    const handleLike = () => {
        if (story) {
            likeStory(story.id);
        }
    };

    const handleBookmark = () => {
        if (story) {
            bookmarkStory(story.id);
        }
    };

    const handleShare = async () => {
        if (story && navigator.share) {
            try {
                await navigator.share({
                    title: story.title,
                    text: story.content.substring(0, 100) + '...',
                    url: window.location.href
                });
            } catch (error) {
                // Fallback to clipboard
                navigator.clipboard.writeText(window.location.href);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim() || !story || !user) return;

        setIsSubmittingComment(true);
        try {
            await addComment(story.id, newComment);
            setNewComment('');
            addActivity('Commented on story', story.title, story.id);
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleRateStory = async () => {
        if (!story || !user || newRating === 0) return;

        setIsSubmittingRating(true);
        try {
            await rateStory(story.id, newRating, newReview);
            setNewRating(0);
            setNewReview('');
            addActivity('Rated story', story.title, story.id);
        } catch (error) {
            console.error('Error rating story:', error);
        } finally {
            setIsSubmittingRating(false);
        }
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

    if (!story) {
        return (
            <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Story Not Found</h1>
                    <p className="text-slate-400 mb-6">The story you're looking for doesn't exist.</p>
                    <Link to="/stories" className="btn-primary">
                        Back to Stories
                    </Link>
                </div>
            </div>
        );
    }

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
                    {/* Navigation Breadcrumb */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center space-x-2 text-sm text-slate-400 mb-6"
                    >
                        <button
                            onClick={() => navigate('/stories')}
                            className="hover:text-white transition-colors"
                        >
                            Stories
                        </button>
                        <span>/</span>
                        <span className="text-slate-300 truncate">{story?.title}</span>
                    </motion.div>

                    {/* Back Button */}
                    <motion.button
                        onClick={() => navigate('/stories')}
                        className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors mb-6"
                        whileHover={{ x: -5 }}
                    >
                        <FiArrowLeft className="w-5 h-5" />
                        <span>Back to Stories</span>
                    </motion.button>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Story Content */}
                        <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">
                            {/* Story Content */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-6 md:p-8"
                            >
                                {/* Story Header */}
                                <div className="mb-6">
                                    <div className="flex items-center space-x-2 mb-4">
                                        <div className="p-2 bg-secondary-green/20 rounded-lg">
                                            <FiTrendingUp className="w-5 h-5 text-secondary-green" />
                                        </div>
                                        <span className="text-sm text-slate-400 capitalize">{story.category}</span>
                                    </div>

                                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
                                        {story.title}
                                    </h1>

                                    {/* Story Meta */}
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-4">
                                        <div className="flex items-center space-x-2">
                                            <FiUser className="w-4 h-4" />
                                            <span>{story.author}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <FiClock className="w-4 h-4" />
                                            <span>{story.readTime} min read</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <FiCalendar className="w-4 h-4" />
                                            <span>{formatTimeAgo(story.createdAt)}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <FiEye className="w-4 h-4" />
                                            <span>{story.views} views</span>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {story.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-slate-700/50 rounded-full text-sm text-slate-300"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Story Content */}
                                <div className="prose prose-invert max-w-none mb-8">
                                    <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                                        {story.content}
                                    </div>
                                </div>

                                {/* Story Actions */}
                                <div className="flex items-center justify-between pt-6 border-t border-slate-700/50">
                                    <div className="flex items-center space-x-4">
                                        <motion.button
                                            onClick={handleLike}
                                            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${isLiked
                                                ? 'bg-red-500/20 text-red-400'
                                                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white'
                                                }`}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <FiHeart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                                            <span>{story.likes}</span>
                                        </motion.button>

                                        <motion.button
                                            onClick={handleBookmark}
                                            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${isBookmarked
                                                ? 'bg-yellow-500/20 text-yellow-400'
                                                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white'
                                                }`}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <FiBookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                                            <span>Save</span>
                                        </motion.button>

                                        <motion.button
                                            onClick={handleShare}
                                            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white transition-all duration-300"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <FiShare2 className="w-4 h-4" />
                                            <span>Share</span>
                                        </motion.button>
                                    </div>

                                    {/* Rating Display */}
                                    <div className="flex items-center space-x-2">
                                        <div className="flex items-center space-x-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <FiStar
                                                    key={star}
                                                    className={`w-4 h-4 ${star <= story.rating
                                                        ? 'text-yellow-400 fill-current'
                                                        : 'text-slate-400'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm text-slate-400">
                                            {story.rating.toFixed(1)} ({story.totalRatings} ratings)
                                        </span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Comments Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-6 md:p-8"
                            >
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                                    <FiMessageCircle className="w-5 h-5 mr-2 text-secondary-green" />
                                    Comments ({storyComments.length})
                                </h2>

                                {/* Add Comment */}
                                {user && (
                                    <div className="mb-6">
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Share your thoughts on this story..."
                                            className="w-full p-4 bg-slate-700/50 rounded-xl border border-slate-600/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-green/50 focus:border-secondary-green/50 transition-all duration-300 resize-none"
                                            rows={3}
                                        />
                                        <div className="flex justify-end mt-3">
                                            <motion.button
                                                onClick={handleAddComment}
                                                disabled={!newComment.trim() || isSubmittingComment}
                                                className="px-6 py-2 bg-secondary-green text-white rounded-xl hover:bg-secondary-green/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                                            </motion.button>
                                        </div>
                                    </div>
                                )}

                                {/* Comments List */}
                                <div className="space-y-4">
                                    {storyComments.length > 0 ? (
                                        storyComments.map((comment) => (
                                            <div key={comment.id} className="p-4 bg-slate-700/30 rounded-xl">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-semibold text-white">{comment.author}</span>
                                                        <span className="text-xs text-slate-400">
                                                            {formatTimeAgo(comment.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-slate-300">{comment.content}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-slate-400 text-center py-8">
                                            No comments yet. Be the first to share your thoughts!
                                        </p>
                                    )}
                                </div>
                            </motion.div>

                            {/* Rating Section */}
                            {user && !userRating && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-6 md:p-8"
                                >
                                    <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                                        <FiStar className="w-5 h-5 mr-2 text-secondary-green" />
                                        Rate this Story
                                    </h2>

                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => setNewRating(star)}
                                                    className={`transition-colors duration-200 ${star <= newRating
                                                        ? 'text-yellow-400'
                                                        : 'text-slate-400 hover:text-yellow-300'
                                                        }`}
                                                >
                                                    <FiStar className="w-6 h-6" />
                                                </button>
                                            ))}
                                            <span className="text-sm text-slate-400 ml-2">
                                                {newRating > 0 ? `${newRating} star${newRating > 1 ? 's' : ''}` : 'Select rating'}
                                            </span>
                                        </div>

                                        <textarea
                                            value={newReview}
                                            onChange={(e) => setNewReview(e.target.value)}
                                            placeholder="Write a review (optional)..."
                                            className="w-full p-4 bg-slate-700/50 rounded-xl border border-slate-600/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-green/50 focus:border-secondary-green/50 transition-all duration-300 resize-none"
                                            rows={3}
                                        />

                                        <div className="flex justify-end">
                                            <motion.button
                                                onClick={handleRateStory}
                                                disabled={newRating === 0 || isSubmittingRating}
                                                className="px-6 py-2 bg-secondary-green text-white rounded-xl hover:bg-secondary-green/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {isSubmittingRating ? 'Submitting...' : 'Submit Rating'}
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Right Column - Recommendations Sidebar */}
                        <div className="lg:col-span-1 order-1 lg:order-2">
                            {/* Recommended Stories */}
                            {recommendedStories.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-6 lg:sticky lg:top-24"
                                >
                                    <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                                        <FiTrendingUp className="w-5 h-5 mr-2 text-secondary-green" />
                                        Recommended Stories
                                    </h2>

                                    <div className="space-y-4">
                                        {recommendedStories.map((recommendedStory, index) => (
                                            <motion.div
                                                key={recommendedStory.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 * index }}
                                                whileHover={{ scale: 1.02, y: -2 }}
                                                className="bg-slate-700/30 rounded-xl border border-slate-600/50 p-4 hover:border-secondary-green/50 transition-all duration-300 cursor-pointer group"
                                                onClick={() => navigate(`/stories/${recommendedStory.id}`)}
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="p-1.5 bg-secondary-green/20 rounded-lg">
                                                            <FiTrendingUp className="w-3 h-3 text-secondary-green" />
                                                        </div>
                                                        <span className="text-xs text-slate-400 capitalize">
                                                            {recommendedStory.category}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <FiStar className="w-3 h-3 text-yellow-400 fill-current" />
                                                        <span className="text-xs text-slate-400">
                                                            {recommendedStory.rating.toFixed(1)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-secondary-green transition-colors">
                                                    {recommendedStory.title}
                                                </h3>

                                                <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                                                    {recommendedStory.content.substring(0, 80)}...
                                                </p>

                                                <div className="flex items-center justify-between text-xs text-slate-500">
                                                    <div className="flex items-center space-x-2">
                                                        <FiUser className="w-3 h-3" />
                                                        <span>{recommendedStory.author}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex items-center space-x-1">
                                                            <FiHeart className="w-3 h-3 text-red-400" />
                                                            <span>{recommendedStory.likes}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <FiClock className="w-3 h-3" />
                                                            <span>{recommendedStory.readTime}m</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Read More Indicator */}
                                                <div className="mt-3 pt-3 border-t border-slate-600/30">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-slate-400">Click to read</span>
                                                        <FiChevronRight className="w-3 h-3 text-slate-400 group-hover:text-secondary-green transition-colors" />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* More Stories Section */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mt-6 bg-slate-800/30 backdrop-blur-lg rounded-xl border border-slate-700/30 p-4"
                            >
                                <div className="text-center">
                                    <h3 className="text-sm font-semibold text-white mb-2">Want to explore more?</h3>
                                    <p className="text-xs text-slate-400 mb-4">Discover more inspiring stories</p>
                                    <motion.button
                                        onClick={() => navigate('/stories')}
                                        className="w-full px-4 py-2 bg-secondary-green/20 text-secondary-green rounded-lg hover:bg-secondary-green/30 transition-all duration-300 text-sm font-medium"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Browse All Stories
                                    </motion.button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoryDetailPage;