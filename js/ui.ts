
class UI {

    constructor (private update: () => void) {
        document.querySelector(".content").addEventListener("click", this.update);
        document.querySelector(".choice-panel").addEventListener("click", this.update);
    }

    slideChoicesUp = () => {
        var content = document.querySelector(".content");
        content.classList.add("overlay");

        var panel = <HTMLElement>document.querySelector(".choice-panel");
        panel.style.top = "calc(100% - " + panel.offsetHeight + "px)";

        var text = <HTMLElement>document.querySelector(".content-text");
        text.style.marginBottom = panel.offsetHeight + "px";
    };

    slideChoicesDown = () => {
        var content = document.querySelector(".content");
        content.classList.remove("overlay");

        var panel = <HTMLElement>document.querySelector(".choice-panel");
        panel.style.top = "100%";

        var text = <HTMLElement>document.querySelector(".content-text");
        text.style.marginBottom = "0";
    };

    typeTitle = (text: string) => {
        var title = document.querySelector(".title span");
        title.textContent = text;
    };

    typeSection = (html: string) => {
        var content = document.querySelector(".content-text");
        var div = document.createElement("div");
        div.innerHTML = html;
        var section = <HTMLDivElement>div.firstChild;
        section.style.opacity = "0";
        content.appendChild(section);
        setTimeout(function() {
            section.style.opacity = "1";
            section.style.transition = "all 0.15s ease";
        }, 0);
    };

}
