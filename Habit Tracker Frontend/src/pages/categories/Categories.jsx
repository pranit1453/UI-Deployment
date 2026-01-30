import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import categoryService from '../../services/categoryService';
import { getApiErrorMessage } from '../../utils/apiError';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ categoryName: '', description: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        categoryName: category.categoryName,
        description: category.description || '',
      });
    } else {
      setEditingCategory(null);
      setFormData({ categoryName: '', description: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ categoryName: '', description: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingCategory) {
        const updatedCategories = categories.map((cat) =>
          cat.categoryId === editingCategory.categoryId
            ? { ...cat, ...formData }
            : cat
        );
        setCategories(updatedCategories);
        await categoryService.updateCategory(editingCategory.categoryId, formData);
      } else {
        const tempCategory = { categoryId: Date.now(), ...formData };
        setCategories([...categories, tempCategory]);
        await categoryService.createCategory(formData);
      }
      fetchCategories();
      handleCloseModal();
    } catch (err) {
      setError(getApiErrorMessage(err));
      fetchCategories();
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure? This will affect all habits in this category.')) return;
    setError('');
    try {
      const updatedCategories = categories.filter((cat) => cat.categoryId !== categoryId);
      setCategories(updatedCategories);
      await categoryService.deleteCategory(categoryId);
    } catch (err) {
      setError(getApiErrorMessage(err));
      fetchCategories();
    }
  };

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  return (
    <Layout>
      <div className="container-xxl page-enter">
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')} aria-label="Close" />
          </div>
        )}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1">📁 Categories</h2>
            <p className="text-muted mb-0">Organize your habits by categories</p>
          </div>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            + Add Category
          </button>
        </div>

        {categories.length === 0 ? (
          <EmptyState
            title="No Categories Yet"
            message="Create categories to better organize your habits!"
            action={
              <button
                className="btn btn-primary"
                onClick={() => handleOpenModal()}
              >
                Create Your First Category
              </button>
            }
          />
        ) : (
          <div className="row g-4">
            {categories.map((category) => (
              <div key={category.categoryId} className="col-md-6 col-lg-4">
                <div className="card h-100 shadow-sm border-0 card-hover">
                  <div className="card-body">
                    <div className="d-flex align-items-start justify-content-between mb-3">
                      <h5 className="card-title mb-0">{category.categoryName}</h5>
                      <span className="badge bg-primary">Category</span>
                    </div>
                    <p className="card-text text-muted">
                      {category.description || 'No description provided'}
                    </p>
                  </div>
                  <div className="card-footer bg-transparent border-top">
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary flex-fill"
                        onClick={() => handleOpenModal(category)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(category.categoryId)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal
          show={showModal}
          onHide={handleCloseModal}
          title={editingCategory ? '✏️ Edit Category' : '➕ Add Category'}
          footer={
            <>
              <button className="btn btn-secondary" onClick={handleCloseModal}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                {editingCategory ? 'Update Category' : 'Create Category'}
              </button>
            </>
          }
        >
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="categoryName" className="form-label">
                Category Name *
              </label>
              <input
                type="text"
                className="form-control"
                id="categoryName"
                placeholder="e.g., Health, Fitness, Learning"
                value={formData.categoryName}
                onChange={(e) =>
                  setFormData({ ...formData, categoryName: e.target.value })
                }
                required
                maxLength="50"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                className="form-control"
                id="description"
                rows="3"
                placeholder="Optional description for this category..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                maxLength="200"
              ></textarea>
              <small className="text-muted">
                {formData.description.length}/200 characters
              </small>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default Categories;
