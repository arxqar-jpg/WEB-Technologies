# CodeQuiz - Assignment 4: Introduction to JavaScript

CodeQuiz continues the original Astana IT University Front-End / Web Technologies project. Home, Quiz, About Us and Contacts, previous content, Bootstrap components, and all three programming quizzes are preserved.

## Run the project

Extract the ZIP and open `index.html` in a modern browser. No installation, server, account, database or build is needed. Bootstrap 5.3.3 and the existing photographs are included locally, so the pages also work offline. Enable JavaScript.

For hosting, upload the contents of the `CodeQuiz` folder so `index.html` is at the site root. Follow `DEPLOYMENT.md`.

## Team and original responsibility split

- **Darkhan Saduakasov**: Home and Quiz pages; Task 1 (form validation), Task 5 (live date/time), quiz scoring.
- **Kassymkhan**: About Us and Contacts pages; Task 2 (FAQ accordion), Task 3 (popup), Task 4 (background cycling).

Both names appear in the footer of every website page. Each member should understand all components and submit their own work as required by the assignment.

## Assignment features

1. **Validation**: required full name, realistic email syntax, password of at least eight characters containing a letter and number, exact password confirmation and required agreement. Clear field errors update as input changes. Newsletter and contact forms share the email rules.
2. **FAQ accordion**: five questions on Home, answers hidden initially; click/Enter opens or closes smoothly. Opening another closes the previous answer.
3. **Popup**: Sign Up and Newsletter open the appropriate tab on every page. Close using the close button, outside click or Escape. Focus stays inside and returns to the trigger after dismissal.
4. **Background colour**: Change Theme cycles five programming-themed colours using JavaScript. Theme index is stored when localStorage is available. Storage failure never breaks other features.
5. **Current date/time**: a readable local clock in a time element is rendered with a Date object and updated every second.

Original Java, Python, and HTML/CSS quizzes still calculate scores, reject incomplete submissions, show feedback and support retaking. Previous responsive grids, navigation, tables, gallery/carousel and all original image PNGs remain.

## Password and email rules

- Both password inputs block typed, pasted and dropped whitespace, including tabs, non-breaking spaces and invisible formatting characters. Submission also validates raw values without silently trimming/changing passwords.
- Email validation rejects malformed local/domain parts, obvious dummy/example addresses, known disposable domains and common provider misspellings. Academic and custom domains and normal plus-addressing are allowed.
- **No frontend can prove that every email address exists or belongs to the user.** Genuine registration needs a backend that sends/checks an email verification link or code. The included forms are clearly identified as course demos: they validate locally, but do not create accounts, send messages/newsletters or store passwords/personal details.

## Submission materials

- `report/Assignment-4-Report.pdf`: report with five tasks, steps, actual browser screenshots, testing and reflection. Group and deployment URL fields on page 1 are fillable.
- `report/REPORT.md`: editable report text with screenshot references.
- `report/screenshots/`: current website screenshots. Original screenshots remain under `images/`.
- `report/test-results.json`: exact results of the browser tests used for this package.
- `DEFENSE.md`: Kazakh explanation and demo sequence for the practice lesson.
- `DEPLOYMENT.md`: GitHub Pages / Netlify instructions.
- `CHANGELOG.md`: changes and preserved functionality.

**Before submission:** fill in the real group; commit/push to the shared repository, deploy and verify the site, then enter its actual public URL in the PDF and Markdown report. No online deployment or group number is fabricated in this package.

## Optional automated checks

Node.js is needed only for development checks, not for using the website:

```sh
npm install
npx playwright install chromium firefox
npm run check
npm test
```

The test runner starts a temporary local server, checks the five assignment tasks and original quizzes in Chromium/Firefox, and checks phone/tablet widths of 360, 390 and 768 pixels. It also verifies direct file opening, missing storage and local assets. To run using installed Google Chrome, set `CODEQUIZ_CHANNEL=chrome`. Set `CODEQUIZ_FILE_MODE=1` to test using only file URLs.

See `ASSETS.md` and `vendor/bootstrap/LICENSE` for bundled asset sources and licensing.
