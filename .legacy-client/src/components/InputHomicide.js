import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for programmatic navigation
import ArticleForm from "./ArticleForm"; // Import ArticleForm component
import VictimForm from "./VictimForm"; // Import VictimForm component
import PerpetratorForm from "./PerpetratorForm"; // Import PerpetratorForm component
import "react-toastify/dist/ReactToastify.css"; // Import CSS for toast notifications

// Component for inputting homicide data
const InputHomicide = () => {
  // State variables for managing form data and submission status
  const [articleData, setArticleData] = useState({}); // State for article data
  const [victimData, setVictimData] = useState([]); // State for victim data
  const [perpetratorData, setPerpetratorData] = useState([]); // State for perpetrator data
  const [successMessage, setSuccessMessage] = useState(""); // State for success message
  const [loading, setLoading] = useState(false); // State for loading status

  const navigate = useNavigate(); // Initialize useNavigate hook for navigation

  // Function to handle submission of article form
  const onSubmitArticleForm = (data) => {
    setArticleData(data);
  };

  // Function to handle submission of victim form
  const onSubmitVictimForm = (data) => {
    setVictimData((prevData) => [...prevData, data]);
  };

  // Function to handle submission of perpetrator form
  const onSubmitPerpetratorForm = (data) => {
    setPerpetratorData((prevData) => [...prevData, data]);
  };
  // Function to handle overall form submission
  const onSubmitForm = async () => {
    try {
      setLoading(true);

      
      
      const victimName = victimData.map(
        (victimObject) => victimObject.victims.victimName
      );
      const SubmitName = victimName[0];

      const victimAge = victimData.map(
        (victimObject) => victimObject.victims.ageOfVictim
      );
      const SubmitAge = victimAge[0];
      const victimAgeRange = victimData.map(
        (victimObject) => victimObject.victims.ageRangeOfVictim
      );
      const SubmitAgeRange = victimAgeRange[0];
      const victimDate = victimData.map(
        (victimObject) => victimObject.victims.dateOfDeath
      );
      const SubmitDate = victimDate[0];
      const victimProvince = victimData.map(
        (victimObject) => victimObject.victims.province
      );
      const SubmitProvince = victimProvince[0];
      const victimTown = victimData.map(
        (victimObject) => victimObject.victims.town
      );
      const SubmitTown = victimTown[0];
      const victimLocationType = victimData.map(
        (victimObject) => victimObject.victims.locationType
      );
      const SubmitLocationType = victimLocationType[0];
      const policeStation = victimData.map(
        (victimObject) => victimObject.victims.policeStation
      );
      const SubmitPoliceStation = policeStation[0];
      const victimSexualAssault = victimData.map(
        (victimObject) => victimObject.victims.sexualAssault
      );
      const SubmitSexualAssault = victimSexualAssault[0];
      const victimGender = victimData.map(
        (victimObject) => victimObject.victims.genderOfVictim
      );
      const SubmitGender = victimGender[0];
      const victimModeSpecific = victimData.map(
        (victimObject) => victimObject.victims.modeOfDeathSpecific
      );
      const SubmitModeOfDeathSpecific = victimModeSpecific[0];
      const victimModeGeneral = victimData.map(
        (victimObject) => victimObject.victims.modeOfDeathGeneral
      );
      const SubmitModeGeneral = victimModeGeneral[0];
      const victimRace = victimData.map(
        (victimObject) => victimObject.victims.race
      );

      const typeOfMurder = victimData.map(
        (victimObject) => victimObject.typeOfMurder
      );
      const SubmitTypeOfMurder = typeOfMurder[0];

      
      const SubmitRace = victimRace[0];
      const perpetratorName = perpetratorData.map(
        (perpetratorObject) => perpetratorObject.perpetratorName
      );
      const SubmitPerpetratorName = perpetratorName[0];
      
      const relationshipToVictim = perpetratorData.map(
        (perpetratorObject) => perpetratorObject.relationshipToVictim
      );
      const SubmitRelationshipToVictim = relationshipToVictim[0];
      
      const suspectIdentified = perpetratorData.map(
        (perpetratorObject) => perpetratorObject.suspectIdentified
      );
      const SubmitSuspectIdentified = suspectIdentified[0];
      
      const suspectArrested = perpetratorData.map(
        (perpetratorObject) => perpetratorObject.suspectArrested
      );
      const SubmitSuspectArrested = suspectArrested[0];
      const suspectCharged = perpetratorData.map(
        (perpetratorObject) => perpetratorObject.suspectCharged
      );
      const SubmitSuspectCharged = suspectCharged[0];
      
      const Suspectconviction = perpetratorData.map(
        (perpetratorObject) => perpetratorObject.conviction
      );
      const SubmitSuspectConviction = Suspectconviction[0];

      const sentence = perpetratorData.map(
        (perpetratorObject) => perpetratorObject.sentence
      );
      const SubmitSentence = sentence[0];

    
      
      
      // Combine all data for the API request
      const body = {
        news_report_id: articleData.newsReportId,
        news_report_url: articleData.newsReportUrl,
        news_report_headline: articleData.newsReportHeadline,
        date_of_publication: articleData.dateOfPublication,
        author: articleData.author,
        wire_service: articleData.wireService,
        language: articleData.language,
        type_of_source: articleData.sourceType,
        news_report_platform: articleData.newsSource,
        victim_name: SubmitName,
        date_of_death:SubmitDate,
        place_of_death_province:SubmitProvince,
        place_of_death_town:SubmitTown,
        police_station:SubmitPoliceStation,
        type_of_location:SubmitLocationType,
        sexual_assault:SubmitSexualAssault,
        gender_of_victim:SubmitGender,
        race_of_victim:SubmitRace,
        age_of_victim:SubmitAge,
        age_range_of_victim:SubmitAgeRange,
        mode_of_death_specific:SubmitModeOfDeathSpecific,
        mode_of_death_general:SubmitModeGeneral,
        type_of_murder: SubmitTypeOfMurder,
        perpetrator_name: SubmitPerpetratorName,
        perpetrator_relationship_to_victim: SubmitRelationshipToVictim,
                suspect_identified: SubmitSuspectIdentified,
        suspect_arrested: SubmitSuspectArrested,
        suspect_charged: SubmitSuspectCharged,
        conviction: SubmitSuspectConviction,
        sentence: SubmitSentence,
       
          
        
      };

      console.log(body);
      const response = await fetch("http://localhost:5000/homicides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setSuccessMessage("Homicide entry was successfully added!");
        setTimeout(() => {
          setSuccessMessage("");
          navigate("/ListHomicides");
        }, 3000);
      } else {
        console.error("Failed to add homicide entry");
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-200 to-gray-600 p-5">
      <h1 className="text-center text-4xl font-bold text-gray-500 mb-5">
        Input Data
      </h1>
  
      {/* Article Details Section */}
      <div className="bg-white p-5 mb-5 border rounded-md shadow-md">
        <h2 className="text-xl font-bold mb-3 text-gray-800">
          Article Details
        </h2>
        <ArticleForm onSubmit={onSubmitArticleForm} />
      </div>
  
      {/* Victim Details Section */}
      <div className="bg-white p-5 mb-5 border rounded-md shadow-md">
        <h2 className="text-xl font-bold mb-3 text-gray-800">Victim Details</h2>
        <VictimForm onSubmit={onSubmitVictimForm} />
      </div>
  
      {/* Perpetrator Details Section */}
      <div className="bg-white p-5 mb-5 border rounded-md shadow-md">
        <h2 className="text-xl font-bold mb-3 text-gray-800">
          Perpetrator Details
        </h2>
        <PerpetratorForm onSubmit={onSubmitPerpetratorForm} />
      </div>
  
      <button
        className="btn btn-success mt-3"
        onClick={onSubmitForm}
        disabled={loading}
      >
        {loading ? "Adding..." : "Add"}
      </button>
  
      {successMessage && (
        <div className="text-green-500 mt-3">{successMessage}</div>
      )}
    </div>
  );
      }

export default InputHomicide;
