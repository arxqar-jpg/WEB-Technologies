# Assignment 6 - не жасалды

Жоба алдыңғы Assignment 3-5 ZIP нұсқасының жалғасы. Бұрынғы бес бет пен функциялар сақталды.

1. Барлық HTML head бөлігіне jQuery 4.0.0 CDN қосылды. Интернет болмағанда сол нұсқаның жергілікті көшірмесі жүктеледі. js/script.js ішіндегі ready функциясы консольға jQuery is ready! шығарады.
2. Study Lab -> Practice library бөліміне real-time search қосылды. Тақырып пен сипаттама бойынша сүзеді; бұрынғы category filter-мен бірге жұмыс істейді.
3. Сол іздеу өрісіне autocomplete dropdown қосылды: тышқан, Arrow/Enter және Escape қолданылады.
4. Нәтиже карточкаларындағы барлық сәйкес мәтін mark арқылы белгіленеді. Арнайы regex таңбалары қауіпсіз өңделеді; іздеу HTML-ге айналдырылмайды.
5. Бес беттің үстіне scroll progress bar қосылды.
6. Study Lab ішіндегі 3 тақырып, 9 сұрақ, 3 қадам сандары нөлден өседі. Жалған қолданушы статистикасы қосылған жоқ.
7. Registration, newsletter және contact формалары дұрыс толтырылғанда Submit батырмасы 1.2 секундқа өшіп, spinner және Please wait... көрсетеді, кейін қалпына келеді.
8. Форма аяқталғанда және мәтін көшірілгенде уақытша toast шығып, біртіндеп жоғалады.
9. Дайын жоспардың жанына Copy plan батырмасы қосылды. Нақты мәтінді көшіреді; ✓ Copied және Copied to clipboard! tooltip көрсетеді. Көшіру орындалмаса, success көрсетпейді.
10. Суреттер viewport-қа келгенде ғана жүктеледі. Carousel мен thumbnail gallery жағдайлары да ескерілді.

## Тексеру

44 тест тобы өтті: Assignment 6 бойынша 19, бұрынғы функциялар бойынша 25. JavaScript қатесі шықпады. 320/360/390/576/768/992/1440 px өлшемдері, offline fallback, нақты clipboard, loading күйі және lazy loading network сұраулары тексерілді.

## Қорғауда түсіндіру

- Live search: input event -> topics.filter -> renderTopics.
- Autocomplete: сол topics массивінен ұсыныс құру; таңдалған атауды input-қа жазу.
- Highlight: literal query-ді regex үшін escape жасап, text node ішіне mark енгізу.
- Progress: scrollTop / (document height - viewport height) * 100.
- Counter: jQuery animate-тің step callback-і.
- Spinner: validation өткеннен кейін disabled + submitting flag + setTimeout; кейін бастапқы label.
- Toast: fadeIn, delay, fadeOut; жаңа хабар келгенде ескі queue тазартылады.
- Copy: Clipboard API, fallback, содан кейін ғана checkmark/tooltip.
- Lazy loading: data-src, scroll/resize, offset, visible bounds, attr(src).

## Сенің келесі қадамың

CodeQuiz ішіндегі файлдарды ортақ репозиторийдің root бөлігіне көшіріп, commit/push жаса. Push аяқталған соң жарияланған нұсқаның жұмысын тексер. Репорттағы URL бұрыннан бар сайт адресі, осы жаңа нұсқа әлі push жасалған жоқ.

Бұрынғы Assignment 3-5 репорттары өзгертілген жоқ.
