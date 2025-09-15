import React, { useState, useEffect } from "react";
import axios from "axios";

const MergeEntriesModal = ({
  isOpen,
  onClose,
  selectedEntries,
  onMergeComplete,
}) => {
  // State variables for managing merge process and UI
  const [masterEntry, setMasterEntry] = useState(null); // State for the master entry
  const [selectedSubEntries, setSelectedSubEntries] = useState([]); // State for selected sub entries
  const [error, setError] = useState(null); // State for error message
  const [mergeStatus, setMergeStatus] = useState(null); // State for merge status

  useEffect(() => {
    // Update sub-entries when master entry changes
    setSelectedSubEntries([]);
  }, [masterEntry, selectedEntries]);

  // Function to handle change in master entry selection
  const handleMasterEntryChange = (entry) => {
    setMasterEntry(entry);
  };

  // Function to handle change in sub entry selection
  const handleSubEntryChange = (entry) => {
    // Toggle the selected state for the clicked sub-entry
    const isSelected = selectedSubEntries.includes(entry);

    if (isSelected) {
      setSelectedSubEntries(
        selectedSubEntries.filter((subEntry) => subEntry !== entry)
      );
    } else {
      setSelectedSubEntries([...selectedSubEntries, entry]);
    }
  };

  // Function to handle merge process
  const handleMerge = async () => {
    try {
      // Make a request to your backend to perform the merge
      const response = await axios.post("http://localhost:5000/MergeEntries", {
        masterId: masterEntry.news_report_id,
        subId: selectedSubEntries.map((entry) => entry.news_report_id)[0], // Assuming only one subId is selected
      });

      console.log(response.data);

      // Set merge status to success and close the modal after a delay
      setMergeStatus("success");
      setTimeout(() => {
        onMergeComplete();
        onClose();
      }, 2000); // Adjust the delay time as needed
    } catch (error) {
      console.error(error.message);
      setError("An error occurred during the merge process.");
    }
  };


  return (
    <div className={`modal ${isOpen ? "block" : "hidden"}`}>
      {/* <div className="modal-overlay absolute w-full h-full bg-gray-800 opacity-50"></div> */}
      <div className="modal-container bg-white w-96 mx-auto mt-10 p-6 rounded-md shadow-lg z-10">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Isolate and Merge Entries</h2>
        </div>
       
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Master Entry:
          </label>
          <select
  className="w-full border p-2 text-black"
  value={masterEntry ? masterEntry.news_report_id : ""}
  onChange={(e) => {
    const selectedId = e.target.value;
    console.log("Selected ID:", selectedId);
    console.log("Selected entries:", selectedEntries);
    const selectedEntry = selectedEntries.find(
      (entry) => entry.news_report_id === selectedId
    );
    console.log("Selected entry:", selectedEntry);
    handleMasterEntryChange(selectedEntry);
  }}
>
  <option value="" disabled={!masterEntry}>
    {masterEntry ? masterEntry.news_report_id : "Select Master Entry"}
  </option>
  {selectedEntries.map((entry, index) => {
    const optionText =
      index === 0
        ? `${entry.news_report_id} (Current Article)`
        : entry.news_report_id;
    const optionColor = index === 0 ? 'blue' : 'black';
    return (
      <option key={entry.news_report_id} value={entry.news_report_id} style={{ color: optionColor }}>
        {optionText}
      </option>
    );
  })}
</select>

        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Sub Entry:
          </label>
          <h1 className="block text-xs font-medium text-purple-500 mb-1">Note that the order of sub ID's correspond to the listing order of the Entries</h1>
          <select
  className="w-full border p-2 text-black"
  multiple
  value={selectedSubEntries.map((entry) => entry.news_report_id)}
  onChange={(e) => {
    const selectedIds = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    const selectedSubs = selectedEntries.filter((entry) =>
      selectedIds.includes(entry.news_report_id)
    );
    setSelectedSubEntries(selectedSubs);
  }}
>
  {/* Filter out the selected master ID from the list of sub IDs */}
  {selectedEntries
    .filter((entry) => entry.news_report_id !== masterEntry?.news_report_id)
    .map((entry) => (
      <option key={entry.news_report_id} value={entry.news_report_id}>
        {entry.news_report_id}
      </option>
    ))}
</select>

        </div>
        {error && <div className="text-red-500">{error}</div>}
        {mergeStatus === "success" && (
          <p className="text-green-500">Successful merge!</p>
        )}

        <div className="flex justify-end">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded mr-2"
            onClick={handleMerge}
            disabled={!masterEntry || selectedSubEntries.length === 0}
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
