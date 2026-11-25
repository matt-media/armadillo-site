# Armadillo — About + Team pages

Drop these into the site root next to index.html:

    about.html
    team.html
    assets/css/pages.css        (self-contained; does not load styles.css)
    assets/js/pages.js
    assets/img/team/matt-puretz.webp
    assets/img/team/jasmine-williams.webp
    assets/img/inspired-internet-pledge-signatory.png

The pages reuse assets/img/logo.png and assets/img/favicon.png, which the site already has.

## Link the new pages from the homepage nav

In index.html, add two links at the start of <nav class="nav__links">:

    <a href="about.html">About</a>
    <a href="team.html">Team</a>

## Council photos

Each council card has a placeholder. Replace
<div class="avatar avatar--placeholder" ...>…</div> with
<div class="avatar"><img src="assets/img/council/<name>.webp" alt="Dr. …" width="600" height="600" loading="lazy" /></div>
Square images, 600×600 or larger.

## Design-goal features

The feature lists for each goal live in the GOALS array at the top of
assets/js/pages.js, so copy edits happen in one place.

## Fonts

Matches the live homepage (Quicksand + Space Mono) with Fraunces Light Italic
as the single accent. To move to Atkinson Hyperlegible per the brand guide,
change --font-body in pages.css and the Google Fonts link.
