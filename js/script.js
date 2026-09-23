document.addEventListener("DOMContentLoaded", function () {

    // =========================
    // CURSOR GLOW
    // =========================

    const glow = document.createElement("div");
    glow.className = "cursor-glow";
    document.body.appendChild(glow);

    document.addEventListener("mousemove", function (event) {
        glow.style.left = event.clientX + "px";
        glow.style.top = event.clientY + "px";
    });


    // =========================
    // SCROLL ANIMATION
    // =========================

    const revealElements = document.querySelectorAll(
        ".welcome, .quiz-card, .step, .gallery-item, .team-card, .skill-card, .process-card, .contact-form-container, .contact-info-container, .feedback-card, .quiz-section"
    );

    revealElements.forEach(function (element) {
        element.classList.add("reveal");
    });

    const observer = new IntersectionObserver(function (entries) {

        entries.forEach(function (entry) {

            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            }

        });

    }, {
        threshold: 0.1
    });

    revealElements.forEach(function (element) {
        observer.observe(element);
    });


    // =========================
    // FLOATING CODE BACKGROUND
    // =========================

    const particles = [
        "</>",
        "{}",
        "01",
        "const",
        "=>",
        "HTML",
        "CSS",
        "JS",
        "1010",
        "#code"
    ];

    const background = document.createElement("div");
    background.className = "code-background";
    document.body.appendChild(background);

    for (let i = 0; i < 18; i++) {

        const particle = document.createElement("span");

        particle.className = "code-particle";

        particle.textContent =
            particles[Math.floor(Math.random() * particles.length)];

        particle.style.left =
            Math.random() * 100 + "%";

        particle.style.animationDuration =
            12 + Math.random() * 15 + "s";

        particle.style.animationDelay =
            Math.random() * -15 + "s";

        background.appendChild(particle);
    }


    // =========================
    // CARD 3D EFFECT
    // =========================

    const cards = document.querySelectorAll(
        ".quiz-card, .skill-card, .gallery-item"
    );

    cards.forEach(function (card) {

        card.addEventListener("mousemove", function (event) {

            const rect = card.getBoundingClientRect();

            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 35;
            const rotateY = (centerX - x) / 35;

            card.style.transform =
                `perspective(800px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                translateY(-5px)`;

        });

        card.addEventListener("mouseleave", function () {

            card.style.transform =
                "perspective(800px) rotateX(0deg) rotateY(0deg)";

        });

    });


    // =========================
    // ONLY FOR QUIZ PAGE
    // =========================

    if (!document.body.classList.contains("quiz-page")) {
        return;
    }


    // =========================
    // CORRECT ANSWERS
    // =========================

    const correctAnswers = {

        java1: "class",
        java2: "main()",
        java3: ";",

        python1: "def",
        python2: "print()",
        python3: ".py",

        html1: "HyperText Markup Language",
        html2: "<p>",
        html3: "Styling"

    };


    // =========================
    // TIMER
    // =========================

    const timer = document.createElement("div");

    timer.className = "quiz-timer";

    timer.innerHTML = `
        <div class="timer-title">
            <span class="timer-dot"></span>
            QUIZ TIMER
        </div>

        <div class="timer-number">
            00:00
        </div>

        <div class="timer-text">
            Choose your first answer
        </div>
    `;

    document.body.appendChild(timer);

    const timerNumber =
        timer.querySelector(".timer-number");

    const timerText =
        timer.querySelector(".timer-text");

    const timerDot =
        timer.querySelector(".timer-dot");


    let currentForm = null;

    const states = new WeakMap();


    function formatTime(seconds) {

        const minutes =
            Math.floor(seconds / 60);

        const remainingSeconds =
            seconds % 60;

        return (
            String(minutes).padStart(2, "0") +
            ":" +
            String(remainingSeconds).padStart(2, "0")
        );
    }


    function getSeconds(state) {

        if (!state.startTime) {
            return 0;
        }

        const end =
            state.endTime || Date.now();

        return Math.floor(
            (end - state.startTime) / 1000
        );
    }


    function updateTimer() {

        if (!currentForm) {
            return;
        }

        const state =
            states.get(currentForm);

        timerNumber.textContent =
            formatTime(getSeconds(state));

    }


    setInterval(updateTimer, 500);


    // =========================
    // QUIZ FORMS
    // =========================

    const forms =
        document.querySelectorAll(
            ".quiz-page .quiz-section form"
        );


    forms.forEach(function (form) {

        const state = {
            startTime: null,
            endTime: null,
            finished: false
        };

        states.set(form, state);

        const submitButton =
            form.querySelector(".quiz-submit");

        const originalButtonText =
            submitButton.textContent.trim();


        // =========================
        // ANSWER CLICK
        // =========================

        form.querySelectorAll(
            'input[type="radio"]'
        ).forEach(function (radio) {

            radio.addEventListener(
                "change",
                function () {

                    currentForm = form;

                    if (!state.startTime) {

                        state.startTime =
                            Date.now();

                        timerText.textContent =
                            "Timer is running";

                        timerDot.classList.add(
                            "running"
                        );
                    }


                    const question =
                        radio.closest(".question");


                    question
                        .querySelectorAll("label")
                        .forEach(function (label) {

                            label.classList.remove(
                                "answer-selected"
                            );

                        });


                    const selectedLabel =
                        radio.closest("label");

                    selectedLabel.classList.add(
                        "answer-selected"
                    );


                    selectedLabel.classList.remove(
                        "answer-animation"
                    );

                    void selectedLabel.offsetWidth;

                    selectedLabel.classList.add(
                        "answer-animation"
                    );

                }
            );

        });


        // =========================
        // SUBMIT
        // =========================

        form.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                currentForm = form;


                // TRY AGAIN
                if (state.finished) {

                    form.reset();

                    state.startTime = null;
                    state.endTime = null;
                    state.finished = false;

                    form
                        .querySelectorAll("label")
                        .forEach(function (label) {

                            label.classList.remove(
                                "answer-selected",
                                "answer-correct",
                                "answer-wrong"
                            );

                        });


                    form
                        .querySelectorAll(
                            'input[type="radio"]'
                        )
                        .forEach(function (radio) {

                            radio.disabled = false;

                        });


                    const oldResult =
                        form.parentElement.querySelector(
                            ".quiz-result"
                        );

                    if (oldResult) {
                        oldResult.remove();
                    }


                    submitButton.textContent =
                        originalButtonText;

                    timerNumber.textContent =
                        "00:00";

                    timerText.textContent =
                        "Choose your first answer";

                    timerDot.classList.remove(
                        "running",
                        "finished"
                    );

                    return;
                }


                if (!state.startTime) {
                    state.startTime = Date.now();
                }

                state.endTime =
                    Date.now();

                state.finished = true;


                let correct = 0;
                let total = 0;


                form
                    .querySelectorAll(".question")
                    .forEach(function (question) {

                        total++;

                        const checked =
                            question.querySelector(
                                'input[type="radio"]:checked'
                            );


                        const radios =
                            question.querySelectorAll(
                                'input[type="radio"]'
                            );


                        radios.forEach(function (radio) {

                            const label =
                                radio.closest("label");

                            const answer =
                                label.textContent
                                    .trim()
                                    .replace(/\s+/g, " ");

                            const expected =
                                correctAnswers[
                                    radio.name
                                ];


                            if (
                                answer.toLowerCase() ===
                                expected.toLowerCase()
                            ) {

                                label.classList.add(
                                    "answer-correct"
                                );

                            }

                        });


                        if (checked) {

                            const label =
                                checked.closest("label");

                            const answer =
                                label.textContent
                                    .trim()
                                    .replace(/\s+/g, " ");

                            const expected =
                                correctAnswers[
                                    checked.name
                                ];


                            if (
                                answer.toLowerCase() ===
                                expected.toLowerCase()
                            ) {

                                correct++;

                            } else {

                                label.classList.add(
                                    "answer-wrong"
                                );

                            }

                        }

                    });


                // DISABLE ANSWERS

                form
                    .querySelectorAll(
                        'input[type="radio"]'
                    )
                    .forEach(function (radio) {

                        radio.disabled = true;

                    });


                const percentage =
                    Math.round(
                        (correct / total) * 100
                    );


                const totalTime =
                    getSeconds(state);


                let title =
                    "Keep Practicing";

                if (percentage === 100) {
                    title = "Perfect!";
                }

                else if (percentage >= 67) {
                    title = "Good Job!";
                }


                // REMOVE OLD RESULT

                const previousResult =
                    form.parentElement.querySelector(
                        ".quiz-result"
                    );

                if (previousResult) {
                    previousResult.remove();
                }


                // RESULT

                const result =
                    document.createElement("div");

                result.className =
                    "quiz-result";


                result.innerHTML = `

                    <div class="result-top">

                        <div>

                            <span class="result-small">
                                TEST COMPLETED
                            </span>

                            <h3>
                                ${title}
                            </h3>

                        </div>

                        <div class="result-percent">
                            ${percentage}%
                        </div>

                    </div>


                    <div class="result-stats">

                        <div>

                            <span>
                                SCORE
                            </span>

                            <strong>
                                ${correct}/${total}
                            </strong>

                        </div>


                        <div>

                            <span>
                                TIME
                            </span>

                            <strong>
                                ${formatTime(totalTime)}
                            </strong>

                        </div>


                        <div>

                            <span>
                                CORRECT
                            </span>

                            <strong>
                                ${correct}
                            </strong>

                        </div>

                    </div>


                    <div class="result-progress">

                        <div
                            style="width:${percentage}%">
                        </div>

                    </div>

                `;


                form.insertAdjacentElement(
                    "afterend",
                    result
                );


                setTimeout(function () {

                    result.classList.add(
                        "show-result"
                    );

                }, 50);


                submitButton.textContent =
                    "Try Again";


                timerText.textContent =
                    "Quiz completed";

                timerDot.classList.remove(
                    "running"
                );

                timerDot.classList.add(
                    "finished"
                );


                result.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }
        );

    });

});