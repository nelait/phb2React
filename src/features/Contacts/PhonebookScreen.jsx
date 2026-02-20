import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { contactsApi } from '../../services/contactsApi';
import { useToast } from '../../contexts/ToastContext';
import { ConfirmDialog } from '../../components/ConfirmDialog';

export const PhonebookScreen = () => {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const data = await contactsApi.getAll();
    setContacts(data);
  };

  const filteredContacts = useMemo(() => {
    if (!search.trim()) return contacts;
    return contactsApi.search(contacts, search);
  }, [contacts, search]);

  const handleDelete = async () => {
    if (deleteId) {
      await contactsApi.delete(deleteId);
      setContacts((prev) => prev.filter((c) => c.id !== deleteId));
      setDeleteId(null);
      showToast('Contact deleted successfully!');
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>My Contacts</h1>
          <p className="subtitle">
            {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link to="/add" className="btn btn-primary">
          <span>＋</span> Add Contact
        </Link>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, phone, or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        {search && (
          <button className="btn btn-ghost" onClick={() => setSearch('')}>
            Clear
          </button>
        )}
      </div>

      {filteredContacts.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <h2>No contacts found</h2>
          <p>
            {search
              ? 'Try a different search term.'
              : 'Add your first contact to get started!'}
          </p>
          {!search && (
            <Link to="/add" className="btn btn-primary">
              ＋ Add Contact
            </Link>
          )}
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="contacts-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Category</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((c) => (
                <tr key={c.id}>
                  <td className="td-name">
                    <span className="avatar">
                      {c.name.charAt(0).toUpperCase()}
                    </span>
                    {c.name}
                  </td>
                  <td>{c.phone}</td>
                  <td>{c.email || '—'}</td>
                  <td>
                    <span className="badge">{c.category}</span>
                  </td>
                  <td className="td-actions">
                    <Link
                      to={`/edit?id=${encodeURIComponent(c.id)}`}
                      className="btn btn-sm btn-secondary"
                    >
                      Edit
                    </Link>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => setDeleteId(c.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete Contact"
          message={`Are you sure you want to delete this contact?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </>
  );
};
