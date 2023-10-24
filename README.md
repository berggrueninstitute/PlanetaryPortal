# Berggruen map documentation

## Data
- Link to main data (Berggruen final data): https://docs.google.com/spreadsheets/d/1FiQv4qkJWnFm0XnZoBoPlUs5P-8jSlsodFB0xsDscz8/edit?usp=sharing

  - "organizations" tab (saved as mapData.csv in the data folder): includes information on the different organizations to show up as points on the map
  - "individuals" tab: old list of individual thinkers. Individuals not in the new list include: Frank Biermann, Johan Rockström, James Lovelock, Benjamin H. Bratton, Bruno Latour.  For updated list see below.
  - "individuals new" tab (saved as individualsData.csv in the data folder): updated list of individuals, used to show the list of thinkers.  The updated list excludes the five individuals listed above and instead includes Donna J. Haraway and Anna L. Tsing


- Link to individuals' work data (Berggruen_individuals_work_data_new): https://docs.google.com/spreadsheets/d/1e6fwchrxj8l0eyTD2m8hEofAbPcv3iMfIMr5v0uJBfY/edit?usp=sharing

  - "all" tab: Essentially the same as the "individuals new" tab above, added here just as a reference
  - rest of the tabs: each tab is added for an individual thinker to show their works.  Columns include: Name ID,	Name,	Entry,	Author,	Work.
    - "Name ID" should be equivalent to the "Id" field in the "all" tab for a specific individual
    - "Name" should be equivalent to the "Name" field in the "all" tab for a specific individual
    - "Entry" shows the ordered number individual works
    - "Author": Author /editor of work
    - "Work": title of work

    For the final individualsWorkData.json, it's a nested JSON. The first layer is an array of objects, each object represents an individual, with the following fields: "Id", "Name", and "Works".  Then the "Works" field includes also an array of objects, each object representing a piece of work, including the folloowing fields: "Entry", "Author", and "Work".  This data is taken from the different individual tabs. Wihtin each csv for an individual, the "Name ID" and "Name" will go into the first layer of the JSON file, and the "Entry", "Author", and "Work" fields will be converted into a JSON and appended after the "Works" field for each individual.


### Organizations
- Fields and functionality in code, if used, in () important points to keep data consistent:
  -  Id: To keep track of which ones are selected.
  -  Organization: Searchable from search bar. Text in tooltip.
  -  Type
  -  Region
  -  Location: Searchable from search bar.
  -  Latitude: to place on map. (Must have a value, if no specific location then put the centroid of the country with a bit of offset, so points won't all overlap in if they are from the same country)
  -  Longitude: to place on map. (Must have a value, if no specific location then put the centroid of the country with a bit of offset, so points won't all overlap in if they are from the same country)
  -  Focus: Text in tooltip.
  -  Category: To color points on map.  (Must be one of these six: Solutions & Politics, Habitability & Hospitability, Justice & Ethics, Earth System Science, Solutions & Economics, Indigenous Knowledge)
  -  Year
  -  Mission: Text in tooltip.
  -  Key_persons
  -  Key_words
  -  Contact_address: Text in tooltip.
  -  Contact_site: Link in tooltip.
  -  Contact_phone
  -  Contact_fax
  -  Contact_email
  -  Active

### Individuals
- Fields and functionality in code, if used, in () important points to keep data consistent:
  -  Id
  -  Name: Text in tooltip.
  -  Nationality
  -  Focus: Text in tooltip.
  -  Category: To color the focus / category text in tooltip. Text in tooltip.
  -  Key_words
  -  Bio
  -  Work: Text in tooltip.
  -  Organization
  -  Type
  -  Contact_address
  -  Latitude
  -  Longitude
  -  Contact_site: Text in tooltip.
  -  Contact_phone
  -  Contact_fax
  -  Contact_email

### Other files
- land1.geojson: map boundaries when zoomed out
- land2.geojson: map boundaries when zoomed in
