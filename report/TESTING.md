# Verification record

Completed suite: **14/14 test groups passed** in Google Chrome 155.0.8059.85, using Playwright and offline file URLs. Browser time zone was Asia/Qyzylorda. The results are recorded in `test-results.json` and the exact runner is `../tests/browser-tests.cjs`.

The suite covers all four pages and local image/script/style loading; footer names and modal defaults; live clock ticks; background cycling/persistence; smooth FAQ open/switch/close; popup close/backdrop/Escape/focus/keyboard tabs; required fields; Kazakh names; short and mismatched passwords; typed and pasted password whitespace/invisible characters plus raw-value validation; malformed/dummy/disposable/typo emails; valid local-demo completion and no password storage; newsletter; all three quiz score/resubmission paths; contact error correction and markup-shaped input rejection; 360, 390 and 768 px page layouts and mobile navigation/popup; missing localStorage and direct file opening.

Additional static checks confirmed no duplicate HTML IDs; valid aria-controls, aria-describedby and label references; existing local links; unchanged hashes of the four original PNG assets; and the exact original 26 radio answer choices. The PDF was rendered and visually reviewed, and its two fillable fields were checked through both the AcroForm field tree and page widgets.

Cross-browser limit: Firefox 153 and Edge could not start inside the restricted Windows environment. Those runs are not counted as successful. The embedded browser was unavailable as well. The included runner defaults to Chromium and Firefox so they can both be checked on an unrestricted machine. The completed suite was explicitly limited to Chrome with `CODEQUIZ_BROWSERS=chromium`; this limitation is preserved in the report.

Phone/tablet checks use viewport emulation, not a physical device. No online deployment was performed, so a final public-hosting smoke test remains for publication. This document does not claim server-side email verification or real message/account delivery.
