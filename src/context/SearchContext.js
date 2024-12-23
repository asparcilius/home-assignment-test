import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import mockData from '../data/mockDb';

const SearchContext = createContext();

const RESULTS_PER_PAGE = 10;
const STORAGE_KEY = 'searchHistory';

export function SearchProvider({ children }) {
  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [searchResults, setSearchResults] = useState([]);
  const [searchMetadata, setSearchMetadata] = useState({ count: 0, time: 0 });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(searchHistory));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }, [searchHistory]);

  const performSearch = useCallback((query) => {
    return new Promise((resolve) => {
      const startTime = performance.now();
      
      const normalizedQuery = query.trim().toLowerCase();
      
      setTimeout(() => {
        const results = mockData.filter(item => 
          item.title.toLowerCase().includes(normalizedQuery) ||
          item.description.toLowerCase().includes(normalizedQuery)
        );
        
        const endTime = performance.now();
        
        setSearchResults(results);
        setSearchMetadata({
          count: results.length,
          time: ((endTime - startTime) / 1000).toFixed(2),
          totalPages: Math.ceil(results.length / RESULTS_PER_PAGE)
        });
        setCurrentPage(1);
        
        if (normalizedQuery) {
          setSearchHistory(prev => {
            const newHistory = [query, ...prev.filter(item => 
              item.toLowerCase() !== normalizedQuery
            )];
            return newHistory.slice(0, 10);
          });
        }
        
        resolve();
      }, 300);
    });
  }, []);

  const removeFromHistory = useCallback((query) => {
    setSearchHistory(prev => prev.filter(item => item !== query));
  }, []);

  const getAutocompleteSuggestions = useCallback((query) => {
    if (!query.trim()) return [];
    
    return mockData
      .filter(item => item.title.toLowerCase().startsWith(query.toLowerCase()))
      .slice(0, 10)
      .map(item => ({
        ...item,
        isInHistory: searchHistory.includes(item.title)
      }));
  }, [searchHistory]);

  const paginatedResults = searchResults.slice(
    (currentPage - 1) * RESULTS_PER_PAGE,
    currentPage * RESULTS_PER_PAGE
  );

  return (
    <SearchContext.Provider value={{
      searchHistory,
      searchResults: paginatedResults,
      searchMetadata: {
        ...searchMetadata,
        currentPage,
        setCurrentPage
      },
      performSearch,
      removeFromHistory,
      getAutocompleteSuggestions,
      setSearchResults
    }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
} 