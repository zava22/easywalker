import React, { useState, useContext } from 'react';
import { Context } from '../../context/Context';
import { X, Plus, Edit2, Trash2, Folder, Tag } from 'lucide-react';
import './CategoryModal.css';

const CategoryModal = ({ isOpen, onClose }) => {
  const { 
    categories, 
    createCategory, 
    updateCategory, 
    deleteCategory,
    assignChatToCategory,
    chats 
  } = useContext(Context);
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#8b5cf6');

  const colors = [
    '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', 
    '#f59e0b', '#ef4444', '#ec4899', '#6366f1'
  ];

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      createCategory({
        name: newCategoryName.trim(),
        color: selectedColor
      });
      setNewCategoryName('');
      setSelectedColor('#8b5cf6');
    }
  };

  const handleUpdateCategory = () => {
    if (editingCategory && editingCategory.name.trim()) {
      updateCategory(editingCategory.id, {
        name: editingCategory.name.trim(),
        color: editingCategory.color
      });
      setEditingCategory(null);
    }
  };

  const getChatCountForCategory = (categoryId) => {
    return chats.filter(chat => chat.categoryId === categoryId).length;
  };

  if (!isOpen) return null;

  return (
    <div className="category-overlay">
      <div className="category-modal">
        <div className="category-header">
          <h2>Manage Categories</h2>
          <button className="close-category" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="category-content">
          <div className="create-category">
            <h3>Create New Category</h3>
            <div className="category-form">
              <input
                type="text"
                placeholder="Category name..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="category-input"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
              />
              <div className="color-picker">
                {colors.map(color => (
                  <button
                    key={color}
                    className={`color-option ${selectedColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
              <button 
                className="create-btn"
                onClick={handleCreateCategory}
                disabled={!newCategoryName.trim()}
              >
                <Plus size={20} />
                Create Category
              </button>
            </div>
          </div>

          <div className="categories-list">
            <h3>Existing Categories</h3>
            {categories.length === 0 ? (
              <div className="no-categories">
                <Folder size={48} />
                <p>No categories yet. Create your first category above!</p>
              </div>
            ) : (
              <div className="categories-grid">
                {categories.map(category => (
                  <div key={category.id} className="category-item">
                    {editingCategory?.id === category.id ? (
                      <div className="edit-category">
                        <input
                          type="text"
                          value={editingCategory.name}
                          onChange={(e) => setEditingCategory({
                            ...editingCategory,
                            name: e.target.value
                          })}
                          className="edit-input"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUpdateCategory();
                            if (e.key === 'Escape') setEditingCategory(null);
                          }}
                          autoFocus
                        />
                        <div className="color-picker small">
                          {colors.map(color => (
                            <button
                              key={color}
                              className={`color-option ${editingCategory.color === color ? 'active' : ''}`}
                              style={{ backgroundColor: color }}
                              onClick={() => setEditingCategory({
                                ...editingCategory,
                                color
                              })}
                            />
                          ))}
                        </div>
                        <div className="edit-actions">
                          <button className="save-btn" onClick={handleUpdateCategory}>
                            Save
                          </button>
                          <button className="cancel-btn" onClick={() => setEditingCategory(null)}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="category-info">
                          <div 
                            className="category-color"
                            style={{ backgroundColor: category.color }}
                          />
                          <div className="category-details">
                            <span className="category-name">{category.name}</span>
                            <span className="category-count">
                              {getChatCountForCategory(category.id)} chats
                            </span>
                          </div>
                        </div>
                        <div className="category-actions">
                          <button
                            className="edit-category-btn"
                            onClick={() => setEditingCategory(category)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="delete-category-btn"
                            onClick={() => {
                              if (confirm(`Delete category "${category.name}"? Chats will be moved to "Uncategorized".`)) {
                                deleteCategory(category.id);
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

export default CategoryModal;