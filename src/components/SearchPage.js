import { useState, useRef, useEffect } from 'react';
import { useSearch } from '../context/SearchContext';
import SearchIcon from './SearchIcon';
import './SearchPage.css';
import Pagination from './Pagination';
import ClearButton from './ClearButton';
import HistoryIcon from './HistoryIcon';
import MicIcon from './MicIcon';
import KeyboardIcon from './KeyboardIcon';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const {
    performSearch,
    getAutocompleteSuggestions,
    searchResults,
    searchMetadata,
    removeFromHistory,
    setSearchResults
  } = useSearch();

  const suggestions = getAutocompleteSuggestions(query);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

  const handleSearch = async (searchQuery) => {
    setIsLoading(true);
    setQuery(searchQuery);
    await performSearch(searchQuery);
    setIsLoading(false);
    setShowAutocomplete(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowAutocomplete(true);
  };

  const handleSearchClick = () => {
    if (query.trim()) {
      handleSearch(query);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSearch(suggestions[selectedIndex].title);
      } else if (query.trim()) {
        handleSearch(query);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > -1 ? prev - 1 : prev);
    } else if (e.key === 'Escape') {
      setShowAutocomplete(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSearchResults([]);
    inputRef.current?.focus();
  };

  const handleBlur = (e) => {
    if (!e.relatedTarget?.closest('.autocomplete-container')) {
      setTimeout(() => setShowAutocomplete(false), 300);
    }
  };

  const handleSuggestionClick = (title) => {
    handleSearch(title);
  };

  return (
    <div className="search-page">
      <div className="search-container">
        <div className="search-input-wrapper">
          <div className="search-icon-wrapper" onClick={handleSearchClick}>
            <SearchIcon />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowAutocomplete(true)}
            onBlur={handleBlur}
            placeholder="Search..."
            className="search-input"
          />
          <div className="search-tools">
            <div className="tool-icon keyboard-wrapper">
              <KeyboardIcon />
            </div>
            <div className="tool-icon mic-wrapper">
              <MicIcon />
            </div>
          </div>
          {query && !isLoading && <ClearButton onClick={handleClear} />}
          {isLoading && <div className="loading-spinner" />}
        </div>
        
        {showAutocomplete && suggestions.length > 0 && (
          <div className="autocomplete-container">
            {suggestions.map((item, index) => (
              <div
                key={item.id}
                className={`autocomplete-item ${item.isInHistory ? 'in-history' : ''} ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => handleSuggestionClick(item.title)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="autocomplete-item-content">
                  {item.isInHistory ? <HistoryIcon /> : <SearchIcon />}
                  <span>{item.title}</span>
                </div>
                {item.isInHistory && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromHistory(item.title);
                    }}
                    className="remove-button"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {query && (
        <div className="search-results">
          {searchResults.length > 0 ? (
            <>
              <div className="search-metadata">
                About {searchMetadata.count} results ({searchMetadata.time} seconds)
              </div>
              {searchResults.map((result) => (
                <div key={result.id} className="result-item">
                  <div className="result-url">{result.url}</div>
                  <a href={result.url} className="result-title">
                    {result.title}
                  </a>
                  <p className="result-description">{result.description}</p>
                </div>
              ))}
              {searchMetadata.totalPages > 1 && (
                <Pagination
                  currentPage={searchMetadata.currentPage}
                  totalPages={searchMetadata.totalPages}
                  onPageChange={searchMetadata.setCurrentPage}
                />
              )}
            </>
          ) : (
            <div className="no-results">
              <p>No results found for "<strong>{query}</strong>"</p>
              <p className="no-results-suggestions">Suggestions:</p>
              <ul>
                <li>Make sure all words are spelled correctly</li>
                <li>Try different keywords</li>
                <li>Try more general keywords</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchPage; 