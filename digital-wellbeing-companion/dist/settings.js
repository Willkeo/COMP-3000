"use strict";
document.addEventListener("DOMContentLoaded", () => {
    const disablePopups = document.getElementById("disablePopupsToggle"); //declares the buttons from HTML
    const rememberLogin = document.getElementById("rememberLoginToggle");
    const backBtn = document.getElementById("backBtn");
    disablePopups.checked = localStorage.getItem("disablePopups") === "true"; //if the button is turned on
    rememberLogin.checked = localStorage.getItem("rememberLogin") === "true";
    disablePopups.addEventListener("change", () => {
        localStorage.setItem("disablePopups", String(disablePopups.checked));
    });
    rememberLogin.addEventListener("change", () => {
        localStorage.setItem("rememberLogin", String(rememberLogin.checked));
    });
    backBtn.addEventListener("click", () => {
        window.api.navigate("main.html");
    });
});
//# sourceMappingURL=settings.js.map