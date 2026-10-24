
document.addEventListener("DOMContentLoaded", function () {
    initClock();
    initTheme();
    initModal();
    initRegistration();
    initNewsletter();
    initFAQ();
    initContact();
    initQuiz("java", ["class", "main()", ";"]);
    initQuiz("python", ["def", "print()", ".py"]);
    initQuiz("html", ["HyperText Markup Language", "<p>", "Styling"]);
});
function initClock() {
    var clock = document.getElementById("current-date-time");
    if (!clock) return;

    function updateClock() {
        var now = new Date();
        clock.textContent = now.toLocaleString("en-US");
        clock.dateTime = now.toISOString();
    }

    updateClock();
    setInterval(updateClock, 1000);
}
function initTheme() {
    var button = document.getElementById("btn-change-bg");
    var colours = ["#edf4f8", "#e8f7f1", "#fff5e5", "#f0edfa", "#ffffff"];
    var index = 0;
    if (!button) return;

    document.body.style.backgroundColor = colours[index];

    button.onclick = function () {
        index++;
        if (index === colours.length) index = 0;
        document.body.style.backgroundColor = colours[index];
    };
}
function initModal() {
    var modal = document.getElementById("custom-modal-overlay");
    if (!modal) return;

    var openButtons = document.querySelectorAll(".trigger-modal-btn");
    var tabs = modal.querySelectorAll(".modal-tab-btn");
    var panels = modal.querySelectorAll(".modal-tab-content");
    var previousButton = null;

    function showTab(name) {
        for (var i = 0; i < tabs.length; i++) {
            if (tabs[i].getAttribute("data-tab") === name) {
                tabs[i].classList.add("active");
                tabs[i].setAttribute("aria-selected", "true");
                tabs[i].tabIndex = 0;
            } else {
                tabs[i].classList.remove("active");
                tabs[i].setAttribute("aria-selected", "false");
                tabs[i].tabIndex = -1;
            }
        }

        for (var j = 0; j < panels.length; j++) {
            if (panels[j].id === "tab-" + name) {
                panels[j].hidden = false;
                panels[j].classList.add("active");
            } else {
                panels[j].hidden = true;
                panels[j].classList.remove("active");
            }
        }
    }

    function closeModal() {
        modal.classList.remove("active");
        document.body.classList.remove("modal-open");
        if (previousButton) previousButton.focus();
        modal.setAttribute("aria-hidden", "true");
        modal.setAttribute("inert", "");
    }

    for (var i = 0; i < openButtons.length; i++) {
        openButtons[i].onclick = function (event) {
            event.preventDefault();
            previousButton = this;
            var name = this.getAttribute("data-modal-tab");
            if (!name) name = "register";
            showTab(name);
            modal.removeAttribute("inert");
            modal.setAttribute("aria-hidden", "false");
            modal.classList.add("active");
            document.body.classList.add("modal-open");
            modal.querySelector(".modal-tab-content.active input").focus();
        };
    }

    for (var j = 0; j < tabs.length; j++) {
        tabs[j].onclick = function () {
            showTab(this.getAttribute("data-tab"));
        };
    }

    document.getElementById("modal-close-btn").onclick = closeModal;
    modal.onclick = function (event) {
        if (event.target === modal) closeModal();
    };

    document.addEventListener("keydown", function (event) {
        if (!modal.classList.contains("active")) return;
        if (event.key === "Escape") closeModal();
        if (event.key === "Tab") {
            var controls = modal.querySelectorAll("button, input");
            var visible = [];
            for (var k = 0; k < controls.length; k++) {
                if (controls[k].offsetParent !== null && controls[k].tabIndex >= 0) {
                    visible.push(controls[k]);
                }
            }
            if (visible.length === 0) return;
            var first = visible[0];
            var last = visible[visible.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    });
}
function initFAQ() {
    var buttons = document.querySelectorAll(".custom-accordion-header");

    function setAnswer(button, open) {
        var item = button.parentElement;
        var answer = item.querySelector(".custom-accordion-content");
        if (open) {
            item.classList.add("active");
            button.setAttribute("aria-expanded", "true");
            answer.setAttribute("aria-hidden", "false");
            answer.removeAttribute("inert");
            answer.style.maxHeight = answer.scrollHeight + "px";
        } else {
            item.classList.remove("active");
            button.setAttribute("aria-expanded", "false");
            answer.setAttribute("aria-hidden", "true");
            answer.setAttribute("inert", "");
            answer.style.maxHeight = "0px";
        }
    }

    for (var i = 0; i < buttons.length; i++) {
        setAnswer(buttons[i], false);
        buttons[i].onclick = function () {
            var wasOpen = this.getAttribute("aria-expanded") === "true";
            for (var j = 0; j < buttons.length; j++) {
                setAnswer(buttons[j], false);
            }
            if (!wasOpen) setAnswer(this, true);
        };
    }

    window.addEventListener("resize", function () {
        for (var j = 0; j < buttons.length; j++) {
            if (buttons[j].getAttribute("aria-expanded") === "true") {
                setAnswer(buttons[j], true);
            }
        }
    });
}
function showField(input, message) {
    var error = document.getElementById("err-" + input.id);
    error.textContent = message;
    if (message !== "") {
        input.classList.add("is-invalid");
        input.classList.remove("is-valid");
        input.setAttribute("aria-invalid", "true");
        error.style.display = "block";
        return false;
    }
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
    input.setAttribute("aria-invalid", "false");
    error.style.display = "none";
    return true;
}

function finishForm(form, boxId, message) {
    form.reset();
    var inputs = form.querySelectorAll("input, textarea");
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].classList.remove("is-valid", "is-invalid");
        inputs[i].removeAttribute("aria-invalid");
    }
    var errors = form.querySelectorAll(".error-msg, .invalid-feedback");
    for (var j = 0; j < errors.length; j++) {
        errors[j].textContent = "";
        errors[j].style.display = "none";
    }
    var box = document.getElementById(boxId);
    box.className = "alert alert-success mt-3";
    box.textContent = message;
}

