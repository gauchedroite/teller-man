enum CKind {
    scene,
    action,
    messageTo,
    messageFrom
}

interface IChoice {
    kind: CKind
    id: number
    text: string
    subtext?: string
}

class UI {
    sections: Array<string>;
    blurbOp: Op;

    constructor (private update: (op: Op, param?: any) => void, opmenu: Op, skipMenu: boolean, menuPage: string, ready: () => void) {
        document.querySelector(".content").addEventListener("click", (e) => {
            this.update(this.blurbOp);
        });

        document.querySelector(".goto-menu").addEventListener("click", (e) => {
            e.stopPropagation();
            this.update(opmenu);
        });

        if (document.querySelector("body").classList.contains("landscape")) {
            var navbar = <HTMLDivElement>document.querySelector(".navbar"); 
            var shell = <HTMLDivElement>document.querySelector(".shell"); 
            navbar.addEventListener("click", (e) => {
                if (shell.classList.contains("retracted"))
                    shell.classList.remove("retracted");
                else
                    shell.classList.add("retracted");
            });
        }

        if ("addEventListener" in document) {
            document.addEventListener("DOMContentLoaded", function() {
                FastClick.attach(document.body);
            }, false);
        }

        localStorage.setItem("ding", null);
        window.addEventListener("storage", function done(e: StorageEvent) {
            if (e.key == "ding" && (JSON.parse(e.newValue).menu == "ready")) {
                window.removeEventListener("storage", done);
                var preloader = <HTMLDivElement>document.querySelector(".preloader");
                setTimeout(() => { 
                    preloader.style.opacity = "0";
                    preloader.addEventListener("transitionend", function done() {
                        preloader.style.display = "none";
                        preloader.removeEventListener("transitionend", done);
                    });
                }, 750);
                setTimeout(ready, 0);
            }
        });

        var menuUrl = `dist/game/${menuPage}`;
        document.querySelector(".menu iframe").setAttribute("src", menuUrl);
    }

    onBlurbTap = (op: Op) => {
        this.blurbOp = op;
    };

    alert = (op: Op, text: string) => {
        let content = <HTMLElement>document.querySelector(".content");
        content.classList.add("overlay");
        content.style.pointerEvents = "none";

        let panel = <HTMLElement>document.querySelector(".modal-inner");
        panel.innerHTML = "<p>" + text + "</p>";

        let modal = <HTMLElement>document.querySelector(".modal");
        modal.classList.add("show");

        let me = this;
        modal.addEventListener("click", function click(e) {
            modal.removeEventListener("click", click);
            modal.classList.remove("show");
            setTimeout(function() { 
                content.classList.remove("overlay");
                content.style.pointerEvents = "";
                me.update(op); 
            }, 250);
        });
    };

