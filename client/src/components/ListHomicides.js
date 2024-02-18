import React, { Fragment, useEffect, useState } from "react";
import EditHomicides from "./EditHomicides";
import CheckMergedSubs from "./CheckMergedSubs";
import FieldSelector from "./FieldSelector";
import { useNavigate } from "react-router-dom";

const  ListHomicides = () => {
  const [homicides, setHomicides] = useState([]);
  const [showDuplicatesMessage, setShowDuplicatesMessage] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  
  const [selectedFields, setSelectedFields] = useState([
    // Selected fields initially include common fields
    "News Report ID",
    "News Report URL",
    "News Report Headline",
    "Date of Publication",
    "Author",
    "Wire Service",
    "Language",
    "Type of Source",
    "News Report Platform",
    // Add other default fields here
  ]);
  const navigate = useNavigate();

  const allFields = [
    "News Report ID",
    "News Report URL",
    "News Report Headline",
    "Date of Publication",
    "Author",
    "Wire Service",
    "Language",
    //"Merge ids",
    "Type of Source",
    "News Report Platform",
    "Victim Name",
    "Date of Death",
    "Place of Death Province",
    "Place of Death Town",
    "Type of Location",
    "Police Station",
    "Sexual Assault",
    "Gender of Victim",
    "Race of Victim",
    "Age of Victim",
    "Age Range of Victim",
    "Mode of Death Specific",
    "Mode of Death General",
    "Perpetrator Name",
    "Perpetrator Relationship to Victim",
    "Suspect Identified",
    "Suspect Arrested",
    "Suspect Charged",
    "Conviction",
    "Sentence",
    "Type of Murder",
    "Notes",
    "Check Merged Entries",
  ];

  // Function to handle field selection
  const handleFieldSelection = (field, isSelected) => {
    if (isSelected) {
      setSelectedFields([...selectedFields, field]);
    } else {
      setSelectedFields(selectedFields.filter((selected) => selected !== field));
    }
  };

  // Function to handle toggling all fields
  const handleToggleAllFields = (selectAll) => {
    if (selectAll) {
      setSelectedFields(allFields);
    } else {
      setSelectedFields([]);
    }
  };

  // Function to fetch homicides data from the backend
  const getHomicides = async () => {
    try {
      const response = await fetch("http://localhost:5000/homicides");
      const jsonData = await response.json();
      setHomicides(jsonData);
      setIsEmpty(jsonData.length === 0);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      if (!id) {
        console.error("Invalid id for deletion");
        return;
      }
  
      const response = await fetch(`http://localhost:5000/homicides/${id}`, {
        method: "DELETE",
      });
  
      if (response.ok) {
        // Optionally, you can display a success message or handle the UI as needed
        // Refresh the list of homicides after deletion
        getHomicides();
      } else {
        console.error("Failed to delete homicide entry");
      }
    } catch (err) {
      console.error(err.message);
    }
  };
  

  // useEffect to fetch data and check for duplicates on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/checkForDuplicates");
        const duplicateData = await response.json();
        if (duplicateData && duplicateData.duplicateData.length > 0) {
          setShowDuplicatesMessage(true);
        }
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchData();
    getHomicides();
  }, []);

  // Function to navigate to duplicates page
  const handleNavigateToDuplicates = () => {
    navigate("/CheckForDuplicates");
  };

  return (
    <Fragment>
      {showDuplicatesMessage && (
        <div className="bg-red-500 text-white p-4 text-center">
          Duplicate entries found! Please go to the{" "}
          <span className="underline cursor-pointer" onClick={handleNavigateToDuplicates}>
            Check for Duplicates
          </span>{" "}
          page to fix them.
        </div>
      )}
      {isEmpty && (
        <div className="bg-yellow-500 text-white p-4 text-center">
          The database is empty. Add data via manual or bulk input.
        </div>
      )}
      {!isEmpty && (
        <Fragment>
          <FieldSelector
            fields={allFields}
            onSelectField={handleFieldSelection}
            onToggleAllFields={handleToggleAllFields}
          />
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  {selectedFields.map((field) => (
                    field !== "Check Merged Entries" && ( // Exclude Check Merged Entries from the header
                      <th key={field} scope="col" className="px-6 py-3">
                        {field}
                      </th>
                    )
                  ))}
                  <th scope="col" className="px-6 py-3">
                    Edit
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Delete
                  </th>
                </tr>
              </thead>
              <tbody>
                {homicides.map((homicide) => (
                  <tr
                    key={homicide.article_id}
                    className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 ${
                      homicide.merge_ids ? "bg-purple-50" : "bg-white"
                    }`}
                  >
                    {selectedFields.map((field) => (
                      field !== "Check Merged Entries" && ( // Exclude Check Merged Entries from the cells
                        <td key={field} className="px-6 py-4">
                          {field === "Date of Publication" && homicide.date_of_publication
                            ? new Date(homicide.date_of_publication).toLocaleDateString("en-GB")
                            : field === "Date of Death" && homicide.date_of_death
                            ? new Date(homicide.date_of_death).toLocaleDateString("en-GB")
                            : field === "Merge ids"
                            ? homicide.merge_ids
                            : homicide[field.toLowerCase().replace(/\s/g, "_")]
                          }
                        </td>
                      )
                    ))}
                    <td className="px-6 py-4 text-right">
                      <EditHomicides todo={homicide} />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-black font-medium px-4 py-2 rounded transition duration-300"
                        onClick={() => handleDelete(homicide.article_id)}
                      >
                        Delete
                      </button>
                    </td>
                    {selectedFields.includes("Check Merged Entries") && ( // Render Check Merged Entries button
                      <td className="px-6 py-4">
                        {homicide.merge_ids && (
                          <CheckMergedSubs mergeIds={homicide.merge_ids} />
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

export default ListHomicides;