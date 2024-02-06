import React, { useState, useEffect } from "react";
import axios from "axios";

const MergeEntriesModal = ({
  isOpen,
  onClose,
  selectedEntries,
  onMergeComplete,
}) => {
  const [masterEntry, setMasterEntry] = useState(null);
  const [selectedSubEntries, setSelectedSubEntries] = useState([]);
  const [error, setError] = useState(null);
  const [mergeStatus, setMergeStatus] = useState(null);

  useEffect(() => {
    // Update sub-entries when master entry changes
    setSelectedSubEntries([]);
  }, [masterEntry, selectedEntries]);

  const handleMasterEntryChange = (entry) => {
    //console.log("Selected entry:", entry);
    setMasterEntry(entry);
  };

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

  const handleMerge = async () => {
    try {
      // Make a request to your backend to perform the merge
      const response = await axios.post("http://localhost:5000/MergeEntries", {
        masterId: masterEntry.news_report_id,
        subId: selectedSubEntries.map((entry) => entry.news_report_id)[0], // Assuming only one subId is selected
      });

      // Handle the response or trigger any additional actions
      console.log(response.data);

     

      // Close the modal and signal that the merge is complete
      onClose();
      onMergeComplete();

      setTimeout(() => {
        setMergeStatus('success');
      }, 1000); // Adjust the delay time as needed
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
            {selectedEntries.map((entry) => (
              <option key={entry.news_report_id} value={entry.news_report_id}>
                {entry.news_report_id}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Sub Entry:
          </label>
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
