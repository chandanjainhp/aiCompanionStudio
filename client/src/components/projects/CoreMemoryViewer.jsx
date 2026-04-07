import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
/* eslint-disable-next-line no-unused-vars */
import { Brain, Eye, EyeOff, Trash2 } from 'lucide-react';
/* eslint-disable-next-line no-unused-vars */
import { Button } from '@/components/ui/button';

export function CoreMemoryViewer({ projectId, initialMemory = '', lastUpdated = null, onMemoryUpdate }) {
  const [coreMemory, setCoreMemory] = useState(initialMemory);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMemory, setEditedMemory] = useState(initialMemory);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setCoreMemory(initialMemory);
    setEditedMemory(initialMemory);
  }, [initialMemory]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Update project with new core memory value
      const response = await apiClient.updateProject(projectId, {
        coreMemory: editedMemory,
      });

      // Improved response validation
      if (!response) {
        throw new Error('Server did not return a response');
      }

      if (response.success) {
        setCoreMemory(editedMemory);
        setIsEditing(false);
        toast({
          title: 'Memory updated',
          description: 'Core memory has been updated successfully.',
        });
        onMemoryUpdate?.();
      } else {
        throw new Error(response.error || 'Failed to update memory');
      }
    } catch (error) {
      console.error('❌ Failed to update memory:', error);
      toast({
        title: 'Failed to update memory',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Are you sure you want to clear all core memory? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      // Clear memory by setting it to empty string
      const response = await apiClient.updateProject(projectId, {
        coreMemory: '',
      });

      // Improved response validation
      if (!response) {
        throw new Error('Server did not return a response');
      }

      if (response.success) {
        setCoreMemory('');
        setEditedMemory('');
        setIsEditing(false);
        toast({
          title: 'Memory cleared',
          description: 'Core memory has been cleared. The agent will start learning fresh.',
        });
        onMemoryUpdate?.();
      } else {
        throw new Error(response.error || 'Failed to clear memory');
      }
    } catch (error) {
      console.error('❌ Failed to clear memory:', error);
      toast({
        title: 'Failed to clear memory',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatMemoryDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const factsList = coreMemory
    .split('\n')
    .filter(line => line.trim().length > 0);

  return (
    <div className="w-full space-y-4">
      <div className="border rounded-lg bg-card">
        <div
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold flex items-center gap-2">
                🧠 Agent's Core Memory
                {factsList.length > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {factsList.length} fact{factsList.length !== 1 ? 's' : ''}
                  </span>
                )}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {formatMemoryDate(lastUpdated)}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>

        {isExpanded && (
          <div className="border-t p-4 space-y-4">
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editedMemory}
                  onChange={(e) => setEditedMemory(e.target.value)}
                  placeholder="Add or edit facts about the user, preferences, and constraints..."
                  className="w-full h-32 p-3 border rounded-md bg-background text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="text-xs text-muted-foreground">
                  <p>Format: One fact per line, starting with • or -</p>
                  <p>Example: • User prefers concise technical explanations</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Memory'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedMemory(coreMemory);
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {factsList.length === 0 ? (
                  <div className="p-4 text-center bg-muted/50 rounded text-sm text-muted-foreground">
                    <p>No facts learned yet. Start chatting with the agent!</p>
                    <p className="text-xs mt-1">The agent will automatically extract and remember important facts from your conversations.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {factsList.map((fact, index) => (
                      <div
                        key={index}
                        className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded text-sm"
                      >
                        {fact}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Memory
                  </Button>
                  {factsList.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleClear}
                      disabled={isLoading}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info card about auto-updating memory */}
      {!isEditing && factsList.length === 0 && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded text-sm">
          <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">💡 How Core Memory Works</p>
          <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
            <li>✓ After each conversation, the agent extracts key facts and learns about you</li>
            <li>✓ Your preferences, constraints, and domain knowledge are automatically remembered</li>
            <li>✓ Memory facts are injected into every future conversation for consistency</li>
            <li>✓ You can manually edit or clear memory at any time</li>
          </ul>
        </div>
      )}
    </div>
  );
}
