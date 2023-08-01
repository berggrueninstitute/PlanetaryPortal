# Berggruen map documentation

## Data
- Link: https://docs.google.com/spreadsheets/d/1FiQv4qkJWnFm0XnZoBoPlUs5P-8jSlsodFB0xsDscz8/edit?usp=sharing
  
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
