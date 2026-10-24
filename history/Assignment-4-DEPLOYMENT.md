# Publish CodeQuiz for Assignment 4

The archive contains a static website ready to upload. This package has not been pushed or deployed to an online account. The assignment requires the final public URL in the report; add the real URL after publishing and checking it.

## GitHub Pages

The original project identifies its shared repository as `https://github.com/arxqar-jpg/WEB-Technologies`.

1. Open your existing clone of that repository, or clone it. Keep its existing Git history.
2. Copy the CONTENTS of this `CodeQuiz` folder into the repository root, preserving the four original pages and all supporting folders. Do not create an extra nested `CodeQuiz/CodeQuiz` folder.
3. Inspect the changes, then commit and push them yourself:

   ```sh
   git status
   git add index.html quiz.html about.html contact.html css js images vendor report tests README.md DEPLOYMENT.md DEFENSE.md CHANGELOG.md package.json .gitignore .nojekyll netlify.toml
   git commit -m "Complete Assignment 4 JavaScript features and report"
   git push origin main
   ```

4. In the repository's Settings > Pages, choose deployment from the `main` branch and root folder (`/`). Save and wait for the published URL displayed by GitHub.
5. Open that exact URL. Check all four navigation links, Sign Up, Newsletter, FAQ, Change Theme, live clock and quiz scores. Test on a phone as well.
6. Enter the checked URL and your real group in `report/Assignment-4-Report.pdf` (fillable fields on the first page) and `report/REPORT.md`. Save the edited PDF before submitting it.
7. Every team member must submit their own report and ZIP and prepare for the defense.

## Netlify alternative

Sign in to your Netlify account and use its manual site upload. Upload the folder containing `index.html`, with `css`, `js`, `vendor` and `images`. The included `netlify.toml` identifies the current directory as the publish folder. No build or database is required. Verify the assigned public URL and put it in the report.

## Email verification limitation

The assignment demonstrates frontend validation. Real mailbox existence/ownership and real account creation need a backend and an email verification service. The current forms clearly identify themselves as demos. They do not send mail, create accounts, store passwords or make network requests with personal details.
