import React, { useEffect, useState, useRef } from 'react';

import '../output.css';
import Chart from 'chart.js/auto';

function DataAnalysis() {
  const [ageData, setAgeData] = useState({ labels: [], values: [] });
  const [error, setError] = useState(null);
  const chartRef = useRef(null);

  const fetchAgeData = async () => {
    try {
      const response = await fetch('http://localhost:5000/ageDistribution');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setAgeData(data);
      setError(null);
    } catch (error) {
      console.error(error.message);
      setAgeData({ labels: [], values: [] });
      setError('An error occurred while fetching data. Please try again.');
    }
  };

  useEffect(() => {
    fetchAgeData();
  
    // Save the current chartRef value to a variable
    const currentChartRef = chartRef.current;
  
    // Cleanup function to destroy the chart when the component is unmounted
    return () => {
      if (currentChartRef) {
        const chartInstance = currentChartRef.chartInstance;
        if (chartInstance) {
          chartInstance.destroy();
        }
      }
    };
  }, []);
  

  useEffect(() => {
    if (chartRef.current && ageData.labels.length > 0) {
      const chartInstance = chartRef.current.chartInstance;
      if (chartInstance) {
        chartInstance.destroy();
      }
      chartRef.current.chart = new Chart(chartRef.current.getContext('2d'), {
        type: 'bar',
        data: {
          labels: ageData.labels,
          datasets: [
            {
              label: 'Number of Homicides',
              backgroundColor: 'rgba(75,192,192,0.4)',
              borderColor: 'rgba(75,192,192,1)',
              borderWidth: 1,
              hoverBackgroundColor: 'rgba(75,192,192,0.6)',
              hoverBorderColor: 'rgba(75,192,192,1)',
              data: ageData.values,
            },
          ],
        },
      });
    }
  }, [ageData]);

  const handleRefresh = () => {
    fetchAgeData();
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-gray-200 to-gray-600">
      <h1 className="text-4xl font-semibold text-gray-800 mb-4">Age Distribution of Homicides</h1>
      {error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="w-3/4 h-3/4">
          <canvas ref={chartRef}></canvas>
        </div>
      )}
      <button className="mt-4 p-2 bg-blue-500 text-white" onClick={handleRefresh}>
        Refresh
      </button>
    </div>
  );
}

export default DataAnalysis;
