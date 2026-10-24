$(document).ready(function () {
    initMenuKeys();
    if (document.getElementById("study-lab")) {
        initStudyLab();
    }
});

function initMenuKeys() {
    var items = document.querySelectorAll("#mainNavigation .nav-link, #mainNavigation .trigger-modal-btn");
    for (var i = 0; i < items.length; i++) {
        items[i].addEventListener("keydown", function (event) {
            var next = 0;
            for (var j = 0; j < items.length; j++) {
                if (items[j] === this) next = j;
            }
            switch (event.key) {
                case "ArrowRight":
                case "ArrowDown":
                    next++;
                    break;
                case "ArrowLeft":
                case "ArrowUp":
                    next--;
                    break;
                case "Home":
                    next = 0;
                    break;
                case "End":
                    next = items.length - 1;
                    break;
                default:
                    return;
            }
            event.preventDefault();
            if (next < 0) next = items.length - 1;
            if (next === items.length) next = 0;
            items[next].focus();
        });
    }
}

function initStudyLab() {
    var topics = [
        { category: "java", title: "Java foundations", description: "Review classes, the main method and Java statements.", link: "quiz.html#java", questions: 3 },
        { category: "python", title: "Python essentials", description: "Practise functions, output and Python file extensions.", link: "quiz.html#python", questions: 3 },
        { category: "web", title: "HTML & CSS", description: "Check the structure and presentation of a webpage.", link: "quiz.html#htmlcss", questions: 3 }
    ];
    var currentCategory = "all";
    var step = 1;
    var plan = {
        name: "",
        topic: "",
        minutes: "15",
        summary: function () {
            return this.name + ", your plan is " + this.minutes + " minutes of " + topicTitle(this.topic) + " practice.";
        }
    };
    var audio = document.getElementById("notification-sound");

    function topicTitle(category) {
        switch (category) {
            case "java":
                return "Java";
            case "python":
                return "Python";
            case "web":
                return "HTML & CSS";
            default:
                return "All topics";
        }
    }

    function matchesCategory(topic) {
        return currentCategory === "all" || topic.category === currentCategory;
    }

    function renderTopics(category) {
        currentCategory = category;
        var visibleTopics = topics.filter(matchesCategory);
        var container = $("#practice-topics");
        container.html("");
        for (var i = 0; i < visibleTopics.length; i++) {
            var topic = visibleTopics[i];
            container.append(
                '<div class="col-12 col-md-4"><article class="topic-card">' +
                '<p class="lab-eyebrow">' + topicTitle(topic.category) + '</p>' +
                '<h3>' + topic.title + '</h3>' +
                '<p>' + topic.description + '</p>' +
                '<p class="topic-meta">' + topic.questions + ' questions / Beginner</p>' +
                '<a class="btn btn-outline-primary" href="' + topic.link + '">Open quiz</a>' +
                '</article></div>'
            );
        }
        $("#topic-count").text(topicTitle(category) + " / " + visibleTopics.length + " available");
    }

    $(".topic-filter").click(function () {
        $(".topic-filter").removeClass("active").attr("aria-pressed", "false");
        $(this).addClass("active").attr("aria-pressed", "true");
        renderTopics($(this).attr("data-category"));
    });
    renderTopics("all");

    function updateStep(number) {
        $("#plan-step-status").text("Step " + number + " of 3");
        $(".plan-progress li").removeClass("current").removeAttr("aria-current");
        $('.plan-progress li[data-step="' + number + '"]').addClass("current").attr("aria-current", "step");
        $("#plan-back, #plan-next, #plan-finish").hide();
        if (number > 1) $("#plan-back").show();
        if (number < 3) $("#plan-next").show();
        if (number === 3) {
            $("#plan-finish").show();
            $("#plan-review").text(plan.summary());
        }
    }

    function showStep(number, callback) {
        step = number;
        $(".plan-step").stop(true, true).hide();
        $("#plan-step-" + number).fadeIn(180);
        callback(number);
    }

    function checkStep() {
        if (step === 1) {
            var input = document.getElementById("plan-name");
            var valid = showField(input, getNameError(input.value));
            if (!valid) { input.focus(); return false; }
            plan.name = input.value.trim();
        }
        if (step === 2) {
            var topic = document.getElementById("plan-topic");
            var minutes = document.getElementById("plan-minutes");
            var topicOK = false;
            var minutesOK = false;
            if (topic.value === "java" || topic.value === "python" || topic.value === "web") {
                topicOK = showField(topic, "");
            } else {
                showField(topic, "Choose a programming topic.");
            }
            if (minutes.value === "10" || minutes.value === "15" || minutes.value === "25") {
                minutesOK = showField(minutes, "");
            } else {
                showField(minutes, "Choose 10, 15 or 25 minutes.");
            }
            if (!topicOK) { topic.focus(); return false; }
            if (!minutesOK) { minutes.focus(); return false; }
            plan.topic = topic.value;
            plan.minutes = minutes.value;
        }
        return true;
    }

    $("#plan-next").click(function () {
        if (step < 3 && checkStep()) showStep(step + 1, updateStep);
    });
    $("#plan-back").click(function () {
        if (step > 1) showStep(step - 1, updateStep);
    });
    $("#plan-name").keyup(function () {
        showField(this, getNameError(this.value));
    });
    $("#plan-topic, #plan-minutes").change(function () {
        showField(this, "");
    });

    function playSound() {
        if (!document.getElementById("sound-enabled").checked) {
            $("#sound-status").text("Sound is off.");
            return;
        }
        audio.pause();
        audio.currentTime = 0;
        var playback = audio.play();
        $("#sound-status").text("Playing the notification sound.");
        if (playback) {
            playback.catch(function (error) {
                if (error.name !== "AbortError") {
                    $("#sound-status").text("The browser could not play audio. Check sound permissions and try again.");
                }
            });
        }
    }

    $("#test-sound").click(function () { playSound(); });
    $("#sound-enabled").change(function () {
        audio.pause();
        audio.currentTime = 0;
        if (this.checked) $("#sound-status").text("Sound is on. Choose Preview sound to listen.");
        else $("#sound-status").text("Sound is off.");
    });
    audio.addEventListener("ended", function () {
        $("#sound-status").text("Sound finished. Ready for your next action.");
    });
    audio.addEventListener("error", function () {
        $("#sound-status").text("Audio could not be loaded. Keep the audio folder with the project.");
    });

    $("#practice-plan").submit(function (event) {
        event.preventDefault();
        if (step < 3) {
            if (checkStep()) showStep(step + 1, updateStep);
            return;
        }
        $("#plan-result-heading").text("Your next session is ready");
        $("#plan-result").text(plan.summary());
        for (var i = 0; i < topics.length; i++) {
            if (topics[i].category === plan.topic) $("#plan-quiz-link").attr("href", topics[i].link).show();
        }
        $(".plan-result-panel").addClass("completed").stop(true, true).css("opacity", 0.4).animate({ opacity: 1 }, 250);
        playSound();
    });

    document.getElementById("plan-reset").addEventListener("click", function () {
        document.getElementById("practice-plan").reset();
        plan.name = "";
        plan.topic = "";
        plan.minutes = "15";
        $("#practice-plan .is-invalid, #practice-plan .is-valid").removeClass("is-invalid is-valid").removeAttr("aria-invalid");
        $("#practice-plan .invalid-feedback").text("").hide();
        $("#plan-result-heading").text("Make time for one small win");
        $("#plan-result").text("Complete the three steps to create a plan for your next quiz.");
        $("#plan-quiz-link").hide().attr("href", "quiz.html");
        $(".plan-result-panel").removeClass("completed");
        audio.pause();
        audio.currentTime = 0;
        $("#sound-status").text("Plan reset. No sound is playing.");
        showStep(1, updateStep);
    });

    $(".study-thumb").click(function () {
        var source = $(this).attr("data-src");
        var description = $(this).attr("data-alt");
        var caption = $(this).attr("data-caption");
        $(".study-thumb").removeClass("selected").attr("aria-pressed", "false");
        $(this).addClass("selected").attr("aria-pressed", "true");
        $("#study-image").stop(true, true).fadeOut(120, function () {
            $(this).attr("src", source).attr("alt", description).fadeIn(160);
        });
        $("#study-caption").text(caption);
    });
    showStep(1, updateStep);
}
