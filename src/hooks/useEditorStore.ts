import { create } from 'zustand';

interface EditorState {
  // Theme settings
  isDarkTheme: boolean;
  setIsDarkTheme: (isDark: boolean) => void;
  
  // Search state
  searchTerm: string;
  searchResults: number[];
  currentSearchIndex: number;
  showSearch: boolean;
  setSearchTerm: (term: string) => void;
  setSearchResults: (results: number[]) => void;
  setCurrentSearchIndex: (index: number) => void;
  setShowSearch: (show: boolean) => void;
  
  // Editor preferences
  showLineNumbers: boolean;
  fontSize: number;
  tabSize: number;
  setShowLineNumbers: (show: boolean) => void;
  setFontSize: (size: number) => void;
  setTabSize: (size: number) => void;
  
  // Reset functions
  resetSearch: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  // Theme settings
  isDarkTheme: false,
  setIsDarkTheme: (isDark) => set({ isDarkTheme: isDark }),
  
  // Search state
  searchTerm: '',
  searchResults: [],
  currentSearchIndex: -1,
  showSearch: false,
  setSearchTerm: (term) => set({ searchTerm: term }),
  setSearchResults: (results) => set({ searchResults: results }),
  setCurrentSearchIndex: (index) => set({ currentSearchIndex: index }),
  setShowSearch: (show) => set({ showSearch: show }),
  
  // Editor preferences
  showLineNumbers: true,
  fontSize: 14,
  tabSize: 2,
  setShowLineNumbers: (show) => set({ showLineNumbers: show }),
  setFontSize: (size) => set({ fontSize: size }),
  setTabSize: (size) => set({ tabSize: size }),
  
  // Reset functions
  resetSearch: () => set({ 
    searchTerm: '', 
    searchResults: [], 
    currentSearchIndex: -1, 
    showSearch: false 
  }),
}));