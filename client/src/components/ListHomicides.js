import React, { Fragment, useEffect, useState } from "react";
import EditHomicides from "./EditHomicides";
import "../output.css";
import { Link, useNavigate } from "react-router-dom";
import CheckForDuplicates from "./CheckForDuplicates";

const ListHomicides = () => {
  const [homicides, setHomicides] = useState([]);
  const [showDuplicatesMessage, setShowDuplicatesMessage] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
const navigate = useNavigate();
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
        const response = await fetch("http://localhost:5000/checkForDuplicates");
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
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                News Report ID
              </th>
              <th scope="col" className="px-6 py-3">
                News Report URL
              </th>
              <th scope="col" className="px-6 py-3">
                News Report Headline
              </th>
              <th scope="col" className="px-6 py-3">
                Date of Publication
              </th>
              <th scope="col" className="px-6 py-3">
                Author
              </th>
              <th scope="col" className="px-6 py-3">
                Wire Service
              </th>
              <th scope="col" className="px-6 py-3">
                Language
              </th>
              <th scope="col" className="px-6 py-3">
                Type of Source
              </th>
              <th scope="col" className="px-6 py-3">
                News Report Platform
              </th>
              <th scope="col" className="px-6 py-3">
                Victim Name
              </th>
              <th scope="col" className="px-6 py-3">
                Date of Death
              </th>
              <th scope="col" className="px-6 py-3">
                Place of Death Province
              </th>
              <th scope="col" className="px-6 py-3">
                Place of Death Town
              </th>
              <th scope="col" className="px-6 py-3">
                Type of Location
              </th>
              <th scope="col" className="px-6 py-3">
                Sexual Assault
              </th>
              <th scope="col" className="px-6 py-3">
                Gender of Victim
              </th>
              <th scope="col" className="px-6 py-3">
                Race of Victim
              </th>
              <th scope="col" className="px-6 py-3">
                Age of Victim
              </th>
              <th scope="col" className="px-6 py-3">
                Age Range of Victim
              </th>
              <th scope="col" className="px-6 py-3">
                Mode of Death Specific
              </th>
              <th scope="col" className="px-6 py-3">
                Mode of Death General
              </th>
              <th scope="col" className="px-6 py-3">
                Perpetrator Name
              </th>
              <th scope="col" className="px-6 py-3">
                Perpetrator Relationship to Victim
              </th>
              <th scope="col" className="px-6 py-3">
                Suspect Identified
              </th>
              <th scope="col" className="px-6 py-3">
                Suspect Arrested
              </th>
              <th scope="col" className="px-6 py-3">
                Suspect Charged
              </th>
              <th scope="col" className="px-6 py-3">
                Conviction
              </th>
              <th scope="col" className="px-6 py-3">
                Sentence
              </th>
              <th scope="col" className="px-6 py-3">
                Type of Murder
              </th>
              <th scope="col" className="px-6 py-3">
                Notes
              </th>
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
                <td className="px-6 py-4">{homicide.news_report_id}</td>
                <td className="px-6 py-4">{homicide.news_report_url}</td>
                <td className="px-6 py-4">{homicide.news_report_headline}</td>
                <td className="px-6 py-4">
                  {new Date(homicide.date_of_publication).toLocaleDateString(
                    "en-gb"
                  )}
                </td>
                <td className="px-6 py-4">{homicide.author}</td>
                <td className="px-6 py-4">{homicide.wire_service}</td>
                <td className="px-6 py-4">{homicide.language}</td>
                <td className="px-6 py-4">{homicide.type_of_source}</td>
                <td className="px-6 py-4">{homicide.news_report_platform}</td>
                <td className="px-6 py-4">{homicide.victim_name}</td>
                <td className="px-6 py-4">
                  {homicide.date_of_death
                    ? new Date(homicide.date_of_death).toLocaleDateString(
                        "en-gb"
                      )
                    : ""}
                </td>
                <td className="px-6 py-4">
                  {homicide.place_of_death_province}
                </td>
                <td className="px-6 py-4">{homicide.place_of_death_town}</td>
                <td className="px-6 py-4">{homicide.type_of_location}</td>
                <td className="px-6 py-4">{homicide.sexual_assault}</td>
                <td className="px-6 py-4">{homicide.gender_of_victim}</td>
                <td className="px-6 py-4">{homicide.race_of_victim}</td>
                <td className="px-6 py-4">{homicide.age_of_victim}</td>
                <td className="px-6 py-4">{homicide.age_range_of_victim}</td>
                <td className="px-6 py-4">{homicide.mode_of_death_specific}</td>
                <td className="px-6 py-4">{homicide.mode_of_death_general}</td>
                <td className="px-6 py-4">{homicide.perpetrator_name}</td>
                <td className="px-6 py-4">
                  {homicide.perpetrator_relationship_to_victim}
                </td>
                <td className="px-6 py-4">{homicide.suspect_identified}</td>
                <td className="px-6 py-4">{homicide.suspect_arrested}</td>
                <td className="px-6 py-4">{homicide.suspect_charged}</td>
                <td className="px-6 py-4">{homicide.conviction}</td>
                <td className="px-6 py-4">{homicide.sentence}</td>
                <td className="px-6 py-4">{homicide.type_of_murder}</td>
                <td className="px-6 py-4">{homicide.notes}</td>
                <td className="px-6 py-4 text-right">
                  <EditHomicides todo={homicide} />
                </td>
                <td className="px-6 py-4">
                  <button
                    className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-black font-medium px-4 py-2 rounded transition duration-300"
                    onClick={() => {
                      console.log(
                        "Deleting homicide with ID:",
                        homicide.article_id
                      );
                      handleDelete(homicide.article_id);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </Fragment>
  );
};

export default ListHomicides;
