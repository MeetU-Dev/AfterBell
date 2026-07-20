import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiLayers, FiBookOpen, FiUsers, FiLink } from 'react-icons/fi';

interface SkillDomain {
  _id: string;
  name: string;
  description: string;
}

interface Lesson {
  _id: string;
  title: string;
  description: string;
  video: string;
  videoType: string;
  source: string;
  partner: { _id: string; name: string } | null;
  skillDomain: string;
}

interface Partner {
  _id: string;
  name: string;
  website: string;
  description: string;
  partnerType: string;
  isActive: boolean;
}

type Tab = 'domains' | 'lessons' | 'partners';

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('domains');
  const [domains, setDomains] = useState<SkillDomain[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'domains') {
        const data = await apiRequest('/api/v1/skilldomains');
        setDomains(data.data || []);
      } else if (activeTab === 'lessons') {
        const data = await apiRequest('/api/v1/lessons');
        setLessons(data.data || []);
      } else {
        const data = await apiRequest('/api/v1/partners/all');
        setPartners(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load:', err);
    }
    setLoading(false);
  };

  const startEdit = (item: any) => {
    setEditingId(item._id || 'new');
    setEditForm({ ...item });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveDomain = async () => {
    try {
      if (editingId === 'new') {
        await apiRequest('/api/v1/skilldomains', {
          method: 'POST',
          body: JSON.stringify({ name: editForm.name, description: editForm.description }),
        });
      } else {
        await apiRequest(`/api/v1/skilldomains/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify({ name: editForm.name, description: editForm.description }),
        });
      }
      cancelEdit();
      loadData();
    } catch (err) {
      alert('Failed to save: ' + (err as Error).message);
    }
  };

  const deleteDomain = async (id: string) => {
    if (!window.confirm('Delete this domain and all its lessons?')) return;
    try {
      await apiRequest(`/api/v1/skilldomains/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      alert('Failed to delete: ' + (err as Error).message);
    }
  };

  const saveLesson = async () => {
    try {
      const body = {
        title: editForm.title,
        description: editForm.description,
        video: editForm.video || '',
        videoType: editForm.videoType || 'none',
        source: editForm.source || '',
        partner: editForm.partner || undefined,
      };

      if (editingId === 'new') {
        if (!editForm.skillDomain) {
          alert('Please assign a skill domain');
          return;
        }
        await apiRequest(`/api/v1/skilldomains/${editForm.skillDomain}/lessons`, {
          method: 'POST',
          body: JSON.stringify(body),
        });
      } else {
        await apiRequest(`/api/v1/lessons/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
      }
      cancelEdit();
      loadData();
    } catch (err) {
      alert('Failed to save: ' + (err as Error).message);
    }
  };

  const deleteLesson = async (id: string) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await apiRequest(`/api/v1/lessons/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      alert('Failed to delete: ' + (err as Error).message);
    }
  };

  const savePartner = async () => {
    try {
      const body = {
        name: editForm.name,
        website: editForm.website || '',
        description: editForm.description || '',
        partnerType: editForm.partnerType || 'other',
      };
      if (editingId === 'new') {
        await apiRequest('/api/v1/partners', {
          method: 'POST',
          body: JSON.stringify(body),
        });
      } else {
        await apiRequest(`/api/v1/partners/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
      }
      cancelEdit();
      loadData();
    } catch (err) {
      alert('Failed to save: ' + (err as Error).message);
    }
  };

  const deletePartner = async (id: string) => {
    if (!window.confirm('Delete this partner?')) return;
    try {
      await apiRequest(`/api/v1/partners/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      alert('Failed to delete: ' + (err as Error).message);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'domains', label: 'Skill Domains', icon: <FiLayers /> },
    { id: 'lessons', label: 'Lessons', icon: <FiBookOpen /> },
    { id: 'partners', label: 'Partners', icon: <FiUsers /> },
  ];

  const partnerTypeLabels: Record<string, string> = {
    ngo: 'NGO',
    government: 'Government',
    psychologist: 'Psychologist',
    career_expert: 'Career Expert',
    financial_educator: 'Financial Educator',
    healthcare: 'Healthcare',
    educational: 'Educational',
    other: 'Other',
  };

  return (
    <div className="min-h-screen bg-[#0D1117] pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white">Content Manager</h1>
          <p className="text-slate-400 mt-1">Manage skill domains, lessons, and content partners</p>
        </motion.div>

        <div className="flex space-x-1 bg-slate-800/50 rounded-xl p-1 border border-slate-700/50 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all flex-1 justify-center ${
                activeTab === tab.id ? 'bg-secondary-green text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-20">Loading...</div>
        ) : (
          <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {activeTab === 'domains' && (
              <div className="space-y-4">
                <button onClick={() => startEdit({ name: '', description: '' })} className="flex items-center space-x-2 px-4 py-2 bg-secondary-green text-white rounded-lg hover:bg-emerald-600 transition-colors">
                  <FiPlus /> <span>New Domain</span>
                </button>
                {editingId && (editingId === 'new' || domains.find(d => d._id === editingId)) && (
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 space-y-3">
                    <input className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded text-white" placeholder="Name" value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                    <textarea className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded text-white" placeholder="Description" rows={2} value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                    <div className="flex space-x-2">
                      <button onClick={saveDomain} className="flex items-center space-x-1 px-3 py-1.5 bg-secondary-green text-white rounded"><FiSave /> <span>Save</span></button>
                      <button onClick={cancelEdit} className="flex items-center space-x-1 px-3 py-1.5 bg-slate-600 text-white rounded"><FiX /> <span>Cancel</span></button>
                    </div>
                  </div>
                )}
                {domains.map(domain => (
                  <div key={domain._id} className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-semibold">{domain.name}</h3>
                      <p className="text-slate-400 text-sm">{domain.description}</p>
                    </div>
                    <div className="flex space-x-2 flex-shrink-0">
                      <button onClick={() => startEdit(domain)} className="p-2 text-slate-400 hover:text-white"><FiEdit2 /></button>
                      <button onClick={() => deleteDomain(domain._id)} className="p-2 text-red-400 hover:text-red-300"><FiTrash2 /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'lessons' && (
              <div className="space-y-4">
                <button onClick={() => startEdit({ title: '', description: '', video: '', videoType: 'none', source: '', partner: '', skillDomain: domains[0]?._id || '' })} className="flex items-center space-x-2 px-4 py-2 bg-secondary-green text-white rounded-lg hover:bg-emerald-600 transition-colors">
                  <FiPlus /> <span>New Lesson</span>
                </button>
                {editingId && (
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 space-y-3">
                    <input className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded text-white" placeholder="Title" value={editForm.title || ''} onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
                    <textarea className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded text-white" placeholder="Description" rows={2} value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                    <div className="grid grid-cols-2 gap-3">
                      <input className="p-2 bg-slate-700/50 border border-slate-600 rounded text-white" placeholder="Video URL" value={editForm.video || ''} onChange={e => setEditForm({ ...editForm, video: e.target.value })} />
                      <select className="p-2 bg-slate-700/50 border border-slate-600 rounded text-white" value={editForm.videoType || 'none'} onChange={e => setEditForm({ ...editForm, videoType: e.target.value })}>
                        <option value="none">No Video</option>
                        <option value="youtube">YouTube</option>
                        <option value="vimeo">Vimeo</option>
                        <option value="direct">Direct URL</option>
                      </select>
                    </div>
                    <input className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded text-white" placeholder="Source attribution (e.g. 'Khan Academy')" value={editForm.source || ''} onChange={e => setEditForm({ ...editForm, source: e.target.value })} />
                    {editingId === 'new' && (
                      <select className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded text-white" value={editForm.skillDomain || ''} onChange={e => setEditForm({ ...editForm, skillDomain: e.target.value })}>
                        <option value="">Select Skill Domain</option>
                        {domains.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                      </select>
                    )}
                    <select className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded text-white" value={editForm.partner || ''} onChange={e => setEditForm({ ...editForm, partner: e.target.value })}>
                      <option value="">No Partner</option>
                      {partners.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                    <div className="flex space-x-2">
                      <button onClick={saveLesson} className="flex items-center space-x-1 px-3 py-1.5 bg-secondary-green text-white rounded"><FiSave /> <span>Save</span></button>
                      <button onClick={cancelEdit} className="flex items-center space-x-1 px-3 py-1.5 bg-slate-600 text-white rounded"><FiX /> <span>Cancel</span></button>
                    </div>
                  </div>
                )}
                {lessons.map(lesson => (
                  <div key={lesson._id} className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{lesson.title}</h3>
                        <p className="text-slate-400 text-sm mt-1">{lesson.description}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {lesson.videoType && lesson.videoType !== 'none' && (
                            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">{lesson.videoType.toUpperCase()}</span>
                          )}
                          {lesson.source && (
                            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded flex items-center space-x-1">
                              <FiLink className="w-3 h-3" />
                              <span>{lesson.source}</span>
                            </span>
                          )}
                          {lesson.partner && (
                            <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">Partner: {lesson.partner.name}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2 flex-shrink-0 ml-4">
                        <button onClick={() => startEdit(lesson)} className="p-2 text-slate-400 hover:text-white"><FiEdit2 /></button>
                        <button onClick={() => deleteLesson(lesson._id)} className="p-2 text-red-400 hover:text-red-300"><FiTrash2 /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'partners' && (
              <div className="space-y-4">
                <button onClick={() => startEdit({ name: '', website: '', description: '', partnerType: 'other' })} className="flex items-center space-x-2 px-4 py-2 bg-secondary-green text-white rounded-lg hover:bg-emerald-600 transition-colors">
                  <FiPlus /> <span>New Partner</span>
                </button>
                {editingId && (
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 space-y-3">
                    <input className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded text-white" placeholder="Organization Name" value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                    <input className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded text-white" placeholder="Website URL" value={editForm.website || ''} onChange={e => setEditForm({ ...editForm, website: e.target.value })} />
                    <textarea className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded text-white" placeholder="Description" rows={2} value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                    <select className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded text-white" value={editForm.partnerType || 'other'} onChange={e => setEditForm({ ...editForm, partnerType: e.target.value })}>
                      {Object.entries(partnerTypeLabels).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                    <div className="flex space-x-2">
                      <button onClick={savePartner} className="flex items-center space-x-1 px-3 py-1.5 bg-secondary-green text-white rounded"><FiSave /> <span>Save</span></button>
                      <button onClick={cancelEdit} className="flex items-center space-x-1 px-3 py-1.5 bg-slate-600 text-white rounded"><FiX /> <span>Cancel</span></button>
                    </div>
                  </div>
                )}
                {partners.map(partner => (
                  <div key={partner._id} className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-white font-semibold">{partner.name}</h3>
                        <span className="text-xs bg-slate-600/50 text-slate-300 px-2 py-0.5 rounded">{partnerTypeLabels[partner.partnerType] || partner.partnerType}</span>
                      </div>
                      {partner.website && <p className="text-slate-400 text-sm">{partner.website}</p>}
                      {partner.description && <p className="text-slate-400 text-sm mt-1">{partner.description}</p>}
                    </div>
                    <div className="flex space-x-2 flex-shrink-0">
                      <button onClick={() => startEdit(partner)} className="p-2 text-slate-400 hover:text-white"><FiEdit2 /></button>
                      <button onClick={() => deletePartner(partner._id)} className="p-2 text-red-400 hover:text-red-300"><FiTrash2 /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;