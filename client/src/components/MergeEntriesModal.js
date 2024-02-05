import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MergeEntriesModal = ({ isOpen, onClose, selectedEntries, onMergeComplete }) => {
  const [masterEntry, setMasterEntry] = useState(null);
  const [selectedSubEntries, setSelectedSubEntries] = useState([]);

  useEffect(() => {
    // Update sub-entries when master entry changes
    setSelectedSubEntries([]);
  }, [masterEntry, selectedEntries]);

  const handleMasterEntryChange = (entry) => {
    setMasterEntry(entry);
  };

  const handleSubEntryChange = (entry) => {
    // Toggle the selected state for the clicked sub-entry
    const isSelected = selectedSubEntries.includes(entry);

    if (isSelected) {
      setSelectedSubEntries(selectedSubEntries.filter((subEntry) => subEntry !== entry));
    } else {
      setSelectedSubEntries([...selectedSubEntries, entry]);
    }
  };

  const handleMerge = async () => {
    try {
      // Extract news_report_id values from selectedEntries
      const articleIds = selectedEntries.map((entry) => entry.news_report_id);

      // Make a request to your backend to perform the merge
      const response = await axios.put('http://localhost:5000/mergeEntries', {
        masterArticleId: masterEntry.news_report_id,
        subArticleIds: selectedSubEntries.map((entry) => entry.news_report_id),
      });

      // Handle the response or trigger any additional actions
      console.log(response.data);

      // Close the modal and signal that the merge is complete
      onClose();
      onMergeComplete();
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className={`modal ${isOpen ? 'block' : 'hidden'}`}>
      {/* <div className="modal-overlay absolute w-full h-full bg-gray-800 opacity-50"></div> */}
      <div className="modal-container bg-white w-96 mx-auto mt-10 p-6 rounded-md shadow-lg z-10">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Isolate and Merge Entries</h2>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Master Entry:</label>
          <select
            className="w-full border p-2 text-black"
            value={masterEntry ? masterEntry.news_report_id : ''}
            onChange={(e) =>
              handleMasterEntryChange(
                selectedEntries.find((entry) => entry.news_report_id === parseInt(e.target.value))
              )
            }
          >
            <option value="" disabled={!masterEntry}>
              {masterEntry ? masterEntry.news_report_id : 'Select Master Entry'}
            </option>
            {selectedEntries.map((entry) => (
              <option key={entry.news_report_id} value={entry.news_report_id}>
                {entry.news_report_id}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-500">Select sub-entries to merge into the master entry:</p>
          <ul className="list-disc list-inside text-black">
            {selectedEntries.map((entry) => (
              <li key={entry.news_report_id}>
                <input
                  type="checkbox"
                  id={`entry-${entry.news_report_id}`}
                  checked={selectedSubEntries.includes(entry)}
                  onChange={() => handleSubEntryChange(entry)}
                />
                <label htmlFor={`entry-${entry.news_report_id}`} className="ml-2">
                  {entry.news_report_id}
                </label>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-end">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded mr-2"
            onClick={handleMerge}
            disabled={!masterEntry}
          >
            Merge
          </button>
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MergeEntriesModal;
