import React, { useState } from "react";
import Select from "react-select";
// ... (import statements)

const PerpetratorForm = ({ onSubmit }) => {
    const [currentPerpetrator, setCurrentPerpetrator] = useState({
        perpetratorName: "",
        relationshipToVictim: "",
        suspectIdentified: "",
        suspectArrested: "",
        suspectCharged: "",
        conviction: "",
        sentence: "",
        typeOfMurder: [],  // <-- Ensure it's an empty array initially
      });
      
  
    const [perpetratorData, setPerpetratorData] = useState([]);
  
    const handleAddPerpetrator = () => {
      setPerpetratorData((prevData) => [...prevData, { ...currentPerpetrator }]);
      setCurrentPerpetrator({
        perpetratorName: "",
        relationshipToVictim: "",
        suspectIdentified: "",
        suspectArrested: "",
        suspectCharged: "",
        conviction: "",
        sentence: "",
        typeOfMurder: [],
      });
    };
  
    const handlePerpetratorSubmit = () => {
        // Group values by field and join them together
        const formattedPerpetrators = Object.keys(currentPerpetrator).reduce(
          (acc, key) => {
            if (key === "typeOfMurder") {
              acc[key] = currentPerpetrator[key].join(", ");
            } else {
              acc[key] = perpetratorData.map((perpetrator) => perpetrator[key]).join(", ");
            }
            return acc;
          },
          {}
        );
      
        // Call the onSubmit callback with the formatted data
        onSubmit(formattedPerpetrators);
      };
      
      

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
      <label htmlFor="perpetratorName">Perpetrator Name:</label>
      <input
        type="text"
        id="perpetratorName"
        className="form-control"
        value={currentPerpetrator.perpetratorName}
        onChange={(e) =>
          setCurrentPerpetrator((prevPerpetrator) => ({
            ...prevPerpetrator,
            perpetratorName: e.target.value,
          }))
        }
      />

      <label htmlFor="relationshipToVictim">Relationship to Victim:</label>
      <select
        id="relationshipToVictim"
        className="form-control"
        value={currentPerpetrator.relationshipToVictim}
        onChange={(e) =>
          setCurrentPerpetrator((prevPerpetrator) => ({
            ...prevPerpetrator,
            relationshipToVictim: e.target.value,
          }))
        }
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
        <option value="Terrorist (state label)">Terrorist (state label)</option>
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
        value={currentPerpetrator.suspectIdentified}
        onChange={(e) =>
          setCurrentPerpetrator((prevPerpetrator) => ({
            ...prevPerpetrator,
            suspectIdentified: e.target.value,
          }))
        }
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
        value={currentPerpetrator.suspectArrested}
        onChange={(e) =>
          setCurrentPerpetrator((prevPerpetrator) => ({
            ...prevPerpetrator,
            suspectArrested: e.target.value,
          }))
        }
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
        value={currentPerpetrator.suspectCharged}
        onChange={(e) =>
          setCurrentPerpetrator((prevPerpetrator) => ({
            ...prevPerpetrator,
            suspectCharged: e.target.value,
          }))
        }
      >
        <option value="">Select Option</option>
        <option value="Yes">Yes</option>
        <option value="No">No</option>
        <option value="Unknown">Unknown</option>
        <option value="null">Null</option>
      </select>

      <label htmlFor="conviction">Suspect Convicted:</label>
      <select
        id="conviction"
        className="form-control"
        value={currentPerpetrator.conviction}
        onChange={(e) =>
          setCurrentPerpetrator((prevPerpetrator) => ({
            ...prevPerpetrator,
            conviction: e.target.value,
          }))
        }
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
        value={currentPerpetrator.sentence}
        onChange={(e) =>
          setCurrentPerpetrator((prevPerpetrator) => ({
            ...prevPerpetrator,
            sentence: e.target.value,
          }))
        }
      />

      <label htmlFor="typeOfMurder">
        Type of Murder (Select all that apply):
      </label>
      <Select
        id="typeOfMurder"
        isMulti
        options={murderOptions}
        styles={customStyles}
        value={currentPerpetrator.typeOfMurder}
        onChange={(selectedOptions) =>
          setCurrentPerpetrator((prevPerpetrator) => ({
            ...prevPerpetrator,
            typeOfMurder: selectedOptions,
          }))
        }
      />

      <button
        className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-black font-medium px-4 py-2 rounded transition duration-300"
        onClick={handleAddPerpetrator}
      >
        Add Perpetrator
      </button>

      {perpetratorData.length > 0 && (
        <div>
          <h3>Entered Perpetrators</h3>
          <table>
            <th>Perpetrator Name</th>
            <th>Relationship to Victim</th>
            <th>Suspect Identified</th>
            <th>Suspect Arrested</th>
            <th>Suspect Charged</th>
            <th>Convition</th>
            <th>Sentence</th>
            <th>Type of Murder</th>
            <tbody>
              {perpetratorData.map((perpetrator, index) => (
                <tr key={index}>
                  <td>{perpetrator.perpetratorName}</td>
                  <td>{perpetrator.relationshipToVictim}</td>
                  <td>{perpetrator.suspectIdentified}</td>
                  <td>{perpetrator.suspectArrested}</td>
                  <td>{perpetrator.suspectCharged}</td>
                  <td>{perpetrator.conviction}</td>
                  <td>{perpetrator.sentence}</td>
                  <td>{perpetrator.typeOfMurder.map(murder => murder.label).join(', ')}</td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-black font-medium px-4 py-2 rounded transition duration-300"
        onClick={handlePerpetratorSubmit}
      >
        Submit All Perpetrators
      </button>
    </div>
  );
};

export default PerpetratorForm;