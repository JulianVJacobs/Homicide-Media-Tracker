const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
const router = express.Router();
const fastcsv = require("fast-csv");
const fs = require("fs");
const xlsx = require("xlsx");
const exceljs = require("exceljs");
const axios = require("axios");
app.use(cors());
app.use(express.json());

app.get("/exportxlsx", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        a.article_id,
        a.news_report_id,
        a.news_report_url,
        a.news_report_headline,
        a.date_of_publication,
        a.author,
        a.wire_service,
        a.language,
        a.type_of_source,
        a.news_report_platform,
        v.victim_name,
        v.date_of_death,
        v.place_of_death_province,
        v.place_of_death_town,
        v.type_of_location,
        v.sexual_assault,
        v.gender_of_victim,
        v.race_of_victim,
        v.age_of_victim,
        v.age_range_of_victim,
        v.mode_of_death_specific,
        v.mode_of_death_general,
        v.type_of_murder,
        p.perpetrator_name,
        p.perpetrator_relationship_to_victim,
        p.suspect_identified,
        p.suspect_arrested,
        p.suspect_charged,
        p.conviction,
        p.sentence,
        a.notes
        
      FROM articles a
      LEFT JOIN victim v ON a.article_id = v.article_id
      LEFT JOIN perpetrator p ON a.article_id = p.article_id
    `);

    const jsonData = JSON.parse(JSON.stringify(result.rows));

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet("Data");

    // Add headers to the worksheet
    const headers = Object.keys(jsonData[0]);
    worksheet.addRow(headers);

    // Add data rows to the worksheet
    jsonData.forEach((row) => {
      const values = headers.map((header) => row[header]);
      worksheet.addRow(values);
    });

    // Save the workbook to a buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Send the buffer as a response
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=exported_data.xlsx"
    );
    res.send(buffer);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//this is for checking wayback archival status:
app.post("/checkArchivalStatus", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    // Make a request to the Wayback CDX Server API
    const response = await axios.get(
      `http://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(
        url
      )}&output=json`
    );

    // Parse the JSON response
    const data = response.data;

    // Check if there are captures for the URL
    const isArchived = Array.isArray(data) && data.length > 1;

    // You can update your database here if needed

    // Return the archival status
    res.json({ url, isArchived });
  } catch (error) {
    console.error(
      `Error checking archival status for ${url}: ${error.message}`
    );
    res.status(500).json({ error: "Internal server error" });
  }
});

// Existing imports...
app.get("/exportcsv", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        a.article_id,
        a.news_report_id,
        a.news_report_url,
        a.news_report_headline,
        a.date_of_publication,
        a.author,
        a.wire_service,
        a.language,
        a.type_of_source,
        a.news_report_platform,
        v.victim_name,
        v.date_of_death,
        v.place_of_death_province,
        v.place_of_death_town,
        v.type_of_location,
        v.sexual_assault,
        v.gender_of_victim,
        v.race_of_victim,
        v.age_of_victim,
        v.age_range_of_victim,
        v.mode_of_death_specific,
        v.mode_of_death_general,
        v.type_of_murder,
        p.perpetrator_name,
        p.perpetrator_relationship_to_victim,
        p.suspect_identified,
        p.suspect_arrested,
        p.suspect_charged,
        p.conviction,
        p.sentence
       
      FROM articles a
      LEFT JOIN victim v ON a.article_id = v.article_id
      LEFT JOIN perpetrator p ON a.article_id = p.article_id
    `);

    const jsonData = JSON.parse(JSON.stringify(result.rows));
    const ws = fs.createWriteStream("exported_data.csv");

    fastcsv
      .writeToStream(ws, jsonData, { headers: true })
      .on("finish", function () {
        console.log("Write to exported_data.csv successfully!");
        res.download("exported_data.csv", "exported_data.csv", (err) => {
          if (err) {
            console.error(err.message);
            res.status(500).json({ error: "Internal Server Error" });
          } else {
            // Clean up the exported file after download
            fs.unlinkSync("exported_data.csv");
          }
        });
      });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/ageDistribution", async (req, res) => {
  try {
    const ageDistribution = await pool.query(
      "SELECT age_of_victim, COUNT(*) FROM victim GROUP BY age_of_victim"
    );

    const labels = ageDistribution.rows.map((row) => row.age_of_victim);
    const values = ageDistribution.rows.map((row) => row.count);

    res.json({ labels, values });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/homicidesBulk", async (req, res) => {
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
      news_report_platform,
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
      type_of_murder,
      perpetrator_name,
      perpetrator_relationship_to_victim,
      suspect_identified,
      suspect_arrested,
      suspect_charged,
      conviction,
      sentence,
    } = req.body;

    console.log("Data received from frontend:", req.body);

    // Insert into Articles table
    const articleResult = await pool.query(
      "INSERT INTO articles (news_report_id, news_report_url, news_report_headline, date_of_publication, author, wire_service, language, type_of_source, news_report_platform) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING article_id",
      [
        news_report_id,
        news_report_url,
        news_report_headline.trim(),
        date_of_publication,
        author.trim(),
        wire_service,
        language,
        type_of_source,
        news_report_platform,
      ]
    );

    const articleId = articleResult.rows[0].article_id;

    // Insert into Victims table
    const victimResult = await pool.query(
      "INSERT INTO victim (article_id, victim_name, date_of_death, place_of_death_province, place_of_death_town, type_of_location, sexual_assault, gender_of_victim, race_of_victim, age_of_victim, age_range_of_victim, mode_of_death_specific, mode_of_death_general,  type_of_murder) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING victim_id",
      [
        articleId,
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
        type_of_murder,
      ]
    );

    const victimId = victimResult.rows[0].victim_id;

    // Insert into ArticleVictim linking table
    await pool.query(
      "INSERT INTO ArticleVictim (article_id, victim_id) VALUES ($1, $2)",
      [articleId, victimId]
    );

    // Insert into Perpetrators table
    const perpetratorResult = await pool.query(
      "INSERT INTO perpetrator (article_id, perpetrator_name, perpetrator_relationship_to_victim, suspect_identified, suspect_arrested, suspect_charged, conviction, sentence) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING perpetrator_id",
      [
        articleId,
        perpetrator_name,
        perpetrator_relationship_to_victim,
        suspect_identified,
        suspect_arrested,
        suspect_charged,
        conviction,
        sentence,
      ]
    );

    const perpetratorId = perpetratorResult.rows[0].perpetrator_id;

    // Insert into ArticlePerpetrator linking table
    await pool.query(
      "INSERT INTO ArticlePerpetrator (article_id, perpetrator_id) VALUES ($1, $2)",
      [articleId, perpetratorId]
    );

    res.json("Homicide entry was added!");
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
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
      news_report_platform,
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
      type_of_murder,
      perpetrator_name,
      perpetrator_relationship_to_victim,
      suspect_identified,
      suspect_arrested,
      suspect_charged,
      conviction,
      sentence,
    } = req.body;
    console.log("Data received from frontend:", req.body);
    // Insert into Articles table
    const articleResult = await pool.query(
      "INSERT INTO articles (news_report_id, news_report_url, news_report_headline, date_of_publication, author, wire_service, language, type_of_source,news_report_platform ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING article_id",
      [
        news_report_id,
        news_report_url,
        news_report_headline,
        date_of_publication,
        author,
        wire_service,
        language,
        type_of_source,
        news_report_platform,
      ]
    );

    const articleId = articleResult.rows[0].article_id;

    // Insert into Victims table
    const victimNames = victim_name
      ? victim_name.split(",").map((name) => name.trim())
      : [];
    const datesOfDeath = date_of_death ? date_of_death.split(",") : [];
    const provinces = place_of_death_province
      ? place_of_death_province.split(",")
      : [];
    const town = place_of_death_town ? place_of_death_town.split(",") : [];
    const locationType = type_of_location ? type_of_location.split(",") : [];
    const sexualAssault = sexual_assault ? sexual_assault.split(",") : [];
    const genderOfVictim = gender_of_victim ? gender_of_victim.split(",") : [];
    const race = race_of_victim ? race_of_victim.split(",") : [];
    const ageOfVictim = age_of_victim ? age_of_victim.split(",") : [];
    const ageRangeOfVictim = age_range_of_victim
      ? age_range_of_victim.split(",")
      : [];
    const modeOfDeathSpecific = mode_of_death_specific
      ? mode_of_death_specific.split(",")
      : [];
    const modeOfDeathGeneral = mode_of_death_general
      ? mode_of_death_general.split(",")
      : [];
    const TypeOfMurder = type_of_murder ? type_of_murder.split(",") : [];

    // ... split other fields as needed

    //insert into perp table
    const PerpetratorNames = perpetrator_name
      ? perpetrator_name.split(",").map((name) => name.trim())
      : [];
    const PerpetratorRelatioshipsToVictims = perpetrator_relationship_to_victim
      ? perpetrator_relationship_to_victim.split(",")
      : [];
    const SuspectsIdentified = suspect_identified
      ? suspect_identified.split(",")
      : [];
    const SuspectsArrested = suspect_arrested
      ? suspect_arrested.split(",")
      : [];
    const SuspectsCharged = suspect_charged ? suspect_charged.split(",") : [];
    const Convictions = conviction ? conviction.split(",") : [];
    const Sentences = sentence ? sentence.split(",") : [];

    for (let i = 0; i < victimNames.length; i++) {
      const victimResult = await pool.query(
        "INSERT INTO victim (article_id, victim_name, date_of_death, place_of_death_province,place_of_death_town, type_of_location, sexual_assault, gender_of_victim, race_of_victim, age_of_victim, age_range_of_victim, mode_of_death_specific, mode_of_death_general, type_of_murder) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING victim_id",
        [
          articleId,
          victimNames[i],
          datesOfDeath[i],
          provinces[i],
          town[i],
          locationType[i],
          sexualAssault[i],
          genderOfVictim[i],
          race[i],
          ageOfVictim[i],
          ageRangeOfVictim[i],
          modeOfDeathSpecific[i],
          modeOfDeathGeneral[i],
          TypeOfMurder[i],
        ]
      );

      const victimId = victimResult.rows[0].victim_id;

      // Insert into ArticleVictim linking table
      await pool.query(
        "INSERT INTO ArticleVictim (article_id, victim_id) VALUES ($1, $2)",
        [articleId, victimId]
      );
    }
    // Insert into Perpetrators table
    for (let j = 0; j < PerpetratorNames.length; j++) {
      const perpetratorResult = await pool.query(
        "INSERT INTO perpetrator (article_id, perpetrator_name, perpetrator_relationship_to_victim, suspect_identified, suspect_arrested, suspect_charged, conviction, sentence) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING perpetrator_id",
        [
          articleId,
          PerpetratorNames[j],
          PerpetratorRelatioshipsToVictims[j],
          SuspectsIdentified[j],
          SuspectsArrested[j],
          SuspectsCharged[j],
          Convictions[j],
          Sentences[j],
        ]
      );

      const perpetratorId = perpetratorResult.rows[0].perpetrator_id;

      // Insert into ArticlePerpetrator linking table
      await pool.query(
        "INSERT INTO ArticlePerpetrator (article_id, perpetrator_id) VALUES ($1, $2)",
        [articleId, perpetratorId]
      );
    }

    res.json("Homicide entry was added!");
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// This get request retrieves all homicide entries with all specified fields
app.get("/homicides", async (req, res) => {
  try {
    const allHomicides = await pool.query(`
      SELECT
        a.article_id,
        a.news_report_id,
        a.news_report_url,
        a.news_report_headline,
        a.date_of_publication,
        a.author,
        a.wire_service,
        a.language,
        a.type_of_source,
        a.news_report_platform,
        v.victim_name,
        v.date_of_death,
        v.place_of_death_province,
        v.place_of_death_town,
        v.type_of_location,
        v.sexual_assault,
        v.gender_of_victim,
        v.race_of_victim,
        v.age_of_victim,
        v.age_range_of_victim,
        v.mode_of_death_specific,
        v.mode_of_death_general,
        v.type_of_murder,
        p.perpetrator_name,
        p.perpetrator_relationship_to_victim,
        p.suspect_identified,
        p.suspect_arrested,
        p.suspect_charged,
        p.conviction,
        p.sentence
        
      FROM articles a
      LEFT JOIN victim v ON a.article_id = v.article_id
      LEFT JOIN perpetrator p ON a.article_id = p.article_id
    `);

    res.json(allHomicides.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// This get request is for user search parameters!
app.get("/search", async (req, res) => {
  try {
    const {
      dateOfPublication,
      place_of_death_province,
      newsReportPlatform,
      victim_name,
      perpetrator_name,
    } = req.query;

    // Build the query based on the provided parameters
    const query = `
    SELECT
    a.article_id,
    a.news_report_id,
    a.news_report_url,
    a.news_report_headline,
    a.date_of_publication,
    a.author,
    a.wire_service,
    a.language,
    a.type_of_source,
    a.news_report_platform,
    v.victim_name,
    v.date_of_death,
    v.place_of_death_province,
    v.place_of_death_town,
    v.type_of_location,
    v.sexual_assault,
    v.gender_of_victim,
    v.race_of_victim,
    v.age_of_victim,
    v.age_range_of_victim,
    v.mode_of_death_specific,
    v.mode_of_death_general,
    v.type_of_murder,
    p.perpetrator_name,
    p.perpetrator_relationship_to_victim,
    p.suspect_identified,
    p.suspect_arrested,
    p.suspect_charged,
    p.conviction,
    p.sentence
    
FROM articles a
LEFT JOIN victim v ON a.article_id = v.article_id
LEFT JOIN perpetrator p ON a.article_id = p.article_id
WHERE
    ($1::date IS NULL OR a.date_of_publication = $1::date)
    AND ($2::text IS NULL OR (
        LOWER(split_part(v.victim_name, ' ', 1)) LIKE LOWER($2::text)
        OR LOWER(split_part(v.victim_name, ' ', 2)) LIKE LOWER($2::text)
        OR LOWER(v.victim_name) LIKE LOWER($2::text)
    ))
    AND ($3::text IS NULL OR a.news_report_platform ILIKE $3::text)
    AND ($4::text IS NULL OR (
        LOWER(split_part(v.victim_name, ' ', 1)) LIKE LOWER($4::text)
        OR LOWER(split_part(v.victim_name, ' ', 2)) LIKE LOWER($4::text)
        OR LOWER(v.victim_name) LIKE LOWER($4::text)
    ))
    AND ($5::text IS NULL OR p.perpetrator_name ILIKE $5::text)

    `;

    const result = await pool.query(query, [
      dateOfPublication || null,
      place_of_death_province || null,
      newsReportPlatform || null,
      victim_name || null,
      perpetrator_name || null,
    ]);

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//This get request retrieves data based off news report id
app.get("/homicides/:news_report_id", async (req, res) => {
  const { news_report_id } = req.params;

  try {
    const homicideDetails = await pool.query(
      `
      SELECT
        a.article_id,
        a.news_report_id,
        a.news_report_url,
        a.news_report_headline,
        a.date_of_publication,
        a.author,
        a.wire_service,
        a.language,
        a.type_of_source,
        a.news_report_platform,
        v.victim_name,
        v.date_of_death,
        v.place_of_death_province,
        v.place_of_death_town,
        v.type_of_location,
        v.sexual_assault,
        v.gender_of_victim,
        v.race_of_victim,
        v.age_of_victim,
        v.age_range_of_victim,
        v.mode_of_death_specific,
        v.mode_of_death_general,
        v.type_of_murder,
        p.perpetrator_name,
        p.perpetrator_relationship_to_victim,
        p.suspect_identified,
        p.suspect_arrested,
        p.suspect_charged,
        p.conviction,
        p.sentence
      FROM articles a
      LEFT JOIN victim v ON a.article_id = v.article_id
      LEFT JOIN perpetrator p ON a.article_id = p.article_id
      WHERE a.news_report_id = $1
    `,
      [news_report_id]
    );

    res.json(homicideDetails.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/homicides/:article_id", async (req, res) => {
  const { article_id } = req.params;
  const { news_report_url, news_report_headline, ...updatedFields } = req.body;

  try {
    // Get the existing homicide data
    const existingHomicide = await pool.query(
      `SELECT * FROM articles WHERE article_id = $1`,
      [article_id]
    );

    if (existingHomicide.rows.length === 0) {
      return res.status(404).json({ error: "Homicide not found" });
    }

    const currentFields = existingHomicide.rows[0];

    // Create an object to store updated values
    const updatedValues = {};

    // Compare updated fields with current fields and update if changed
    for (const key in currentFields) {
      if (
        updatedFields[key] !== undefined &&
        updatedFields[key] !== currentFields[key]
      ) {
        updatedValues[key] = updatedFields[key];
      } else {
        updatedValues[key] = currentFields[key];
      }
    }

    // Create the SET clause for the SQL query
    const setClause = Object.entries(updatedValues)
      .map(([key, value], index) => `${key} = $${index + 1}`)
      .join(", ");

    // Explicitly set the fields in the update query
    const updateQuery = `
      UPDATE articles
      SET ${setClause}
      WHERE article_id = $${Object.keys(updatedValues).length + 1}
      RETURNING *
    `;

    const values = [...Object.values(updatedValues), article_id];

    const updatedHomicide = await pool.query(updateQuery, values);

    res.json(updatedHomicide.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// This delete route deletes a homicide entry
app.delete("/homicides/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    // Use a transaction to ensure atomicity
    await client.query("BEGIN");

    // Delete from ArticleVictim linking table
    await client.query("DELETE FROM ArticleVictim WHERE article_id = $1", [id]);

    // Delete from ArticlePerpetrator linking table
    await client.query("DELETE FROM ArticlePerpetrator WHERE article_id = $1", [
      id,
    ]);

    // Delete from Victims table
    await client.query("DELETE FROM victim WHERE article_id = $1", [id]);

    // Delete from Articles table
    await client.query("DELETE FROM articles WHERE article_id = $1", [id]);

    // Commit the transaction
    await client.query("COMMIT");

    res.json("Homicide entry was deleted!");
  } catch (err) {
    // Rollback the transaction in case of an error
    await client.query("ROLLBACK");
    console.error(err.message);
    console.error(err.message, err.stack);

    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    // Release the client back to the pool
    client.release();
  }
});

//this endpoint searchers for duplicate data:

app.get("/checkForDuplicates", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
      a.article_id,
        a.news_report_id,
        a.news_report_url,
        a.notes,
        a.news_report_headline,
        a.date_of_publication,
        a.author,
        a.wire_service,
        a.language,
        a.type_of_source,
        a.news_report_platform,
        v.victim_name,
        v.date_of_death,
        v.place_of_death_province,
        v.place_of_death_town,
        v.type_of_location,
        v.sexual_assault,
        v.gender_of_victim,
        v.race_of_victim,
        v.age_of_victim,
        v.age_range_of_victim,
        v.mode_of_death_specific,
        v.mode_of_death_general,
        v.type_of_murder,
        p.perpetrator_name,
        p.perpetrator_relationship_to_victim,
        p.suspect_identified,
        p.suspect_arrested,
        p.suspect_charged,
        p.conviction,
        p.sentence
      FROM articles a
      LEFT JOIN victim v ON a.article_id = v.article_id
      LEFT JOIN perpetrator p ON a.article_id = p.article_id
      WHERE a.news_report_id IN (
        SELECT news_report_id
        FROM (
          SELECT
            a.news_report_id,
            COUNT(*) OVER (PARTITION BY a.date_of_publication, a.author, a.news_report_headline) AS duplicate_count
          FROM articles a
          LEFT JOIN victim v ON a.article_id = v.article_id
          LEFT JOIN perpetrator p ON a.article_id = p.article_id
          WHERE a.duplicate_ignored IS NULL OR a.duplicate_ignored = 'No'
        ) subquery
        WHERE duplicate_count > 1
      )
    `);

    const duplicateData = result.rows;

    res.json({ duplicateData });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//this endpoint marks duplicates to be ignored
// Express route to update duplicate_ignored field
app.put("/ignoreDuplicate/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      UPDATE articles
      SET duplicate_ignored = 'Yes'
      WHERE news_report_id = $1
    `;
    await pool.query(query, [id]);
    res.json({ message: "Duplicate ignored successfully." });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//this endpoint adds notes to duplicate entries:
app.put("/api/addNote/:articleId", async (req, res) => {
  try {
    const { articleId } = req.params;
    const { notes } = req.body;

    const query = "UPDATE articles SET notes = $1 WHERE article_id = $2";
    const values = [notes, articleId];

    await pool.query(query, values);

    res.status(200).json({ success: true, message: "Note added successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.listen(5000, () => {
  console.log("server has started on port 5000");
});
