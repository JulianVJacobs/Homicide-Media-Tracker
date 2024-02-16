

//This component represents the article form found on the input homicides page. it inlcudes capturing of the data 
import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';


// Component representing the form for adding an article
const ArticleForm = ({ onSubmit }) => {
    // Log updated article data whenever it changes
  const [newsReportUrl, setNewsReportUrl] = useState("");
  const [newsReportHeadline, setNewsReportHeadline] = useState("");
  const [dateOfPublication, setDateOfPublication] = useState("");
  const [author, setAuthor] = useState("");
  const [wireService, setWireService] = useState("");
  const [language, setLanguage] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [newsSource, setNewsSource] = useState("");

  useEffect(() => {
    console.log("Updated Article Data:", {
      
      newsReportUrl,
      newsReportHeadline,
      dateOfPublication,
      author,
      wireService,
      language,
      sourceType,
      newsSource,
    });
  }, 
    [ onSubmit]
  );
 // Function to handle form submission
  const handleSubmit = () => {
       // Construct article data object
    const articleData = {
      newsReportId: uuidv4(), //Generate a unique id for each article 
      newsReportUrl,
      newsReportHeadline,
      dateOfPublication,
      author,
      wireService,
      language,
      sourceType,
      newsSource,
    };

    // Call the parent onSubmit function to update the state in InputHomicidePage --which is the parent component 
    onSubmit(articleData);
  };

  return (
    <div className="col-md-20 text-gray-800">
      {/* <label htmlFor="newsReportId">News Report ID:</label>
      <input
        type="text"
        id="newsReportId"
        className="form-control"
        value={newsReportId}
        onChange={(e) => setNewsReportId(e.target.value)}
      /> */}

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
        <option value="SABINET">SABINET</option>
        <option value="SAPA">SAPA</option>
        <option value="AFP">AFP</option>
        <option value="ANA">ANA</option>
        <option value="Caxton News Service">Caxton News Service</option>
        <option value="NewsWire">NewsWire</option>
        <option value="EINPresswire">EIN Presswire</option>
        <option value="News24Wire">News24Wire</option>
        <option value="AP">AP</option>
        <option value="Reuters">Reuters</option>
        <option value="Null">null</option>
        
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
        type="date"
        id="dateOfPublication"
        className="form-control"
        value={dateOfPublication}
        onChange={(e) => setDateOfPublication(e.target.value)}
        max="9999-12-31"
      />

      <button className="btn btn-primary mt-3" onClick={handleSubmit}>
        Save Article Details
      </button>
    </div>
  );
};

export default ArticleForm;
