import React from "react";
const ExportData = () => {
    const handleExport = async () => {
      try {
        const response = await fetch("http://localhost:5000/export-to-excel");
        if (response.ok) {
          // Retrieve the content disposition header
          const contentDisposition = response.headers.get('content-disposition');
  
          // Extract the filename from the content disposition header
          const filenameMatch = contentDisposition.match(/filename="(.+?)"/);
          const filename = filenameMatch ? filenameMatch[1] : 'exported_data.csv';
  
          // Trigger the download
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", filename);
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
          onClick={handleExport}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Export to CSV
        </button>
      </div>
    );
  };
  
  export default ExportData;
  