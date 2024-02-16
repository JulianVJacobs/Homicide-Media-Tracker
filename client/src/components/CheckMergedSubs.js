import React, { useState, useEffect } from "react";

const CheckMergedSubs = ({ newsReportId }) => {
  const [mergedSubs, setMergedSubs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchMergedSubs = async () => {
      try {
        const response = await fetch(`http://localhost:5000/mergedSubs/${newsReportId}`);
        const jsonData = await response.json();
        setMergedSubs(jsonData);
      } catch (error) {
        console.error("Error fetching merged subs:", error);
      }
    };

    fetchMergedSubs();
  }, [newsReportId]);

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <div>
      <button
        className="bg-purple-500 text-white font-bold py-2 px-4 rounded"
        onClick={openModal}
      >
        Check Merged Subs
      </button>
      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <h3>Merged Subs:</h3>
            <ul>
              {mergedSubs.map((sub) => (
                <li key={sub.id}>{sub.newsReportId}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckMergedSubs;
