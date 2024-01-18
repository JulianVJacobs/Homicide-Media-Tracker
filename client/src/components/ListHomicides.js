import React, { Fragment, useEffect, useState } from "react";
import EditHomicides from "./EditHomicides";

const ListHomicides = () => {
  const [homicides, setHomicides] = useState([]);

  const deleteHomicide = async (id) => {
    try {
      const deleteHomicide = await fetch(`http://localhost:5000/homicides/${id}`, {
        method: "DELETE",
      });

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

  return (
    <Fragment>
      <table className="table mt-5 text-center">
        <thead>
          <tr>
          <th>News Report ID</th>
          <th>News Report URL</th>
          <th>News Report Headline</th>
          <th>Author</th>
          <th>Wire Service</th>
          <th>Language</th>
          <th>Source Type</th>
          <th>Newspaper Source</th>
            <th>Date of Publication</th>
            <th>Victim Name</th>
            <th>Date of Death</th>
            <th>Province</th>
            <th>Town</th>
            <th>Location Type</th>
            <th>Location</th>
            <th>Sexual Assault</th>
            <th>Gender of victim</th>
            <th>Race</th>
            <th>Age of Victim</th>
            <th>Mode of Death SPECIFIC</th>
            <th>Name of Perpetrator</th>
            <th>Relationship to victim</th>
            <th>Suspect Identified</th>
            <th>Suspect Arrested</th>
            <th>Suspect Charged</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {homicides.map((homicide) => (
            <tr key={homicide.homicide_id}>
              <td>{homicide.news_report_id}</td>
              <td>{homicide.news_report_url}</td>
              <td>{homicide.news_report_headline}</td>
              <td>{homicide.author}</td>
              <td>{homicide.wire_service}</td>
              <td>{homicide.language}</td>
              <td>{homicide.source_type}</td>
              <td>{homicide.newspaper_article}</td>
              <td><td>{new Date(homicide.date).toLocaleDateString('en-gb')}</td></td> {/*needed to prevent time zone messes!*/}
              <td>{homicide.victim_name}</td>
              <td>{new Date(homicide.date_of_death).toLocaleDateString('en-gb')}</td>
              <td>{homicide.province}</td>
              <td>{homicide.town}</td>
              <td>{homicide.location_type}</td>
              <td>{homicide.location}</td>
              <td>{homicide.sexual_assault}</td>
              <td>{homicide.gender_of_victim}</td>
              <td>{homicide.race}</td>
              <td>{homicide.age_of_victim}</td>
              <td>{homicide.mode_of_death_specific}</td>
              <td>{homicide.name_of_perpetrator}</td>
              <td>{homicide.relationship_to_victim}</td>
              <td>{homicide.suspect_identified}</td>
              <td>{homicide.suspect_arrested}</td>
              <td>{homicide.suspect_charged}</td>
              <td>
                <EditHomicides todo={homicide} />
              </td>
              <td>
                <button
                  className="btn btn-danger"
                  onClick={() => deleteHomicide(homicide.homicide_id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Fragment>
  );
};

export default ListHomicides;
