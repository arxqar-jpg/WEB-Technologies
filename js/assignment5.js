$(document).ready(function () {
    initMenuKeys();
    if (document.getElementById("practice-library")) initPracticeLibrary();
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

var practiceTopics = [
    { category: "java", title: "Java foundations", description: "Review score updates, loops and Java classes.", link: "quiz.html#java", questions: 3 },
    { category: "python", title: "Python essentials", description: "Practise lists, functions and Python loops.", link: "quiz.html#python", questions: 3 },
    { category: "web", title: "HTML & CSS", description: "Review forms, CSS selectors and responsive grids.", link: "quiz.html#htmlcss", questions: 3 }
];

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


function initPracticeLibrary() {
    var topics = practiceTopics;
    var currentCategory = "all";
    function matchesCategory(topic) {
        return currentCategory === "all" || topic.category === currentCategory;
    }

    function renderTopics(category) {
        currentCategory = category;
        var query = $("#topic-search").val().trim().toLowerCase();
        var visibleTopics = topics.filter(function (topic) {
            return matchesCategory(topic) &&
                (topic.title + " " + topic.description).toLowerCase().indexOf(query) !== -1;
        });
        var container = $("#practice-topics");
        container.html("");
        for (var i = 0; i < visibleTopics.length; i++) {
            var topic = visibleTopics[i];
            container.append(
                '<div class="col-12 col-md-4"><article class="topic-card card h-100 p-3 p-lg-4">' +
                '<div class="topic-heading"><span class="language-icon language-' + topic.category + '" aria-hidden="true">' + (topic.category === "java" ? "Jv" : topic.category === "python" ? "Py" : "&lt;/&gt;") + '</span><h3 class="m-0">' + topic.title + '</h3></div>' +
                '<p class="topic-description mt-3 mb-3">' + topic.description + '</p>' +
                '<p class="topic-meta mb-0"><span>' + topic.questions + ' questions</span><span>Beginner</span></p>' +
                '<a class="btn btn-primary topic-start" href="' + topic.link + '">Start quiz <span aria-hidden="true">→</span></a>' +
                '</article></div>'
            );
        }
        if (visibleTopics.length === 0) {
            container.append('<p class="text-secondary" role="status">No matching topics. Try another search or category.</p>');
        }
        $("#topic-count").text(topicTitle(category) + " / " + visibleTopics.length + " available");
        highlightMatches(container[0], query);
        $(window).trigger("resize");
    }

    $(".topic-filter").on("click", function () {
        $(".topic-filter").removeClass("active").attr("aria-pressed", "false");
        $(this).addClass("active").attr("aria-pressed", "true");
        renderTopics($(this).attr("data-category"));
        closeSuggestions();
    });
    renderTopics("all");

    function closeSuggestions() {
        $("#topic-suggestions").empty().prop("hidden", true);
        $("#topic-search").attr("aria-expanded", "false").removeAttr("aria-activedescendant");
    }

    function showSuggestions() {
        var query = $("#topic-search").val().trim().toLowerCase();
        closeSuggestions();
        if (!query) return;
        var list = $("#topic-suggestions");
        for (var i = 0; i < topics.length; i++) {
            var topic = topics[i];
            if (matchesCategory(topic) && (topic.title + " " + topic.description).toLowerCase().indexOf(query) !== -1) {
                var option = $("<li>", { role: "option", id: "topic-option-" + i, "aria-selected": "false" });
                $("<button>", { type: "button", class: "list-group-item list-group-item-action", tabindex: -1 }).text(topic.title).appendTo(option);
                list.append(option);
            }
        }
        if (list.children().length) {
            list.prop("hidden", false);
            $("#topic-search").attr("aria-expanded", "true");
        }
    }

    $("#topic-search").on("input", function () {
        renderTopics(currentCategory);
        showSuggestions();
    }).on("focus", showSuggestions).on("keydown", function (event) {
        var options = $("#topic-suggestions [role=option]");
        var current = options.index(options.filter('[aria-selected="true"]'));
        if (event.key === "Escape") { event.preventDefault(); closeSuggestions(); return; }
        if (event.key === "Tab") { closeSuggestions(); return; }
        if (!options.length) return;
        if (event.key === "Enter") {
            event.preventDefault();
            if (current >= 0) options.eq(current).find("button").trigger("click");
            else closeSuggestions();
        } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            current = event.key === "ArrowDown" ? (current + 1) % options.length : (current <= 0 ? options.length - 1 : current - 1);
            options.attr("aria-selected", "false").find("button").removeClass("active");
            options.eq(current).attr("aria-selected", "true").find("button").addClass("active");
            $(this).attr("aria-activedescendant", options.eq(current).attr("id"));
        }
    });
    $("#topic-suggestions").on("mousedown", "button", function (event) { event.preventDefault(); });
    $("#topic-suggestions").on("click", "button", function () {
        $("#topic-search").val($(this).text());
        renderTopics(currentCategory);
        closeSuggestions();
        $("#topic-search").trigger("focus");
        closeSuggestions();
    });
    $(document).on("click", function (event) {
        if (!$(event.target).closest(".topic-search").length) closeSuggestions();
    });


}

function initStudyLab() {
    var topics = practiceTopics;
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

    $("#plan-next").on("click", function () {
        if (step < 3 && checkStep()) showStep(step + 1, updateStep);
    });
    $("#plan-back").on("click", function () {
        if (step > 1) showStep(step - 1, updateStep);
    });
    $("#plan-name").on("keyup", function () {
        showField(this, getNameError(this.value));
    });
    $("#plan-topic, #plan-minutes").on("change", function () {
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

    $("#test-sound").on("click", function () { playSound(); });
    $("#sound-enabled").on("change", function () {
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

    $("#practice-plan").on("submit", function (event) {
        event.preventDefault();
        if (step < 3) {
            if (checkStep()) showStep(step + 1, updateStep);
            return;
        }
        resetCopyButton();
        $("#copy-plan").prop("hidden", false);
        $("#plan-result-heading").text("Your next session is ready");
        $("#plan-result").text(plan.summary());
        for (var i = 0; i < topics.length; i++) {
            if (topics[i].category === plan.topic) $("#plan-quiz-link").attr("href", topics[i].link).show();
        }
        $(".plan-result-panel").addClass("completed").stop(true, true).css("opacity", 0.4).animate({ opacity: 1 }, 250);
        playSound();
    });

    document.getElementById("plan-reset").addEventListener("click", function () {
        resetCopyButton();
        $("#copy-plan").prop("hidden", true);
        document.getElementById("practice-plan").reset();
        plan.name = "";
        plan.topic = "";
        plan.minutes = "15";
        $("#practice-plan .is-invalid, #practice-plan .is-valid").removeClass("is-invalid is-valid").removeAttr("aria-invalid");
        $("#practice-plan .invalid-feedback").text("").hide();
        $("#plan-result-heading").text("Your practice plan");
        $("#plan-result").text("Complete the three steps to create a plan for your next quiz.");
        $("#plan-quiz-link").hide().attr("href", "quiz.html");
        $(".plan-result-panel").removeClass("completed");
        audio.pause();
        audio.currentTime = 0;
        $("#sound-status").text("Plan reset. No sound is playing.");
        showStep(1, updateStep);
    });

    $(".study-thumb").on("click", function () {
        var source = $(this).attr("data-src");
        var description = $(this).attr("data-alt");
        var caption = $(this).attr("data-caption");
        $(".study-thumb").removeClass("selected").attr("aria-pressed", "false");
        $(this).addClass("selected").attr("aria-pressed", "true");
        $("#study-image").stop(true, true).fadeOut(120, function () {
            $(this).attr("src", source).attr("alt", description).removeAttr("data-src").removeClass("lazy-image").fadeIn(160);
        });
        $("#study-caption").text(caption);
    });
    showStep(1, updateStep);
}
