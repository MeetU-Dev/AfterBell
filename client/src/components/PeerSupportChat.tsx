import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiHeart, FiMessageCircle, FiUsers, FiShield, FiSmile, FiMeh, FiFrown } from 'react-icons/fi';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'peer';
    timestamp: Date;
    mood?: 'happy' | 'neutral' | 'sad';
    isAnonymous?: boolean;
}

interface Peer {
    id: string;
    name: string;
    mood: 'happy' | 'neutral' | 'sad';
    isOnline: boolean;
    lastSeen: Date;
}

const PeerSupportChat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedPeer, setSelectedPeer] = useState<Peer | null>(null);
    const [userMood, setUserMood] = useState<'happy' | 'neutral' | 'sad'>('neutral');
    const [isAnonymous, setIsAnonymous] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [peers] = useState<Peer[]>([
        {
            id: '1',
            name: 'Alex',
            mood: 'neutral',
            isOnline: true,
            lastSeen: new Date()
        },
        {
            id: '2',
            name: 'Sam',
            mood: 'happy',
            isOnline: true,
            lastSeen: new Date()
        },
        {
            id: '3',
            name: 'Jordan',
            mood: 'sad',
            isOnline: false,
            lastSeen: new Date(Date.now() - 30 * 60 * 1000)
        },
        {
            id: '4',
            name: 'Casey',
            mood: 'neutral',
            isOnline: true,
            lastSeen: new Date()
        }
    ]);

    // Load messages from localStorage
    useEffect(() => {
        const savedMessages = localStorage.getItem('peer_support_messages');
        if (savedMessages) {
            const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
            }));
            setMessages(parsedMessages);
        }
    }, []);

    // Save messages to localStorage
    useEffect(() => {
        localStorage.setItem('peer_support_messages', JSON.stringify(messages));
    }, [messages]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Simulate peer responses
    useEffect(() => {
        if (selectedPeer && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.sender === 'user') {
                const timer = setTimeout(() => {
                    const responses = [
                        "I understand how you feel. You're not alone in this.",
                        "That sounds really tough. I've been through something similar.",
                        "Thank you for sharing. It takes courage to open up.",
                        "I'm here for you. We can get through this together.",
                        "Your feelings are valid. It's okay to feel this way.",
                        "I believe in you. You're stronger than you think.",
                        "Let's take this one step at a time.",
                        "You're doing great by reaching out for support."
                    ];

                    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        text: randomResponse,
                        sender: 'peer',
                        timestamp: new Date(),
                        mood: selectedPeer.mood,
                        isAnonymous: true
                    }]);
                }, 2000 + Math.random() * 3000);

                return () => clearTimeout(timer);
            }
        }
    }, [messages, selectedPeer]);

    const sendMessage = () => {
        if (!newMessage.trim() || !selectedPeer) return;

        const message: Message = {
            id: Date.now().toString(),
            text: newMessage,
            sender: 'user',
            timestamp: new Date(),
            mood: userMood,
            isAnonymous
        };

        setMessages(prev => [...prev, message]);
        setNewMessage('');
    };

    const getMoodIcon = (mood: string) => {
        switch (mood) {
            case 'happy': return <FiSmile className="w-4 h-4 text-green-400" />;
            case 'neutral': return <FiMeh className="w-4 h-4 text-yellow-400" />;
            case 'sad': return <FiFrown className="w-4 h-4 text-red-400" />;
            default: return <FiMeh className="w-4 h-4 text-yellow-400" />;
        }
    };

    const getMoodColor = (mood: string) => {
        switch (mood) {
            case 'happy': return 'from-green-500 to-emerald-500';
            case 'neutral': return 'from-yellow-500 to-orange-500';
            case 'sad': return 'from-red-500 to-pink-500';
            default: return 'from-gray-500 to-slate-500';
        }
    };

    return (
        <div className="min-h-screen bg-slate-900/40 backdrop-blur-sm p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Peer Support Chat</h1>
                            <p className="text-slate-400">Connect with peers who understand what you're going through</p>
                        </div>
                        <div className="flex items-center space-x-2 text-slate-400">
                            <FiShield className="w-5 h-5" />
                            <span className="text-sm">Anonymous & Safe</span>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Peer List */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                                <FiUsers className="w-5 h-5" />
                                <span>Available Peers</span>
                            </h3>

                            <div className="space-y-3">
                                {peers.map((peer) => (
                                    <motion.div
                                        key={peer.id}
                                        onClick={() => setSelectedPeer(peer)}
                                        className={`p-3 rounded-lg cursor-pointer transition-all ${selectedPeer?.id === peer.id
                                                ? 'bg-secondary-green/20 border border-secondary-green/50'
                                                : 'bg-slate-700/30 hover:bg-slate-700/50'
                                            }`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getMoodColor(peer.mood)} flex items-center justify-center`}>
                                                    {getMoodIcon(peer.mood)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{peer.name}</p>
                                                    <p className="text-slate-400 text-sm capitalize">{peer.mood}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <div className={`w-2 h-2 rounded-full ${peer.isOnline ? 'bg-green-400' : 'bg-slate-500'}`} />
                                                <p className="text-slate-400 text-xs">
                                                    {peer.isOnline ? 'Online' : 'Offline'}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* User Settings */}
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 mt-4">
                            <h3 className="text-lg font-bold text-white mb-4">Your Settings</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-slate-300 text-sm mb-2">Your Mood:</label>
                                    <div className="flex space-x-2">
                                        {(['sad', 'neutral', 'happy'] as const).map((mood) => (
                                            <motion.button
                                                key={mood}
                                                onClick={() => setUserMood(mood)}
                                                className={`p-2 rounded-lg transition-all ${userMood === mood
                                                        ? 'bg-secondary-green/20 border border-secondary-green/50'
                                                        : 'bg-slate-700/30 hover:bg-slate-700/50'
                                                    }`}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                {getMoodIcon(mood)}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-center space-x-2 text-slate-300 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={isAnonymous}
                                            onChange={(e) => setIsAnonymous(e.target.checked)}
                                            className="rounded"
                                        />
                                        <span>Stay Anonymous</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Chat Area */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-3"
                    >
                        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 h-[600px] flex flex-col">
                            {selectedPeer ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="p-4 border-b border-slate-700/50">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getMoodColor(selectedPeer.mood)} flex items-center justify-center`}>
                                                {getMoodIcon(selectedPeer.mood)}
                                            </div>
                                            <div>
                                                <h3 className="text-white font-medium">{selectedPeer.name}</h3>
                                                <p className="text-slate-400 text-sm">
                                                    {selectedPeer.isOnline ? 'Online' : 'Offline'} •
                                                    {selectedPeer.isOnline ? ' Active now' : ` Last seen ${Math.floor((Date.now() - selectedPeer.lastSeen.getTime()) / 60000)}m ago`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {messages.length === 0 ? (
                                            <div className="text-center py-8">
                                                <FiMessageCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                                                <p className="text-slate-400">Start a conversation with {selectedPeer.name}</p>
                                                <p className="text-slate-500 text-sm mt-2">Share what's on your mind - you're in a safe space</p>
                                            </div>
                                        ) : (
                                            messages.map((message) => (
                                                <motion.div
                                                    key={message.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender === 'user'
                                                            ? 'bg-secondary-green text-white'
                                                            : 'bg-slate-700 text-slate-200'
                                                        }`}>
                                                        <p className="text-sm">{message.text}</p>
                                                        <div className="flex items-center justify-between mt-1">
                                                            <span className="text-xs opacity-70">
                                                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                            {message.mood && (
                                                                <div className="flex items-center space-x-1">
                                                                    {getMoodIcon(message.mood)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Message Input */}
                                    <div className="p-4 border-t border-slate-700/50">
                                        <div className="flex space-x-3">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                                placeholder="Type your message..."
                                                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-secondary-green"
                                            />
                                            <motion.button
                                                onClick={sendMessage}
                                                disabled={!newMessage.trim()}
                                                className="bg-secondary-green hover:bg-secondary-green/80 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <FiSend className="w-5 h-5" />
                                            </motion.button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <FiUsers className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-white mb-2">Select a Peer</h3>
                                        <p className="text-slate-400">Choose someone to start a conversation with</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Safety Notice */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4"
                >
                    <div className="flex items-start space-x-3">
                        <FiShield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold text-blue-300 mb-2">Safe Space Guidelines</h4>
                            <ul className="text-blue-200 text-sm space-y-1">
                                <li>• Be respectful and supportive of others</li>
                                <li>• This is a peer support space, not professional therapy</li>
                                <li>• If you're in crisis, please contact emergency services</li>
                                <li>• All conversations are anonymous and confidential</li>
                            </ul>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PeerSupportChat;