function getNameError(value) {
    var name = value.trim().toLowerCase();
    var letters = "abcdefghijklmnopqrstuvwxyzабвгдеёжзийклмнопрстуфхцчшщъыьэюяәіңғүұқөһ";
    var count = 0;
    for (var i = 0; i < name.length; i++) {
        if (letters.indexOf(name[i]) !== -1) {
            count++;
        } else if (name[i] !== " " && name[i] !== "-" && name[i] !== "'" && name[i] !== "’") {
            return "Use letters, spaces, apostrophes or hyphens.";
        }
    }
    if (count < 2) return "Enter your name (at least two letters).";
    return "";
}

function getEmailError(value) {
    var email = value.trim().toLowerCase();
    var parts = email.split("@");
    if (email === "") return "Email is required.";
    if (parts.length !== 2 || email.length > 254) return "Enter a valid email address.";
    var local = parts[0];
    var domain = parts[1];
    var labels = domain.split(".");
    var localChars = "abcdefghijklmnopqrstuvwxyz0123456789.!#$%&'*+/=?^_`{|}~-";
    var domainChars = "abcdefghijklmnopqrstuvwxyz0123456789-";
    var letters = "abcdefghijklmnopqrstuvwxyz";

    if (local.length === 0 || local.length > 64 || labels.length < 2) return "Check the email format.";
    if (local[0] === "." || local[local.length - 1] === "." || email.indexOf("..") !== -1) return "Check the dots in your email.";
    for (var i = 0; i < local.length; i++) {
        if (localChars.indexOf(local[i]) === -1) return "Email contains an invalid character.";
    }
    for (var j = 0; j < labels.length; j++) {
        var label = labels[j];
        if (label.length === 0 || label.length > 63 || label[0] === "-" || label[label.length - 1] === "-") {
            return "Check the email domain.";
        }
        for (var k = 0; k < label.length; k++) {
            if (domainChars.indexOf(label[k]) === -1) return "Check the email domain.";
        }
    }
    var ending = labels[labels.length - 1];
    if (ending.length < 2) return "Check the email ending, such as .com or .kz.";
    for (var n = 0; n < ending.length; n++) {
        if (letters.indexOf(ending[n]) === -1) return "Check the email ending.";
    }

    var blockedDomains = ["example.com", "example.org", "example.net", "example.edu", "test.com", "fake.com", "domain.tld", "mailinator.com", "guerrillamail.com", "guerrillamail.net", "guerrillamail.org", "sharklasers.com", "grr.la", "10minutemail.com", "10minutemail.net", "tempmail.com", "temp-mail.org", "temp-mail.io", "yopmail.com", "yopmail.fr", "getnada.com", "dispostable.com", "throwawaymail.com", "trashmail.com", "maildrop.cc", "mohmal.com"];
    var blockedNames = ["test", "fake", "dummy", "asdf", "qwerty", "example", "123"];
    var blockedEndings = ["invalid", "test", "localhost", "example"];
    var baseDomain = labels[labels.length - 2] + "." + ending;
    var localName = local.split("+")[0];
    if (blockedDomains.indexOf(baseDomain) !== -1 || blockedNames.indexOf(localName) !== -1 || blockedEndings.indexOf(ending) !== -1) {
        return "Use your own email. Dummy and known temporary addresses are not accepted.";
    }
    var wrongDomains = ["gmial.com", "gmai.com", "gmail.con", "gmail.cmo", "gmal.com", "outlok.com", "hotmial.com", "yahoo.con"];
    if (wrongDomains.indexOf(domain) !== -1) return "Check your email provider spelling.";
    return "";
}

