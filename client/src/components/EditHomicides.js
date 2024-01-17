import React, { Fragment, useState } from "react";

const EditHomicides = ({ todo }) => {
  const [victimName, setVictimName] = useState(todo.victim_name);
  const [newspaperArticle, setNewspaperArticle] = useState(todo.newspaper_article);
  const [date, setDate] = useState(todo.date);
  const [location, setLocation] = useState(todo.location);
  const [newsReportId, setNewsReportId] = useState(todo.news_report_id);
  const [newsReportUrl, setNewsReportUrl] = useState(todo.news_report_url);
  const [newsReportHeadline, setNewsReportHeadline] = useState(todo.news_report_headline);
  const [author, setAuthor] = useState(todo.author);
  const [wireService,setWireService] = useState(todo.wire_service);
  const [language,setLanguage] = useState(todo.language);
  const [sourceType,setSourceType] = useState(todo.source_type);
  const [dateOfDeath,setDateOfDeath] = useState(todo.date_of_death);
  const [province,setProvince] = useState(todo.province);
  const [town,setTown] = useState(todo.town);
  const [locationType,setLocationType] = useState(todo.location_type);
  const updateDescription = async (e) => {
    e.preventDefault();

    try {
      const body = {
        news_report_id: newsReportId,
        news_report_url: newsReportUrl,
        news_report_headline: newsReportHeadline,
        author:author,
        wire_service: wireService,
        language:language,
        source_type:sourceType,
        victim_name: victimName,
        date_of_death: dateOfDeath,
        town:town,
        province:province,
        location_type:locationType,
        newspaper_article: newspaperArticle,
        date: date,
        location: location,
      };
      const response = await fetch(`http://localhost:5000/homicides/${todo.homicide_id}`, {
        method: "PUT",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(body),
      });

      window.location = "/";
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <Fragment>
      <button
        type="button"
        className="btn btn-warning"
        data-toggle="modal"
        data-target={`#id${todo.homicide_id}`}
      >
        Edit
      </button>

      <div className="modal" id={`id${todo.homicide_id}`} onClick={() => setVictimName(todo.victim_name)}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Edit Homicide Entry</h4>
              <button
                type="button"
                className="close"
                onClick={() => setVictimName(todo.victim_name)}
                data-dismiss="modal"
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
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
        <label htmlFor="newspaperArticle">News Source:</label>
        <select
          id="newspaperArticle"
          className="form-control"
          value={newspaperArticle}
          onChange={(e) => setNewspaperArticle(e.target.value)}
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

<label htmlFor="dateOfDeath">Date of Death:</label>
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
              
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-warning"
                data-dismiss="modal"
                onClick={(e) => updateDescription(e)}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn btn-danger"
                data-dismiss="modal"
                onClick={() => setVictimName(todo.victim_name)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default EditHomicides;
