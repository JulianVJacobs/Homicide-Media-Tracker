import React, { Fragment, useState } from "react";
import "./InputHomicide.css";
import VictimForm from "./VictimForm";
import PerpetratorForm from "./PerpetratorForm";
import ArticleForm from "./ArticleForm";
import ListHomicides from "./ListHomicides";

const EditHomicides = ({ todo }) => {
  // State for each form
  const [victimData, setVictimData] = useState({
    victimName: todo.victim_name,
    ageOfVictim: todo.age_of_victim,
    dateOfDeath: todo.date_of_death,
    province: todo.province,
    town: todo.town,
    locationType: todo.location_type,
    sexualAssault: todo.sexual_assault,
    genderOfVictim: todo.gender_of_victim,
    race: todo.race,
    modeOfDeathSpecific: todo.mode_of_death_specific,
    modeOfDeathGeneral: todo.mode_of_death_general,
    ageRangeOfVictim: todo.age_range_of_victim,
  });

  const [perpetratorData, setPerpetratorData] = useState({
    nameOfPerpetrator: todo.name_of_perpetrator,
    relationshipToVictim: todo.relationship_to_victim,
    suspectIdentified: todo.suspect_identified,
    suspectArrested: todo.suspect_arrested,
    suspectCharged: todo.suspect_charged,
    conviction: todo.conviction,
    sentence: todo.sentence,
    typeOfMurder: todo.typeOfMurder,
  });

  const [articleData, setArticleData] = useState({
    // newsReportId: todo.news_report_id,
    newspaperArticle: todo.newspaper_article,
    date: todo.date,
    newsReportUrl: todo.news_report_url,
    newsReportHeadline: todo.news_report_headline,
    author: todo.author,
    wireService: todo.wire_service,
    language: todo.language,
    sourceType: todo.source_type,
  });

  // Function to update data in the backend

  const updateDescription = async (e) => {
    e.preventDefault();

    try {
      // Filter out empty or undefined values
      const filteredVictimData = filterData(victimData);
      const filteredPerpetratorData = filterData(perpetratorData);
      const filteredArticleData = Object.fromEntries(
        Object.entries(articleData).filter(
          ([key, value]) =>
            key !== "newsReportId" && value !== undefined && value !== ""
        )
      );

      // Handle undefined values explicitly
      for (const key in filteredVictimData) {
        if (filteredVictimData[key] === undefined) {
          delete filteredVictimData[key];
        }
      }

      for (const key in filteredPerpetratorData) {
        if (filteredPerpetratorData[key] === undefined) {
          delete filteredPerpetratorData[key];
        }
      }

      for (const key in filteredArticleData) {
        if (filteredArticleData[key] === undefined) {
          delete filteredArticleData[key];
        }
      }

      // Convert newsReportId to an integer if it's not undefined
      // if (filteredArticleData.newsReportId !== undefined) {
      //   filteredArticleData.newsReportId = parseInt(
      //     filteredArticleData.newsReportId
      //   );
      // }

      // Merge filtered data from all forms into a single object
      const body = {
        ...filteredVictimData,
        ...filteredPerpetratorData,
        ...filteredArticleData,
      };

      const response = await fetch(
        `http://localhost:5000/homicides/${todo.homicide_id}`,
        {
          method: "PUT",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      window.location = "/ListHomicides";
    } catch (err) {
      console.error(err.message);
    }
  };

  // Helper function to filter out empty or undefined values
  const filterData = (data) => {
    return Object.fromEntries(
      Object.entries(data).filter(
        ([_, value]) => value !== undefined && value !== ""
      )
    );
  };

  // Function to handle article form submission
  const handleArticleFormSubmit = (data) => {
    setArticleData(data);
  };

  // Function to handle victim form submission
  const handleVictimFormSubmit = (data) => {
    setVictimData(data);
  };

  // Function to handle perpetrator form submission
  const handlePerpetratorFormSubmit = (data) => {
    setPerpetratorData(data);
  };

  return (
    <Fragment>
      <button
        type="button"
        className="bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-black border border-yellow-700 font-medium px-4 py-2 rounded transition duration-300"
        data-toggle="modal"
        data-target={`#id${todo.homicide_id}`}
      >
        Edit
      </button>

      <div className="modal" id={`id${todo.homicide_id}`}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Edit Homicide Entry</h4>
              <button type="button" className="close" data-dismiss="modal">
                &times;
              </button>
            </div>

            <div className="modal-body">
              {/* Render article form */}
              <ArticleForm
                articleData={articleData}
                setArticleData={setArticleData}
                onSubmit={handleArticleFormSubmit}
              />
              {/* Render victim form */}
              <VictimForm
                victimData={victimData}
                setVictimData={setVictimData}
                onSubmit={handleVictimFormSubmit}
              />

              {/* Render perpetrator form */}
              <PerpetratorForm
                perpetratorData={perpetratorData}
                setPerpetratorData={setPerpetratorData}
                onSubmit={handlePerpetratorFormSubmit}
              />
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-black font-medium px-4 py-2 rounded transition duration-300"
                data-dismiss="modal"
                onClick={(e) => updateDescription(e)}
              >
                Edit
              </button>

              <button
                type="button"
                className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-black font-medium px-4 py-2 rounded transition duration-300"
                data-dismiss="modal"
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
