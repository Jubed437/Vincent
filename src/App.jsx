import AppLayout from './components/layout/AppLayout';
import AppInitializer from './components/AppInitializer';
import './styles/index.css';

function App() {
  return (
    <div className="App">
      <AppInitializer>
        <AppLayout />
      </AppInitializer>
    </div>
  );
}

export default App;