
class UI {
    sections: Array<string>;

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

    typeSection = (chunk: IMomentData) => {
        var html = this.markupChunk(chunk);
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

    private markupChunk = (chunk: IMomentData): string => {
        let dialog = <IDialog>chunk;
        let html = Array<string>();

        if (dialog.actor != undefined) {
            html.push(`<section class="dialog">`);
            html.push(`<h1>${dialog.actor}</h1>`);

            if (dialog.parenthetical != undefined)
                html.push(`<h2>${dialog.parenthetical}</h2>`);

            for (var line of dialog.lines) {
                html.push(`<p>${line}</p>`);
            }
            html.push(`</section>`);
        }
        else {
            html.push(`<section class="text">`);
            for (var line of dialog.lines) {
                html.push(`<p>${line}</p>`);
            }
            html.push(`</section>`);
        }

        return html.join("");
    }

}
