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
  const [modeOfDeathGeneral, setModeOfDeathGeneral] = useState("");
  const [nameOfPerpetrator, setNameOfPerpetrator] = useState("");
  const [relationshipToVictim, setRelationshipToVictim] = useState("");
  const [suspectIdentified, setSuspectIdentified] = useState("");
  const [suspectArrested, setSuspectArrested] = useState("");
  const [suspectCharged, setSuspectCharged] = useState("");
  const [conviction, setConviction] = useState("");
  const [sentence, setSentence] = useState("");
  const [incidentNotes, setIncidentNotes] = useState("");
  const [ageRangeOfVictim, setAgeRangeOfVictim] = useState("");
  const onSubmitForm = async (e) => {
    e.preventDefault();

    try {
      const body = {
        victim_name: victimName,
        newspaper_article: newsSource,
        date,
        location,
        news_report_id: newsReportId,
        news_report_url: newsReportUrl,
        news_report_headline: newsReportHeadline,
        author,
        wire_service: wireService,
        language: language,
        source_type: sourceType,
        date_of_death: dateOfDeath,
        province: province,
        town: town,
        location_type: locationType,
        sexual_assault: sexualAssault,
        gender_of_victim: genderOfVictim,
        race: race,
        age_of_victim: ageOfVictim,
        mode_of_death_specific: modeOfDeathSpecific,
        mode_of_death_general: modeOfDeathGeneral,
        name_of_perpetrator: nameOfPerpetrator,
        relationship_to_victim: relationshipToVictim,
        suspect_identified: suspectIdentified,
        suspect_arrested: suspectArrested,
        suspect_charged: suspectCharged,
        conviction: conviction,
        sentence: sentence,
        incident_notes: incidentNotes,
        age_range_of_victim: ageRangeOfVictim,
      }; // Updated object
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

        <label htmlFor="newsSource">News Report Platform:</label>
        <select
          id="newsSource"
          className="form-control"
          value={newsSource}
          onChange={(e) => setNewsSource(e.target.value)}
        >
          <option value="">Select News Report Platform</option>
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

        <label htmlFor="dateOfDeath">
          Date of Death -input 01/01/1000 for default:
        </label>
        <input
          type="date"
          id="dateOfDeath"
          className="form-control"
          value={dateOfDeath}
          onChange={(e) => setDateOfDeath(e.target.value)}
        />

        <label htmlFor="province"> Location of death -PROVINCE :</label>
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

        <label htmlFor="sexualAssault"> Sexual Assault :</label>
        <select
          id="sexualAssault"
          className="form-control"
          value={sexualAssault}
          onChange={(e) => setSexualAssault(e.target.value)}
        >
          <option value="">Select an option</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="Unknown">Unknown</option>
        </select>

        <label htmlFor="genderOfVictim"> Victim Gender :</label>
        <select
          id="genderOfVictim"
          className="form-control"
          value={genderOfVictim}
          onChange={(e) => setGenderOfVictim(e.target.value)}
        >
          <option value="">Select gender of victim</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Transgender">Transgender</option>
          <option value="Other">Other</option>
          <option value="Unknown">Unknown</option>
        </select>

        <label htmlFor="race"> Victim Race :</label>
        <select
          id="race"
          className="form-control"
          value={race}
          onChange={(e) => setRace(e.target.value)}
        >
          <option value="">Select Race of victim</option>
          <option value="Black South African">Black South African</option>
          <option value="Coloured South African">Coloured South African</option>
          <option value="White South African">White South African</option>
          <option value="Indian">Indian</option>
          <option value="Asian">
            Asian - Chinese and other Asian heritage excluding the subcontinent
          </option>
          <option value="Black Non-South African">
            Black Non-South African
          </option>
          <option value="White Non-South African">
            White Non-South African
          </option>
          <option value="Unknown">Unknown</option>
        </select>

        <label htmlFor="ageOfVictim">Age of Victim:</label>
        <input
          type="text"
          id="ageOfVictim"
          className="form-control"
          value={ageOfVictim}
          onChange={(e) => setAgeOfVictim(e.target.value)}
        />
        <label htmlFor="ageRangeOfVictim">Age Range of Victim:</label>
        <select
          id="ageRangeOfVictim"
          className="form-control"
          value={ageRangeOfVictim}
          onChange={(e) => setAgeRangeOfVictim(e.target.value)}
        >
          <option value="">Select Age Range</option>
          <option value="Neonate">Neonate</option>
          <option value="Abandonment Baby">Abandonment Baby</option>
          <option value="Infant">Infant</option>
          <option value="Child">Child</option>
          <option value="Teenager">Teenager</option>
          <option value="Elderly">Elderly</option>
          <option value="Unknown">Unknown</option>
          <option value="0-5 years">0-5 years</option>
          <option value="5-10 years">5-10 years</option>
          <option value="10-14 years">10-14 years</option>
          <option value="15-20 years">15-20 years</option>
          <option value="20-30 years">20-30 years</option>
          <option value="30-40 years">30-40 years</option>
          <option value="40-50 years">40-50 years</option>
          <option value="50-60 years">50-60 years</option>
          <option value="60-70 years">60-70 years</option>
          <option value="70 years+">70 years+</option>
        </select>

        <label htmlFor="modeOfDeathSpecific">Mode of Death - Specific:</label>
        <select
          id="modeOfDeathSpecific"
          className="form-control"
          value={modeOfDeathSpecific}
          onChange={(e) => setModeOfDeathSpecific(e.target.value)}
        >
          <option value="">Select Mode of Death - Specific</option>
          <option value="Gunshot">Gunshot</option>
          <option value="Strangulation (manual or ligature)">
            Strangulation (manual or ligature)
          </option>
          <option value="Suffocation">Suffocation</option>
          <option value="Stabbing (knife or similar)">
            Stabbing (knife or similar)
          </option>
          <option value="Chopping (axe or panga or similar)">
            Chopping (axe or panga or similar)
          </option>
          <option value="Beating">Beating</option>
          <option value="Poison">Poison</option>
          <option value="Fire">Fire</option>
          <option value="Chemical burns">Chemical burns</option>
          <option value="Electrical shock">Electrical shock</option>
          <option value="Dogs or other animals">Dogs or other animals</option>
          <option value="Lightning">Lightning</option>
          <option value="Drowning">Drowning</option>
          <option value="Motor vehicle impact">Motor vehicle impact</option>
          <option value="Falling from height">Falling from height</option>
          <option value="Suicide">Suicide</option>
          <option value="Explosive device/explosion">
            Explosive device/explosion
          </option>
          <option value="Missing presumed dead">Missing presumed dead</option>
          <option value="Unknown">Unknown</option>
          <option value="Other">Other</option>
        </select>

        <label htmlFor="modeOfDeathGeneral">Mode of Death -General:</label>
      <select
        id="modeOfDeathGeneral"
        className="form-control"
        value={modeOfDeathGeneral}
        onChange={(e) => setModeOfDeathGeneral(e.target.value)}
      >
        <option value="">Select Mode of Death (General)</option>
        <option value="Sharp force trauma">Sharp force trauma</option>
        <option value="Blunt force trauma">Blunt force trauma</option>
        <option value="Sharp-blunt/Blunt-sharp force trauma">Sharp-blunt/Blunt-sharp force trauma</option>
        <option value="Strangulation or asphyxiation">Strangulation or asphyxiation</option>
        <option value="Poison or burning">Poison or burning</option>
        <option value="Firearm injury">Firearm injury</option>
      </select>

        <label htmlFor="nameOfPerpetrator">Name of Perpetrator:</label>
        <input
          type="text"
          id="nameOfPerpetrator"
          className="form-control"
          value={nameOfPerpetrator}
          onChange={(e) => setNameOfPerpetrator(e.target.value)}
        />

        <label htmlFor="relationshipToVictim">Relationship to Victim:</label>
        <select
          id="relationshipToVictim"
          className="form-control"
          value={relationshipToVictim}
          onChange={(e) => setRelationshipToVictim(e.target.value)}
        >
          <option value="">Select Relationship</option>
          <option value="Unknown">Unknown</option>
          <option value="Stranger">Stranger</option>
          <option value="Current or former intimate partner">
            Current or former intimate partner
          </option>
          <option value="Love rival">Love rival</option>
          <option value="Current or former employee">
            Current or former employee
          </option>
          <option value="Current or former employer">
            Current or former employer
          </option>
          <option value="Terrorist (state label)">
            Terrorist (state label)
          </option>
          <option value="Parent">Parent</option>
          <option value="Child">Child</option>
          <option value="Grandchild">Grandchild</option>
          <option value="Grandparent">Grandparent</option>
          <option value="Mother-in-law">Mother-in-law</option>
          <option value="Sister-in-law">Sister-in-law</option>
          <option value="Brother-in-law">Brother-in-law</option>
          <option value="Son-in-law">Son-in-law</option>
          <option value="Daughter-in-law">Daughter-in-law</option>
          <option value="Father-in-law">Father-in-law</option>
          <option value="Aunt">Aunt</option>
          <option value="Uncle">Uncle</option>
          <option value="Niece">Niece</option>
          <option value="Nephew">Nephew</option>
          <option value="Cousin">Cousin</option>
          <option value="Close family member (unknown relationship or more distant than first cousin)">
            Close family member (unknown relationship or more distant than first
            cousin)
          </option>
          <option value="Stepchild">Stepchild</option>
          <option value="Step-parent">Step-parent</option>
          <option value="Foster child">Foster child</option>
          <option value="Foster parent">Foster parent</option>
          <option value="Police officer">Police officer</option>
          <option value="Suspect in police or security custody">
            Suspect in police or security custody
          </option>
          <option value="Security Guard">Security Guard</option>
          <option value="Community member">Community member</option>
          <option value="Other">Other</option>
        </select>

        <label htmlFor="suspectIdentified">Suspect Identified:</label>
        <select
          id="suspectIdentified"
          className="form-control"
          value={suspectIdentified}
          onChange={(e) => setSuspectIdentified(e.target.value)}
        >
          <option value="">Select Option</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="Unknown">Unknown</option>
          <option value="null">Null</option>
        </select>

        <label htmlFor="suspectArrested">Suspect Arrested:</label>
        <select
          id="suspectArrested"
          className="form-control"
          value={suspectArrested}
          onChange={(e) => setSuspectArrested(e.target.value)}
        >
          <option value="">Select Option</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="Unknown">Unknown</option>
          <option value="null">Null</option>
        </select>

        <label htmlFor="suspectCharged">Suspect Charged:</label>
        <select
          id="suspectCharged"
          className="form-control"
          value={suspectCharged}
          onChange={(e) => setSuspectCharged(e.target.value)}
        >
          <option value="">Select Option</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="Unknown">Unknown</option>
          <option value="null">Null</option>
        </select>

        <label htmlFor="conviction">Conviction:</label>
        <select
          id="conviction"
          className="form-control"
          value={conviction}
          onChange={(e) => setConviction(e.target.value)}
        >
          <option value="">Select Option</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="Unknown">Unknown</option>
          <option value="null">Null</option>
        </select>

        <label htmlFor="sentence">Sentence:</label>
        <input
          type="text"
          id="sentence"
          className="form-control"
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
        />

        <label htmlFor="incidentNotes">Incident Notes:</label>
        <textarea
          id="incidentNotes"
          className="form-control"
          value={incidentNotes}
          onChange={(e) => setIncidentNotes(e.target.value)}
        />
        <button className="btn btn-success mt-3">Add</button>
      </form>
    </Fragment>
  );
};

export default InputHomicide;
