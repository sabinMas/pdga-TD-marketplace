# pdga-TD-marketplace 

PDGA Tournament Director Marketplace

The PDGA TD Marketplace is a web‑based storefront designed for tournament directors to order event supplies, player packs and custom merchandise. It is mainly a static front‑end (HTML/CSS/JavaScript) with a small PHP back‑end to handle email verification. Sample data is provided in JSON files.

======= Key features ======= 

======= Email verification & dashboard ======= 
Email verification: Tournament directors sign in using their email. The sendVerification.php endpoint generates a one‑time token, emails a sign‑in link and stores the token in tokens.json
When the user clicks the link, verify.php validates the token, returns the director’s email and associated event IDs (read from events.json), and invalidates the token.

Dashboard (signIn.html): After verification, directors select an event and view a dashboard listing upcoming events, purchase history and favorite items. The dashboard is powered by signIn.js, which loads events from events.json, histories from purchaseHistory.json and favourites from favoriteItems.json. It also displays product recommendations based on event tier (A/B/C) with a pre‑defined RECS object.

======= Product browsing & customization ======= 
Product catalogue: All products are described in catalog.json. Each entry includes an ID, name, section (e.g., Player Packs or Course Setup Products), payment category (player‑pack, discs, custom‑merch or event‑supplies), price and image. This catalogue is used to annotate product cards and drive pricing.

Marketplace page (tournamentItems.html): The main shopping page displays products in categories: Player Packs, Course Setup Products, Safety Products, Extras and Seasonal Events. Flip‑cards reveal customization options and price ranges. A data attribute (data‑min‑selections) enforces minimum selections when building player packs.

Dynamic cart: javaScripts/Main.js loads the catalogue, attaches event handlers and maintains a list (cart) in sessionStorage. It updates the cart count, supports searching products, and calculates prices based on selected options  Colour options are converted into checkboxes for multi‑select player‑pack builds

======= List view & local vs online fulfilment ======= 
List page (list.html): Displays items added to the cart. Using listLoader.js, the page rebuilds the cart from sessionStorage, showing quantities and allowing the user to mark each item for local pickup or online fulfilment. Buttons let directors select all items as local or online. A “Pre‑checkout” button creates checkoutList containing only online items, stored in sessionStorage

Find local stores: The right column of the list page provides a store locator. Users enter a ZIP code and radius, and Leaflet renders a map of nearby sports/disc golf shops. listLoader.js performs geocoding via Nominatim and queries the Overpass API to find shops. Results are shown on the map and as a list with distances


======= Checkout & order summary ======= 
Checkout page (checkoutpage.html): Divides the cart into collapsible categories (player packs, event supplies, custom items and custom discs). Items are rendered on load by checkout.js; quantities can be adjusted, and totals are recalculated and displayed in the order summary. Sections summarise the item count and cost; the final total is updated dynamically. A shipping section allows choosing UPS/DHL/FedEx, and a Buy button is enabled when at least one item is in the cart.

Payment options: A sidebar lists express payment buttons (Shop Pay, PayPal, Amazon Pay, Apple Pay) and a standard card payment section with logos. Payment integration is illustrative; no real payment processing is implemented.

======= Data & back‑end ======= 
Events & recommended items: events.json contains sample events, including their PDGA IDs, tier, location, dates and authorised email addresses. These event IDs drive the verification process and the tier determines which recommended supplies are displayed.

Purchase history & favorites: purchaseHistory.json and favoriteItems.json store sample historical orders and favourite products for different directors. These files enable the dashboard to show reorder buttons and quick access to preferred supplies.

Email verification scripts: The PHP scripts (sendVerification.php and verify.php) are minimal and write/read JSON files to store tokens. For production use, they should be replaced with secure storage and run under HTTPS. A db.example.php template is provided for connecting to a MySQL database; the database.php file includes real credentials and is not intended for public use.

======= Running the site locally ======= 
Serve the files: Use a local web server (e.g., php -S localhost:8000) in the project root so that relative paths and PHP scripts work. Opening the HTML files directly from the file system will not execute the PHP verification flow.

Configure email: The sendVerification.php script uses PHP’s mail() function. Configure SMTP or replace the mailing logic with a suitable library to send verification emails. During development, the script writes the verification link to the PHP error log for convenience.

Add sample data: The JSON files (events.json, catalog.json, etc.) provide mock data. Update them to reflect your actual events and product catalogue.

Optional database: If you intend to back the catalogue with a database, use db.example.php as a starting point and remove database.php from version control.

======= Security notes =======
The repository contains phpFiles/database.php with real database credentials. Do not commit real secrets; instead, use environment variables or a .env file.

The PHP verification scripts rely on local JSON files; tokens and events are not encrypted and should be stored securely in a production environment.

Payment buttons are placeholders. Integrate a PCI‑compliant payment provider before accepting payments.

Contributing

This project is a prototype to demonstrate the workflow of verifying event directors, browsing event supplies, building a shopping list, and checking out. Feel free to adapt the data files, refine the UI or integrate a proper back‑end. Pull requests and suggestions are welcome.