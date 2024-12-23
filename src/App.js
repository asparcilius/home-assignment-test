import { SearchProvider } from './context/SearchContext';
import SearchPage from './components/SearchPage';
import './App.css';

function App() {
  return (
    <SearchProvider>
      <div className="App">
        <SearchPage />
      </div>
    </SearchProvider>
  );
}

export default App;
