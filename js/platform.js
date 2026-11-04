$(document).ready(function () {
    $("details.platform-resources").on("toggle", function () { $(window).trigger("resize"); });
    if (!document.querySelector(".quiz-workspace")) return;
    function updateAnswered() {
        var active = document.querySelector(".quiz-panel:not([hidden]) form");
        if (active) $("#quiz-answer-count").text($(active).find("input:checked").length + " / 3");
    }
    function selectTopic() {
        var topic = location.hash.slice(1);
        if (topic !== "java" && topic !== "python" && topic !== "htmlcss") topic = "java";
        $(".quiz-panel").prop("hidden", true);
        $("#" + topic).prop("hidden", false);
        $("[data-quiz-topic]").removeClass("active").attr("aria-selected", "false");
        $('[data-quiz-topic="' + topic + '"]').addClass("active").attr("aria-selected", "true");
        updateAnswered();
        $(window).trigger("resize");
        window.requestAnimationFrame(function () { window.scrollTo(0, 0); });
    }
    $(window).on("hashchange", selectTopic);
    $(".quiz-panel form").on("change", updateAnswered);
    $("[data-quiz-topic]").on("click", function () {
        if (location.hash === "#" + $(this).attr("data-quiz-topic")) selectTopic();
    }).on("keydown", function (event) {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        var tabs = $("[data-quiz-topic]");
        var index = (tabs.index(this) + (event.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
        tabs.eq(index)[0].focus();
        location.hash = tabs.eq(index).attr("data-quiz-topic");
    });
    selectTopic();
});
