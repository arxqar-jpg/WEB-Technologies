$(document).ready(function () {
    initScrollProgress();
    initCounters();
    initLazyImages();
    $(document).on("click", "[data-copy-target]", copyText);
});

function initScrollProgress() {
    function update() {
        var distance = $(document).height() - $(window).height();
        var percent = distance > 0 ? $(window).scrollTop() / distance * 100 : 0;
        percent = Math.max(0, Math.min(100, percent));
        $("#scroll-progress").css("width", percent + "%").attr("aria-valuenow", Math.round(percent));
    }
    $(window).on("scroll resize load", update);
    $(document).on("slid.bs.carousel shown.bs.collapse", update);
    update();
}

function initCounters() {
    function countVisible() {
        $(".number-counter").each(function () {
            var counter = $(this);
            if (counter.data("started") || counter.offset().top >= $(window).scrollTop() + $(window).height()) return;
            counter.data("started", true);
            var target = Number(counter.attr("data-count"));
            $({ value: 0 }).animate({ value: target }, {
                duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1200,
                step: function (value) { counter.text(Math.floor(value)); },
                complete: function () { counter.text(target); }
            });
        });
    }
    $(".number-counter").text("0");
    $(window).on("scroll resize", countVisible);
    countVisible();
}

function finishForm(form, boxId, message) {
    var target = $(form);
    if (target.data("submitting")) return;
    var button = target.find('button[type="submit"]');
    var label = button.html();
    target.data("submitting", true).attr("aria-busy", "true");
    button.prop("disabled", true).html('<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Please wait…');
    setTimeout(function () {
        completeForm(form, boxId, message);
        button.html(label).prop("disabled", false);
        target.data("submitting", false).removeAttr("aria-busy");
        showNotification("Form submitted successfully.");
    }, 1200);
}

function showNotification(message) {
    $("#action-toast").stop(true, true).text(message).prop("hidden", false).hide().fadeIn(150).delay(2400).fadeOut(250);
}

function highlightMatches(element, query) {
    if (!query) return;
    var expression = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    $(element).contents().each(function () {
        if (this.nodeType === 1) {
            if (!$(this).is("script, style, mark")) highlightMatches(this, query);
        } else if (this.nodeType === 3) {
            var text = this.nodeValue;
            var fragment = document.createDocumentFragment();
            var match;
            var start = 0;
            expression.lastIndex = 0;
            while ((match = expression.exec(text)) !== null) {
                fragment.appendChild(document.createTextNode(text.slice(start, match.index)));
                var mark = document.createElement("mark");
                mark.textContent = match[0];
                fragment.appendChild(mark);
                start = match.index + match[0].length;
            }
            if (start) {
                fragment.appendChild(document.createTextNode(text.slice(start)));
                this.parentNode.replaceChild(fragment, this);
            }
        }
    });
}

function resetCopyButton() {
    var button = document.getElementById("copy-plan");
    if (!button) return;
    clearTimeout($(button).data("copy-timer"));
    var tooltip = bootstrap.Tooltip.getInstance(button);
    if (tooltip) tooltip.hide();
    $(button).text("Copy plan");
}

function copyText() {
    var button = this;
    var text = $("#" + $(button).attr("data-copy-target")).text();
    function copied() {
        resetCopyButton();
        $(button).text("✓ Copied");
        var tooltip = bootstrap.Tooltip.getOrCreateInstance(button, { trigger: "manual", title: "Copied to clipboard!" });
        tooltip.show();
        showNotification("Copied to clipboard!");
        $(button).data("copy-timer", setTimeout(resetCopyButton, 2000));
    }
    function fallback() {
        var area = $("<textarea>").val(text).addClass("clipboard-buffer").appendTo("body");
        area[0].select();
        var success = false;
        try { success = document.execCommand("copy"); } catch (error) { success = false; }
        area.remove();
        button.focus();
        if (success) copied();
        else showNotification("Copy failed. Select the plan text and copy it.");
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(copied, fallback);
    else fallback();
}

function initLazyImages() {
    function loadVisible() {
        var top = $(window).scrollTop();
        var bottom = top + $(window).height();
        $("img.lazy-image[data-src]").each(function () {
            var image = $(this);
            var imageTop = image.offset().top;
            if (image.is(":visible") && imageTop < bottom && imageTop + image.outerHeight() > top) {
                image.attr("src", image.attr("data-src")).removeAttr("data-src").removeClass("lazy-image");
            }
        });
    }
    $(window).on("scroll resize load", loadVisible);
    $(document).on("slid.bs.carousel shown.bs.collapse", loadVisible);
    loadVisible();
}
