
import React from 'react';
import { CalendarClock, User, RefreshCw } from 'lucide-react';

export interface EditHistoryItem {
  id: string;
  user: string;
  timestamp: string;
  changes: string[];
}

interface EditHistoryProps {
  historyItems: EditHistoryItem[];
  title?: string;
}

const EditHistory: React.FC<EditHistoryProps> = ({ 
  historyItems,
  title = "Edit History" 
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <RefreshCw size={18} />
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      
      {historyItems.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">No edit history available.</p>
      ) : (
        <div className="space-y-4">
          {historyItems.map((item) => (
            <div key={item.id} className="neu-flat p-4 rounded-lg transition-all hover:shadow-neu-pressed">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-muted-foreground" />
                  <span className="font-medium">{item.user}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarClock size={16} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{item.timestamp}</span>
                </div>
              </div>
              
              <ul className="space-y-1 mt-2">
                {item.changes.map((change, idx) => (
                  <li key={idx} className="text-sm">
                    • {change}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EditHistory;
