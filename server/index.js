const express = require("express");
const app = express(); //creating an instance of express 
const cors = require("cors"); //requiring cross origin resource sharing 
const pool = require("./db"); //this pooling connects to the psql db 

//middleware
app.use(cors());
app.use(express.json()); //req.body

//routes//

// post request for adding a homicide entry
app.post("/homicides", async (req, res) => {
    try {
      const { victim_name, newspaper_article, date, location, news_report_id, news_report_url, news_report_headline, author, wire_service, language, source_type, date_of_death, province, town, location_type } = req.body;
      const newHomicide = await pool.query(
        "INSERT INTO homicide (victim_name, newspaper_article, date, location, news_report_id, news_report_url, news_report_headline, author, wire_service, language, source_type, date_of_death , province, town, location_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *",
        [victim_name, newspaper_article, date, location, news_report_id, news_report_url, news_report_headline, author, wire_service, language, source_type, date_of_death, province, town, location_type ]
      );
  
      res.json(newHomicide.rows[0]);
    } catch (err) {
      console.error(err.message);
    }
  });
  
  // this get request retrieves all homicide entries
  app.get("/homicides", async (req, res) => {
    try {
      const allHomicides = await pool.query("SELECT * FROM homicide");
      res.json(allHomicides.rows);
    } catch (err) {
      console.error(err.message);
    }
  });
  
  // This put request is for updating/editing a homicide entry
  app.put("/homicides/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { victim_name, newspaper_article, date, location, news_report_id, news_report_url, news_report_headline, author, wire_service, language, source_type, date_of_death, province, town, location_type } = req.body;
      const updateHomicide = await pool.query(
        "UPDATE homicide SET victim_name = $1, newspaper_article = $2, date = $3, location = $4 , news_report_id = $6, news_report_url =$7, news_report_headline =$8, author=$9, wire_service=$10 , language=$11, source_type=$12, date_of_death=$13, province =$14, town = $15, location_type = $16  WHERE homicide_id = $5",
        [victim_name, newspaper_article, date, location, id, news_report_id, news_report_url, news_report_headline, author, wire_service, language, source_type ,date_of_death, province, town, location_type]
      );
      res.json("Homicide entry was updated!");
    } catch (err) {
      console.error(err.message);
    }
  });
  
  // This delete route deletes a homicide entry
  app.delete("/homicides/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleteHomicide = await pool.query(
        "DELETE FROM homicide WHERE homicide_id = $1",
        [id]
      );
      res.json("Homicide entry was deleted!");
    } catch (err) {
      console.error(err.message);
    }
  });
  



app.listen(5000, () => {
    console.log("server has started on port 5000");
})