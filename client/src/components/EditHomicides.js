import React, { Fragment, useState } from "react";

const EditHomicides = ({ todo }) => {
  const [victimName, setVictimName] = useState(todo.victim_name);
  const [newspaperArticle, setNewspaperArticle] = useState(todo.newspaper_article);
  const [date, setDate] = useState(todo.date);
  const [location, setLocation] = useState(todo.location);
  const [newsReportId, setNewsReportId] = useState(todo.news_report_id);
  const [newsReportUrl, setNewsReportUrl] = useState(todo.news_report_url);
  const [newsReportHeadline, setNewsReportHeadline] = useState(todo.news_report_headline);
  const [author, setAuthor] = useState(todo.author);
  const updateDescription = async (e) => {
    e.preventDefault();

    try {
      const body = {
        news_report_id: newsReportId,
        news_report_url: newsReportUrl,
        news_report_headline: newsReportHeadline,
        author:author,
        victim_name: victimName,
        newspaper_article: newspaperArticle,
        date: date,
        location: location,
      };
      const response = await fetch(`http://localhost:5000/homicides/${todo.homicide_id}`, {
        method: "PUT",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(body),
      });

      window.location = "/";
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <Fragment>
      <button
        type="button"
        className="btn btn-warning"
        data-toggle="modal"
        data-target={`#id${todo.homicide_id}`}
      >
        Edit
      </button>

      <div className="modal" id={`id${todo.homicide_id}`} onClick={() => setVictimName(todo.victim_name)}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Edit Homicide Entry</h4>
              <button
                type="button"
                className="close"
                onClick={() => setVictimName(todo.victim_name)}
                data-dismiss="modal"
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
            <input
                type="text"
                className="form-control"
                value={newsReportId}
                onChange={(e) => setNewsReportId(e.target.value)}
              />
              
              <input
                type="text"
                className="form-control"
                value={newsReportUrl}
                onChange={(e) => setNewsReportUrl(e.target.value)}
              />

<input
                type="text"
                className="form-control"
                value={newsReportHeadline}
                onChange={(e) => setNewsReportHeadline(e.target.value)}
              />
              <input
                type="text"
                className="form-control"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
              <input
                type="text"
                className="form-control"
                value={victimName}
                onChange={(e) => setVictimName(e.target.value)}
              />
              <input
                type="text"
                className="form-control"
                value={newspaperArticle}
                onChange={(e) => setNewspaperArticle(e.target.value)}
              />
              <input
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <input
                type="text"
                className="form-control"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-warning"
                data-dismiss="modal"
                onClick={(e) => updateDescription(e)}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn btn-danger"
                data-dismiss="modal"
                onClick={() => setVictimName(todo.victim_name)}
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
