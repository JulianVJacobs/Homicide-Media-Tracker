import React, { useState } from "react";

// Component for entering perpetrator information
const PerpetratorForm = ({ onSubmit }) => {
  // State variables for managing perpetrator data
  const [currentPerpetrator, setCurrentPerpetrator] = useState({
      // Initial state for perpetrator data fields
        perpetratorName: "",
        relationshipToVictim: "",
        suspectIdentified: "",
        suspectArrested: "",
        suspectCharged: "",
        conviction: "",
        sentence: "",
          // <-- Ensure it's an empty array initially
      });
      
      const [perpetratorData, setPerpetratorData] = useState([]); // State for the list of entered perpetrators
      const [hasPerpetrators, setHasPerpetrators] = useState(false); // State for tracking if perpetrators are entered
  
      // Event handler for adding a perpetrator
      const handleAddPerpetrator = () => {
          setPerpetratorData((prevData) => [...prevData, { ...currentPerpetrator }]);
          setCurrentPerpetrator({
              // Reset currentPerpetrator state after adding a perpetrator
        perpetratorName: "",
        relationshipToVictim: "",
        suspectIdentified: "",
        suspectArrested: "",
        suspectCharged: "",
        conviction: "",
        sentence: "",
        
      });
      setHasPerpetrators(true);
    };
  
 // Function to clear all entered perpetrators
 const handleClearAllPerpetrators = () => {
  setPerpetratorData([]); // Clear all perpetrator data
  setHasPerpetrators(false); // Update hasPerpetrators when perpetrators are cleared
};

 // Event handler for submitting all perpetrator data
 const handlePerpetratorSubmit = () => {
  // Group values by field and join them together
        const formattedPerpetrators = Object.keys(currentPerpetrator).reduce(
          (acc, key) => {
            
              acc[key] = perpetratorData.map((perpetrator) => perpetrator[key]).join(", ");
            
            return acc;
          },
          {}
        );
      
        // Call the onSubmit callback with the formatted data
        onSubmit(formattedPerpetrators);
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

      



      <button
        className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-black font-medium px-4 py-2 rounded transition duration-300"
        onClick={handleAddPerpetrator}
      >
        Add Perpetrator
      </button>
      {hasPerpetrators && ( // Step 2
        <button
          className="bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-black font-medium px-4 py-2 rounded transition duration-300"
          onClick={handleClearAllPerpetrators}
        >
          Clear All Perpetrators
        </button>
      )}

      {perpetratorData.length > 0 && (
        <div>
          <h3>Entered Perpetrators</h3>
          <table>
            <th>Perpetrator Name</th>
            <th>Relationship to Victim</th>
            <th>Suspect Identified</th>
            <th>Suspect Arrested</th>
            <th>Suspect Charged</th>
            <th>Conviction</th>
            <th>Sentence</th>
            
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