CREATE TABLE homicide (
  homicide_id SERIAL PRIMARY KEY,
  victim_name VARCHAR(255),
  newspaper_article VARCHAR(255),
  date DATE,
  location VARCHAR(255)
);