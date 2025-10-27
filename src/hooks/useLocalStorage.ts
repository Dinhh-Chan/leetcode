import { useState, useEffect, useCallback } from 'react';

// Generic hook for localStorage
export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] => {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

// Hook for theme management
export const useTheme = () => {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark' | 'system'>('theme', 'system');
  
  const updateTheme = useCallback((newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  }, [setTheme]);

  return { theme, setTheme: updateTheme };
};

// Hook for user preferences
export const useUserPreferences = () => {
  const [preferences, setPreferences] = useLocalStorage('user-preferences', {
    language: 'javascript',
    fontSize: 14,
    tabSize: 2,
    wordWrap: true,
    minimap: true,
    autoSave: true,
    notifications: true,
  });

  const updatePreference = useCallback((key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  }, [setPreferences]);

  return { preferences, setPreferences, updatePreference };
};

// Hook for recent problems
export const useRecentProblems = () => {
  const [recentProblems, setRecentProblems] = useLocalStorage<number[]>('recent-problems', []);
  const maxRecent = 10;

  const addRecentProblem = useCallback((problemId: number) => {
    setRecentProblems(prev => {
      const filtered = prev.filter(id => id !== problemId);
      return [problemId, ...filtered].slice(0, maxRecent);
    });
  }, [setRecentProblems]);

  const clearRecentProblems = useCallback(() => {
    setRecentProblems([]);
  }, [setRecentProblems]);

  return { recentProblems, addRecentProblem, clearRecentProblems };
};

// Hook for code templates
export const useCodeTemplates = () => {
  const [templates, setTemplates] = useLocalStorage<Record<string, string>>('code-templates', {
    javascript: `function solution() {
    // Your code here
}`,
    python: `def solution():
    # Your code here
    pass`,
    java: `class Solution {
    public void solution() {
        // Your code here
    }
}`,
    cpp: `class Solution {
public:
    void solution() {
        // Your code here
    }
};`,
  });

  const updateTemplate = useCallback((language: string, template: string) => {
    setTemplates(prev => ({ ...prev, [language]: template }));
  }, [setTemplates]);

  const getTemplate = useCallback((language: string) => {
    return templates[language] || '';
  }, [templates]);

  return { templates, updateTemplate, getTemplate };
};

