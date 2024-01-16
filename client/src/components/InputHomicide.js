import React, { Fragment, useState } from "react";

const InputHomicide = () => {
  const [victimName, setVictimName] = useState("");
  const [newsSource, setNewsSource] = useState(""); // Added state for news source
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");

  const onSubmitForm = async (e) => {
    e.preventDefault();

    try {
      const body = { victim_name: victimName, newspaper_article: newsSource, date, location }; // Updated object
      const response = await fetch("http://localhost:5000/homicides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      window.location = "/";
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <Fragment>
      <h1 className="text-center mt-5">Homicide Tracker</h1>
      <form className="d-flex flex-column mt-5" onSubmit={onSubmitForm}>
        <label htmlFor="victimName">Victim Name:</label>
        <input
          type="text"
          id="victimName"
          className="form-control"
          value={victimName}
          onChange={(e) => setVictimName(e.target.value)}
        />

        <label htmlFor="newsSource">News Source:</label>
        <select
          id="newsSource"
          className="form-control"
          value={newsSource}
          onChange={(e) => setNewsSource(e.target.value)}
        >
          <option value="">Select News Source</option>
          <option value="CNN">CNN</option>
          <option value="The New York Times">The New York Times</option>
          <option value="BBC">BBC</option>
          <option value="News24">News24</option>
        </select>

        <label htmlFor="date">Date:</label>
        <input
          type="date"
          id="date"
          className="form-control"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <label htmlFor="location">Location:</label>
        <input
          type="text"
          id="location"
          className="form-control"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <button className="btn btn-success mt-3">Add</button>
      </form>
    </Fragment>
  );
};

export default InputHomicide;
