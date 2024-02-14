import React, { useState } from "react";
import { utils, read } from "xlsx";
import ExportData from "./ExportData"; // Import ExportData component
import { Navigate, useNavigate } from "react-router-dom"; // Import Navigate and useNavigate hooks
import { v4 as uuidv4 } from 'uuid'; // Import uuidv4 for generating unique ids
import DeleteDatabase from "./DeleteDatabase"; // Import DeleteDatabase component

// Component for importing and exporting data
const ImportExport = () => {
  // State variables for managing data import/export
  const [excelData, setExcelData] = useState([]); // State for Excel data
  const [excelError, setExcelError] = useState(""); // State for Excel import error
  const [loading, setLoading] = useState(false); // State for loading status
  const [completed, setCompleted] = useState(false); // State for import completion
  const [showDeleteModal, setShowDeleteModal] = useState(false); // State to manage delete modal visibility

  const navigate = useNavigate(); // Initialize useNavigate hook for programmatic navigation
  const file_type = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ]; // Supported file types for import

  // Function to convert Excel date to JS date
  const excelDateToJSDate = (excelDate) => {
    const baseDate = new Date("1900-01-01");
    const daysToSubtract = excelDate <= 60 ? 1 : 2;
    const dateMilliseconds =
      baseDate.getTime() + (excelDate - daysToSubtract) * 24 * 60 * 60 * 1000;
    return new Date(dateMilliseconds);
  };

  // Function to handle file change during import
  const handleChange = (e) => {
    const selected_file = e.target.files[0];
    if (selected_file) {
      if (selected_file && file_type.includes(selected_file.type)) {
        setLoading(true);

        let reader = new FileReader();
        reader.onload = (e) => {
          const workbook = read(e.target.result);
          const sheet = workbook.SheetNames;
          if (sheet.length) {
            const data = utils.sheet_to_json(workbook.Sheets[sheet[0]]);
            setExcelData(data);
          }
          setLoading(false);
        };
        reader.readAsArrayBuffer(selected_file);
      } else {
        setExcelError("Please upload Excel or CSV files only!");
        setExcelData([]);
      }
    }
  };

  // Function to format date from Excel
  const formatDate = (dateString) => {
    const [day, month, year] = dateString.split("/");
    return `${year}/${month}/${day}`;
  };

  // Function to add data to the database
  const handleAddToDatabase = async () => {
    try {
      setLoading(true);
      const failedIds = [];
      // Iterate through each row and send it to the backend
      for (const row of excelData) {
        const rowData = {
          // Adjust the keys based on your API requirements
          news_report_id: uuidv4(),
          news_report_url: row["news_report_url"],
          news_report_headline: row["news_report_headline"],
          author: row["author"],
          wire_service: row["wire_service"],
          language: row["language"],
          type_of_source: row["type_of_source"],
          news_report_platform: row["news_report_platform"],
          victim_name: row["victim_name"],
          date_of_publication: formatDate(row["date_of_publication"]),
          date_of_death: formatDate(row["date_of_death"]),
          place_of_death_province: row["place_of_death_province"],
          place_of_death_town: row["place_of_death_town"],
          type_of_location: row["type_of_location"],
          sexual_assault: row["sexual_assault"],
          gender_of_victim: row["gender_of_victim"],
          race_of_victim: row["race_of_victim"],
          age_of_victim: row["age_of_victim"],
          age_range_of_victim: row["age_range_of_victim"],
          mode_of_death_specific: row["mode_of_death_specific"],
          mode_of_death_general: row["mode_of_death_general"],
          perpetrator_name: row["perpetrator_name"],
          perpetrator_relationship_to_victim:
            row["relationship_to_victim"],
          suspect_identified: row["suspect_identified"],
          suspect_arrested: row["suspect_arrested"],
          suspect_charged: row["suspect_charged"],
          conviction: row["conviction"],
          sentence: row["sentence"],
          type_of_murder: row["type_of_murder"],
          // ... other fields
        };
        console.log(rowData);
        // Send a POST request to your backend with the rowData
        const response = await fetch("http://localhost:5000/homicidesBulk", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(rowData),
        });

        if (!response.ok) {
          console.error("Failed to add data to the database");
          console.log("PROBLEM WITH ENTRY", rowData);
          // Handle error appropriately
          failedIds.push(row["author of problematic entry"]);
          // Handle error appropriately
        }
      }
      if (failedIds.length > 0) {
        // Display an error message with the failed news_report_ids
        alert(`Failed to add data for news_report_ids: ${failedIds.join(", ")}`);
      } else {
        setCompleted(true);
        setTimeout(() => {
          navigate("/ListHomicides"); // Redirect after successful completion
        }, 3000); // Redirect after 3 seconds (adjust as needed)
        console.log("All data added to the database successfully!");
      }
    } catch (error) {
      console.error("Error adding data to the database", error.message);
      // Handle error appropriately
    } finally {
      setLoading(false);
    }
  };

 
  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <DeleteDatabase isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} />
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Choose Excel File:
          </label>
          <input
            type="file"
            onChange={handleChange}
            className="p-2 border border-gray-300 text-gray-700 rounded w-full"
          />
        </div >
        {loading && <p className="text-gray-600">Loading...</p>}
        {completed && <p className="text-green-600">Complete! Redirecting...</p>}
        
        <ExportData />
        <div className="mb-4 mt-6">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Delete Database
          </button>
        </div>
        <div className="mb-4 mt-6">
        <button
            onClick={handleAddToDatabase}
            disabled={loading || excelData.length === 0 || completed}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Add to Database
          </button>
        </div>

        <div className="overflow-x-auto">
          {excelData.length ? (
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  {Object.keys(excelData[0]).map((header, index) => (
                    <th key={index} className="px-6 py-3">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {excelData.map((info, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    {Object.entries(info).map(([key, value], cellIndex) => (
                      <td key={cellIndex} className="px-5 py-4">
                        {key === " date_of_publication"
                          ? excelDateToJSDate(value).toLocaleDateString("en-gb")
                          : value}
                          
                      </td>
                    ))}
                     {Object.entries(info).map(([key, value], cellIndex) => (
                      <td key={cellIndex} className="px-6 py-4">
                        {key === "date_of_death"
                          ? excelDateToJSDate(value).toLocaleDateString("en-gb")
                          : value}
                          
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : excelError.length ? (
            <p className="text-red-500">{excelError}</p>
          ) : (
            <p>No user data is present</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportExport;
