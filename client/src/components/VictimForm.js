


import React, { useState } from "react";

const VictimForm = ({ onSubmit }) => {
  // State for the current victim
  const [currentVictim, setCurrentVictim] = useState({
    victimName: "",
    dateOfDeath: "",
    province: "",
    town: "",
    locationType: "",
    location: "",
    sexualAssault: "",
    genderOfVictim: "",
    race: "",
    ageOfVictim: "",
    ageRangeOfVictim: "",
    modeOfDeathSpecific: "",
    modeOfDeathGeneral: "",
  });


  const [towns, setTowns] = useState([]);

  // Hard-coded townsByProvince for simplicity

  const townsByProvince = {
    "Eastern Cape": [
      "Alice",
      "Butterworth",
      "East London",
      "Graaff-Reinet",
      "Grahamstown",
      "King William’s Town",
      "Mthatha",
      "Port Elizabeth",
      "Queenstown",
      "Uitenhage",
      "Zwelitsha",
    ],

    "Free State": [
      "Bethlehem",
      "Bloemfontein",
      "Jagersfontein",
      "Kroonstad",
      "Odendaalsrus",
      "Parys",
      "Phuthaditjhaba",
      "Sasolburg",
      "Virginia",
      "Welkom",
    ],

    Gauteng: [
      "Benoni",
      "Boksburg",
      "Brakpan",
      "Carletonville",
      "Germiston",
      "Johannesburg",
      "Krugersdorp",
      "Pretoria",
      "Randburg",
      "Randfontein",
      "Roodepoort",
      "Soweto",
      "Springs",
      "Vanderbijlpark",
      "Vereeniging",
    ],

    "KwaZulu-Natal": [
      "Durban",
      "Empangeni",
      "Ladysmith",
      "Newcastle",
      "Pietermaritzburg",
      "Pinetown",
      "Ulundi",
      "Umlazi",
    ],

    Limpopo: [
      "Giyani",
      "Lebowakgomo",
      "Musina",
      "Phalaborwa",
      "Polokwane",
      "Seshego",
      "Sibasa",
      "Thabazimbi",
    ],

    " Mpumalanga": ["Emalahleni", "Nelspruit", "Secunda"],

    "North West": [
      "Klerksdorp",
      "Mahikeng",
      "Mmabatho",
      "Potchefstroom",
      "Rustenburg",
    ],

    "Northern Cape": ["Kimberley", "Kuruman", "Port Nolloth"],

    "Western Cape": [
      "Bellville",
      "Cape Town",
      "Constantia",
      "George",
      "Hopefield",
      "Oudtshoorn",
      "Paarl",
      "Simon’s Town",
      "Stellenbosch",
      "Swellendam",
      "Worcester",
    ],
  };

  // Event handler for province change
  const handleProvinceChange = (e) => {
    const selectedProvince = e.target.value;
    setCurrentVictim((prevVictim) => ({
      ...prevVictim,
      province: selectedProvince,
    }));
    setTowns(townsByProvince[selectedProvince] || []);
  };

  // State for the list of entered victims
  const [victimData, setVictimData] = useState([]);

  // Event handler for adding a victim
  const handleAddVictim = () => {
    // Concatenate the current victim data with the existing data
    const concatenatedVictim = Object.keys(currentVictim).reduce(
      (acc, key) => ({
        ...acc,
        [key]: victimData.map((victim) => victim[key]).concat(currentVictim[key]).join(","),
      }),
      {}
    );

    // Save the concatenated victim data to the list
    setVictimData((prevData) => [...prevData, concatenatedVictim]);

    // Clear the current victim data for the next entry
    setCurrentVictim({
      victimName: "",
      dateOfDeath: "",
      province: "",
      town: "",
      locationType: "",
      location: "",
      sexualAssault: "",
      genderOfVictim: "",
      race: "",
      ageOfVictim: "",
      ageRangeOfVictim: "",
      modeOfDeathSpecific: "",
      modeOfDeathGeneral: "",
    });
  };

  // Event handler for submitting all victim data
  const handleVictimSubmit = () => {
    // Ensure there is at least one victim in the array
    if (victimData.length > 0) {
      // Submit the last victim data to the parent component
      const lastVictim = victimData[victimData.length - 1];
      onSubmit({
        victims: lastVictim,
        // ... (other fields)
      });
    } else {
      // Handle the case where there are no victims
      console.error("No victim data to submit.");
    }
  };
  

  return (
    <div className="col-md-20 text-gray-800">
     <label htmlFor="victimName">Victim Name:</label>
      <input
        type="text"
        id="victimName"
        className="form-control"
        value={currentVictim.victimName}
        onChange={(e) =>
          setCurrentVictim((prevVictim) => ({
            ...prevVictim,
            victimName: e.target.value,
          }))
        }
      />

      {/* ... other form fields for the current victim */}
      <label htmlFor="dateOfDeath">Date of Death:</label>
      <input
        type="date"
        id="dateOfDeath"
        className="form-control"
        value={currentVictim.dateOfDeath || ""}
        onChange={(e) =>
          setCurrentVictim((prevVictim) => ({
            ...prevVictim,
            dateOfDeath: e.target.value,
          }))
        }
      />

      {/* ... other form fields for the current victim */}
      <label htmlFor="province">Location of death - PROVINCE:</label>
      <select
        id="province"
        className="form-control"
        value={currentVictim.province}
        onChange={handleProvinceChange}
      >
        <option value="">Select Province</option>
        <option value="Western Cape">Western Cape</option>
        <option value="Northern Cape">Northern Cape</option>
        <option value="Eastern Cape">Eastern Cape</option>
        <option value="North West">North West</option>
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

      {/* ... other form fields for the current victim */}
      <label htmlFor="town">Location of death - Town/City:</label>
      <select
        id="town"
        className="form-control"
        value={currentVictim.town}
        onChange={(e) =>
          setCurrentVictim((prevVictim) => ({
            ...prevVictim,
            town: e.target.value,
          }))
        }
      >
        {/* Dynamically generate options based on the selected province */}
        {towns.map((town) => (
          <option key={town} value={town}>
            {town}
          </option>
        ))}
      </select>

      {/* ... other form fields for the current victim */}
      <label htmlFor="locationType">Type of Location:</label>
      <select
        id="locationType"
        className="form-control"
        value={currentVictim.locationType}
        onChange={(e) =>
          setCurrentVictim((prevVictim) => ({
            ...prevVictim,
            locationType: e.target.value,
          }))
        }
      >
        <option value="">Select Location Type</option>
        <option value="School">School</option>
        <option value="Home">Home</option>
        <option value="Hospital">Hospital</option>
        <option value="Taxi Rank">Taxi Rank</option>
        <option value="Farm">Farm</option>
      </select>

      <label htmlFor="sexualAssault">Sexual Assault:</label>
      <select
        id="sexualAssault"
        className="form-control"
        value={currentVictim.sexualAssault}
        onChange={(e) =>
          setCurrentVictim((prevVictim) => ({
            ...prevVictim,
            sexualAssault: e.target.value,
          }))
        }
      >
        <option value="">Select an option</option>
        <option value="Yes">Yes</option>
        <option value="No">No</option>
        <option value="Unknown">Unknown</option>
      </select>

      {/* ... other form fields for the current victim */}
      <label htmlFor="genderOfVictim">Victim Gender:</label>
      <select
        id="genderOfVictim"
        className="form-control"
        value={currentVictim.genderOfVictim}
        onChange={(e) =>
          setCurrentVictim((prevVictim) => ({
            ...prevVictim,
            genderOfVictim: e.target.value,
          }))
        }
      >
        <option value="">Select gender of victim</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Transgender">Transgender</option>
        <option value="Other">Other</option>
        <option value="Unknown">Unknown</option>
      </select>

      {/* ... other form fields for the current victim */}
      <label htmlFor="race">Victim Race:</label>
      <select
        id="race"
        className="form-control"
        value={currentVictim.race}
        onChange={(e) =>
          setCurrentVictim((prevVictim) => ({
            ...prevVictim,
            race: e.target.value,
          }))
        }
      >
        <option value="">Select Race of victim</option>
        <option value="Black South African">Black South African</option>
        <option value="Coloured South African">Coloured South African</option>
        <option value="White South African">White South African</option>
        <option value="Indian">Indian</option>
        <option value="Asian">
          Asian - Chinese and other Asian heritage excluding the subcontinent
        </option>
        <option value="Black Non-South African">Black Non-South African</option>
        <option value="White Non-South African">White Non-South African</option>
        <option value="Unknown">Unknown</option>
      </select>

      {/* ... other form fields for the current victim */}
      <label htmlFor="ageOfVictim">Age of Victim:</label>
      <input
        type="text"
        id="ageOfVictim"
        className="form-control"
        value={currentVictim.ageOfVictim || ""}
        onChange={(e) =>
          setCurrentVictim((prevVictim) => ({
            ...prevVictim,
            ageOfVictim: e.target.value,
          }))
        }
      />

      {/* ... other form fields for the current victim */}
      <label htmlFor="ageRangeOfVictim">Age Range of Victim:</label>
      <select
        id="ageRangeOfVictim"
        className="form-control"
        value={currentVictim.ageRangeOfVictim}
        onChange={(e) =>
          setCurrentVictim((prevVictim) => ({
            ...prevVictim,
            ageRangeOfVictim: e.target.value,
          }))
        }
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

      {/* ... other form fields for the current victim */}
      <label htmlFor="modeOfDeathSpecific">Mode of Death - Specific:</label>
      <select
        id="modeOfDeathSpecific"
        className="form-control"
        value={currentVictim.modeOfDeathSpecific}
        onChange={(e) =>
          setCurrentVictim((prevVictim) => ({
            ...prevVictim,
            modeOfDeathSpecific: e.target.value,
          }))
        }
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

      {/* ... other form fields for the current victim */}
      <label htmlFor="modeOfDeathGeneral">Mode of Death - General:</label>
      <select
        id="modeOfDeathGeneral"
        className="form-control"
        value={currentVictim.modeOfDeathGeneral}
        onChange={(e) =>
          setCurrentVictim((prevVictim) => ({
            ...prevVictim,
            modeOfDeathGeneral: e.target.value,
          }))
        }
      >
        <option value="">Select Mode of Death (General)</option>
        <option value="Sharp force trauma">Sharp force trauma</option>
        <option value="Blunt force trauma">Blunt force trauma</option>
        <option value="Sharp-blunt/Blunt-sharp force trauma">
          Sharp-blunt/Blunt-sharp force trauma
        </option>
        <option value="Strangulation or asphyxiation">
          Strangulation or asphyxiation
        </option>
        <option value="Poison or burning">Poison or burning</option>
        <option value="Firearm injury">Firearm injury</option>
      </select>
      <button className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-black font-medium px-4 py-2 rounded transition duration-300" onClick={handleAddVictim}>Add Victim</button>


      {victimData.length > 0 && (
        <div>
          <h3>Entered Victims</h3>
          <table>
            <th>Victim Name</th>
            <th>Date of death</th>
            <th>Province</th>
            <th>Town</th>
            <th>Location Type</th>
            <th>sexual Assault</th>
            <th>Gender</th>
            <th>Race</th>
            <th>Age</th>
            <th>Age Range</th>
            <th>Mode of death specific</th>
            <th>Mode of death general</th>

            <tbody>
              {victimData.map((victim, index) => (
                <tr key={index}>
                  <td>{victim.victimName}</td>
                  <td>{victim.dateOfDeath}</td>
                  <td>{victim.province}</td>
                  <td>{victim.town}</td>
                  <td>{victim.locationType}</td>
                  <td>{victim.sexualAssault}</td>
                  <td>{victim.genderOfVictim}</td>
                  <td>{victim.race}</td>
                  <td>{victim.ageOfVictim}</td>
                  <td>{victim.ageRangeOfVictim}</td>
                  <td>{victim.modeOfDeathSpecific}</td>
                  <td>{victim.modeOfDeathGeneral}</td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
     
      {/* Button to submit victim data */}
      <button className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-black font-medium px-4 py-2 rounded transition duration-300" onClick={handleVictimSubmit}>Submit Victims</button>
    </div>
  );
};

export default VictimForm;
