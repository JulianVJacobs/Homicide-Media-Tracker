import React, { Fragment, useEffect, useState } from "react";
import EditHomicides from "./EditHomicides";
import "../output.css";

const ListHomicides = () => {
  const [homicides, setHomicides] = useState([]);
  const [sortCriteria, setSortCriteria] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" or "desc"

  const deleteHomicide = async (id) => {
    try {
      const deleteHomicide = await fetch(
        `http://localhost:5000/homicides/${id}`,
        {
          method: "DELETE",
        }
      );

      setHomicides(homicides.filter((homicide) => homicide.homicide_id !== id));
    } catch (err) {
      console.error(err.message);
    }
  };

  const getHomicides = async () => {
    try {
      const response = await fetch("http://localhost:5000/homicides");
      const jsonData = await response.json();
      setHomicides(jsonData);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    getHomicides();
  }, []);

  const handleSort = (criteria) => {
    // If the same criteria is clicked again, toggle the sort order
    if (sortCriteria === criteria) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // If a new criteria is clicked, set the criteria and default to ascending order
      setSortCriteria(criteria);
      setSortOrder("asc");
    }
  };

  const sortHomicides = () => {
    if (sortCriteria) {
      const sortedHomicides = [...homicides].sort((a, b) => {
        const aValue = a[sortCriteria];
        const bValue = b[sortCriteria];

        if (sortOrder === "asc") {
          return aValue < bValue ? -1 : 1;
        } else {
          return aValue > bValue ? -1 : 1;
        }
      });

      return sortedHomicides;
    } else {
      return homicides;
    }
  };

  const sortedHomicides = sortHomicides();

  return (
    <Fragment>
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
                Author
              </th>
              <th scope="col" className="px-6 py-3">
                Wire Service
              </th>
              <th scope="col" className="px-6 py-3">
                Language
              </th>
              <th scope="col" className="px-6 py-3">
                Source Type
              </th>
              <th scope="col" className="px-6 py-3">
                News Report Source
              </th>
              <th
                scope="col"
                className="px-6 py-3 cursor-pointer"
                onClick={() => handleSort("date_of_publication")}
              >
                Date of Publication
                {sortCriteria === "date_of_publication" && (
                  <span>{sortOrder === "asc" ? " ▲" : " ▼"}</span>
                )}
              </th>

              <th
                scope="col"
                className="px-6 py-3 cursor-pointer"
                onClick={() => handleSort("name_of_perpetrator")}
              >
                Name of Perpetrator
                {sortCriteria === "name_of_perpetrator" && (
                  <span>{sortOrder === "asc" ? " ▲" : " ▼"}</span>
                )}
              </th>
              <th scope="col" className="px-6 py-3">
                Relationship to victim
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
                conviction
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
            {sortedHomicides.map((homicide) => (
              <tr
                key={homicide.homicide_id}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {homicide.news_report_id}
                </td>
                <td>{homicide.news_report_url}</td>
                <td>{homicide.news_report_headline}</td>
                <td>{homicide.author}</td>
                <td>{homicide.wire_service}</td>
                <td>{homicide.language}</td>
                <td>{homicide.source_type}</td>
                <td>{homicide.newspaper_article}</td>
                <td>
                  <td>{new Date(homicide.date).toLocaleDateString("en-gb")}</td>
                </td>{" "}
                <td>{homicide.victim_name}</td>
                <td>
                  {homicide.date_of_death
                    ? new Date(homicide.date_of_death).toLocaleDateString(
                        "en-gb"
                      )
                    : ""}
                </td>
                <td>{homicide.province}</td>
                <td>{homicide.town}</td>
                <td>{homicide.location_type}</td>
                <td>{homicide.location}</td>
                <td>{homicide.sexual_assault}</td>
                <td>{homicide.gender_of_victim}</td>
                <td>{homicide.race}</td>
                <td>{homicide.age_of_victim}</td>
                <td>{homicide.age_range_of_victim}</td>
                <td>{homicide.mode_of_death_specific}</td>
                <td>{homicide.mode_of_death_general}</td>
                <td>{homicide.name_of_perpetrator}</td>
                <td>{homicide.relationship_to_victim}</td>
                <td>{homicide.suspect_identified}</td>
                <td>{homicide.suspect_arrested}</td>
                <td>{homicide.suspect_charged}</td>
                <td>{homicide.conviction}</td>
                <td>{homicide.sentence}</td>
                <td>{homicide.incident_notes}</td>
                <td>{homicide.type_of_murder}</td>
                <td className="px-6 py-4 text-right">
                  <EditHomicides todo={homicide} />
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    className="font-medium text-black bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 px-3 py-2 rounded transition duration-300"
                    onClick={() => deleteHomicide(homicide.homicide_id)}
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
  );
};

export default ListHomicides;
