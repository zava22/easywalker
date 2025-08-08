import React, { useState, useContext } from 'react';
import { Context } from '../../context/Context';
import { Plus, Edit2, Trash2, BookOpen, X } from 'lucide-react';
import './PromptTemplates.css';

const PromptTemplates = ({ isOpen, onClose, onSelectTemplate }) => {
  const { promptTemplates, createPromptTemplate, updatePromptTemplate, deletePromptTemplate } = useContext(Context);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [newTemplate, setNewTemplate] = useState({ title: '', content: '', category: 'general' });

  const categories = ['general', 'coding', 'writing', 'analysis', 'creative'];

  const handleCreateTemplate = () => {
    if (newTemplate.title.trim() && newTemplate.content.trim()) {
      createPromptTemplate(newTemplate);
      setNewTemplate({ title: '', content: '', category: 'general' });
    }
  };

  const handleUpdateTemplate = () => {
    if (editingTemplate && editingTemplate.title.trim() && editingTemplate.content.trim()) {
      updatePromptTemplate(editingTemplate.id, editingTemplate);
      setEditingTemplate(null);
    }
  };

  const handleSelectTemplate = (template) => {
    onSelectTemplate(template.content);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="prompt-templates-overlay">
      <div className="prompt-templates-modal">
        <div className="templates-header">
          <div className="templates-title">
            <BookOpen size={24} />
            <h2>Prompt Templates</h2>
          </div>
          <button className="close-templates" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="templates-content">
          <div className="create-template">
            <h3>Create New Template</h3>
            <div className="template-form">
              <input
                type="text"
                placeholder="Template title..."
                value={newTemplate.title}
                onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                className="template-input"
              />
              <select
                value={newTemplate.category}
                onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                className="template-select"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
              <textarea
                placeholder="Template content..."
                value={newTemplate.content}
                onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                className="template-textarea"
                rows={4}
              />
              <button className="create-template-btn" onClick={handleCreateTemplate}>
                <Plus size={20} />
                Create Template
              </button>
            </div>
          </div>

          <div className="templates-list">
            <h3>Your Templates</h3>
            {promptTemplates.length === 0 ? (
              <div className="no-templates">
                <BookOpen size={48} />
                <p>No templates yet. Create your first template above!</p>
              </div>
            ) : (
              <div className="templates-grid">
                {promptTemplates.map(template => (
                  <div key={template.id} className="template-card">
                    {editingTemplate?.id === template.id ? (
                      <div className="edit-template">
                        <input
                          type="text"
                          value={editingTemplate.title}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, title: e.target.value })}
                          className="template-input"
                        />
                        <select
                          value={editingTemplate.category}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
                          className="template-select"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                          ))}
                        </select>
                        <textarea
                          value={editingTemplate.content}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, content: e.target.value })}
                          className="template-textarea"
                          rows={3}
                        />
                        <div className="edit-actions">
                          <button className="save-btn" onClick={handleUpdateTemplate}>Save</button>
                          <button className="cancel-btn" onClick={() => setEditingTemplate(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="template-header">
                          <h4 className="template-title">{template.title}</h4>
                          <span className="template-category">{template.category}</span>
                        </div>
                        <p className="template-preview">{template.content}</p>
                        <div className="template-actions">
                          <button
                            className="use-template-btn"
                            onClick={() => handleSelectTemplate(template)}
                          >
                            Use Template
                          </button>
                          <button
                            className="edit-template-btn"
                            onClick={() => setEditingTemplate(template)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="delete-template-btn"
                            onClick={() => {
                              if (confirm(`Delete template "${template.title}"?`)) {
                                deletePromptTemplate(template.id);
                              }
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptTemplates;