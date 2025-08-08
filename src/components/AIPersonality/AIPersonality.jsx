import React, { useState, useContext } from 'react';
import { Context } from '../../context/Context';
import { Bot, X, Sliders } from 'lucide-react';
import './AIPersonality.css';

const AIPersonality = ({ isOpen, onClose }) => {
  const { aiPersonality, setAiPersonality } = useContext(Context);
  const [tempSettings, setTempSettings] = useState(aiPersonality);

  const personalities = [
    {
      id: 'professional',
      name: 'Professional',
      description: 'Formal, precise, and business-oriented responses',
      tone: 'formal',
      style: 'concise',
      expertise: 'business'
    },
    {
      id: 'friendly',
      name: 'Friendly',
      description: 'Warm, approachable, and conversational',
      tone: 'casual',
      style: 'detailed',
      expertise: 'general'
    },
    {
      id: 'technical',
      name: 'Technical Expert',
      description: 'Deep technical knowledge with detailed explanations',
      tone: 'neutral',
      style: 'detailed',
      expertise: 'technical'
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Imaginative, inspiring, and out-of-the-box thinking',
      tone: 'enthusiastic',
      style: 'creative',
      expertise: 'creative'
    },
    {
      id: 'teacher',
      name: 'Teacher',
      description: 'Patient, educational, with step-by-step explanations',
      tone: 'encouraging',
      style: 'educational',
      expertise: 'educational'
    }
  ];

  const handleSave = () => {
    setAiPersonality(tempSettings);
    onClose();
  };

  const handlePresetSelect = (preset) => {
    setTempSettings({
      ...tempSettings,
      preset: preset.id,
      tone: preset.tone,
      style: preset.style,
      expertise: preset.expertise
    });
  };

  if (!isOpen) return null;

  return (
    <div className="ai-personality-overlay">
      <div className="ai-personality-modal">
        <div className="personality-header">
          <div className="personality-title">
            <Bot size={24} />
            <h2>AI Personality Settings</h2>
          </div>
          <button className="close-personality" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="personality-content">
          <div className="personality-presets">
            <h3>Quick Presets</h3>
            <div className="presets-grid">
              {personalities.map(preset => (
                <div
                  key={preset.id}
                  className={`preset-card ${tempSettings.preset === preset.id ? 'active' : ''}`}
                  onClick={() => handlePresetSelect(preset)}
                >
                  <h4>{preset.name}</h4>
                  <p>{preset.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="custom-settings">
            <h3>Custom Settings</h3>
            
            <div className="setting-group">
              <label>Response Tone</label>
              <select
                value={tempSettings.tone}
                onChange={(e) => setTempSettings({ ...tempSettings, tone: e.target.value })}
                className="personality-select"
              >
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
                <option value="neutral">Neutral</option>
                <option value="enthusiastic">Enthusiastic</option>
                <option value="encouraging">Encouraging</option>
              </select>
            </div>

            <div className="setting-group">
              <label>Response Style</label>
              <select
                value={tempSettings.style}
                onChange={(e) => setTempSettings({ ...tempSettings, style: e.target.value })}
                className="personality-select"
              >
                <option value="concise">Concise</option>
                <option value="detailed">Detailed</option>
                <option value="creative">Creative</option>
                <option value="educational">Educational</option>
              </select>
            </div>

            <div className="setting-group">
              <label>Expertise Focus</label>
              <select
                value={tempSettings.expertise}
                onChange={(e) => setTempSettings({ ...tempSettings, expertise: e.target.value })}
                className="personality-select"
              >
                <option value="general">General Knowledge</option>
                <option value="technical">Technical/Programming</option>
                <option value="business">Business/Professional</option>
                <option value="creative">Creative/Arts</option>
                <option value="educational">Educational/Teaching</option>
              </select>
            </div>

            <div className="setting-group">
              <label>Custom Instructions</label>
              <textarea
                value={tempSettings.customInstructions || ''}
                onChange={(e) => setTempSettings({ ...tempSettings, customInstructions: e.target.value })}
                placeholder="Add specific instructions for how the AI should behave..."
                className="personality-textarea"
                rows={4}
              />
            </div>
          </div>

          <div className="personality-actions">
            <button className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button className="save-btn" onClick={handleSave}>
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPersonality;