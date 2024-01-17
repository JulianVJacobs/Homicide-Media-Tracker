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
      const body = { victim_name: victimName, newspaper_article: newsSource, date, location, news_report_id:newsReportId, news_report_url:newsReportUrl, news_report_headline:newsReportHeadline, author, wire_service: wireService, language:language, source_type:sourceType, date_of_death:dateOfDeath, province:province, town:town, location_type:locationType }; // Updated object
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

        <label htmlFor="sourceType">Source Type :</label>
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

        <label htmlFor="date">Date of publication:</label>
        <input
          type="date"
          id="date"
          className="form-control"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
<label htmlFor="victimName">Victim Name:</label>
        <input
          type="text"
          id="victimName"
          className="form-control"
          value={victimName}
          onChange={(e) => setVictimName(e.target.value)}
        />

<label htmlFor="dateOfDeath">Date of Death -input 01/01/1000 for default:</label>
        <input
          type="date"
          id="dateOfDeath"
          className="form-control"
          value={dateOfDeath}
          onChange={(e) => setDateOfDeath(e.target.value)}
        />

<label htmlFor="province"> Location of death -PROVINCE  :</label>
        <select
          id="province"
          className="form-control"
          value={province}
          onChange={(e) => setProvince(e.target.value)}
        >
          <option value="">Select Province</option>
          <option value="Western Cape">Western Cape</option>
  <option value="Northern Cape">Northern Cape</option>
  <option value="Eastern Cape">Eastern Cape</option>
  <option value="North-West">North-West</option>
  <option value="Free State">Free State</option>
  <option value="Gauteng">Gauteng</option>
  <option value="Mpumalanga">Mpumalanga</option>
  <option value="Limpopo">Limpopo</option>
  <option value="KwaZulu-Natal">KwaZulu-Natal</option>
  <option value="Cape of Good Hope">Cape of Good Hope</option>
  <option value="Orange Free State">Orange Free State</option>
  <option value="Transvaal">Transvaal</option>
  <option value="Natal">Natal</option>
  <option value="Transkei">Transkei</option>
  <option value="Bophuthatswana">Bophuthatswana</option>
  <option value="Venda">Venda</option>
  <option value="Ciskei">Ciskei</option>
        </select>


        <label htmlFor="town">Location of death -Town/City:</label>
<select
  id="town"
  className="form-control"
  value={town}
  onChange={(e) => setTown(e.target.value)}
>
  <option value="">Select Town</option>
  {/* Eastern Cape */}
  <option value="Alice">Alice</option>
  <option value="Butterworth">Butterworth</option>
  <option value="East London">East London</option>
  <option value="Graaff-Reinet">Graaff-Reinet</option>
  <option value="Grahamstown">Grahamstown</option>
  <option value="King William’s Town">King William’s Town</option>
  <option value="Mthatha">Mthatha</option>
  <option value="Port Elizabeth">Port Elizabeth</option>
  <option value="Queenstown">Queenstown</option>
  <option value="Uitenhage">Uitenhage</option>
  <option value="Zwelitsha">Zwelitsha</option>

  {/* Free State */}
  <option value="Bethlehem">Bethlehem</option>
  <option value="Bloemfontein">Bloemfontein</option>
  <option value="Jagersfontein">Jagersfontein</option>
  <option value="Kroonstad">Kroonstad</option>
  <option value="Odendaalsrus">Odendaalsrus</option>
  <option value="Parys">Parys</option>
  <option value="Phuthaditjhaba">Phuthaditjhaba</option>
  <option value="Sasolburg">Sasolburg</option>
  <option value="Virginia">Virginia</option>
  <option value="Welkom">Welkom</option>

  {/* Gauteng */}
  <option value="Benoni">Benoni</option>
  <option value="Boksburg">Boksburg</option>
  <option value="Brakpan">Brakpan</option>
  <option value="Carletonville">Carletonville</option>
  <option value="Germiston">Germiston</option>
  <option value="Johannesburg">Johannesburg</option>
  <option value="Krugersdorp">Krugersdorp</option>
  <option value="Pretoria">Pretoria</option>
  <option value="Randburg">Randburg</option>
  <option value="Randfontein">Randfontein</option>
  <option value="Roodepoort">Roodepoort</option>
  <option value="Soweto">Soweto</option>
  <option value="Springs">Springs</option>
  <option value="Vanderbijlpark">Vanderbijlpark</option>
  <option value="Vereeniging">Vereeniging</option>

  {/* KwaZulu-Natal */}
  <option value="Durban">Durban</option>
  <option value="Empangeni">Empangeni</option>
  <option value="Ladysmith">Ladysmith</option>
  <option value="Newcastle">Newcastle</option>
  <option value="Pietermaritzburg">Pietermaritzburg</option>
  <option value="Pinetown">Pinetown</option>
  <option value="Ulundi">Ulundi</option>
  <option value="Umlazi">Umlazi</option>

  {/* Limpopo */}
  <option value="Giyani">Giyani</option>
  <option value="Lebowakgomo">Lebowakgomo</option>
  <option value="Musina">Musina</option>
  <option value="Phalaborwa">Phalaborwa</option>
  <option value="Polokwane">Polokwane</option>
  <option value="Seshego">Seshego</option>
  <option value="Sibasa">Sibasa</option>
  <option value="Thabazimbi">Thabazimbi</option>

  {/* Mpumalanga */}
  <option value="Emalahleni">Emalahleni</option>
  <option value="Nelspruit">Nelspruit</option>
  <option value="Secunda">Secunda</option>

  {/* North West */}
  <option value="Klerksdorp">Klerksdorp</option>
  <option value="Mahikeng">Mahikeng</option>
  <option value="Mmabatho">Mmabatho</option>
  <option value="Potchefstroom">Potchefstroom</option>
  <option value="Rustenburg">Rustenburg</option>

  {/* Northern Cape */}
  <option value="Kimberley">Kimberley</option>
  <option value="Kuruman">Kuruman</option>
  <option value="Port Nolloth">Port Nolloth</option>

  {/* Western Cape */}
  <option value="Bellville">Bellville</option>
  <option value="Cape Town">Cape Town</option>
  <option value="Constantia">Constantia</option>
  <option value="George">George</option>
  <option value="Hopefield">Hopefield</option>
  <option value="Oudtshoorn">Oudtshoorn</option>
  <option value="Paarl">Paarl</option>
  <option value="Simon’s Town">Simon’s Town</option>
  <option value="Stellenbosch">Stellenbosch</option>
  <option value="Swellendam">Swellendam</option>
  <option value="Worcester">Worcester</option>
</select>

<label htmlFor="locationType">Type of Location:</label>
<select
  id="locationType"
  className="form-control"
  value={locationType}
  onChange={(e) => setLocationType(e.target.value)}
>
  <option value="">Select Location Type</option>
  <option value="School">School</option>
  <option value="Home">Home</option>
  <option value="Hospital">Hospital</option>
  <option value="Taxi Rank">Taxi Rank</option>
  <option value="Farm">Farm</option>
  {/* Add more location types as needed */}
</select>
        
        <label htmlFor="location">Location notes:</label>
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
