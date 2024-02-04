import React, { Fragment, useState } from "react";
import axios from "axios";



const CheckForDuplicates = () => {
  const [loading, setLoading] = useState(false);
  const [groupedDuplicates, setGroupedDuplicates] = useState([]);

  const handleCheckDuplicates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/checkForDuplicates"
      );

      // Group duplicates based on headline, author, and date_of_publication
      const groupedDuplicates = groupDuplicates(response.data.duplicateData);
      setGroupedDuplicates(groupedDuplicates);

      console.log("RESPONSE POES:", response.data);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleIgnoreDuplicate = async (id) => {
    // Display a confirmation dialog
    const userConfirmed = window.confirm(
      "Are you sure you want to ignore this duplicate? This action cannot be undone."
    );

    // If the user confirms, proceed with ignoring the duplicate
    if (userConfirmed) {
      try {
        await axios.put(`http://localhost:5000/ignoreDuplicate/${id}`);
        // After ignoring duplicate, re-fetch the list of duplicates
        handleCheckDuplicates();
      } catch (error) {
        console.error(error.message);
      }
    }
    // If the user cancels, do nothing
  };

  // Function to group duplicates based on headline, author, and date_of_publication
  const groupDuplicates = (duplicateData) => {
    const groupedDuplicates = {};

    duplicateData.forEach((entry) => {
      const key = `${entry.news_report_headline}-${entry.author}-${entry.date_of_publication}`;

      if (!groupedDuplicates[key]) {
        groupedDuplicates[key] = [];
      }

      groupedDuplicates[key].push(entry);
    });

    return Object.values(groupedDuplicates);
  };

  const handleDelete2 = async (id) => {
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

      // Refresh the list of duplicates after deletion
      handleCheckDuplicates();
    } catch (err) {
      console.error(err.message);
    }
  };


  return (
    <div>
      <div className="w-full max-w-full p-6 bg-white  shadow-md">
        <h1 className="text-2xl font-bold mb-5 text-gray-900">
          Check for Duplicate Entries
        </h1>

        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={handleCheckDuplicates}
          disabled={loading}
        >
          {loading ? "Checking..." : "Check for Duplicates"}
        </button>
      </div>
      <Fragment>
        {groupedDuplicates.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Duplicate Entries:</h3>
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
                      Edit
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Delete
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groupedDuplicates.map((groupedEntries, groupIndex) => (
                    <Fragment key={groupIndex}>
                      {groupedEntries.map((entry) => (
                        <tr
                          key={entry.news_report_id}
                          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                          <td className="px-6 py-4">{entry.news_report_id}</td>
                          <td className="px-6 py-4">{entry.news_report_url}</td>
                          <td className="px-6 py-4">
                            {entry.news_report_headline}
                          </td>
                          <td className="px-6 py-4">
                            {new Date(
                              entry.date_of_publication
                            ).toLocaleDateString("en-gb")}
                          </td>
                          <td className="px-6 py-4">{entry.author}</td>
                          <td className="px-6 py-4">{entry.wire_service}</td>
                          <td className="px-6 py-4">{entry.language}</td>
                          <td className="px-6 py-4">{entry.type_of_source}</td>
                          <td className="px-6 py-4">
                            {entry.news_report_platform}
                          </td>
                          <td className="px-6 py-4">{entry.victim_name}</td>
                          <td className="px-6 py-4">
                            {entry.date_of_death
                              ? new Date(
                                  entry.date_of_death
                                ).toLocaleDateString("en-gb")
                              : ""}
                          </td>
                          <td className="px-6 py-4">
                            {entry.place_of_death_province}
                          </td>
                          <td className="px-6 py-4">
                            {entry.place_of_death_town}
                          </td>
                          <td className="px-6 py-4">
                            {entry.type_of_location}
                          </td>
                          <td className="px-6 py-4">{entry.sexual_assault}</td>
                          <td className="px-6 py-4">
                            {entry.gender_of_victim}
                          </td>
                          <td className="px-6 py-4">{entry.race_of_victim}</td>
                          <td className="px-6 py-4">{entry.age_of_victim}</td>
                          <td className="px-6 py-4">
                            {entry.age_range_of_victim}
                          </td>
                          <td className="px-6 py-4">
                            {entry.mode_of_death_specific}
                          </td>
                          <td className="px-6 py-4">
                            {entry.mode_of_death_general}
                          </td>
                          <td className="px-6 py-4">
                            {entry.perpetrator_name}
                          </td>
                          <td className="px-6 py-4">
                            {entry.perpetrator_relationship_to_victim}
                          </td>
                          <td className="px-6 py-4">
                            {entry.suspect_identified}
                          </td>
                          <td className="px-6 py-4">
                            {entry.suspect_arrested}
                          </td>
                          <td className="px-6 py-4">{entry.suspect_charged}</td>
                          <td className="px-6 py-4">{entry.conviction}</td>
                          <td className="px-6 py-4">{entry.sentence}</td>
                          <td className="px-6 py-4">{entry.type_of_murder}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              className="bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-black font-medium px-4 py-2 rounded transition duration-300"
                              onClick={() =>
                                handleIgnoreDuplicate(entry.news_report_id)
                              }
                            >
                              Ignore Duplicate
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-black font-medium px-4 py-2 rounded transition duration-300"
                              onClick={() => handleDelete2(entry.article_id)}
                            >
                              Delete
                            </button>
                          </td>

                          
                          {/* Add Edit and Delete buttons here */}
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Fragment>
    </div>
  );
};

export default CheckForDuplicates;
