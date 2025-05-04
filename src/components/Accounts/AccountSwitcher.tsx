import React, { useState } from 'react';
import { useCharacters } from '../../contexts/CharacterContext';

const AccountSwitcher: React.FC = () => {
  const { accounts, currentAccountId, switchAccount, addAccount, updateAccountName, deleteAccount } = useCharacters();
  const [showNewAccountForm, setShowNewAccountForm] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Handle account switching
  const handleAccountSwitch = (accountId: string) => {
    switchAccount(accountId);
  };

  // Handle adding a new account
  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAccountName.trim()) {
      addAccount(newAccountName.trim());
      setNewAccountName('');
      setShowNewAccountForm(false);
    }
  };

  // Start editing an account name
  const handleEditStart = (accountId: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAccountId(accountId);
    setEditingName(currentName);
  };

  // Save edited account name
  const handleEditSave = (accountId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingName.trim()) {
      updateAccountName(accountId, editingName.trim());
    }
    setEditingAccountId(null);
  };

  // Handle deleting an account
  const handleDeleteAccount = (accountId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this account? All characters in this account will be deleted.')) {
      try {
        deleteAccount(accountId);
      } catch (error) {
        alert((error as Error).message);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-lg font-semibold mb-4 border-b pb-2">Accounts</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {accounts.map(account => (
          <div 
            key={account.id}
            onClick={() => handleAccountSwitch(account.id)}
            className={`
              relative rounded-lg p-3
              ${currentAccountId === account.id 
                ? 'text-gray-800  bg-gray-100' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-400'
              }
              transition-all cursor-pointer
            `}
          >
            {editingAccountId === account.id ? (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="flex items-center w-full"
              >
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full px-2 py-1 text-black rounded border"
                  autoFocus
                />
                <button
                  onClick={(e) => handleEditSave(account.id, e)}
                  className="ml-2 p-1 bg-green-500 text-white rounded-full flex items-center justify-center"
                  title="Save"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <div className="mb-2">
                  <div className="font-medium text-base mb-1">{account.name}</div>
                  <div className="text-sm opacity-80">
                    {account.characters.length} character{account.characters.length !== 1 ? 's' : ''}
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={(e) => handleEditStart(account.id, account.name, e)}
                    className={`
                      bg-[#2a3042] text-white p-2 rounded-full
                      hover:bg-opacity-80 transition-colors
                      flex items-center justify-center
                    `}
                    title="Edit Account Name"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  
                  {accounts.length > 1 && (
                    <button
                      onClick={(e) => handleDeleteAccount(account.id, e)}
                      className={`
                        bg-[#2a3042] text-white p-2 rounded-full
                        hover:bg-opacity-80 transition-colors
                        flex items-center justify-center
                        ${currentAccountId === account.id ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                      disabled={currentAccountId === account.id}
                      title={currentAccountId === account.id ? "Cannot delete active account" : "Delete Account"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      
      {/* New account form */}
      {showNewAccountForm && (
        <div className="mt-4 border-t pt-4">
          <form onSubmit={handleAddAccount} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-medium mb-3">Create New Account</h3>
            <div className="flex">
              <input
                type="text"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                placeholder="Account Name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-[#344055]"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#344055] text-white rounded-r-md hover:bg-[#293346] transition-colors"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowNewAccountForm(false)}
                className="px-4 py-2 ml-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AccountSwitcher;