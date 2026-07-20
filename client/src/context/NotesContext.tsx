import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Note {
    id: string;
    title: string;
    content: string;
    type: 'story' | 'skill' | 'general';
    relatedId?: string; // ID of the story or skill this note is related to
    tags: string[];
    isPinned: boolean;
    isFavorite: boolean;
    createdAt: string;
    updatedAt: string;
    color: 'default' | 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

export interface NoteTemplate {
    id: string;
    name: string;
    description: string;
    content: string;
    category: 'learning' | 'reflection' | 'planning' | 'review';
    isDefault: boolean;
}

interface NotesContextType {
    notes: Note[];
    templates: NoteTemplate[];
    searchQuery: string;
    selectedTags: string[];
    selectedType: 'all' | 'story' | 'skill' | 'general';
    sortBy: 'newest' | 'oldest' | 'title' | 'updated';

    // Note actions
    addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
    updateNote: (noteId: string, updates: Partial<Note>) => Promise<void>;
    deleteNote: (noteId: string) => Promise<void>;
    pinNote: (noteId: string) => Promise<void>;
    unpinNote: (noteId: string) => Promise<void>;
    favoriteNote: (noteId: string) => Promise<void>;
    unfavoriteNote: (noteId: string) => Promise<void>;

    // Template actions
    createTemplate: (template: Omit<NoteTemplate, 'id'>) => Promise<string>;
    useTemplate: (templateId: string) => Promise<Note>;

    // Utility functions
    getNotesByType: (type: string) => Note[];
    getNotesByRelatedId: (relatedId: string) => Note[];
    getPinnedNotes: () => Note[];
    getFavoriteNotes: () => Note[];
    getFilteredNotes: () => Note[];
    getAllTags: () => string[];
    searchNotes: (query: string) => Note[];

    // State management
    setSearchQuery: (query: string) => void;
    setSelectedTags: (tags: string[]) => void;
    setSelectedType: (type: 'all' | 'story' | 'skill' | 'general') => void;
    setSortBy: (sort: 'newest' | 'oldest' | 'title' | 'updated') => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

// Default note templates
const DEFAULT_TEMPLATES: NoteTemplate[] = [
    {
        id: 'learning_reflection',
        name: 'Learning Reflection',
        description: 'Reflect on what you learned today',
        content: '## What I Learned Today\n\n### Key Concepts:\n- \n- \n- \n\n### Questions I Have:\n- \n- \n\n### How I Can Apply This:\n- \n- \n\n### Next Steps:\n- \n- ',
        category: 'reflection',
        isDefault: true
    },
    {
        id: 'story_notes',
        name: 'Story Notes',
        description: 'Take notes while reading a story',
        content: '## Story Notes\n\n### Main Points:\n- \n- \n- \n\n### Personal Connections:\n- \n- \n\n### Key Takeaways:\n- \n- \n\n### Questions for Discussion:\n- \n- ',
        category: 'learning',
        isDefault: true
    },
    {
        id: 'skill_planning',
        name: 'Skill Planning',
        description: 'Plan your learning for a specific skill',
        content: '## Skill Learning Plan\n\n### Skill: \n\n### Current Level: \n### Target Level: \n\n### Learning Goals:\n- \n- \n- \n\n### Resources Needed:\n- \n- \n\n### Timeline:\n- Week 1: \n- Week 2: \n- Week 3: \n\n### Success Metrics:\n- \n- ',
        category: 'planning',
        isDefault: true
    },
    {
        id: 'daily_review',
        name: 'Daily Review',
        description: 'Review your daily learning progress',
        content: '## Daily Learning Review\n\n### Date: \n\n### What I Accomplished:\n- \n- \n- \n\n### Challenges Faced:\n- \n- \n\n### What I Learned:\n- \n- \n\n### Tomorrow\'s Goals:\n- \n- \n\n### Gratitude:\n- \n- ',
        category: 'review',
        isDefault: true
    }
];

export const NotesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [templates, setTemplates] = useState<NoteTemplate[]>(DEFAULT_TEMPLATES);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedType, setSelectedType] = useState<'all' | 'story' | 'skill' | 'general'>('all');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'updated'>('newest');

    // Load data from localStorage
    useEffect(() => {
        const savedNotes = localStorage.getItem('afterbell_notes');
        const savedTemplates = localStorage.getItem('afterbell_note_templates');

        if (savedNotes) {
            try {
                setNotes(JSON.parse(savedNotes));
            } catch (error) {
                console.error('Error loading notes:', error);
            }
        }

        if (savedTemplates) {
            try {
                const customTemplates = JSON.parse(savedTemplates);
                setTemplates([...DEFAULT_TEMPLATES, ...customTemplates]);
            } catch (error) {
                console.error('Error loading note templates:', error);
            }
        }
    }, []);

    // Save data to localStorage
    useEffect(() => {
        localStorage.setItem('afterbell_notes', JSON.stringify(notes));
    }, [notes]);

    useEffect(() => {
        const customTemplates = templates.filter(t => !t.isDefault);
        localStorage.setItem('afterbell_note_templates', JSON.stringify(customTemplates));
    }, [templates]);

    // Add a new note
    const addNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
        const newNote: Note = {
            ...noteData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        setNotes(prev => [newNote, ...prev]);
        return newNote.id;
    };

    // Update an existing note
    const updateNote = async (noteId: string, updates: Partial<Note>): Promise<void> => {
        setNotes(prev => prev.map(note =>
            note.id === noteId
                ? { ...note, ...updates, updatedAt: new Date().toISOString() }
                : note
        ));
    };

    // Delete a note
    const deleteNote = async (noteId: string): Promise<void> => {
        setNotes(prev => prev.filter(note => note.id !== noteId));
    };

    // Pin/unpin a note
    const pinNote = async (noteId: string): Promise<void> => {
        setNotes(prev => prev.map(note =>
            note.id === noteId ? { ...note, isPinned: true } : note
        ));
    };

    const unpinNote = async (noteId: string): Promise<void> => {
        setNotes(prev => prev.map(note =>
            note.id === noteId ? { ...note, isPinned: false } : note
        ));
    };

    // Favorite/unfavorite a note
    const favoriteNote = async (noteId: string): Promise<void> => {
        setNotes(prev => prev.map(note =>
            note.id === noteId ? { ...note, isFavorite: true } : note
        ));
    };

    const unfavoriteNote = async (noteId: string): Promise<void> => {
        setNotes(prev => prev.map(note =>
            note.id === noteId ? { ...note, isFavorite: false } : note
        ));
    };

    // Create a custom template
    const createTemplate = async (templateData: Omit<NoteTemplate, 'id'>): Promise<string> => {
        const newTemplate: NoteTemplate = {
            ...templateData,
            id: Date.now().toString()
        };

        setTemplates(prev => [...prev, newTemplate]);
        return newTemplate.id;
    };

    // Use a template to create a note
    const useTemplate = async (templateId: string): Promise<Note> => {
        const template = templates.find(t => t.id === templateId);
        if (!template) throw new Error('Template not found');

        const newNote: Note = {
            id: Date.now().toString(),
            title: template.name,
            content: template.content,
            type: 'general',
            tags: [template.category],
            isPinned: false,
            isFavorite: false,
            color: 'default',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        setNotes(prev => [newNote, ...prev]);
        return newNote;
    };

    // Get notes by type
    const getNotesByType = (type: string): Note[] => {
        return notes.filter(note => note.type === type);
    };

    // Get notes by related ID
    const getNotesByRelatedId = (relatedId: string): Note[] => {
        return notes.filter(note => note.relatedId === relatedId);
    };

    // Get pinned notes
    const getPinnedNotes = (): Note[] => {
        return notes.filter(note => note.isPinned);
    };

    // Get favorite notes
    const getFavoriteNotes = (): Note[] => {
        return notes.filter(note => note.isFavorite);
    };

    // Get all unique tags
    const getAllTags = (): string[] => {
        const allTags = notes.flatMap(note => note.tags);
        return Array.from(new Set(allTags)).sort();
    };

    // Search notes
    const searchNotes = (query: string): Note[] => {
        if (!query.trim()) return notes;

        const lowercaseQuery = query.toLowerCase();
        return notes.filter(note =>
            note.title.toLowerCase().includes(lowercaseQuery) ||
            note.content.toLowerCase().includes(lowercaseQuery) ||
            note.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
        );
    };

    // Get filtered notes
    const getFilteredNotes = (): Note[] => {
        let filtered = notes;

        // Filter by type
        if (selectedType !== 'all') {
            filtered = filtered.filter(note => note.type === selectedType);
        }

        // Filter by tags
        if (selectedTags.length > 0) {
            filtered = filtered.filter(note =>
                selectedTags.some(tag => note.tags.includes(tag))
            );
        }

        // Filter by search query
        if (searchQuery.trim()) {
            filtered = searchNotes(searchQuery);
        }

        // Sort notes (pinned first, then by selected sort)
        filtered.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'updated':
                    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                default:
                    return 0;
            }
        });

        return filtered;
    };

    const value: NotesContextType = {
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
        createTemplate,
        useTemplate,
        getNotesByType,
        getNotesByRelatedId,
        getPinnedNotes,
        getFavoriteNotes,
        getFilteredNotes,
        getAllTags,
        searchNotes,
        setSearchQuery,
        setSelectedTags,
        setSelectedType,
        setSortBy
    };

    return (
        <NotesContext.Provider value={value}>
            {children}
        </NotesContext.Provider>
    );
};

export const useNotes = () => {
    const context = useContext(NotesContext);
    if (context === undefined) {
        throw new Error('useNotes must be used within a NotesProvider');
    }
    return context;
};
