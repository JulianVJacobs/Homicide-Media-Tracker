import React, { useState } from "react";

const [newsReportId, setNewsReportId] = useState(generateUniqueId());
const [newsReportUrl, setNewsReportUrl] = useState("");
const [newsReportHeadline, setNewsReportHeadline] = useState("");
const [author, setAuthor] = useState("");
const [wireService, setWireService] = useState("");
const [language, setLanguage] = useState("");
const [sourceType, setSourceType] = useState("");
const [newsSource, setNewsSource] = useState("");
const [dateOfPublication, setDateOfPublication] = useState("");
const [victimName, setVictimName] = useState("");

const ArticleForm = () => {
  const [counter, setCounter] = useState(1); // Starting counter value

  const generateUniqueId = () => {
    // Increment the counter for each new ID
    const uniqueId = counter;
    setCounter(counter + 1);
    return uniqueId;
  };

  return (
    <div className="col-md-20">
      <label htmlFor="newsReportId">News Report ID:</label>
      <input
        type="text"
        id="newsReportId"
        className="form-control"
        value={newsReportId}
        readOnly // Make the input read-only
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
        <option value="NULL">null</option>
      </select>

      <label htmlFor="language">Language:</label>
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

      <label htmlFor="sourceType">Source Type:</label>
      <select
        id="sourceType"
        className="form-control"
        value={sourceType}
        onChange={(e) => setSourceType(e.target.value)}
      >
        <option value="">Select Source type</option>
        <option value="PDF">PDF</option>
        <option value="Website">Website</option>
        <option value="Print Media">Print Media</option>
      </select>

      <label htmlFor="newsSource">News Report Platform:</label>
      <select
        id="newsSource"
        className="form-control"
        value={newsSource}
        onChange={(e) => setNewsSource(e.target.value)}
      >
        <option value="">Select News Report Platform</option>
        <option value="News24">News24</option>
        <option value="Times">Times</option>
        <option value="SS">SS</option>
        <option value="Weekend Argus">Weekend Argus</option>
        <option value="CP">CP</option>
        <option value="TNA">TNA</option>
        <option value="SABC">SABC</option>
        <option value="PN">PN</option>
        <option value="NETWERK24">NETWERK24</option>
        <option value="BURGER">BURGER</option>
        <option value="ST">ST</option>
        <option value="Daily News">Daily News</option>
        <option value="Post">Post</option>
        <option value="NW">NW</option>
        <option value="ENCA">ENCA</option>
        <option value="Volksblad">Volksblad</option>
      </select>

      <label htmlFor="dateOfPublication">Date of publication:</label>
      <input
        type="dateOfPublication"
        id="dateOfPublication"
        className="form-control"
        value={dateOfPublication}
        onChange={(e) => setDateOfPublication(e.target.value)}
      />

      <label htmlFor="victimName">Victim Name:</label>
      <input
        type="text"
        id="victimName"
        className="form-control"
        value={victimName}
        onChange={(e) => setVictimName(e.target.value)}
      />
    </div>
  );
};

export default ArticleForm;
