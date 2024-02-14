//this component is non functional yet!
import React, { Fragment, useState } from "react";
import "./InputHomicide.css";
import VictimForm from "./VictimForm";
import PerpetratorForm from "./PerpetratorForm";
import ArticleForm from "./ArticleForm";
import ListHomicides from "./ListHomicides";

const EditHomicides = ({ todo }) => {
  const [editStep, setEditStep] = useState(0); // 0: Select, 1: Edit Article, 2: Edit Victim, 3: Edit Perpetrator

  const [victimData, setVictimData] = useState({
    // ... your initial victimData
  });

  const [perpetratorData, setPerpetratorData] = useState({
    // ... your initial perpetratorData
  });

  const [articleData, setArticleData] = useState({
    // ... your initial articleData
  });

  const handleEditStepChange = (step) => {
    setEditStep(step);
  };

  const handleBack = () => {
    setEditStep(0);
  };

  const updateDescription = async (e) => {
    e.preventDefault();

    try {
      let body = {};

      switch (editStep) {
        case 1:
          body = filterData(articleData);
          break;
        case 2:
          body = filterData(victimData);
          break;
        case 3:
          body = filterData(perpetratorData);
          break;
        default:
          // Handle default case
          break;
      }

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

  const filterData = (data) => {
    return Object.fromEntries(
      Object.entries(data).filter(
        ([_, value]) => value !== undefined && value !== ""
      )
    );
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

            <div className="modal-body flex flex-wrap justify-center">
              {editStep === 0 && (
                <Fragment>
                  {/* Select edit type */}
                  <button
                    className="btn btn-primary m-2"
                    onClick={() => handleEditStepChange(1)}
                  >
                    Edit Article Data
                  </button>
                  <button
                    className="btn btn-primary m-2"
                    onClick={() => handleEditStepChange(2)}
                  >
                    Edit Victim Data
                  </button>
                  <button
                    className="btn btn-primary m-2"
                    onClick={() => handleEditStepChange(3)}
                  >
                    Edit Perpetrator Data
                  </button>
                </Fragment>
              )}

              {editStep === 1 && (
                <Fragment>
                  <ArticleForm
                    articleData={articleData}
                    setArticleData={setArticleData}
                  />
                  <button
                    className="btn btn-secondary "
                    onClick={() => handleBack()}
                  >
                    Back
                  </button>
                </Fragment>
              )}

              {editStep === 2 && (
                <Fragment>
                  <VictimForm
                    victimData={victimData}
                    setVictimData={setVictimData}
                  />
                  <button
                    className="btn btn-secondary m-2"
                    onClick={() => handleBack()}
                  >
                    Back
                  </button>
                </Fragment>
              )}

              {editStep === 3 && (
                <Fragment>
                  <PerpetratorForm
                    perpetratorData={perpetratorData}
                    setPerpetratorData={setPerpetratorData}
                  />
                  <button
                    className="btn btn-secondary m-2"
                    onClick={() => handleBack()}
                  >
                    Back
                  </button>
                </Fragment>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-black font-medium px-4 py-2 rounded transition duration-300"
                data-dismiss="modal"
                onClick={(e) => updateDescription(e)}
              >
                Submit
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
