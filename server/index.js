const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");

app.use(cors());
app.use(express.json());

// Routes

// Add this route to your backend
app.get('/ageDistribution', async (req, res) => {
  try {
    const ageDistribution = await pool.query('SELECT age_of_victim, COUNT(*) FROM victim GROUP BY age_of_victim');
    
    const labels = ageDistribution.rows.map(row => row.age_of_victim);
    const values = ageDistribution.rows.map(row => row.count);

    res.json({ labels, values });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// post request for adding a homicide entry
app.post("/homicides", async (req, res) => {
  try {
    const {
      news_report_id,
      news_report_url,
      news_report_headline,
      date_of_publication,
      author,
      wire_service,
      language,
      type_of_source,
      victim_name,
      date_of_death,
      place_of_death_province,
      place_of_death_town,
      type_of_location,
      sexual_assault,
      gender_of_victim,
      race_of_victim,
      age_of_victim,
      age_range_of_victim,
      mode_of_death_specific,
      mode_of_death_general,
      perpetrator_name,
      perpetrator_relationship_to_victim,
      suspect_identified,
      suspect_arrested,
      suspect_charged,
      conviction,
      sentence,
      type_of_murder
    } = req.body;

    // Insert into Articles table
    const articleResult = await pool.query(
      "INSERT INTO articles (news_report_id, news_report_url, news_report_headline, date_of_publication, author, wire_service, language, type_of_source) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING article_id",
      [news_report_id, news_report_url, news_report_headline, date_of_publication, author, wire_service, language, type_of_source]
    );

    const articleId = articleResult.rows[0].article_id;

    // Insert into Victims table
    await pool.query(
      "INSERT INTO victim (article_id, victim_name, date_of_death, place_of_death_province, place_of_death_town, type_of_location, sexual_assault, gender_of_victim, race_of_victim, age_of_victim, age_range_of_victim, mode_of_death_specific, mode_of_death_general) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)",
      [articleId, victim_name, date_of_death, place_of_death_province, place_of_death_town, type_of_location, sexual_assault, gender_of_victim, race_of_victim, age_of_victim, age_range_of_victim, mode_of_death_specific, mode_of_death_general]
    );

    // Insert into Perpetrators table
    await pool.query(
      "INSERT INTO perpetrator (article_id, perpetrator_name, perpetrator_relationship_to_victim, suspect_identified, suspect_arrested, suspect_charged, conviction, sentence, type_of_murder) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
      [articleId, perpetrator_name, perpetrator_relationship_to_victim, suspect_identified, suspect_arrested, suspect_charged, conviction, sentence, type_of_murder]
    );

    res.json("Homicide entry was added!");
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// this get request retrieves all homicide entries
app.get("/homicides", async (req, res) => {
  try {
    const allHomicides = await pool.query(`
      SELECT a.article_id, a.news_report_id, a.news_report_url, a.news_report_headline, a.date_of_publication,
             v.victim_name, v.date_of_death, v.place_of_death_province, v.place_of_death_town, 
             p.perpetrator_name, p.perpetrator_relationship_to_victim
      FROM articles a
      LEFT JOIN victim v ON a.article_id = v.article_id
      LEFT JOIN perpetrator p ON a.article_id = p.article_id
    `);

    res.json(allHomicides.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// This put request is for updating/editing a homicide entry
app.put("/homicides/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      news_report_id,
      news_report_url,
      news_report_headline,
      date_of_publication,
      author,
      wire_service,
      language,
      type_of_source,
      victim_name,
      date_of_death,
      place_of_death_province,
      place_of_death_town,
      type_of_location,
      sexual_assault,
      gender_of_victim,
      race_of_victim,
      age_of_victim,
      age_range_of_victim,
      mode_of_death_specific,
      mode_of_death_general,
      perpetrator_name,
      perpetrator_relationship_to_victim,
      suspect_identified,
      suspect_arrested,
      suspect_charged,
      conviction,
      sentence,
      type_of_murder
    } = req.body;

    // Update Articles table
    await pool.query(
      "UPDATE articles SET news_report_id = $1, news_report_url = $2, news_report_headline = $3, date_of_publication = $4, author = $5, wire_service = $6, language = $7, type_of_source = $8 WHERE article_id = $9",
      [news_report_id, news_report_url, news_report_headline, date_of_publication, author, wire_service, language, type_of_source, id]
    );

    // Update Victims table
    await pool.query(
      "UPDATE victim SET victim_name = $2, date_of_death = $3, place_of_death_province = $4, place_of_death_town = $5, type_of_location = $6, sexual_assault = $7, gender_of_victim = $8, race_of_victim = $9, age_of_victim = $10, age_range_of_victim = $11, mode_of_death_specific = $12, mode_of_death_general = $13 WHERE article_id = $1",
      [id, victim_name, date_of_death, place_of_death_province, place_of_death_town, type_of_location, sexual_assault, gender_of_victim, race_of_victim, age_of_victim, age_range_of_victim, mode_of_death_specific, mode_of_death_general]
    );

    // Update Perpetrators table
    await pool.query(
      "UPDATE perpetrator SET perpetrator_name = $2, perpetrator_relationship_to_victim = $3, suspect_identified = $4, suspect_arrested = $5, suspect_charged = $6, conviction = $7, sentence = $8, type_of_murder = $9 WHERE article_id = $1",
      [id, perpetrator_name, perpetrator_relationship_to_victim, suspect_identified, suspect_arrested, suspect_charged, conviction, sentence, type_of_murder]
    );

    res.json("Homicide entry was updated!");
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// This delete route deletes a homicide entry
app.delete("/homicides/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete from Articles table (cascading foreign key constraints will delete related records from Victims and Perpetrators tables)
    await pool.query(
      "DELETE FROM articles WHERE article_id = $1",
      [id]
    );

    res.json("Homicide entry was deleted!");
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(5000, () => {
  console.log("server has started on port 5000");
});
