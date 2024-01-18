CREATE TABLE homicide (
  homicide_id SERIAL PRIMARY KEY,
  victim_name VARCHAR(255),
  newspaper_article VARCHAR(255),
  date DATE,
  location VARCHAR(255)
);


SELECT incident_notes, data_type
FROM information_schema.columns
WHERE table_name = 'homicide' AND column_name = 'incident_notes';


ALTER TABLE homicide
ALTER COLUMN incident_notes TYPE VARCHAR(255);