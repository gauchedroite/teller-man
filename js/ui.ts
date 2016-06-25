
class UI {
    sections: Array<string>;
    blurbMode: string;

    constructor (private update: (mode: string, param?: any) => void) {
        let me = this;
        document.querySelector(".content").addEventListener("click", (e) => {
            me.update(me.blurbMode);
        });
    }

    onBlurbTap = (mode: string) => {
        this.blurbMode = mode;
    };

    alert = (mode: string, text: string) => {
        let content = <HTMLElement>document.querySelector(".content");
        content.classList.add("overlay");
        content.style.pointerEvents = "none";

        let panel = <HTMLElement>document.querySelector(".modal-inner p");
        panel.innerHTML = text;

        let modal = <HTMLElement>document.querySelector(".modal");
        modal.classList.add("show");

        let me = this;
        modal.addEventListener("click", function onClick(e) {
            modal.removeEventListener("click", onClick);
            me.update(mode);
        });
    };

    slideChoicesUp = (mode: string, sceneChoices: Array<string>) => {
        let panel = <HTMLElement>document.querySelector(".choice-panel");
        panel.innerHTML = "";
        let ul = document.createElement("ul");
        for (var i = 0; i < sceneChoices.length; i++) {
            let choice = sceneChoices[i];
            let li = <HTMLLIElement>document.createElement("li");
            li.setAttribute("data-index", i.toString());
            li.innerHTML = `
                <div class="kind"><div><i class="icon ion-ios-location"></i></div></div>
                <div class="choice">${choice}</div>`;
            ul.appendChild(li);
        }
        panel.appendChild(ul);

        let content = <HTMLElement>document.querySelector(".content");
        content.classList.add("overlay");
        content.style.pointerEvents = "none";

        panel.style.top = "calc(100% - " + panel.offsetHeight + "px)";

        let text = <HTMLElement>document.querySelector(".content-text");
        text.style.marginBottom = panel.offsetHeight + "px";

        let me = this;
        document.querySelector(".choice-panel li").addEventListener("click", function onChoice(e) {
            document.querySelector(".choice-panel li").removeEventListener("click", onChoice);
            var target = <HTMLElement>e.target;
            var li: HTMLElement = target;
            while (true) {
                if (li.nodeName == "LI") break;
                li = li.parentElement;
            }
            var index = parseInt( li.getAttribute("data-index"));
            me.update(mode, index);
        });
    };

    slideChoicesDown = () => {
        var content = <HTMLElement>document.querySelector(".content");
        content.classList.remove("overlay");
        content.style.pointerEvents = "auto";

        var panel = <HTMLElement>document.querySelector(".choice-panel");
        panel.style.top = "100%";

        var text = <HTMLElement>document.querySelector(".content-text");
        text.style.marginBottom = "0";
    };

    typeTitle = (text: string) => {
        var title = document.querySelector(".title span");
        title.textContent = text;
    };

    typeBlurb = (chunk: IMomentData) => {
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

    clearBlurb = () => {
        var content = document.querySelector(".content-text");
        content.innerHTML = "";
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
