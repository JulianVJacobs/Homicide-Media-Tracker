import React, { Fragment, useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

function DataAnalysis() {
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const barChartInstance = useRef(null);
  const pieChartInstance = useRef(null);

  const [ageDistributionData, setAgeDistributionData] = useState({
    labels: [],
    values: [],
  });

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

  useEffect(() => {
    // Destroy previous instances
    if (barChartInstance.current) {
      barChartInstance.current.destroy();
    }

    if (pieChartInstance.current) {
      pieChartInstance.current.destroy();
    }

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

  return (
    <Fragment>
      <div className="font-bold text-xl mt-10 bg-gray-100">
        <h1 className="text-gray-700 flex mx-auto">DATA ANALYSIS: AGE DISTRIBUTION </h1>
      </div>

      <div className="mt-10 flex my-5">
        <canvas ref={barChartRef} width={300} height={400}></canvas> {/* Adjust width and height */}
      </div>

      <div className="flex my-5 mt-8">
        <canvas ref={pieChartRef} width={300} height={400}></canvas> {/* Adjust width and height */}
      </div>
    </Fragment>
  );
}

export default DataAnalysis;
