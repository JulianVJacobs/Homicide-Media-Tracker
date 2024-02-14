//this component is not currently listed on the site, if you want to use it, please add its route in the navbar

import React, { Fragment, useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

// Component for data analysis of age distribution
function DataAnalysis() {
  // References to chart canvases and chart instances
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const barChartInstance = useRef(null);
  const pieChartInstance = useRef(null);

  // State for age distribution data
  const [ageDistributionData, setAgeDistributionData] = useState({
    labels: [],
    values: [],
  });

  // Fetch age distribution data from server on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/ageDistribution");
        if (!response.ok) {
          throw new Error("Failed to fetch age distribution data");
        }

        const data = await response.json();
        setAgeDistributionData({
          labels: data.labels,
          values: data.values,
        });
      } catch (error) {
        console.error(error.message);
        // Handle error (e.g., show an error message to the user)
      }
    };

    fetchData();
  }, []);

  // Update charts when age distribution data changes
  useEffect(() => {
    // Destroy previous chart instances
    if (barChartInstance.current) {
      barChartInstance.current.destroy();
    }

    if (pieChartInstance.current) {
      pieChartInstance.current.destroy();
    }

    // Create new chart instances
    // Bar Chart
    barChartInstance.current = new Chart(barChartRef.current, {
      type: "bar",
      data: {
        labels: ageDistributionData.labels,
        datasets: [
          {
            label: "Age Distribution",
            data: ageDistributionData.values,
            backgroundColor: "rgba(75, 192, 192, 0.9)", // Adjust opacity
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        plugins: {
          legend: {
            display: false, // Hide legend
          },
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    });

    // Pie Chart
    pieChartInstance.current = new Chart(pieChartRef.current, {
      type: "pie",
      data: {
        labels: ageDistributionData.labels.map((label, index) => `Label ${index + 1}`),

        datasets: [
          {
            data: ageDistributionData.values,
            backgroundColor: [
              "rgba(255, 99, 132, 0.9)",
              "rgba(54, 162, 235, 0.9)",
              "rgba(255, 206, 86, 0.9)",
              "rgba(75, 192, 192, 0.9)",
              "rgba(153, 102, 255, 0.9)",
              "rgba(255, 159, 64, 0.9)",
            ], // Adjust opacity
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 159, 64, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            position: "right", // Change legend position
          },
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }, [ageDistributionData]);

  // Render age distribution charts
  return (
    <Fragment>
      <div className="font-bold text-xl mt-10 bg-gray-100">
        <h1 className="text-gray-700 flex mx-auto">DATA ANALYSIS: AGE DISTRIBUTION </h1>
      </div>

      {/* Display bar chart */}
      <div className="mt-10 flex my-5">
        <canvas ref={barChartRef} width={300} height={400}></canvas> {/* Adjust width and height */}
      </div>

      {/* Display pie chart */}
      <div className="flex my-5 mt-8">
        <canvas ref={pieChartRef} width={300} height={400}></canvas> {/* Adjust width and height */}
      </div>
    </Fragment>
  );
}

export default DataAnalysis;
