# Armadillo site — page structure (v2)

Two pages now:

- index.html — landing, design goals, how it works, benchmark results,
  real examples, timeline to product release, meet the people, contact form, popup
- about.html — about landing (with the Inspired Internet Pledge badge), our mission,
  what we believe, team (#team), scientific council (#council), connect CTA
- team.html — now just redirects to about.html#team so old links keep working

Styles and scripts:

- assets/css/pages.css — styles for BOTH pages (styles.css is no longer used and can be deleted)
- assets/js/main.js — unchanged: real-examples viewer, chart animation, contact form, popup
- assets/js/pages.js — nav menu + hand-drawn underline that follows the section in view,
  scroll reveals, design-goals explorer, how-it-works animation, timeline road

Editing content:

- Design-goal features: GOALS array near the top of assets/js/pages.js
- How-it-works example chats: SCENES array in assets/js/pages.js
- Council photos: replace each <div class="avatar avatar--placeholder" …> with
  <div class="avatar"><img src="assets/img/council/<name>.webp" alt="Dr. …" width="600" height="600" loading="lazy" /></div>

Caching: the logo and stylesheet are linked as logo.png?v=2 and pages.css?v=2.
If you replace either file and the browser keeps showing the old one, bump the number.
