import React, { useState, useRef, useEffect } from 'react';
import { RoleExplorerProps } from '../types';
import { JOB_CATEGORIES } from '../utils/constants';
import './RoleExplorer.css';

export const RoleExplorer: React.FC<RoleExplorerProps> = ({
  roles,
  selectedRole,
  onRoleSelect,
  searchQuery,
  onSearchChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex(prev => 
            prev < roles.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : roles.length - 1
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < roles.length) {
            handleRoleSelect(roles[focusedIndex].id);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          searchInputRef.current?.blur();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedIndex, roles]);

  const handleRoleSelect = (roleId: string) => {
    onRoleSelect(roleId);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const handleSearchFocus = () => {
    setIsOpen(true);
    setFocusedIndex(-1);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
    setIsOpen(true);
    setFocusedIndex(-1);
  };

  const selectedRoleData = roles.find(role => role.id === selectedRole);

  // Group roles by category for better organization
  const rolesByCategory = roles.reduce((acc, role) => {
    if (!acc[role.category]) {
      acc[role.category] = [];
    }
    acc[role.category].push(role);
    return acc;
  }, {} as Record<string, typeof roles>);

  return (
    <div className="role-explorer" ref={dropdownRef}>
      <div className="search-container">
        <input
          ref={searchInputRef}
          type="text"
          className="search-input"
          placeholder="Search job roles..."
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          aria-label="Search job roles"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        />
        <div className="search-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
        </div>
      </div>

      {selectedRoleData && (
        <div className="selected-role-display">
          <div className="selected-role-info">
            <span className="selected-role-name">{selectedRoleData.name}</span>
            <span 
              className="selected-role-category"
              style={{ color: JOB_CATEGORIES[selectedRoleData.category].color }}
            >
              {JOB_CATEGORIES[selectedRoleData.category].name}
            </span>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="dropdown-menu" role="listbox">
          {roles.length === 0 ? (
            <div className="no-results">
              <p>No roles found matching "{searchQuery}"</p>
              <p className="suggestion">Try searching for categories like "AI", "Developer", or "Data"</p>
            </div>
          ) : (
            <div className="roles-list">
              {Object.entries(rolesByCategory).map(([categoryKey, categoryRoles]) => {
                const category = JOB_CATEGORIES[categoryKey as keyof typeof JOB_CATEGORIES];
                if (!category || categoryRoles.length === 0) return null;

                return (
                  <div key={categoryKey} className="category-group">
                    <div 
                      className="category-header"
                      style={{ borderLeftColor: category.color }}
                    >
                      <span className="category-name">{category.name}</span>
                      <span className="category-count">({categoryRoles.length})</span>
                    </div>
                    <div className="category-roles">
                      {categoryRoles.map((role, index) => {
                        const globalIndex = roles.indexOf(role);
                        const isSelected = role.id === selectedRole;
                        const isFocused = globalIndex === focusedIndex;

                        return (
                          <div
                            key={role.id}
                            className={`role-item ${isSelected ? 'selected' : ''} ${isFocused ? 'focused' : ''}`}
                            onClick={() => handleRoleSelect(role.id)}
                            role="option"
                            aria-selected={isSelected}
                            data-role-id={role.id}
                          >
                            <div className="role-main">
                              <span className="role-name">{role.name}</span>
                              {role.aliases.length > 0 && (
                                <span className="role-aliases">
                                  Also known as: {role.aliases.slice(0, 2).join(', ')}
                                  {role.aliases.length > 2 && ` +${role.aliases.length - 2} more`}
                                </span>
                              )}
                            </div>
                            <div className="role-description">
                              {role.description}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {roles.length > 0 && (
            <div className="dropdown-footer">
              <span className="results-count">
                {roles.length} role{roles.length !== 1 ? 's' : ''} found
              </span>
              <span className="keyboard-hint">
                Use ↑↓ to navigate, Enter to select, Esc to close
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoleExplorer;