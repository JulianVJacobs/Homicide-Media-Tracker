import streamlit as st
import psycopg2
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy import text
import plotly.express as px
import json
import io
from io import StringIO
import numpy as np
from calendar import month_abbr

# Load GeoJSON data
with open("za.json") as f:
    geojson_data = json.load(f)


# Provinces and towns mapping
provinces = {
    'Western Cape': ['Cape Town', 'Stellenbosch', 'George', 'Beauford West', 'Mossel Bay', 'Worcester', 'Knysna', 'Swellendam', 'Ladismith', 'Laingsburg'],
    'Eastern Cape': ['Port Elizabeth', 'East London', 'Grahamstown', 'Komani', 'KwaMaqoma', 'Tarkhastad', 'Tlokoeng', 'Qonce'],
    'Gauteng': ['Johannesburg', 'Pretoria', 'Soweto', 'Refilwe', 'Roodepoort', 'Vanderbijlpark', 'Krugersdorp', 'Alberton', 'Thembisa', 'Benoni'],
    'Northern Cape' : ['Kimberley', 'Britstown', 'Hopetown', 'Garies', 'De Aar', 'Prieska', 'Pofadder', 'Victoria West', 'Nababeep'],
    'Free State' : ['Bethlehem', 'Heilbron', 'Reitz', 'Senekal', 'Frankfort', 'Vrede', 'Excelsior', 'Frankfort', 'Cornelia', 'Warden'],
    'Mpumalanga': ['Ermalo', 'Komatipoort', 'eNtokozweni', 'eMakhazeni', 'eMalahleni', 'Emgwenya', 'Sabie', 'Mbombela', 'Pilgrims Rest'],
    'KwaZulu-Natal' : ['Durban', 'Ixopo', 'Ubombo', 'KwaDukuza', 'Richmond', 'Bulwer', 'Wartburg', 'Newcastle', 'Umzimkulu'],
    'Limpopo' : ['Polokwane', 'Bela-Bela', 'Phalaborwa', 'Haenertsberg', 'Lephalale', 'Mokopane', 'Louis Trichardt', 'Tzaneen', 'Hoedspruit' ],
    'North West' : ['Mahikeng', 'Chirstiana', 'Rustenburg', 'Schweizer-Reneke', 'Ganyesa', 'Koster', 'Delareyville', 'Bloemhof', 'Brits']
    # Add more provinces and towns here
}

race_options = ['African', 'White', 'Coloured', 'Indian', 'Asian', 'Other']
relationship_options = ['Family', 'Friend', 'Acquaintance', 'Stranger', 'Other']
bool_options = ['Y', 'N', 'U']

# Database connection
def get_db_connection():
    conn = psycopg2.connect(
        host="localhost", port="5432", database="homicide_main",
        user="postgres", password="Khiz1234"
    )
    return conn

engine = create_engine("postgresql://postgres:Khiz1234@localhost:5432/homicide_main")


def highlighted_title(text):
    st.markdown(f"<h1 style='background-color: green; text-decoration: underline;'>{text}</h1>", unsafe_allow_html=True)


# Fetch data from the PostgreSQL database
def fetch_data(query):
    with get_db_connection() as conn:
        return pd.read_sql_query(query, conn)

#Display the whole table
def display_whole_table():
    display_query = "SELECT * FROM homicide_news"
    data = fetch_data(display_query)
    st.dataframe(data, height=600, width=1500)  # Adjust height and width here

# Display the table
def display_table(selected_columns):
    if not selected_columns:
        st.write("No columns selected. Please select at least one column.")
        return

    try:
        # Connect to the PostgreSQL database
        with psycopg2.connect(
            host="localhost", port="5432", database="homicide_main",
            user="postgres", password="Khiz1234"
        ) as conn:
            query = f"SELECT {', '.join(selected_columns)} FROM homicide_news"
            st.write(f"Executing query: {query}")  # Debugging output

            # Fetch data into a pandas DataFrame
            df = pd.read_sql_query(query, conn)

        # Check if the DataFrame is empty
        if df.empty:
            st.write("No data found for the selected columns.")
        else:
            st.write(f"Dataframe shape: {df.shape}")
            st.dataframe(df)  # Display DataFrame in Streamlit
            #API_response_size(query)

    except Exception as e:
        st.error(f"Error in display_selected_columns: {str(e)}")

    
#Insert functionality
def insert_data(report_url, news_publisher, date_of_publication, wire_service, author_name, news_headline, 
                victim_name, age, date_of_death, mode_of_death, race, location_type, province, town, 
                suspect_name, no_of_suspects, suspect_arrested, suspect_convicted, relationship, sexual_assault,
                robbery, multiple_murder, extreme_violence, intimate_femicide, notes):
    
    insert_query = text('''INSERT INTO homicide_news 
            (news_report_url, news_report_platform, date_of_publication, author, news_report_headline, no_of_subs, 
            wire_service, victim_name, date_of_death, age_of_victim, race_of_victim, type_of_location, 
            place_of_death_town, place_of_death_province, sexual_assault, mode_of_death_specific, robbery_y_n_u, 
            suspect_arrested, suspect_convicted, perpetrator_name, perpetrator_relationship_to_victim, 
            multiple_murder, extreme_violence_y_n_m_u, intimate_femicide_y_n_u, notes)
            VALUES (:report_url, :news_publisher, :date_of_publication, :author_name, :news_headline, :no_of_suspects, 
            :wire_service, :victim_name, :date_of_death, :age, :race, :location_type, :town, :province, 
            :sexual_assault, :mode_of_death, :robbery, :suspect_arrested, :suspect_convicted, 
            :suspect_name, :relationship, :multiple_murder, :extreme_violence, :intimate_femicide, :notes)''')

    values = {
        'report_url': report_url, 'news_publisher': news_publisher, 'date_of_publication': date_of_publication, 
        'author_name': author_name, 'news_headline': news_headline, 'no_of_suspects': no_of_suspects, 
        'wire_service': wire_service, 'victim_name': victim_name, 'date_of_death': date_of_death, 
        'age': age, 'race': race, 'location_type': location_type, 'town': town, 'province': province, 
        'sexual_assault': sexual_assault, 'mode_of_death': mode_of_death, 'robbery': robbery, 
        'suspect_arrested': suspect_arrested, 'suspect_convicted': suspect_convicted, 
        'suspect_name': suspect_name, 'relationship': relationship, 'multiple_murder': multiple_murder, 
        'extreme_violence': extreme_violence, 'intimate_femicide': intimate_femicide, 'notes': notes
    }

    
    # Debug: Print the values
    st.write("Values: ", values)
    
    with engine.connect() as connection:
        connection.execute(insert_query, values)
        connection.commit()
        connection.close()


#Delete functionality
# Function to create the delete table if it doesn't exist
def create_delete_table():
    create_table_query = '''
        CREATE TABLE IF NOT EXISTS delete (
            article_id SERIAL PRIMARY KEY,
            news_report_url TEXT,
            news_report_platform TEXT,
            date_of_publication DATE,
            author TEXT,
            news_report_headline TEXT,
            no_of_subs INT,
            wire_service TEXT,
            victim_name TEXT,
            date_of_death DATE,
            age_of_victim INT,
            race_of_victim TEXT,
            type_of_location TEXT,
            place_of_death_town TEXT,
            place_of_death_province TEXT,
            sexual_assault BOOLEAN,
            mode_of_death_specific TEXT,
            robbery_y_n_u BOOLEAN,
            suspect_arrested BOOLEAN,
            suspect_convicted BOOLEAN,
            perpetrator_name TEXT,
            perpetrator_relationship_to_victim TEXT,
            multiple_murder BOOLEAN,
            extreme_violence_y_n_m_u BOOLEAN,
            intimate_femicide_y_n_u BOOLEAN,
            notes TEXT,
            deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    '''
    
    with engine.connect() as connection:
        connection.execute(text(create_table_query))
        print("Delete table checked/created.")
        connection.commit()

# Function to delete a record and insert it into the delete table
def delete_data(record_id):
    # Step 1: Ensure the delete table exists
    create_delete_table()

    # Step 2: Fetch the record from `homicide_news` before deletion
    select_query = text("SELECT * FROM homicide_news WHERE article_id = :record_id")
    delete_query = text("DELETE FROM homicide_news WHERE article_id = :record_id")

    # Step 3: Insert the record into the `delete` table before actual deletion
    insert_query = text('''
        INSERT INTO delete
        (article_id, news_report_url, news_report_platform, date_of_publication, author, news_report_headline, no_of_subs, wire_service,
         victim_name, date_of_death, age_of_victim, race_of_victim, type_of_location, place_of_death_town, place_of_death_province, 
         sexual_assault, mode_of_death_specific, robbery_y_n_u, suspect_arrested, suspect_convicted, perpetrator_name, 
         perpetrator_relationship_to_victim, multiple_murder, extreme_violence_y_n_m_u, intimate_femicide_y_n_u, notes)
        VALUES 
        (:article_id, :news_report_url, :news_report_platform, :date_of_publication, :author, :news_report_headline, :no_of_subs, :wire_service,
         :victim_name, :date_of_death, :age_of_victim, :race_of_victim, :type_of_location, :place_of_death_town, :place_of_death_province, 
         :sexual_assault, :mode_of_death_specific, :robbery_y_n_u, :suspect_arrested, :suspect_convicted, :perpetrator_name, 
         :perpetrator_relationship_to_victim, :multiple_murder, :extreme_violence_y_n_m_u, :intimate_femicide_y_n_u, :notes)
    ''')
    
    with engine.connect() as connection:
        # Fetch the record that will be deleted
        result = connection.execute(select_query, {"record_id": record_id}).fetchone()

        if result is not None:
                    # Convert the fetched result to a dictionary for easy parameter binding
                    record = dict(result._mapping)
                    
                    # Insert the record into the delete table
                    connection.execute(insert_query, record)
                    connection.commit()
                    
                    # Now delete the record from the homicide_news table
                    connection.execute(delete_query, {"record_id": record_id})
                    connection.commit()

                    return f"Record {record_id} deleted and stored in the delete table."
        else:
                    return f"Record {record_id} not found."
                
def display_delete():
    delete_table_query = "SELECT * FROM delete"
    data = fetch_data(delete_table_query)
    st.dataframe(data, height=600, width=1500)  # Adjust height and width here

    
#Duplicates - Here we will show the duplicates, delete them and store them in another table called duplicates 
def check_duplicates(columns):
    if not columns:
        st.write("Please enter one or more columns to check for duplicates.")
        return

    column_list = [col.strip() for col in columns.split(',')]

    try:
        # Connect to the PostgreSQL database
        with psycopg2.connect(
            host="localhost", port="5432", database="homicide_main",
            user="postgres", password="Khiz1234"
        ) as conn:
            query = f"""
                SELECT {', '.join(column_list)}, COUNT(*) 
                FROM homicide_news 
                GROUP BY {', '.join(column_list)}
                HAVING COUNT(*) > 1
            """
            # Fetch data into a pandas DataFrame
            df = pd.read_sql(query, conn)

        # Check if the DataFrame is empty
        if df.empty:
            st.write("No duplicate records found based on the selected columns.")
        else:
            st.write(f"Found duplicate records based on columns: {', '.join(column_list)}")
            st.dataframe(df)  # Display DataFrame in Streamlit

    except Exception as e:
        st.error(f"Error checking duplicates: {str(e)}")
        
