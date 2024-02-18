import React, { useState, useEffect } from "react";

const CheckMergedSubs = ({ mergeIds }) => {
  const [mergedSubs, setMergedSubs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchMergedSubs = async () => {
    try {
      const response = await fetch(`http://localhost:5000/homicides/${mergeIds}`);
      const jsonData = await response.json();
      setMergedSubs(jsonData);
    } catch (error) {
      console.error("Error fetching merged subs:", error);
    }
  };

  const handleButtonClick = async () => {
    await fetchMergedSubs();
    openModal();
  };

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <div>
      <button
        className="bg-purple-500 hover:bg-purple-600 active:by-purple-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleButtonClick}
      >
        Check Merged Subs
      </button>
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-10 overflow-x-auto overflow-y-auto bg-black bg-opacity-50">
          <div className="relative bg-white rounded-lg max-w-full mx-auto p-8">
            <button className="absolute top-0 right-0 m-4 text-gray-500" onClick={closeModal}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-lg font-semibold mb-4">Merged Subs:</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2">News Report ID</th>
                    <th className="border border-gray-300 px-4 py-2">News Report URL</th>
                    <th className="border border-gray-300 px-4 py-2">News Report Headline</th>
                    <th className="border border-gray-300 px-4 py-2">Date of Publication</th>
                    <th className="border border-gray-300 px-4 py-2">Author</th>
                    <th className="border border-gray-300 px-4 py-2">Wire Service</th>
                    <th className="border border-gray-300 px-4 py-2">Language</th>
                    <th className="border border-gray-300 px-4 py-2">Type of Source</th>
                    <th className="border border-gray-300 px-4 py-2">News Report Platform</th>
                    <th className="border border-gray-300 px-4 py-2">Notes</th>
                    <th className="border border-gray-300 px-4 py-2">Victim Name</th>
                    <th className="border border-gray-300 px-4 py-2">Date of Death</th>
                    <th className="border border-gray-300 px-4 py-2">Place of Death Province</th>
                    <th className="border border-gray-300 px-4 py-2">Place of Death Town</th>
                    <th className="border border-gray-300 px-4 py-2">Police Station</th>
                    <th className="border border-gray-300 px-4 py-2">Type of Location</th>
                    <th className="border border-gray-300 px-4 py-2">Sexual Assault</th>
                    <th className="border border-gray-300 px-4 py-2">Gender of Victim</th>
                    <th className="border border-gray-300 px-4 py-2">Race of Victim</th>
                    <th className="border border-gray-300 px-4 py-2">Age of Victim</th>
                    <th className="border border-gray-300 px-4 py-2">Age Range of Victim</th>
                    <th className="border border-gray-300 px-4 py-2">Mode of Death Specific</th>
                    <th className="border border-gray-300 px-4 py-2">Mode of Death General</th>
                    <th className="border border-gray-300 px-4 py-2">Type of Murder</th>
                    <th className="border border-gray-300 px-4 py-2">Perpetrator Name</th>
                    <th className="border border-gray-300 px-4 py-2">Perpetrator Relationship to Victim</th>
                    <th className="border border-gray-300 px-4 py-2">Suspect Identified</th>
                    <th className="border border-gray-300 px-4 py-2">Suspect Arrested</th>
                    <th className="border border-gray-300 px-4 py-2">Suspect Charged</th>
                    <th className="border border-gray-300 px-4 py-2">Conviction</th>
                    <th className="border border-gray-300 px-4 py-2">Sentence</th>
                  </tr>
                </thead>
                <tbody>
                  {mergedSubs.map((sub, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-2">{sub.news_report_id}</td>
                      <td className="border border-gray-300 px-4 py-2">{sub.news_report_url}</td>
                      <td className="border border-gray-300 px-4 py-2">{sub.news_report_headline}</td>
                      <td className="border border-gray-300 px-4 py-2">{new Date(sub.date_of_publication).toLocaleDateString("en-GB")}</td>
                      <td className="border border-gray-300 px-4 py-2">{sub.author}</td>
                      <td className="border border-gray-300 px-4 py-2">{sub.wire_service}</td>
                      <td className="border border-gray-300 px-4 py-2">{sub.language}</td>
                      <td className="border border-gray-300 px-4 py-2">{sub.type_of_source}</td>
                      <td className="border border-gray-300 px-4 py-2">{sub.news_report_platform}</td>
                      <td className="border border-gray-300 px-4 py-2">{sub.notes}</td>
                      <td className="border border-gray-300 px-4 py-2">{sub.victim_name}</td>
                      <td className="border border-gray-300 px-4 py-2">{new Date(sub.date_of_death).toLocaleDateString("en-GB")}</td>
                      <td className="border border-gray-300 px-4 py-2">{sub.place_of_death_province}</td>
                      <td className="border border-gray-300 px-4 py-2">{sub.place_of_death_town}</td>
                      <td className="border border-gray-300 px-4 py-2">{sub.police_station}</td>
                      <td className="border border-gray-300 px-4 py-2">{sub.type_of_location}</td>
                      <td className="border border-gray-300 px-4 py-2">{sub.sexual_assault}</td>
                      <td className="border border-gray-300 px-4 py-2">{sub.gender_of_victim}</td>
                      <td className="border border-gray-300 px-4 py-2">{sub.race_of_victim}</td>
                      <td className="border border-gray-300 px-4 py-2">{sub.age_of_victim}</td>
                      <td className="border border-gray-300 px-4 py-2">{sub.age_range_of_victim}</td>
                      <td className="border border-gray-300 px-4 py-2">{sub.mode_of_death_specific}</td>
                      <td className="border border-gray-300 px-4 py-2">{sub.mode_of_death_general}</td>
                      <td className="border border-gray-300 px-4 py-2">{sub.type_of_murder}</td>
                      <td className="border border-gray-300 px-4 py-2">{sub.perpetrator_name}</td>
                      <td className="border border-gray-300 px-4 py-2">{sub.perpetrator_relationship_to_victim}</td>
                      <td className="border border-gray-300 px-4 py-2">{sub.suspect_identified}</td>
                      <td className="border border-gray-300 px-4 py-2">{sub.suspect_arrested}</td>
                      <td className="border border-gray-300 px-4 py-2">{sub.suspect_charged}</td>
                      <td className="border border-gray-300 px-4 py-2">{sub.conviction}</td>
                      <td className="border border-gray-300 px-4 py-2">{sub.sentence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckMergedSubs;
