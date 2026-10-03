# OBSINAN CAFFE — FULL UPDATED

## Features
- White + orange premium café UI
- Optional user dark mode
- Responsive desktop/mobile layout
- Booking form
- Ethiopian mobile number validation (09XXXXXXXX / 07XXXXXXXX)
- Ethio Telecom / Safaricom selection
- Automatic booking code
- Admin login
- Admin booking dashboard
- Confirm / Pending / Cancel booking status
- Add, edit, delete menu items
- Edit menu name, category, price, photo URL and description
- Change admin password
- Exact design-reference image kept in `public/assets/` without editing

## Run
1. Install Node.js.
2. Extract this ZIP.
3. Open the extracted folder in VS Code.
4. Open Terminal in the folder.
5. Run:
   npm install
   npm start
6. Open:
   http://localhost:3000/

## Admin
http://localhost:3000/admin.html
or
http://localhost:3000/admin

Initial password:
obsinan.nahom

After login, change the password from the Change Password section.

IMPORTANT:
Do not use VS Code Live Server for this project. Start the Node server with `npm start`.

EVENT UPDATE:
Normal café visits are walk-in; booking is for events only. Event types include Birthday, Wedding, Engagement, Graduation, Business Event, Family Gathering and Other. The form collects optional dietary/allergy and accessibility needs with consent; it does not request blood pressure or other medical measurements.

IMPORTANT ADMIN ERROR FIX
If you see "Cannot GET /admin.html" at 127.0.0.1:5500, you are opening the site through VS Code Live Server (port 5500) instead of the Node/Express server.
Do NOT use Live Server for this project.
Use:
  npm install
  npm start
Then open:
  http://localhost:3000/
  http://localhost:3000/admin.html
You can also double-click START_OBSINAN.bat on Windows.

BOOKING CARD FEATURE
- After a successful event booking, the supplied booking-card image appears in a full-screen cinematic playing-card overlay.
- The image is displayed without filters or edits.
- The overlay starts with a bottom-to-full-page animation and remains available for 30 minutes.
- The booking code is shown on the card and the 30-minute timer persists through page refresh using localStorage.

Phone/card update: 0905903024 is shown in the footer and booking card as a tap-to-call link. The uploaded booking photo is used from assets/photo_2026-09-30_09-08-22.jpg. The card appears after a successful event booking and has a 30-minute timer.

PHOTO CARD: The OBSINAN photo is included under public/assets and is responsive on phones, tablets and desktop. It uses a web-relative path, not a Windows C:\Users path.
