# CodeQuiz - Assignment 6

Team Spirit | Darkhan Saduakasov; Kassymkhan | SE 2508

Extract the complete folder, then open index.html. No build is required. The required jQuery 4.0.0 CDN is in each page head; the same local version is used when the CDN is unavailable.

## Required features

| Task | Location |
|---|---|
| 0: jQuery setup and ready message | All pages; head and js/script.js |
| 1: live search/filter | Study Lab > Practice library |
| 2: autocomplete suggestions | Same search field; click or Arrow/Enter |
| 3: matching-word highlighting | The filtered practice cards |
| 4: gradient scroll progress | Top edge of all five pages |
| 5: animated counters | Study Lab overview: 3 topics, 9 questions, 3 steps |
| 6: submit spinner and disabled button | Valid registration, newsletter and contact forms |
| 7: fading notifications | Form completion and clipboard actions |
| 8: clipboard copy/checkmark/tooltip | Create a practice plan, then Copy plan |
| 9: lazy image loading | Images throughout the existing pages |

The original quizzes, forms, FAQ, clock, theme controls, category filters, planner, gallery and sound remain. Form submission is a frontend simulation.

## Evidence

report/assignment-6/Assignment-6-Report.pdf contains steps, code screenshots, webpage screenshots, reflection and deployment status.
report/assignment-6/test-results.json: 19 Assignment 6 test groups passed.
report/assignment-6/regression-results.json: 25 previous-feature groups passed with jQuery 4.

Developer checks are optional and unnecessary to open the website:

```sh
npm install
npx playwright install chromium
npm run check
npm test
npm run test:regression
```

Tests default to installed Google Chrome. CODEQUIZ_PLAYWRIGHT_PATH can identify an existing Playwright package directory. Tests create evidence only under report/assignment-6.

## Published project

- Website: https://arxqar-jpg.github.io/WEB-Technologies/index.html
- Repository: https://github.com/arxqar-jpg/WEB-Technologies
- Implementation commit: https://github.com/arxqar-jpg/WEB-Technologies/commit/b8f810f64451221357375df49f1472b037fff91e
- GitHub Pages build: https://github.com/arxqar-jpg/WEB-Technologies/actions/runs/41895949494

Published and verified on 5 November 2026 (Asia/Qyzylorda). Six public-site feature groups passed without JavaScript page errors; 12 public HTML/CSS/JavaScript/font files matched the committed implementation. Full evidence: report/assignment-6/live-verification.json.

Submit the report PDF and complete project ZIP to LMS. Every member must submit before the deadline and defend the assignment at practice.

## Forest platform design

The selected Forest interface is applied to all five pages. Headings use local Sora and body text uses local Figtree. The theme selector provides Forest, Midnight and Cobalt and retains the selection across pages.

Overview and Study Lab reuse the same live topic library. On Overview, expand **Resources & FAQ** for the existing CSS-only card group, Bootstrap grids/cards, nine-image carousel and FAQ. These requirements remain available without crowding the quiz catalog.

Quizzes now use nine practical, static code-reading questions: Java score/loop/object creation, Python list/function/loop behavior, and HTML forms/CSS selectors/responsive grid. All three topics still contain three questions and use the original client-side radio-form scoring. The Java and Python outputs were independently checked.

Run `npm run test:platform` for the additional font, theme, navigation, scoring and layout checks. Font licenses are in vendor/fonts/.
