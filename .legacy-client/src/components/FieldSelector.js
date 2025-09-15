import React, { useState } from "react";

// Component for selecting fields
const FieldSelector = ({ fields, onSelectField, onToggleAllFields }) => {
  // State to track selected fields and modal visibility
  const [selectedFields, setSelectedFields] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Function to handle individual field selection
  const handleFieldSelection = (event) => {
    const { value } = event.target;
    if (selectedFields.includes(value)) {
      setSelectedFields(selectedFields.filter((selected) => selected !== value));
      onSelectField(value, false);
    } else {
      setSelectedFields([...selectedFields, value]);
      onSelectField(value, true);
    }
  };

  // Function to toggle visibility of the modal
  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  // Function to handle toggling all fields selection
  const handleToggleAllFields = () => {
    if (selectedFields.length === fields.length) {
      setSelectedFields([]);
      onToggleAllFields(false);
    } else {
      setSelectedFields(fields);
      onToggleAllFields(true);
    }
  };

  // Function to handle deselecting all fields
  const handleDeselectAllFields = () => {
    setSelectedFields([]);
    onToggleAllFields(false);
  };

  // Render the component with field selection options and modal
  return (
    <div className="mb-4">
      <button
        onClick={toggleModal}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded"
      >
        Select Fields
      </button>

      {modalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Select Fields:
                    </h3>
                    <div className="flex items-center justify-between flex-wrap">
                      {fields.map((field) => (
                        <div key={field} className="mr-2 mb-2 flex items-center text-gray-800">
                          <input
                            type="checkbox"
                            id={field}
                            name={field}
                            value={field}
                            checked={selectedFields.includes(field)}
                            onChange={handleFieldSelection}
                            className="mr-1"
                          />
                          <label htmlFor={field}>{field}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={toggleModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
                <button
                  onClick={handleToggleAllFields}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  View All
                </button>
                <button
                  onClick={handleDeselectAllFields}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-500 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Deselect All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldSelector;
