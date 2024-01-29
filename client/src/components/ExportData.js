import React from "react";

const ExportData = () => {
    const handleExportCSV = async () => {
        try {
          const response = await fetch("http://localhost:5000/exportcsv");
          if (response.ok) {
            // Trigger the download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", 'exported_data.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else {
            console.error("Export failed");
            // Handle error appropriately
          }
        } catch (error) {
          console.error("Export failed", error.message);
          // Handle error appropriately
        }
      };
      const handleExportXLSX = async () => {
        try {
          const response = await fetch("http://localhost:5000/exportxlsx");
          if (response.ok) {
            // Trigger the download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", 'exported_data.xlsx');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else {
            console.error("Export failed");
            // Handle error appropriately
          }
        } catch (error) {
          console.error("Export failed", error.message);
          // Handle error appropriately
        }
      };
      
  
    return (
      <div>
        <button
          onClick={handleExportCSV}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Export Database to CSV
        </button>
        
        <button
          onClick={handleExportXLSX}
          className=" ml-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Export Database to XLSX
        </button>
        
      </div>
    );
  };
  
  export default ExportData;
  