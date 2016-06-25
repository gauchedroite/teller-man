
class UI {
    sections: Array<string>;
    blurbOp: Op;

    constructor (private update: (op: Op, param?: any) => void) {
        let me = this;
        document.querySelector(".content").addEventListener("click", (e) => {
            me.update(me.blurbOp);
        });
    }

    onBlurbTap = (op: Op) => {
        this.blurbOp = op;
    };

    alert = (op: Op, text: string) => {
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
            me.update(op);
        });
    };

    showChoices = (op: Op, sceneChoices: Array<string>) => {
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
        let lis = document.querySelectorAll(".choice-panel li");
        const onChoice = (e: any) => {
            for (var i = 0; i < lis.length; i++) {
                lis[i].removeEventListener("click", onChoice);
            } 
            var target = <HTMLElement>e.target;
            var li: HTMLElement = target;
            while (true) {
                if (li.nodeName == "LI") break;
                li = li.parentElement;
            }
            var index = parseInt(li.getAttribute("data-index"));
            me.update(op, index);
        };
        for (var i = 0; i < lis.length; i++) {
            lis[i].addEventListener("click", onChoice);
        } 
    };

    hideChoices = () => {
        var content = <HTMLElement>document.querySelector(".content");
        content.classList.remove("overlay");
        content.style.pointerEvents = "auto";

        var panel = <HTMLElement>document.querySelector(".choice-panel");
        panel.style.top = "100%";

        var text = <HTMLElement>document.querySelector(".content-text");
        text.style.marginBottom = "0";
    };

    setTitle = (text: string) => {
        var title = document.querySelector(".title span");
        title.textContent = text;
    };

    addBlurb = (chunk: IMomentData) => {
        var html = this.markupChunk(chunk);
        var content = document.querySelector(".content-text");
        var div = document.createElement("div");
        div.innerHTML = html;
        var section = <HTMLDivElement>div.firstChild;
        var spans = section.querySelectorAll("span");
        section.style.opacity = "0";
        content.appendChild(section);
        setTimeout(function() {
            section.style.opacity = "1";
            section.style.transition = "all 0.15s ease";
            if (spans.length > 0) {
                var ispan = 0;
                const show = () => {
                    var span = <HTMLElement>spans[ispan++];
                    span.style = null;
                    if (ispan < spans.length) setTimeout(show, 25);
                };
                setTimeout(show, 100);
            }
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
                var spans = Array.prototype.map.call(line, function (char:any) {
                    return `<span style="visibility:hidden">${char}</span>`;
                })
                html.push(`<p>${spans.join("")}</p>`);
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
    };
}
