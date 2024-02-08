import React, { Fragment, useEffect, useState } from "react";
import EditHomicides from "./EditHomicides";
import "../output.css";
import { Link, useNavigate } from "react-router-dom";
import CheckForDuplicates from "./CheckForDuplicates";
import FieldSelector from "./FieldSelector";

const ListHomicides = () => {
  const [homicides, setHomicides] = useState([]);
  const [showDuplicatesMessage, setShowDuplicatesMessage] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [selectedFields, setSelectedFields] = useState([
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
  "Type of Source",
  "News Report Platform",
  "Victim Name",
  "Date of Death",
  "Place of Death Province",
  "Place of Death Town",
  "Type of Location",
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
   ];


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
  // const [sortOrder, setSortOrder] = useState("asc");
  // const [sortColumn, setSortColumn] = useState("date_of_publication");
  const getHomicides = async () => {
    try {
      const response = await fetch("http://localhost:5000/homicides");
      const jsonData = await response.json();
      console.log("Homicides data:", jsonData); // Log the data
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

      const responseData = await response.json();

      // Optionally, you can display a message or handle the UI as needed

      // Refresh the list of homicides after deletion
      getHomicides();
    } catch (err) {
      console.error(err.message);
    }
  };

  // ...

  useEffect(() => {
    // Trigger the check for duplicates when the component is mounted
    const checkForDuplicatesOnMount = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/checkForDuplicates"
        );
        const duplicateData = await response.json();

        if (duplicateData && duplicateData.duplicateData.length > 0) {
          setShowDuplicatesMessage(true);
        }
      } catch (error) {
        console.error(error.message);
      }
    };

    checkForDuplicatesOnMount();
    getHomicides();
  }, []);

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
                    <th key={field} scope="col" className="px-6 py-3">
                      {field}
                    </th>
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
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    {selectedFields.map((field) => (
                      <td key={field} className="px-6 py-4">
                        {homicide[field.toLowerCase().replace(/\s/g, "_")]}
                      </td>
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