function hasWhitespace(value) {
    var forbidden = [" ", "\t", "\n", "\r", "\v", "\f", "\u00a0", "\u1680", "\u2000", "\u2001", "\u2002", "\u2003", "\u2004", "\u2005", "\u2006", "\u2007", "\u2008", "\u2009", "\u200a", "\u200b", "\u200c", "\u200d", "\u2028", "\u2029", "\u202f", "\u205f", "\u2060", "\u3000", "\ufeff"];
    for (var i = 0; i < value.length; i++) {
        if (forbidden.indexOf(value[i]) !== -1) return true;
    }
    return false;
}

function getPasswordError(value) {
    if (value === "") return "Password is required.";
    if (hasWhitespace(value)) return "Password cannot contain spaces or invisible characters.";
    if (value.length < 8) return "Password must be at least 8 characters long.";
    var letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZабвгдеёжзийклмнопрстуфхцчшщъыьэюяәіңғүұқөһАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯӘІҢҒҮҰҚӨҺ";
    var digits = "0123456789";
    var hasLetter = false;
    var hasNumber = false;
    for (var i = 0; i < value.length; i++) {
        if (letters.indexOf(value[i]) !== -1) hasLetter = true;
        if (digits.indexOf(value[i]) !== -1) hasNumber = true;
    }
    if (!hasLetter || !hasNumber) return "Use at least one letter and one number.";
    return "";
}
function initRegistration() {
    var form = document.getElementById("registration-form");
    if (!form) return;
    var name = document.getElementById("reg-name");
    var email = document.getElementById("reg-email");
    var password = document.getElementById("reg-password");
    var confirm = document.getElementById("reg-confirm-password");
    var terms = document.getElementById("reg-terms");
    var success = document.getElementById("reg-success-message");

    function checkConfirmation() {
        if (confirm.value === "") return showField(confirm, "Confirm your password.");
        if (confirm.value !== password.value) return showField(confirm, "Passwords do not match.");
        return showField(confirm, getPasswordError(confirm.value));
    }

    name.oninput = function () { showField(name, getNameError(name.value)); };
    email.oninput = function () { showField(email, getEmailError(email.value)); };
    password.oninput = function () {
        showField(password, getPasswordError(password.value));
        if (confirm.value !== "") checkConfirmation();
    };
    confirm.oninput = checkConfirmation;
    terms.onchange = function () {
        if (terms.checked) showField(terms, "");
        else showField(terms, "Please accept the terms.");
    };
    form.addEventListener("input", function () { success.classList.add("d-none"); });

    var passwordFields = [password, confirm];
    for (var i = 0; i < passwordFields.length; i++) {
        passwordFields[i].onbeforeinput = function (event) {
            if (event.data && hasWhitespace(event.data)) {
                event.preventDefault();
                showField(this, "Spaces and invisible characters are not allowed.");
            }
        };
        passwordFields[i].onpaste = function (event) {
            if (hasWhitespace(event.clipboardData.getData("text"))) {
                event.preventDefault();
                showField(this, "Do not paste a password with spaces.");
            }
        };
        passwordFields[i].ondrop = function (event) {
            if (hasWhitespace(event.dataTransfer.getData("text"))) {
                event.preventDefault();
                showField(this, "Do not drop a password with spaces.");
            }
        };
    }

    form.onsubmit = function (event) {
        event.preventDefault();
        var nameOK = showField(name, getNameError(name.value));
        var emailOK = showField(email, getEmailError(email.value));
        var passwordOK = showField(password, getPasswordError(password.value));
        var confirmOK = checkConfirmation();
        var termsOK = false;
        if (terms.checked) termsOK = showField(terms, "");
        else showField(terms, "Please accept the terms.");

        if (nameOK && emailOK && passwordOK && confirmOK && termsOK) {
            finishForm(form, "reg-success-message", "Welcome, " + name.value.trim() + "! Your details passed validation. This is a demo; no account is created.");
        } else {
            form.querySelector(".is-invalid").focus();
        }
    };
}

