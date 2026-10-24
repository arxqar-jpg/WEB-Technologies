# Assignment 5 implementation map

Team: **Team Spirit**. Members: **Darkhan Saduakasov; Kassymkhan**. Group: **SE 2508**.

| Requirement | Concrete implementation | Evidence |
|---|---|---|
| Continue previous project and team | Four previous pages, all quiz choices, forms, FAQ, popup, clock, background colours, gallery and assets retained; Study Lab added | Five-page regression tests; original asset and quiz-option comparisons |
| DOM selection and dynamic content | Native selectors for navigation/audio/form; jQuery selectors; generated topic cards; live planner summary and count | Study Lab, js/assignment5.js |
| Dynamic styles | Existing Change Theme retained; filter classes, selected thumbnails and event-triggered opacity animation | Home + Study Lab |
| Choose one attribute-manipulation option | **Chosen: thumbnail gallery**; updates main image src, alt, caption and selected aria-pressed state | Study Lab gallery; code-dom-gallery.png, 06-gallery.png |
| Button using addEventListener | Reset plan clears all planner fields, errors, state and result | plan-reset click listener |
| Keyboard navigation menu | Left/Right/Up/Down move focus; wrapping plus Home/End | Every page; code-menu-switch.png, 07-keyboard-menu.png |
| Callback response option | **Chosen: multi-step form**; Next/Back call showStep(number, updateStep); values remain when going back | code-callback.png, 03-plan-review.png |
| switch statement | Navigation key switch and topicTitle(category) switch | Keyboard and category filtering |
| Objects and methods | plan object stores name/topic/minutes; summary() displays its properties | code-data.png, 04-plan-ready.png |
| Arrays and loops | topics array of objects and for loop generate cards; loops select the correct quiz link | Practice library |
| Higher-order function | topics.filter(matchesCategory) passes the predicate callback | code-data.png, 05-filter-python.png |
| Sound effects | One local WAV/audio element, explicit preview and plan-completion actions; pause/rewind before play; mute and feedback | code-sound.png; actual media-playback test |
| No audio overlap | Reuse a single audio element and rewind before retriggering; no new Audio per click | Rapid-click test; audio count remains 1 |
| Event-triggered animations | jQuery fadeIn/fadeOut for steps/gallery; animate for result; CSS hover transforms | code-animation.png, gallery and planner screenshots |
| Separate HTML/CSS/JS | study.html, css/assignment5.css, js/assignment5.js; local jQuery loaded before custom scripts | Static no-inline-style/script/event check |
| Readable reusable code | var, named functions, simple objects/arrays/for/if/switch; no frameworks or extra app-code comments | js/script.js and js/assignment5.js |
| Theme and UX | All additions support CodeQuiz practice: plan, choose subject, open original quiz, study pictures | Desktop and 360/390/768 px tests |
| PDF report | Team/group, steps, code and webpage screenshots, verification and reflection | Assignment-5-Report.pdf |
| Deployment | Static files ready for GitHub Pages / Netlify; actual commit/push/publication not performed | DEPLOYMENT.md; fill real deployed URL in report after publishing |
| Defense and submission | Kazakh explanations and demonstration sequence prepared; each member must submit and defend | DEFENSE.md |

The specification offers alternatives: a thumbnail gallery and a multi-step form were selected. The other alternatives do not need to be implemented simultaneously. No backend request or real account/email delivery is claimed.
