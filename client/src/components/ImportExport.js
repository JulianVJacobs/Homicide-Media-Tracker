import React, { useState } from "react";
import { utils, read } from "xlsx";
import ExportData from "./ExportData";

const ImportExport = () => {
    const [excelData, setExcelData] = useState([]);
    const [excelError, setExcelError] = useState("");
    const [loading, setLoading] = useState(false);
    const file_type = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
  
    const excelDateToJSDate = (excelDate) => {
        const baseDate = new Date("1900-01-01");
        const daysToSubtract = excelDate <= 60 ? 1 : 2;
        const dateMilliseconds =
          baseDate.getTime() + (excelDate - daysToSubtract) * 24 * 60 * 60 * 1000;
        return new Date(dateMilliseconds);
      };
  
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
  
    return (
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Choose Excel or CSV file:
            </label>
            <input
              type="file"
              onChange={handleChange}
              className="p-2 border border-gray-300 text-gray-700 rounded w-full"
            />
          </div>
          {loading && <p>Loading...</p>}
          <ExportData />
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
                      <td key={cellIndex} className="px-6 py-4">
                        {key === "DATE OF ARTICLE" ? (
                          excelDateToJSDate(value).toLocaleDateString("en-gb")
                        ) : (
                          value
                        )}
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
  