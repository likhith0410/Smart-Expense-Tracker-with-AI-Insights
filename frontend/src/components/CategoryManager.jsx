// frontend/src/components/CategoryManager.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, X } from 'lucide-react';
import { expenseService } from '../services/api';
import toast from 'react-hot-toast';

const CategoryManager = ({ isOpen, onClose, onCategoryAdded }) => {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '💰',
    color: '#6366f1'
  });
  const [loading, setLoading] = useState(false);

  const defaultIcons = [
    '🍽️', '🚗', '🛍️', '🎬', '🏥', '⚡', '📚', '🛒', 
    '💪', '✈️', '📄', '💰', '🎵', '🏠', '👕', '📱'
  ];

  const defaultColors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
  ];

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const data = await expenseService.getCategories();
      setCategories(data.results || data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingCategory) {
        // Update existing category
        await expenseService.updateCategory(editingCategory.id, formData);
        toast.success('Category updated successfully!');
      } else {
        // Create new category
        await expenseService.createCategory(formData);
        toast.success('Category created successfully!');
      }
      
      fetchCategories();
      onCategoryAdded();
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.response?.data?.error || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      color: category.color
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        await expenseService.deleteCategory(categoryId);
        toast.success('Category deleted successfully!');
        fetchCategories();
        onCategoryAdded();
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Failed to delete category');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', icon: '💰', color: '#6366f1' });
    setEditingCategory(null);
    setShowForm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="category-manager-modal glass-card">
        <div className="modal-header">
          <h2>
            <Tag size={20} />
            Manage Categories
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="category-manager-content">
          {/* Category List */}
          <div className="category-list-section">
            <div className="section-header">
              <h3>Your Categories</h3>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => setShowForm(true)}
              >
                <Plus size={16} />
                Add Category
              </button>
            </div>

            <div className="category-grid">
              {categories.map((category) => (
                <div key={category.id} className="category-item">
                  <div className="category-display">
                    <span 
                      className="category-icon"
                      style={{ color: category.color }}
                    >
                      {category.icon}
                    </span>
                    <span className="category-name">{category.name}</span>
                    <span className="category-usage">
                      {category.expense_count || 0} expenses
                    </span>
                  </div>
                  
                  <div className="category-actions">
                    <button 
                      className="action-btn edit-btn"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Form */}
          {showForm && (
            <div className="category-form-section">
              <div className="section-header">
                <h3>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSubmit} className="category-form">
                <div className="form-row">
                  <div className="input-group">
                    <label className="input-label">Category Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="input-field"
                      placeholder="e.g., Entertainment"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label className="input-label">Select Icon</label>
                    <div className="icon-selector">
                      {defaultIcons.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
                          onClick={() => setFormData({...formData, icon})}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label className="input-label">Select Color</label>
                    <div className="color-selector">
                      {defaultColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`color-option ${formData.color === color ? 'selected' : ''}`}
                          style={{ backgroundColor: color }}
                          onClick={() => setFormData({...formData, color})}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-preview">
                  <label className="input-label">Preview</label>
                  <div className="preview-item">
                    <span style={{ color: formData.color, fontSize: '1.5rem' }}>
                      {formData.icon}
                    </span>
                    <span>{formData.name || 'Category Name'}</span>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || !formData.name}
                  >
                    {loading ? (
                      <div className="loading-spinner"></div>
                    ) : (
                      <>
                        {editingCategory ? 'Update' : 'Create'} Category
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;