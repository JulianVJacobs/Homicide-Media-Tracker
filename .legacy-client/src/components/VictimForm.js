import React, { useState } from "react";
import townsByProvince from "./townsByProvince";
import Select from "react-select";

// Component for entering victim information
const VictimForm = ({ onSubmit }) => {
  // State variables for managing victim data
  const [currentVictim, setCurrentVictim] = useState({
    // Initial state for victim data fields
    victimName: "",
    dateOfDeath: "",
    province: "",
    town: "",
    locationType: "",
    sexualAssault: "",
    genderOfVictim: "",
    race: "",
    ageOfVictim: "",
    ageRangeOfVictim: "",
    modeOfDeathSpecific: "",
    modeOfDeathGeneral: "",
    typeOfMurder: "",
    policeStation: "",
  });

  const [hasVictims, setHasVictims] = useState(false); // State for tracking if victims are entered
  const [towns, setTowns] = useState([]); // State for towns based on selected province
  const [customTown, setCustomTown] = useState(""); // State for custom town

  // Function to clear all entered victims
  const handleClearAllVictims = () => {
    setVictimData([]); // Clear all victim data
    setHasVictims(false); // Update hasVictims when victims are cleared
    setTowns([]);
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

  const murderOptions = [
    // Options for the type of murder
    
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

  // Event handler for adding a victim
  const handleAddVictim = () => {
    const townToUse =
      currentVictim.town === "Other" ? customTown : currentVictim.town;

    // Add the current victim to victimData array directly
    setVictimData((prevData) => [
      ...prevData,
      {
        ...currentVictim,
        town: townToUse,
      },
    ]);

    setHasVictims(true); // Set hasVictims to true after adding a victim
    setCurrentVictim({
      // Reset currentVictim state after adding a victim
      victimName: "",
      dateOfDeath: "",
      province: "",
      town: "",
      locationType: "",
      sexualAssault: "",
      genderOfVictim: "",
      race: "",
      ageOfVictim: "",
      ageRangeOfVictim: "",
      modeOfDeathSpecific: "",
      modeOfDeathGeneral: "",
      typeOfMurder: "",
      policeStation: "",
    });
    setCustomTown(""); // Clear custom town input
  };

  // Event handler for submitting all victim data
  const handleVictimSubmit = () => {
    console.log("Victim data", victimData);

    if (victimData.length > 0) {
      const formattedVictims = Object.keys(currentVictim).reduce(
        (acc, key) => {
          acc[key] = victimData.map((victim) => victim[key]).join(", ");
          return acc;
        },
        {}
      );

      onSubmit({
        victims: formattedVictims, // Wrap in an array to match the expected structure
        // ... (other fields)
      });

      console.log("formatted victims: ", formattedVictims);
    } else {
      console.error("No victim data to submit.");
    }
  };

  // Custom styles for React Select component
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
        max="9999-12-31"
      />
      <label htmlFor="date_of_death">Date of Death:</label>



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
        onChange={(e) => {
          setCurrentVictim((prevVictim) => ({
            ...prevVictim,
            town: e.target.value,
          }));
          // Clear custom town input when selecting a town from the dropdown
          setCustomTown("");
        }}
      >
        {towns.map((town) => (
          <option key={town} value={town}>
            {town}
          </option>
        ))}
        <option value="Other">Other</option>
      </select>

      {/* Render input field for custom town if "Other" is selected */}
      {currentVictim.town === "Other" && (
        <input
          type="text"
          id="customTown"
          className="form-control"
          placeholder="Enter custom town"
          value={customTown}
          onChange={(e) => setCustomTown(e.target.value)}
        />
      )}

<label htmlFor="policeStation">Police Station (if known):</label>
      <input
        type="text"
        id="policeStation"
        className="form-control"
        value={currentVictim.policeStation}
        onChange={(e) =>
          setCurrentVictim((prevVictim) => ({
            ...prevVictim,
            policeStation: e.target.value,
          }))
        }
      />
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

      <label htmlFor="typeOfMurder">
        Type of Murder (Select all that apply):
      </label>
      <Select
  id="typeOfMurder"
  isMulti
  options={murderOptions}
  styles={customStyles}
  value={murderOptions.filter((option) => currentVictim.typeOfMurder.includes(option.label))}
  onChange={(selectedOptions) => {
    const selectedLabels = selectedOptions.map((option) => option.label);
    const selectedString = selectedLabels.join(';');

    setCurrentVictim((prevVictim) => ({
      ...prevVictim,
      typeOfMurder: selectedString,
    }));
  }}
/>
      <button
        className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-black font-medium px-4 py-2 rounded transition duration-300"
        onClick={handleAddVictim}
      >
        Add Victim
      </button>
      {hasVictims && ( // Step 2
        <button
          className="bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-black font-medium px-4 py-2 rounded transition duration-300"
          onClick={handleClearAllVictims}
        >
          Clear All Victims
        </button>
      )}

      {victimData.length > 0 && (
        <div>
          <h3>Entered Victims</h3>
          <table>
            <th>Victim Name</th>
            <th>Date of death</th>
            <th>Province</th>
            <th>Town</th>
            <th>Location Type</th>
            <th>Police Station</th>
            <th>sexual Assault</th>
            <th>Gender</th>
            <th>Race</th>
            <th>Age</th>
            <th>Age Range</th>
            <th>Mode of death specific</th>
            <th>Mode of death general</th>
            <th>Type of murder</th>
            <tbody>
            {victimData.map((victim, index) => (
          <tr key={index}>
            <td>{victim.victimName}</td>
            <td>{victim.dateOfDeath}</td>
            <td>{victim.province}</td>
            <td>{victim.town}</td>
            <td>{victim.locationType}</td>
            <td>{victim.policeStation}</td>
            <td>{victim.sexualAssault}</td>
            <td>{victim.genderOfVictim}</td>
            <td>{victim.race}</td>
            <td>{victim.ageOfVictim}</td>
            <td>{victim.ageRangeOfVictim}</td>
            <td>{victim.modeOfDeathSpecific}</td>
            <td>{victim.modeOfDeathGeneral}</td>
            <td>{victim.typeOfMurder}</td>
          </tr>
        ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Button to submit victim data */}
      <button
        className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-black font-medium px-4 py-2 rounded transition duration-300"
        onClick={handleVictimSubmit}
      >
        Submit Victims
      </button>
    </div>
  );
};

export default VictimForm;