function initNewsletter() {
    var form = document.getElementById("quick-subscribe-form");
    if (!form) return;
    var email = document.getElementById("sub-email");
    email.oninput = function () {
        document.getElementById("sub-success-message").classList.add("d-none");
        showField(email, getEmailError(email.value));
    };
    form.onsubmit = function (event) {
        event.preventDefault();
        if (showField(email, getEmailError(email.value))) {
            finishForm(form, "sub-success-message", "Your email passed validation. This demo does not send newsletters.");
        } else email.focus();
    };
}

function initContact() {
    var form = document.getElementById("contact-form");
    if (!form) return;
    var name = document.getElementById("user-name");
    var email = document.getElementById("user-email");
    var message = document.getElementById("user-message");
    var consent = document.getElementById("contact-consent");

    name.oninput = function () { showField(name, getNameError(name.value)); };
    email.oninput = function () { showField(email, getEmailError(email.value)); };
    message.oninput = function () {
        if (message.value.trim().length < 10) showField(message, "Write at least 10 characters.");
        else showField(message, "");
    };
    consent.onchange = function () {
        if (consent.checked) showField(consent, "");
        else showField(consent, "Please give your consent.");
    };
    form.addEventListener("input", function () {
        document.getElementById("contact-feedback").classList.add("d-none");
    });

    form.onsubmit = function (event) {
        event.preventDefault();
        var nameOK = showField(name, getNameError(name.value));
        var emailOK = showField(email, getEmailError(email.value));
        var messageOK = false;
        var consentOK = false;
        if (message.value.trim().length >= 10) messageOK = showField(message, "");
        else showField(message, "Write at least 10 characters.");
        if (consent.checked) consentOK = showField(consent, "");
        else showField(consent, "Please give your consent.");

        if (nameOK && emailOK && messageOK && consentOK) {
            finishForm(form, "contact-feedback", "Thank you, " + name.value.trim() + "! Your message passed validation. This demo does not send messages.");
        } else form.querySelector(".is-invalid").focus();
    };
}
function initQuiz(language, answers) {
    var form = document.getElementById(language + "-quiz-form");
    var result = document.getElementById(language + "-quiz-result");
    if (!form || !result) return;

    function clearHighlights() {
        var labels = form.querySelectorAll("label");
        for (var i = 0; i < labels.length; i++) {
            labels[i].classList.remove("text-success", "text-danger", "fw-bold");
        }
    }

    form.onchange = function () {
        result.textContent = "";
        result.className = "";
        clearHighlights();
    };

    form.onsubmit = function (event) {
        event.preventDefault();
        clearHighlights();
        var selected = [];
        var score = 0;

        for (var i = 0; i < answers.length; i++) {
            var input = form.querySelector('input[name="' + language + (i + 1) + '"]:checked');
            if (!input) {
                result.className = "alert alert-warning mt-3";
                result.textContent = "Please answer all questions before submitting.";
                form.querySelector('input[name="' + language + (i + 1) + '"]').focus();
                return;
            }
            selected.push(input);
        }

        for (var j = 0; j < answers.length; j++) {
            if (selected[j].value === answers[j]) {
                score++;
                selected[j].parentElement.classList.add("text-success", "fw-bold");
            } else {
                selected[j].parentElement.classList.add("text-danger", "fw-bold");
            }
        }

        var percentage = Math.floor(score / answers.length * 100 + 0.5);
        var feedback = "Keep practicing!";
        result.className = "alert alert-danger mt-3";
        if (score === answers.length) {
            feedback = "Perfect score!";
            result.className = "alert alert-success mt-3";
        } else if (score >= 2) {
            feedback = "Good job!";
            result.className = "alert alert-info mt-3";
        }
        result.textContent = feedback + " You scored " + score + " out of " + answers.length + " (" + percentage + "%).";
    };
}
