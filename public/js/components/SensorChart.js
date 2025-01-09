// Get React hooks from global React object
const { useState, useEffect } = React;
// Get Recharts components from global Recharts object
const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } = Recharts;

const SensorCharts = () => {
  const [liveData, setLiveData] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [view, setView] = useState('live'); // 'live' or 'historical'

  useEffect(() => {
    // Initialize historical data array
    const initialHistory = [];
    setHistoricalData(initialHistory);

    // Set up polling for live data
    const interval = setInterval(() => {
      fetchData();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      
      // Process live data
      const timestamp = new Date().toLocaleTimeString();
      const newDataPoint = {
        timestamp,
        ...Object.entries(data).reduce((acc, [sensorId, sensorData]) => {
          acc[`${sensorId}_avg`] = calculateAverage(sensorData);
          return acc;
        }, {})
      };
      
      setLiveData(prevData => {
        const updatedData = [...prevData, newDataPoint];
        // Keep only last 30 seconds of data
        return updatedData.slice(-30);
      });

      // Update historical data every 3 minutes
      if (timestamp.endsWith('00') || timestamp.endsWith('30')) {
        setHistoricalData(prevHistory => {
          const historicalPoint = {
            timestamp: new Date().toLocaleString(),
            ...Object.entries(data).reduce((acc, [sensorId, sensorData]) => {
              acc[`${sensorId}_avg`] = calculateAverage(sensorData);
              return acc;
            }, {})
          };
          return [...prevHistory, historicalPoint].slice(-60); // Keep last 60 points (3 hours)
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const calculateAverage = (sensorData) => {
    const values = [sensorData.co2, sensorData.nh3, sensorData.nox]
      .filter(val => val != null && !isNaN(val));
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  };

  return (
    <div className="w-full space-y-6">
      {/* Navigation */}
      <div className="flex justify-center space-x-4 p-4">
        <button
          onClick={() => setView('live')}
          className={`px-4 py-2 rounded-lg ${
            view === 'live' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Live Data
        </button>
        <button
          onClick={() => setView('historical')}
          className={`px-4 py-2 rounded-lg ${
            view === 'historical' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Historical Data
        </button>
      </div>

      {/* Charts */}
      <div className="w-full overflow-x-auto">
        {view === 'live' ? (
          <BarChart width={600} height={200} data={liveData} className="mx-auto">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sensor1_avg" fill="#8884d8" name="Sensor 1" />
            <Bar dataKey="sensor2_avg" fill="#82ca9d" name="Sensor 2" />
            <Bar dataKey="sensor3_avg" fill="#ffc658" name="Sensor 3" />
          </BarChart>
        ) : (
          <BarChart width={800} height={300} data={historicalData} className="mx-auto">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sensor1_avg" fill="#8884d8" name="Sensor 1" />
            <Bar dataKey="sensor2_avg" fill="#82ca9d" name="Sensor 2" />
            <Bar dataKey="sensor3_avg" fill="#ffc658" name="Sensor 3" />
          </BarChart>
        )}
      </div>
    </div>
  );
};

// Make component available globally
window.SensorCharts = SensorCharts;