    showChoices = (op: Op, sceneChoices: Array<IChoice>) => {
        let panel = <HTMLElement>document.querySelector(".choice-panel");
        panel.innerHTML = "";
        let ul = document.createElement("ul");
        for (var i = 0; i < sceneChoices.length; i++) {
            let choice = sceneChoices[i];

            var icon: string = "ion-ios-location";
            if (choice.kind == CKind.action) icon = "ion-flash";
            if (choice.kind == CKind.messageTo) icon = "ion-android-person";
            if (choice.kind == CKind.messageFrom) icon = "ion-chatbubble-working";

            let li = <HTMLLIElement>document.createElement("li");
            li.setAttribute("data-kind", choice.kind.toString());
            li.setAttribute("data-id", choice.id.toString());
            let html = `
                <div class="kind"><div><i class="icon ${icon}"></i></div></div>
                <div class="choice">${choice.text}</div>`;
            if (choice.subtext != undefined) {
                html = `${html}<div class="choice subtext">${choice.subtext}</div>`;                
            }
            li.innerHTML = html;
            ul.appendChild(li);
        }
        panel.appendChild(ul);

        let content = <HTMLElement>document.querySelector(".content");
        content.classList.add("overlay");

        panel.style.top = "calc(100% - " + panel.offsetHeight + "px)";

        let text = <HTMLElement>document.querySelector(".content-inner");
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
            me.update(op, <IChoice> {
                kind: parseInt(li.getAttribute("data-kind")),
                id: parseInt(li.getAttribute("data-id")),
                text: ""
            });
        };
        for (var i = 0; i < lis.length; i++) {
            lis[i].addEventListener("click", onChoice);
        } 
    };

    hideChoices = () => {
        var content = <HTMLElement>document.querySelector(".content");
        content.classList.remove("overlay");
        content.style.pointerEvents = "auto";

        // make sure the first blurb will be visible
        let shell = <HTMLElement>document.querySelector(".shell");
        shell.scrollTop = content.offsetTop;

        var panel = <HTMLElement>document.querySelector(".choice-panel");
        panel.style.top = "100%";

        var text = <HTMLElement>document.querySelector(".content-inner");
        text.style.marginBottom = "0";
    };

    __obsolete__initScene = (data: ISceneData) => {
        var title = document.querySelector(".title span");
        title.textContent = data.title;

        var back = <HTMLDivElement>document.querySelector(".graphics .back");
        var front = <HTMLDivElement>document.querySelector(".graphics .front");

        if (front.style.backgroundImage.indexOf(`dist/assets/${data.image}`) == -1) {
            back.style.backgroundImage = front.style.backgroundImage;
            back.classList.add("loading");
            front.style.opacity = "0";
            var assetName = `dist/assets/${data.image}`;
            var image = new Image();
            image.onload = () => {
                back.classList.remove("loading");
                front.style.backgroundImage = `url(${assetName})`;
                front.style.opacity = "1";
            };
            setTimeout(() => { image.src = assetName; }, 200);
        }
    };

    initScene = (data: ISceneData) => {
        var title = document.querySelector(".title span");
        title.textContent = data.title;

        var inner = <HTMLDivElement>document.querySelector(".graphics-inner");
        var zero = <HTMLDivElement>inner.children[0];
        var one = <HTMLDivElement>inner.children[1];
        var back = (zero.style.zIndex == "0" ? zero : one); 
        var front = (zero.style.zIndex == "0" ? one : zero); 

        var backFrame = <HTMLIFrameElement>back.firstElementChild;
        var frontFrame = <HTMLIFrameElement>front.firstElementChild;

        var fader = <HTMLDivElement>inner.children[2];
        fader.style.opacity = "0.25";

        var sceneUrl = `dist/game/${data.image}`;
        if (frontFrame.src.indexOf(sceneUrl) == -1) {
            localStorage.setItem("ding", null);
            window.addEventListener("storage", function done(e: StorageEvent) {
                if (e.key == "ding" && (JSON.parse(e.newValue).content == "ready")) {
                    window.removeEventListener("storage", done);
                    back.style.opacity = "1";
                    front.style.opacity = "0";
                    fader.style.opacity = "0";
                    fader.addEventListener("transitionend", function done() {
                        fader.removeEventListener("transitionend", done);
                        back.style.zIndex = "1";
                        front.style.zIndex = "0";
                    });
                }
            });
            back.style.opacity = "0";
            backFrame.setAttribute("src", sceneUrl);
        }
    };

    addBlurb = (chunk: IMomentData) => {
        var html = this.markupChunk(chunk);
        var content = document.querySelector(".content-inner");
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
                    span.removeAttribute("style");
                    if (ispan < spans.length) setTimeout(show, 25);
                };
                setTimeout(show, 100);
            }
        }, 0);
    };

    clearBlurb = () => {
        var content = document.querySelector(".content-inner");
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

    showMenu = (opNewGame: Op, opContinue?: Op) => {
        let menu = <HTMLElement>document.querySelector(".menu");
        menu.style.right = "0";

        var options: any = { continue: "disabled" };
        if (opContinue != undefined) options.continue = "enabled";

        var iframe = <HTMLIFrameElement>document.querySelector("div.menu iframe");
        var configureMenu = (<any>iframe.contentWindow).configureMenu;

        configureMenu(options, (name: string) => {
            if (name == "continue") {
                menu.style.right = "100%";
                setTimeout(() => {  this.update(opContinue); }, 250);
            }
            else {
                setTimeout(() => { this.update(opNewGame); }, 500);
            }
        });
    }
}
