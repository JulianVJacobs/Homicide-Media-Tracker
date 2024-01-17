import React, { Fragment, useState } from "react";

const InputHomicide = () => {
  const [victimName, setVictimName] = useState("");
  const [newsSource, setNewsSource] = useState(""); // Added state for news source
  const [newspaperArticle, setNewspaperArticle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [newsReportId, setNewsReportId] = useState("");
  const [newsReportUrl, setNewsReportUrl] = useState("");
  const [newsReportHeadline, setNewsReportHeadline] = useState("");
  const [author, setAuthor] = useState("");
  const [wireService, setWireService] = useState("");
  const [language, setLanguage] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [dateOfDeath, setDateOfDeath] = useState("");
  const [province, setProvince] = useState("");
  const [town, setTown] = useState("");
  const [locationType, setLocationType] = useState("");
  const [sexualAssault, setSexualAssault] = useState("");
  const [genderOfVictim, setGenderOfVictim] = useState("");
  const [race, setRace] = useState("");
  const [ageOfVictim, setAgeOfVictim] = useState("");
  const [modeOfDeathSpecific, setModeOfDeathSpecific] = useState("");
  const [nameOfPerpetrator, setNameOfPerpetrator] = useState("");
  const [relationshipToVictim, setRelationshipToVictim] = useState("");
  const [suspectIdentified, setSuspectIdentified] = useState("");
  const [suspectArrested, setSuspectArrested] = useState("");
  const [suspectCharged, setSuspectCharged] = useState("");
  const [conviction, setConviction] = useState("");
  const [sentence, setSentence] = useState("");
  const [incidentNotes, setIncidentNotes] = useState("");

  const onSubmitForm = async (e) => {
    e.preventDefault();

    try {
      const body = { victim_name: victimName, newspaper_article: newsSource, date, location, news_report_id:newsReportId, news_report_url:newsReportUrl, news_report_headline:newsReportHeadline, author, wire_service: wireService, language:language }; // Updated object
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

      <label htmlFor="newsReportId">News Report ID:</label>
        <input
          type="text"
          id="newsReportId"
          className="form-control"
          value={newsReportId}
          onChange={(e) => setNewsReportId(e.target.value)}
        />

<label htmlFor="newsReportUrl">News Report URL:</label>
        <input
          type="text"
          id="newsReportUrl"
          className="form-control"
          value={newsReportUrl}
          onChange={(e) => setNewsReportUrl(e.target.value)}
        />

<label htmlFor="newsReportHeadline">News Report Headline:</label>
        <input
          type="text"
          id="newsReportHeadline"
          className="form-control"
          value={newsReportHeadline}
          onChange={(e) => setNewsReportHeadline(e.target.value)}
        />

<label htmlFor="author">News Report Author:</label>
        <input
          type="text"
          id="author"
          className="form-control"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />

<label htmlFor="wireService">Wire Service:</label>
        <select
          id="wireService"
          className="form-control"
          value={wireService}
          onChange={(e) => setWireService(e.target.value)}
        >
          <option value="">Select Wire Service</option>
          <option value="AP">AP</option>
          <option value="Reuters">Reuters</option>
          <option value="NUll">null</option>
                  </select>

                  <label htmlFor="language">Language :</label>
        <select
          id="language"
          className="form-control"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="">Select language of publication</option>
          <option value="English">English</option>
          <option value="Afrikaans">Afrikaans</option>
          <option value="Zulu">Zulu</option>
        </select>

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
