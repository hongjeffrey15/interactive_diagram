import React from 'react';
import { Diagram } from '../types/diagram';

interface TabBarProps {
  diagrams: Diagram[];
  activeTabIndex: number;
  onTabSwitch: (index: number) => void;
  onNewTab: () => void;
  onCloseTab: (index: number) => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  diagrams,
  activeTabIndex,
  onTabSwitch,
  onNewTab,
  onCloseTab
}) => {
  return (
    <div className="tab-bar">
      <div className="tabs">
        {diagrams.map((diagram, index) => (
          <div
            key={diagram.id}
            className={`tab ${index === activeTabIndex ? 'active' : ''}`}
            onClick={() => onTabSwitch(index)}
          >
            <span className="tab-title">{diagram.title}</span>
            {diagrams.length > 1 && (
              <button
                className="tab-close"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(index);
                }}
                title="Close tab"
              >
                ×
              </button>
            )}
          </div>
        ))}
        
        <button className="new-tab-btn" onClick={onNewTab} title="New diagram">
          +
        </button>
      </div>
    </div>
  );
}; 