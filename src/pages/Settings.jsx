import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';
import toast from 'react-hot-toast';

const AVAILABLE_SETTINGS = [
  { key: 'facebook', label: 'Facebook URL', placeholder: 'https://facebook.com/...' },
  { key: 'instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/...' },
  { key: 'twitter', label: 'Twitter (X) URL', placeholder: 'https://twitter.com/...' },
  { key: 'youtube', label: 'YouTube URL', placeholder: 'https://youtube.com/...' },
  { key: 'linkedin', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/...' },
  { key: 'whatsapp', label: 'WhatsApp URL', placeholder: 'https://wa.me/91...' },
];

export default function Settings() {
  const [settingsForm, setSettingsForm] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsAPI.getAll();
      if (res.success) {
        const formState = {};
        res.data.forEach(setting => {
          formState[setting.key] = setting.value;
        });
        setSettingsForm(formState);
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSettingsForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveAll = async () => {
    try {
      // Convert formState object to array expected by backend
      const settingsArray = Object.entries(settingsForm).map(([key, value]) => {
        const settingInfo = AVAILABLE_SETTINGS.find(s => s.key === key);
        return {
          key,
          value,
          label: settingInfo ? settingInfo.label : key
        };
      });

      const res = await settingsAPI.saveAll({ settings: settingsArray });
      if (res.success) {
        toast.success('Settings saved successfully');
        fetchSettings(); // Refresh from DB
      }
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="admin-page max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Site Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage social media and messaging links</p>
        </div>
        <button 
          onClick={handleSaveAll}
          className="bg-brand text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-brand/20 hover:shadow-lg hover:shadow-brand/30 hover:-translate-y-0.5 transition-all"
        >
          Save All Changes
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-800">Configuration Details</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {AVAILABLE_SETTINGS.map((setting) => (
              <div key={setting.key} className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="w-full sm:w-48 flex-shrink-0">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {setting.label}
                  </label>
                </div>
                <div className="flex-1">
                  <input 
                    type="text"
                    placeholder={setting.placeholder}
                    value={settingsForm[setting.key] || ''}
                    onChange={(e) => handleChange(setting.key, e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
