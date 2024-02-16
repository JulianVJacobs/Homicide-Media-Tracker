CREATE USER postgres SUPERUSER;


-- Create the database
CREATE DATABASE homicide_main WITH OWNER postgres;

-- Connect to the newly created database
\c homicide_main;

-- Create Articles Table
CREATE TABLE Articles (
    article_id SERIAL PRIMARY KEY,
    news_report_id UUID,
    news_report_url VARCHAR(255),
    news_report_headline VARCHAR(255),
    news_report_platform VARCHAR(255),
    date_of_publication DATE,
    author VARCHAR(255),
    wire_service VARCHAR(255),
    language VARCHAR(255),
    type_of_source VARCHAR(255),
    duplicate_ignored BOOLEAN,
    notes VARCHAR(1000),
    merge_ids VARCHAR(255),
    hide_entry BOOLEAN
);

-- Create Victim Table
CREATE TABLE Victim (
    victim_id SERIAL PRIMARY KEY,
    article_id INT REFERENCES Articles(article_id) ON DELETE CASCADE,
    victim_name VARCHAR(255),
    date_of_death DATE,
    place_of_death_province VARCHAR(100),
    place_of_death_town VARCHAR(255),
    type_of_location VARCHAR(255),
    police_station VARCHAR(255),
    sexual_assault VARCHAR(255),
    gender_of_victim VARCHAR(255),
    race_of_victim VARCHAR(255),
    age_of_victim INT,
    age_range_of_victim VARCHAR(255),
    mode_of_death_specific VARCHAR(100),
    mode_of_death_general VARCHAR(100),
    type_of_murder VARCHAR(255)
);

-- Create Perpetrator Table
CREATE TABLE Perpetrator (
    perpetrator_id SERIAL PRIMARY KEY,
    article_id INT REFERENCES Articles(article_id) ON DELETE CASCADE,
    perpetrator_name VARCHAR(255),
    perpetrator_relationship_to_victim VARCHAR(255),
    suspect_identified VARCHAR(255),
    suspect_arrested VARCHAR(255),
    suspect_charged VARCHAR(255),
    conviction VARCHAR(255),
    sentence VARCHAR(255)
);

-- Create ArticleVictim Linking Table
CREATE TABLE ArticleVictim (
    article_id INT REFERENCES Articles(article_id) ON DELETE CASCADE,
    victim_id INT REFERENCES Victim(victim_id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, victim_id)
);

-- Create ArticlePerpetrator Linking Table
CREATE TABLE ArticlePerpetrator (
    article_id INT REFERENCES Articles(article_id) ON DELETE CASCADE,
    perpetrator_id INT REFERENCES Perpetrator(perpetrator_id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, perpetrator_id)
);
