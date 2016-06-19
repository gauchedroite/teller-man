
class Game {
    constructor() {
        document.querySelector(".content").addEventListener("click", this.slideupChoices);
        document.querySelector(".choice-panel").addEventListener("click", this.slidedownChoices);
    }

    slideupChoices = () => {
        var content = document.querySelector(".content");
        content.classList.add("overlay");

        var panel = <HTMLElement>document.querySelector(".choice-panel");
        panel.style.top = "calc(100% - " + panel.offsetHeight + "px)";

        var text = <HTMLElement>document.querySelector(".content-text");
        text.style.marginBottom = panel.offsetHeight + "px";
    };

    slidedownChoices = () => {
        var content = document.querySelector(".content");
        content.classList.remove("overlay");

        var panel = <HTMLElement>document.querySelector(".choice-panel");
        panel.style.top = "100%";

        var text = <HTMLElement>document.querySelector(".content-text");
        text.style.marginBottom = "0";
    };
}