# Function to delete duplicates based on a specific column
def delete_duplicates(column_name, columns_to_display):
    if not column_name:
        st.write("Please enter a column name.")
        return

    try:
        with psycopg2.connect(
            host="localhost", port="5432", database="homicide_main",
            user="postgres", password="Khiz1234"
        ) as conn:
            with conn.cursor() as cursor:
                # Check if the column exists
                cursor.execute(f"""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name='homicide_news' AND column_name='{column_name}'
                """)
                if not cursor.fetchone():
                    st.write(f"Column '{column_name}' not found.")
                    return

                # Create duplicates table if it doesn't exist
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS duplicates (
                        LIKE homicide_news INCLUDING ALL
                    )
                """)

                # Insert duplicates into the duplicates table, ignoring conflicts
                cursor.execute(f"""
                    INSERT INTO duplicates
                    SELECT * FROM homicide_news
                    WHERE {column_name} IN (
                        SELECT {column_name}
                        FROM homicide_news
                        GROUP BY {column_name}
                        HAVING COUNT(*) > 1
                    )
                    ON CONFLICT (article_id) DO NOTHING
                """)

                # Count the number of duplicates
                cursor.execute(f"""
                    SELECT COUNT(*) FROM (
                        SELECT {column_name}
                        FROM homicide_news
                        GROUP BY {column_name}
                        HAVING COUNT(*) > 1
                    ) as subquery
                """)
                duplicate_count = cursor.fetchone()[0]

                # Delete duplicates from the main table
                cursor.execute(f"""
                    DELETE FROM homicide_news
                    WHERE ctid NOT IN (
                        SELECT MIN(ctid)
                        FROM homicide_news
                        GROUP BY {column_name}
                    )
                """)

                # Fetch the cleaned data
                cursor.execute(f"SELECT {', '.join(columns_to_display)} FROM homicide_news")
                cleaned_data = cursor.fetchall()

                # Commit the transaction
                conn.commit()

            # Create DataFrame from cleaned data
            df_cleaned = pd.DataFrame(cleaned_data, columns=columns_to_display)

            # Display result in Streamlit
            st.write(f"{duplicate_count} duplicate groups found and removed.")
            st.dataframe(df_cleaned)

    except Exception as e:
        st.error(f"An error occurred: {str(e)}")  # Display the error in Streamlit

def display_duplicates():
    duplicates_table_query = "SELECT * FROM duplicates"
    data = fetch_data(duplicates_table_query)
    st.dataframe(data, height=600, width=1500) 

# Visualize data
def visualize_data():

# Define the dropdowns for plot categories and plot types
    category_value = st.selectbox(
        'Select Plot Category',
        ['homicides_over_time', 'geographical_distribution', 'demographic_insights', 
        'victim_perpetrator_relationship', 'multivariate_comparisons']
    )
    return category_value


# Function to update plot type options based on selected category
def update_plot_type_dropdown(category_value):
    if category_value == 'homicides_over_time':
        plot_type_value = st.selectbox('Select Plot Type', ['Line Plot', 'Bar Chart'])
    elif category_value == 'geographical_distribution':
        plot_type_value = st.selectbox('Select Plot Type', ['Choropleth Map', 'Heat Map'])
    elif category_value == 'demographic_insights':
        plot_type_value = st.selectbox('Select Plot Type', ['Bar Chart (Race Breakdown)', 'Age Distribution Histogram', 'Gender Comparison Plot'])
    elif category_value == 'victim_perpetrator_relationship':
        plot_type_value = st.selectbox('Select Plot Type', ['Relationship Bar Chart', 'Heatmap'])
    elif category_value == 'multivariate_comparisons':
        plot_type_value = st.selectbox('Select Plot Type', ['Scatter Plot', 'Bubble Plot'])
    else:
        st.write("Please select a plot category and type")
    return plot_type_value

# Fetch data and render plot based on selections
def render_plot(category_value, plot_type_value):
    connect = get_db_connection()
    fig = None  # Initialize figure

    if category_value == 'homicides_over_time':
        query = """
            SELECT victim_name, date_of_death
            FROM homicide_news
            GROUP BY victim_name, date_of_death
        """
        df = pd.read_sql(query, connect)
        
        df['date_of_death'] = pd.to_datetime(df['date_of_death'])
        df['year_of_death'] = df['date_of_death'].dt.year
        data = df.groupby('year_of_death').size().reset_index(name='count')

        if plot_type_value == 'Line Plot':
            fig = px.line(data, x='year_of_death', y='count', title='Homicides Over Time')
        elif plot_type_value == 'Bar Chart':
            fig = px.bar(data, x='year_of_death', y='count', title='Homicides Over Time')

    elif category_value == 'geographical_distribution':
        query = """
            SELECT place_of_death_province, COUNT(DISTINCT victim_name || ' ' || date_of_death::text) as count 
            FROM homicide_news 
            GROUP BY place_of_death_province
        """
        df = pd.read_sql(query, connect)

        if plot_type_value == 'Choropleth Map':
            st.write("Creating choropleth map...")  # Debug message

            # Ensure df contains valid data
            if df.empty:
                st.write("Dataframe is empty!")
            else:
                st.write("Dataframe content:", df)

            fig = px.choropleth(
                df,
                geojson=geojson_data,
                locations='place_of_death_province',
                featureidkey="properties.name",
                color='count',
                title='Homicides by Province',
                color_continuous_scale="Viridis"  # Color scale
            )

            # Update the geos to focus on South Africa
            fig.update_geos(
                fitbounds="locations",
                visible=False,
                showcountries=True,
                countrycolor="Black",
                showsubunits=True,
                subunitcolor="Black",
                lataxis_range=[-35, -22],  # Latitude bounds for South Africa
                lonaxis_range=[16, 33]     # Longitude bounds for South Africa
            )
                    

    elif category_value == 'demographic_insights':
        if plot_type_value == 'Bar Chart (Race Breakdown)':
            query = """
                SELECT race_of_victim, COUNT(DISTINCT victim_name || ' ' || date_of_death::text) as count 
                FROM homicide_news 
                GROUP BY race_of_victim
            """
            df = pd.read_sql(query, connect)
            fig = px.bar(df, x='race_of_victim', y='count', title='Race Breakdown of Victims')

        elif plot_type_value == 'Age Distribution Histogram':
            query = """
                SELECT DISTINCT ON (victim_name, date_of_death) age_of_victim
                FROM homicide_news
                WHERE age_of_victim IS NOT NULL
            """
            df = pd.read_sql(query, connect)
            if not df.empty:
                fig = px.histogram(df, x='age_of_victim', nbins=20, title='Age Distribution of Homicide Victims')
            else:
                st.write("No valid age data available.")

        elif plot_type_value == 'Gender Comparison Plot':
            query = """
                SELECT perpetrator_gender, COUNT(DISTINCT victim_name || ' ' || date_of_death::text) as count 
                FROM homicide_news
                WHERE perpetrator_gender IS NOT NULL
                GROUP BY perpetrator_gender
            """
            df = pd.read_sql(query, connect)
            fig = px.bar(df, x='perpetrator_gender', y='count', title='Gender Comparison of Perpetrators')

    elif category_value == 'victim_perpetrator_relationship':
        if plot_type_value == 'Relationship Bar Chart':
            query = """
                SELECT perpetrator_relationship_to_victim, COUNT(DISTINCT victim_name || ' ' || date_of_death::text) as count 
                FROM homicide_news 
                WHERE perpetrator_relationship_to_victim IS NOT NULL
                GROUP BY perpetrator_relationship_to_victim
            """
            df = pd.read_sql(query, connect)
            fig = px.bar(df, x='perpetrator_relationship_to_victim', y='count', title='Homicides by Victim-Perpetrator Relationship')

        elif plot_type_value == 'Heatmap':
            query = """
                SELECT perpetrator_relationship_to_victim, mode_of_death_specific, COUNT(DISTINCT victim_name || ' ' || date_of_death::text) as count 
                FROM homicide_news 
                WHERE perpetrator_relationship_to_victim IS NOT NULL AND mode_of_death_specific IS NOT NULL
                GROUP BY perpetrator_relationship_to_victim, mode_of_death_specific
            """
            df = pd.read_sql(query, connect)
            fig = px.density_heatmap(df, x='perpetrator_relationship_to_victim', y='mode_of_death_specific', z='count', title='Relationship vs Mode of Death Heatmap')

    elif category_value == 'multivariate_comparisons':
        if plot_type_value == 'Scatter Plot':
            query = """
                SELECT type_of_location, COUNT(DISTINCT victim_name || ' ' || date_of_death::text) as homicide_count 
                FROM homicide_news 
                WHERE type_of_location IS NOT NULL 
                GROUP BY type_of_location
            """
            df = pd.read_sql(query, connect)
            fig = px.scatter(df, x='type_of_location', y='homicide_count', size='homicide_count', color='homicide_count', title='Location Type vs Homicide Count')

        elif plot_type_value == 'Bubble Plot':
            query = """
                SELECT mode_of_death_specific, suspect_convicted, COUNT(DISTINCT victim_name || ' ' || date_of_death::text) as count 
                FROM homicide_news 
                WHERE mode_of_death_specific IS NOT NULL AND suspect_convicted IS NOT NULL
                GROUP BY mode_of_death_specific, suspect_convicted
            """
            df = pd.read_sql(query, connect)
            fig = px.scatter(df, x='mode_of_death_specific', y='suspect_convicted', size='count', color='suspect_convicted', title='Mode of Death vs Conviction Rates')

    if fig:
        st.plotly_chart(fig)

def update_custom_bar_graph(x_axis):
    if x_axis is None:
        st.write("Please select an X-axis value to generate the bar graph.")
        return

    # Construct the query to count unique murders, grouping by x_axis
    query = f"""
    SELECT {x_axis}, COUNT(DISTINCT victim_name) as count
    FROM homicide_news
    GROUP BY {x_axis}
    """

    # Fetch data from the database
    try:
        with psycopg2.connect(
            host="localhost", port="5432", database="homicide_main",
            user="postgres", password="Khiz1234"
        ) as conn:
            df = pd.read_sql(query, conn)
            st.write(df)  # Display the data frame for debugging purposes

    except Exception as e:
        st.error(f"Error in executing query: {e}")
        return

    if df.empty:
        st.write(f"No data returned for query: {query}")
        return

    # Create a bar graph
    fig = px.bar(df, x=x_axis, y='count', title=f'Bar Graph of {x_axis} vs Count')
    fig.update_layout(xaxis_title=x_axis, yaxis_title='Count')

    # Display the plot in Streamlit
    st.plotly_chart(fig)



# Function to export CSV from database
def export_csv():
    with psycopg2.connect(
        host="localhost", port="5432", database="homicide_main",
        user="postgres", password="Khiz1234"
    ) as conn:
        query = "SELECT * FROM homicide_news"
        df = pd.read_sql(query, conn)

    # Convert the DataFrame to CSV
    csv_data = df.to_csv(index=False)

    # Create a download button
    st.download_button(
        label="Download data as CSV",
        data=csv_data,
        file_name='homicide_news.csv',
        mime='text/csv'
    )
# Function to upload and append CSV data to an existing table
def upload_csv():
    uploaded_file = st.file_uploader("Choose a CSV file to upload and append to 'homicide_news'", type="csv")

    if uploaded_file is not None:
        # Read the uploaded CSV
        try:
            df = pd.read_csv(uploaded_file, sep=';', on_bad_lines='skip')
            st.write("Data preview:", df.head())

            # Connect to PostgreSQL and append data
            with psycopg2.connect(
                host="localhost", port="5432", database="homicide_main",
                user="postgres", password="Khiz1234"
            ) as conn:
                df.to_sql('homicide_news', engine, if_exists='append', index=False)
                st.success("CSV data appended successfully to table 'homicide_news'.")
        
        except pd.errors.ParserError as e:
            st.error(f"Parsing error: {e}")
        
        except UnicodeDecodeError as e:
            st.error(f"Decoding error: {e}")
        
        except Exception as e:
            st.error(f"An error occurred: {e}") 
            
# Function to upload and append CSV data to a new table
def upload_csv_to_new_table():
    uploaded_file = st.file_uploader("Choose a CSV file to upload and append to 'homicide_complete'", type="csv")

    if uploaded_file is not None:
        # Read the uploaded CSV
        try:
            df = pd.read_csv(uploaded_file, sep=';', on_bad_lines='skip')
            st.write("Data preview:", df.head())

            # Connect to PostgreSQL and append data
            with psycopg2.connect(
                host="localhost", port="5432", database="homicide_main",
                user="postgres", password="Khiz1234"
            ) as conn:
                df.to_sql('homicide_complete', engine, if_exists='append', index=False)
                st.success("CSV data appended successfully to 'homicide_complete'.")
        
        except pd.errors.ParserError as e:
            st.error(f"Parsing error: {e}")
        
        except UnicodeDecodeError as e:
            st.error(f"Decoding error: {e}")
        
        except Exception as e:
            st.error(f"An error occurred: {e}")

# Streamlit Layout
st.sidebar.title("Homicide Data Tracker")

# Sidebar for actions
action = st.sidebar.radio("Choose an action", ["Display Data", "Insert Data", "Delete Data", "Visualize Data","Custom Data Visualization", "Data Duplicates", "Export and Upload Data"])

if action == "Display Data":
    highlighted_title("Homicide Data Table")
    
    available_columns = ['news_report_url', 'news_report_platform', 'date_of_publication', 'author', 
                            'news_report_headline', 'no_of_subs', 'wire_service', 'victim_name', 'date_of_death', 
                            'age_of_victim', 'race_of_victim', 'type_of_location', 'place_of_death_town', 
                            'place_of_death_province', 'sexual_assault', 'mode_of_death_specific', 'robbery_y_n_u', 
                            'suspect_arrested', 'suspect_convicted', 'perpetrator_name', 'perpetrator_relationship_to_victim', 
                            'multiple_murder', 'extreme_violence_y_n_m_u', 'intimate_femicide_y_n_u', 'notes']  # Replace with actual column names
    selected_columns = st.multiselect("Select columns to display in the table", available_columns)
    
    display_all_columns = st.checkbox("Display All Columns", value=False)
    
    if display_all_columns:
        display_whole_table()
    else:
        display_table(selected_columns)
        
elif action == "Insert Data":
    highlighted_title("Insert New Homicide Record")
    
    #Input the url for the article
    report_url = st.text_area("Enter the news article or news report url")
    
    news_publisher = st.text_input("Enter the news article publisher")
    
    date_of_publication = st.date_input("Date of publication")
    
    wire_service = st.text_input("Enter the wire service")
    
    author_name  =  st.text_input("Enter the name of the author")
    
    news_headline = st.text_input("Enter the news headline")
    
    victim_name = st.text_input("Enter victim name")
    
    age = st.selectbox("Victim's Age", list(range(0, 121)))
    
    date_of_death = st.date_input("Enter the date of death")
    
    mode_of_death = st.text_input("Enter the specific mode of death")
    
    race = st.selectbox("Race", race_options)
    
    location_type = st.text_input("Enter the type of location")
    
    # Step 1: Select the province
    province = st.selectbox("Select Province", list(provinces.keys()))
    
    # Step 2: Based on the selected province, select the town
    town = st.selectbox("Select Town", provinces[province])
    
    suspect_name = st.text_input("Enter perpetrator name")
    
    no_of_suspects = st.selectbox("Number of suspects", list(range(1, 200)))
    
    suspect_arrested = st.selectbox("Is the perpetrator arrested", bool_options)
    
    suspect_convicted = st.selectbox("Is the suspect convicted", bool_options)
    
    relationship = st.selectbox("Relationship to Victim", relationship_options)
    
    sexual_assault = st.selectbox("Sexual Assault", bool_options)
    
    robbery = st.selectbox("Was there a robbery", bool_options)
    
    multiple_murder = st.selectbox("Was there multiple murders", bool_options)
    
    extreme_violence = st.selectbox("Was there extreme violence", bool_options)
    
    intimate_femicide = st.selectbox("Intimate Femicide", bool_options)
    
    notes = st.text_area("Extra notes")
    
    
    # Insert data into the database
    if st.button("Insert Record"):
        insert_data(report_url, news_publisher, date_of_publication, wire_service, author_name, news_headline, 
                victim_name, age, date_of_death, mode_of_death, race, location_type, province, town, 
                suspect_name, no_of_suspects, suspect_arrested, suspect_convicted, relationship, sexual_assault,
                robbery, multiple_murder, extreme_violence, intimate_femicide, notes)
        st.success("Record inserted successfully")

elif action == "Delete Data":
    highlighted_title("Delete Record")
    
    record_id = st.number_input("Record ID to delete", min_value=1)
    
    if st.button("Delete Record"):
        delete_data(record_id)
        st.success("Record deleted successfully")
    st.subheader("Delete table")
    display_delete()

elif action == "Visualize Data":
    highlighted_title("Data Visualisation")
    cat_value = visualize_data()
    #conn = get_db_connection()
    plot_value = update_plot_type_dropdown(cat_value)
    st.write(f"Selected Category: {cat_value}")
    st.write(f"Select plot type: {plot_value}")
    if cat_value and plot_value:
        render_plot(cat_value, plot_value)

elif action == "Data Duplicates":
    highlighted_title("Duplicate Records ")
    st.subheader("Check for Duplicate Records")
    columns =  st.text_input("Enter columns to check for duplicates (comma-separated)")
    if st.button("Check Duplicates"):
        check_duplicates(columns)
    
    st.subheader("Delete duplicate records")
    column_to_display = st.multiselect("Select columns to display", 
                                       ['news_report_url', 'news_report_platform', 'date_of_publication', 'author',
                                        'news_report_headline', 'no_of_subs', 'wire_service', 'victim_name', 
                                        'date_of_death', 'age_of_victim', 'race_of_victim', 'type_of_location', 
                                        'place_of_death_town', 'place_of_death_province', 'sexual_assault', 
                                        'mode_of_death_specific', 'robbery_y_n_u', 'suspect_arrested', 
                                        'suspect_convicted', 'perpetrator_name', 'perpetrator_relationship_to_victim', 
                                        'multiple_murder', 'extreme_violence_y_n_m_u', 'intimate_femicide_y_n_u', 
                                        'notes'])
    # Button to trigger the delete duplicates operation
    if st.button("Delete Duplicates"):
        delete_duplicates(columns, column_to_display)
    st.subheader("Duplicates table")
    display_duplicates()
    
elif action == "Export and Upload Data":
    highlighted_title("Export and Upload data")
    st.subheader("Export Data to CSV")
    export_csv()
    st.subheader("Upload CSV to Existing Table")
    upload_csv()
    st.subheader("Upload CSV to New Table")
    upload_csv_to_new_table()
    
elif action == "Custom Data Visualization":
    highlighted_title("Customisable Bar Graph")
    x_axis = st.selectbox("Select x-axis for Bar Graph", options=['age_of_victim','place_of_death_province', 'race_of_victim',
                                                                 'perpetrator_relationship_to_victim'])
    y_axis = 'count'
    
    # Button to generate the bar graph
    if st.button("Generate Bar Graph"):
        update_custom_bar_graph(x_axis)
    
    
   

    
