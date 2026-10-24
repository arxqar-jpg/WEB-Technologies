# Assignment 4 changes

- Kept Home, Quiz, About Us and Contacts, the original content sections, team names, questions, radio answers, responsive grids, tables, gallery/carousel and the four original screenshot PNGs.
- Linked all four pages to the shared JavaScript and local Bootstrap 5.3.3 files. Bundled the existing remote photography so the website also works offline. Replaced the fragile external quiz illustration with a local programming photograph.
- Applied consistent name/email rules across registration, newsletter and contact forms, with visible field errors, `aria-invalid` and accessible error descriptions.
- Rejected malformed email domains/local parts, example/dummy addresses, a list of known disposable domains and common provider misspellings. This is input checking, not proof of mailbox ownership.
- Blocked spaces, tabs, line breaks and invisible characters when typing/pasting/dropping into either password field. Rechecked raw passwords on submission and revalidated confirmation whenever the password changes.
- Fixed popup initial focus, keyboard focus trapping, restoration, background interaction, ARIA states and tab keyboard navigation. Preserved close button, outside click and Escape dismissal.
- Preserved smooth FAQ transitions, ensured all answers start closed, added linked labels/regions and recalculated expanded height after resizing.
- Preserved background cycling and the second-by-second Date clock. Made storage optional so blocked localStorage cannot break the site.
- Kept all three quiz grading flows, used exact answer matching, and cleared stale scores after an answer changes.
- Escaped dynamic form output with `textContent`, fixed the contact email error location, and stopped presenting local demos as real submitted messages/accounts.
- Added subtle programming-themed backgrounds and mobile/keyboard/reduced-motion improvements without removing previous content.
- Added a report with actual browser screenshots, executable browser tests, defense notes and publishing instructions.

Remaining submission steps: provide your real group, publish to the shared repository/hosting account, and put the verified public URL in the report.
