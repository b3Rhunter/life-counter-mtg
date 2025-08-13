import { useState } from 'react';
import './App.css';

function App() {
  const [settings, setSettings] = useState(false);
  const [lifeTotal, setLifeTotal] = useState(20);
  const [tempLife, setTempLife] = useState(lifeTotal.toString());
  const [commanderMode, setCommanderMode] = useState(false);
  const [commanderDamage, setCommanderDamage] = useState(0);
  const [counters, setCounters] = useState([]);
  const [displayIndex, setDisplayIndex] = useState(-1);
  const [showCustomInput, setShowCustomInput] = useState(false); 

  const handleLifeChange = (e) => setTempLife(e.target.value);

  const toggleSettings = () => {
    setSettings(!settings);
  };

  const resetApp = () => {
    const newLife = parseInt(tempLife);
    if (!isNaN(newLife)) {
      setLifeTotal(newLife);
    }
    if (commanderMode) {
      setLifeTotal(40);
    }
    setCommanderDamage(0);
    setCounters([]);
    setDisplayIndex(-1);
    setShowCustomInput(false);
  };

  const toggleCommanderMode = () => {
    setCommanderMode(!commanderMode);
    if (!commanderMode) {
      setLifeTotal(40);
      setTempLife('40');
      setCommanderDamage(0);
      setDisplayIndex(-1);
    } else {
      setLifeTotal(20);
      setTempLife('20');
      setDisplayIndex(-1);
    }
  };

  const addCounter = (name) => {
    if (name && name !== 'custom' && !counters.some(counter => counter.name === name)) {
      setCounters(prevCounters => [...prevCounters, { name, value: 0, type: 'preset' }]);
    }
  };

  const handleCounterSelect = (e) => {
    const value = e.target.value;
    if (value === 'custom') {
      setShowCustomInput(true);
    } else if (value) {
      addCounter(value);
      setShowCustomInput(false);
    }
    // Reset the select to default
    e.target.value = '';
  };

  const handleCustomCounterAdd = (e) => {
    const customName = e.target.value.trim();
    if (customName && !counters.some(counter => counter.name === customName)) {
      setCounters(prevCounters => [...prevCounters, { name: customName, value: 0, type: 'custom' }]);
      setShowCustomInput(false);
      e.target.value = '';
    }
  };

  const adjustCounter = (amount) => {
    if (displayIndex === 0 && commanderMode) {
      setCommanderDamage((prev) => Math.min(Math.max(0, prev + amount), 21));
    } else if (displayIndex > 0 && displayIndex <= counters.length) {
      setCounters((prevCounters) =>
        prevCounters.map((counter, index) =>
          index === displayIndex - 1
            ? { ...counter, value: Math.max(0, counter.value + amount) }
            : counter
        )
      );
    } else {
      setLifeTotal((prev) => Math.max(0, prev + amount));
    }
  };

  const toggleDisplay = (e) => {
    e.stopPropagation();
    setDisplayIndex((prev) => {
      // Calculate total displays: life + commander damage (if commander mode) + counters
      const totalDisplays = 1 + (commanderMode ? 1 : 0) + counters.length;
      
      // If no counters and not in commander mode, just stay on life total
      if (totalDisplays === 1) {
        return -1;
      }
      
      let nextIndex;
      
      if (prev === -1) {
        // From life total, go to commander damage if in commander mode, otherwise first counter
        nextIndex = commanderMode ? 0 : 1;
      } else if (commanderMode && prev === 0) {
        // From commander damage, go to first counter or back to life total
        nextIndex = counters.length > 0 ? 1 : -1;
      } else if (prev >= 1 && prev < counters.length) {
        // Cycling through counters
        nextIndex = prev + 1;
      } else {
        // From last counter back to life total
        nextIndex = -1;
      }
      
      console.log('Display Index Transition:', { 
        prev, 
        nextIndex, 
        totalDisplays, 
        countersLength: counters.length, 
        commanderMode 
      });
      
      return nextIndex;
    });
  };

  const presetCounters = ['Poison', 'Charge', 'Energy', 'Experience', 'Blight'];

  const getCurrentValue = () => {
    if (displayIndex === 0 && commanderMode) return commanderDamage;
    if (displayIndex > 0 && displayIndex <= counters.length) return counters[displayIndex - 1].value;
    return lifeTotal;
  };

  const getCurrentLabel = () => {
    if (displayIndex === 0 && commanderMode) return 'CMDR';
    if (displayIndex > 0 && displayIndex <= counters.length) return counters[displayIndex - 1].name;
    return 'Life';
  };

  const getCurrentClass = () => {
    if (displayIndex === 0 && commanderMode) return 'commander-damage';
    if (displayIndex > 0 && displayIndex <= counters.length) {
      const counterName = counters[displayIndex - 1].name;
      if (counterName === 'Poison') return 'poison-counter';
      if (counterName === 'Charge') return 'charge-counter';
      if (counterName === 'Energy') return 'energy-counter';
      if (counterName === 'Experience') return 'experience-counter';
      if (counterName === 'Blight') return 'blight-counter';
      return 'custom-counter';
    }
    return '';
  };

  return (
    <div className="App">
      <button className="decrease-btn" onClick={() => adjustCounter(-1)}>-</button>
      <div className={`display-container ${getCurrentClass()}`} onClick={toggleDisplay}>
        <div className="counter-label">{getCurrentLabel()}</div>
        <p
          name={getCurrentValue().toString()}
          className={`life-total ${getCurrentClass()}`}
        >
          {getCurrentValue()}
        </p>
      </div>
      <button className="increase-btn" onClick={() => adjustCounter(1)}>+</button>

      {settings && (
        <div className="settings-modal">
          <h2>SETTINGS</h2>
          <div className="life-cont">
            <p>Starting Life:</p>
            <input className="life-input" onChange={handleLifeChange} value={tempLife} />
          </div>
          <div className="commander-cont">
            <p>Commander Mode:</p>
            <input
              type="checkbox"
              checked={commanderMode}
              onChange={toggleCommanderMode}
            />
          </div>
          <div className="counter-cont">
            <p>Add Counter:</p>
            <select
              onChange={handleCounterSelect}
              defaultValue=""
            >
              <option value="" disabled>Select a counter</option>
              {presetCounters.map((counter) => (
                <option key={counter} value={counter}>
                  {counter}
                </option>
              ))}
              <option value="custom">Custom...</option>
            </select>
            {showCustomInput && (
              <input
                type="text"
                placeholder="Enter counter name"
                onBlur={handleCustomCounterAdd}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCustomCounterAdd(e);
                  }
                }}
                autoFocus
              />
            )}
          </div>
          <button className="reset-btn" onClick={resetApp}>Reset</button>
          <button className="close-btn" onClick={toggleSettings}>X</button>
        </div>
      )}
      <footer>
        <button name="⚙️" className={getCurrentClass()} onClick={toggleSettings}>⚙️</button>
      </footer>
    </div>
  );
}

export default App;