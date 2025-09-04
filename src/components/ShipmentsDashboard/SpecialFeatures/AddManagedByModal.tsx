import React, { useState, useEffect } from 'react';
import styles from '../ShipmentsDashboard.module.css';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface Team {
  id: string;
  name: string;
  memberCount: number;
}

interface AddManagedByModalProps {
  show: boolean;
  shipmentId: string;
  currentManagedBy?: {
    type: 'user' | 'team';
    id: string;
    name: string;
  } | null;
  users: User[];
  teams: Team[];
  onSave: (managedBy: { type: 'user' | 'team'; id: string }) => void;
  onClose: () => void;
  isLoading?: boolean;
}

const AddManagedByModal: React.FC<AddManagedByModalProps> = ({
  show,
  shipmentId,
  currentManagedBy,
  users = [],
  teams = [],
  onSave,
  onClose,
  isLoading = false
}) => {
  const [selectedType, setSelectedType] = useState<'user' | 'team'>('user');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (currentManagedBy) {
      setSelectedType(currentManagedBy.type);
      setSelectedId(currentManagedBy.id);
    } else {
      setSelectedType('user');
      setSelectedId(null);
    }
  }, [currentManagedBy]);

  const handleSubmit = () => {
    if (!selectedId) return;
    onSave({ type: selectedType, id: selectedId });
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSelectedName = () => {
    if (!selectedId) return null;
    if (selectedType === 'user') {
      const user = users.find(u => u.id === selectedId);
      return user ? user.name : null;
    } else {
      const team = teams.find(t => t.id === selectedId);
      return team ? team.name : null;
    }
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.dialogMain} onClick={e => e.stopPropagation()}>
        <div className={styles.section}>
          <div className={styles.header}>
            <div className={styles.label}>
              {currentManagedBy ? 'Change' : 'Assign'} Management
            </div>
            <i className={styles.materialIcons} onClick={onClose}>close</i>
          </div>
          
          <div className={styles.formGroup}>
            <label>Shipment ID</label>
            <input 
              type="text" 
              value={shipmentId} 
              className={styles.readOnlyInput}
              readOnly 
            />
          </div>
          
          <div className={styles.formGroup}>
            <div className={styles.tabSelector}>
              <button
                type="button"
                className={`${styles.tabButton} ${selectedType === 'user' ? styles.activeTab : ''}`}
                onClick={() => {
                  setSelectedType('user');
                  setSelectedId(null);
                }}
              >
                User
              </button>
              <button
                type="button"
                className={`${styles.tabButton} ${selectedType === 'team' ? styles.activeTab : ''}`}
                onClick={() => {
                  setSelectedType('team');
                  setSelectedId(null);
                }}
              >
                Team
              </button>
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder={`Search ${selectedType === 'user' ? 'users' : 'teams'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              <span className={styles.searchIcon}>🔍</span>
            </div>
          </div>
          
          <div className={styles.selectionContainer}>
            {selectedType === 'user' ? (
              <div className={styles.userList}>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <div 
                      key={user.id}
                      className={`${styles.userItem} ${selectedId === user.id ? styles.selected : ''}`}
                      onClick={() => setSelectedId(user.id)}
                    >
                      <div className={styles.userAvatar}>
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} />
                        ) : (
                          <div className={styles.avatarPlaceholder}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className={styles.userInfo}>
                        <div className={styles.userName}>{user.name}</div>
                        <div className={styles.userEmail}>{user.email}</div>
                      </div>
                      <div className={styles.userRole}>{user.role}</div>
                      {selectedId === user.id && (
                        <div className={styles.selectedIndicator}>✓</div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className={styles.noResults}>
                    No users found matching "{searchQuery}"
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.teamList}>
                {filteredTeams.length > 0 ? (
                  filteredTeams.map(team => (
                    <div 
                      key={team.id}
                      className={`${styles.teamItem} ${selectedId === team.id ? styles.selected : ''}`}
                      onClick={() => setSelectedId(team.id)}
                    >
                      <div className={styles.teamIcon}>👥</div>
                      <div className={styles.teamInfo}>
                        <div className={styles.teamName}>{team.name}</div>
                        <div className={styles.teamMembers}>
                          {team.memberCount} member{team.memberCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                      {selectedId === team.id && (
                        <div className={styles.selectedIndicator}>✓</div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className={styles.noResults}>
                    No teams found matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className={styles.currentSelection}>
            {selectedId ? (
              <div className={styles.selectionBadge}>
                <span className={styles.badgeLabel}>Selected:</span>
                <span className={styles.badgeValue}>
                  {selectedType === 'user' ? '👤' : '👥'} {getSelectedName()}
                </span>
                <button 
                  type="button" 
                  className={styles.clearSelection}
                  onClick={() => setSelectedId(null)}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className={styles.noSelection}>
                No {selectedType} selected
              </div>
            )}
          </div>
          
          <div className={styles.dialogActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={isLoading || !selectedId}
            >
              {isLoading 
                ? 'Saving...' 
                : currentManagedBy 
                  ? 'Update Assignment' 
                  : 'Assign to Shipment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddManagedByModal;
