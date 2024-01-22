import React, { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import "../output.css"; // Import a CSS file for styling
import "react-toastify/dist/ReactToastify.css";

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
  const [dateOfDeath, setDateOfDeath] = useState(null);
  const [province, setProvince] = useState("");
  const [town, setTown] = useState("");
  const [locationType, setLocationType] = useState("");
  const [sexualAssault, setSexualAssault] = useState("");
  const [genderOfVictim, setGenderOfVictim] = useState("");
  const [race, setRace] = useState("");
  const [ageOfVictim, setAgeOfVictim] = useState(null);
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
  const [typeOfMurder, setTypeOfMurder] = useState([]);
  const [successMessage, setSuccessMessage] = useState(""); // New state for success message

  const navigate = useNavigate();

  const murderOptions = [
    { value: "Adult male homicide", label: "Adult male homicide" },
    { value: "Adult female homicide", label: "Adult female homicide" },
    { value: "Eldercide", label: "Eldercide" },
    { value: "Child murder", label: "Child murder" },
    { value: "Multiple killing", label: "Multiple killing" },
    { value: "Political killing", label: "Political killing" },
    { value: "Gang-related killing", label: "Gang-related killing" },
    { value: "Family killing", label: "Family killing" },
    { value: "Witch killing", label: "Witch killing" },
    { value: "LGBTQ killing", label: "LGBTQ killing" },
    { value: "Sex worker killing", label: "Sex worker killing" },
    { value: "Farm killing", label: "Farm killing" },
    { value: "Serial killing", label: "Serial killing" },
    { value: "Spree killing", label: "Spree killing" },
    { value: "Intimate partner killing", label: "Intimate partner killing" },
    { value: "Rural killing", label: "Rural killing" },
    { value: "Ritual killing", label: "Ritual killing" },
    { value: "Assassination", label: "Assassination" },
    { value: "Culpable homicide", label: "Culpable homicide" },
    { value: "Matricide", label: "Matricide" },
    { value: "Patricide", label: "Patricide" },
    { value: "Natural causes", label: "Natural causes" },
    {
      value: "Self-inflicted (including suicide)",
      label: "Self-inflicted (including suicide)",
    },
    { value: "Killing in police custody", label: "Killing in police custody" },
    { value: "Missing presumed dead", label: "Missing presumed dead" },
    { value: "Hired killers", label: "Hired killers" },
    { value: "Concealment of birth", label: "Concealment of birth" },
    { value: "Terrorism or war", label: "Terrorism or war" },
    { value: "Other (add category)", label: "Other (add category)" },
  ];

    
    // Define a mapping of provinces to towns
    const townsByProvince = {
      "Eastern Cape": [
        "Alice", "Butterworth", "East London", "Graaff-Reinet", "Grahamstown",
        "King William’s Town", "Mthatha", "Port Elizabeth", "Queenstown", "Uitenhage", "Zwelitsha"
      ],
    
      "Free State": [
        "Bethlehem", "Bloemfontein", "Jagersfontein", "Kroonstad", "Odendaalsrus",
        "Parys", "Phuthaditjhaba", "Sasolburg", "Virginia", "Welkom"
      ],
    
      "Gauteng": [
        "Benoni", "Boksburg", "Brakpan", "Carletonville", "Germiston",
        "Johannesburg", "Krugersdorp", "Pretoria", "Randburg", "Randfontein",
        "Roodepoort", "Soweto", "Springs", "Vanderbijlpark", "Vereeniging"
      ],
    
      "KwaZulu-Natal": [
        "Durban", "Empangeni", "Ladysmith", "Newcastle", "Pietermaritzburg",
        "Pinetown", "Ulundi", "Umlazi"
      ],
    
      "Limpopo": [
        "Giyani", "Lebowakgomo", "Musina", "Phalaborwa", "Polokwane",
        "Seshego", "Sibasa", "Thabazimbi"
      ],
    
      "Mpumalanga": [
        "Emalahleni", "Nelspruit", "Secunda"
      ],
    
      "North West": [
        "Klerksdorp", "Mahikeng", "Mmabatho", "Potchefstroom", "Rustenburg"
      ],
    
      "Northern Cape": [
        "Kimberley", "Kuruman", "Port Nolloth"
      ],
    
      "Western Cape": [
        "Bellville", "Cape Town", "Constantia", "George", "Hopefield",
        "Oudtshoorn", "Paarl", "Simon’s Town", "Stellenbosch", "Swellendam", "Worcester"
      ],
    };
    

    const handleProvinceChange = (e) => {
      const selectedProvince = e.target.value;
      setProvince(selectedProvince);
      // Set the town to an empty string when province changes
      setTown("");
    };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      border: "1px solid #ccc",
    }),
    option: (provided, state) => ({
      ...provided,
      color: "#000", // Set the text color to black
      background: state.isSelected ? "#f0f0f0" : "#fff", // Background color on selection
      "&:hover": {
        background: "#f0f0f0", // Background color on hover
      },
    }),
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();

    try {
      const typeOfMurderString = typeOfMurder
        .map((option) => option.value)
        .join(",");

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
        type_of_murder: typeOfMurderString,
      }; // Updated object
      const response = await fetch("http://localhost:5000/homicides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        setSuccessMessage("Homicide entry was successfully added!");
        setTimeout(() => {
          setSuccessMessage(""); // Clear success message after a few seconds
          navigate("/ListHomicides");
        }, 3000); // Adjust the timeout as needed
      } else {
        console.error("Failed to add homicide entry");
        // Handle other error cases if needed
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-200 to-gray-600">
      <Fragment>
        <h1 className="text-center mt-10 text-4xl font-bold text-gray-500">
          Input Data
        </h1>
        <form
          className="mt-10 mx-auto max-w-xl bg-gradient-to-r from-gray-400 via-gray-600 to-gray-400 p-8 rounded-lg"
          onSubmit={onSubmitForm}
        >
          <div className="col-md-20">
            <label htmlFor="newsReportId">News Report ID:</label>
            <input
              type="text"
              id="newsReportId"
              className="form-control"
              value={newsReportId}
              onChange={(e) => setNewsReportId(e.target.value)}
            />


            <label htmlFor="nameOfPerpetrator">Name of Perpetrator:</label>
            <input
              type="text"
              id="nameOfPerpetrator"
              className="form-control"
              value={nameOfPerpetrator}
              onChange={(e) => setNameOfPerpetrator(e.target.value)}
            />

            <label htmlFor="relationshipToVictim">
              Relationship to Victim:
            </label>
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
                Close family member (unknown relationship or more distant than
                first cousin)
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

            <label htmlFor="typeOfMurder">
              Type of Murder (Select all that apply):
            </label>
            <Select
              id="typeOfMurder"
              isMulti
              options={murderOptions}
              styles={customStyles}
              value={typeOfMurder}
              onChange={(selectedOptions) => setTypeOfMurder(selectedOptions)}
            />

            <button className="btn btn-success mt-3">Add</button>
          </div>
        </form>
      </Fragment>
    </div>
  );
};

export default InputHomicide;
