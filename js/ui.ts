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

    constructor (menuPage: string, ready: () => void, onmenu: () => void) {
        document.querySelector(".goto-menu").addEventListener("click", (e) => {
            e.stopPropagation();
            setTimeout(onmenu, 0);
        });

        var navbar = <HTMLDivElement>document.querySelector(".navbar"); 
        var inner = <HTMLDivElement>document.querySelector(".story-inner"); 
        navbar.addEventListener("click", (e) => {
            if (document.body.classList.contains("landscape")) {
                if (inner.classList.contains("retracted"))
                    inner.classList.remove("retracted");
                else
                    inner.classList.add("retracted");
            }
        });

        if ("addEventListener" in document) {
            document.addEventListener("DOMContentLoaded", function() {
                FastClick.attach(document.body);
                let format = (window.outerWidth > 600 ? "landscape" : "portrait");
                document.body.classList.add(format);
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
                        preloader.removeEventListener("transitionend", done);
                        preloader.classList.remove("full-white");
                        preloader.removeAttribute("style");
                        var studio = <HTMLDivElement>preloader.querySelector(".studio");
                        studio.style.display = "none";
                    });
                }, 750);
                setTimeout(ready, 0);
            }
        });

        var menuUrl = `game/${menuPage}`;
        document.querySelector(".menu iframe").setAttribute("src", menuUrl);
    }

    alert = (text: string, onalert: () => void) => {
        let content = <HTMLElement>document.querySelector(".content");
        content.classList.add("overlay");
        content.style.pointerEvents = "none";

        let panel = <HTMLElement>document.querySelector(".modal-inner");
        panel.innerHTML = "<p>" + text + "</p>";

        let modal = <HTMLElement>document.querySelector(".modal");
        modal.classList.add("show");

        let onclick = () => {
            modal.removeEventListener("click", onclick);
            modal.classList.remove("show");
            setTimeout(() => { 
                content.classList.remove("overlay");
                content.style.pointerEvents = "";
                setTimeout(onalert, 0);
            }, 250);
        };
        modal.addEventListener("click", onclick);
    };

    showChoices = (sceneChoices: Array<IChoice>, onchoice: (chosen: IChoice) => void) => {
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
        this.scrollContent(text.parentElement);

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
            setTimeout(() => {
                onchoice(<IChoice> {
                    kind: parseInt(li.getAttribute("data-kind")),
                    id: parseInt(li.getAttribute("data-id")),
                    text: ""
                });
            }, 0);
        };
        for (var i = 0; i < lis.length; i++) {
            lis[i].addEventListener("click", onChoice);
        } 
    };

    hideChoices = (callback: () => void) => {
        var content = <HTMLElement>document.querySelector(".content");
        content.classList.remove("overlay");
        content.style.pointerEvents = "auto";

        // make sure the first blurb will be visible
        let inner = <HTMLElement>document.querySelector(".story-inner");
        inner.scrollTop = content.offsetTop;

        var panel = <HTMLElement>document.querySelector(".choice-panel");
        panel.style.top = "100%";

        var text = <HTMLElement>document.querySelector(".content-inner");
        text.style.marginBottom = "0";
        text.setAttribute("style", "");
        setTimeout(callback, 0);
    };

    initScene = (data: ISceneData, callback: () => void) => {
        var title = document.querySelector(".title span");
        title.textContent = data.title;
        if (data.image == undefined) return callback();
        this.changeBackground(data.image, callback);
    };

    addBlurb = (chunk: IMomentData, callback: () => void) => {
        let html = this.markupChunk(chunk);
        let content = document.querySelector(".content");
        let inner = document.querySelector(".content-inner");
        let div = document.createElement("div");
        div.innerHTML = html;
        let section = <HTMLDivElement>div.firstChild;

        if ((<IBackground>chunk).asset != undefined) {
            this.changeBackground((<IBackground>chunk).asset, callback);
        }
        else if ((<IInline>chunk).image != undefined) {
            section.style.opacity = "0";
            inner.appendChild(section);
            this.scrollContent(inner.parentElement);
            section.style.opacity = "1";
            section.style.transition = "opacity 0.1s ease";
            section.style.animation = "color-cycle 5s infinite";

            let assetName = (<IInline>chunk).image.replace(/ /g, "%20").replace(/'/g, "%27");
            if (assetName.indexOf(".") == -1) assetName += ".jpg";
            assetName = `game/assets/${assetName}`;
            let image = new Image();
            image.onload = () => {
                section.style.animation = "";
                let img = <HTMLImageElement>section.firstElementChild;
                img.style.backgroundImage = `url(${assetName})`;
                img.style.height = "100%";
                return callback();
            };
            image.src = assetName;
        }
        else {
            section.style.opacity = "0";
            inner.appendChild(section);
            this.scrollContent(inner.parentElement);
            section.style.opacity = "1";
            section.style.transition = "all 0.15s ease";
            let spans = section.querySelectorAll("span");

            if (spans.length == 0) {
                content.addEventListener("click", function onclick() {
                    content.removeEventListener("click", onclick);
                    return callback();
                });
            }
            else {
                let ispan = 0;
                content.addEventListener("click", function onclick() {
                    content.removeEventListener("click", onclick);
                    clearTimeout(showTimer);
                    while (ispan < spans.length)
                        spans[ispan++].removeAttribute("style");
                    return callback();
                });

                var showTimer = setTimeout(function show() {
                    spans[ispan++].removeAttribute("style");
                    if (ispan < spans.length) 
                        showTimer = setTimeout(show, 25);
                }, 100);
            }
        }
    };

    addBlurbFast = (chunk: IMomentData, callback: () => void) => {
        var html = this.markupChunk(chunk)
        	.replace(/ style\="visibility:hidden"/g, "")
            .replace(/<span>/g, "")
            .replace(/<\/span>/g, "");
        var content = document.querySelector(".content-inner");
        var div = document.createElement("div");
        div.innerHTML = html;
        var section = <HTMLDivElement>div.firstChild;
        content.appendChild(section);
        callback();
    };

    clearBlurb = () => {
        var content = <HTMLDivElement>document.querySelector(".content-inner");
        content.innerHTML = "";
    };

    showMenu = (opNewGame: Op, opContinue: Op, onmenu: (choice: Op) => void) => {
        let menu = <HTMLElement>document.querySelector(".menu");
        menu.style.right = "0";

        var options: any = { continue: "disabled" };
        if (opContinue != undefined) options.continue = "enabled";

        var iframe = <HTMLIFrameElement>document.querySelector("div.menu iframe");
        var configureMenu = (<any>iframe.contentWindow).configureMenu;

        configureMenu(options, (name: string) => {
            if (name == "continue") {
                menu.style.right = "100%";
                setTimeout(() => { onmenu(opContinue); }, 250);
            }
            else {
                setTimeout(() => { onmenu(opNewGame); }, 500);
            }
        });
    };

    changeBackground = (assetName: string, callback: () => void) => {
        if (assetName == undefined) return callback();
        assetName = assetName.replace(/ /g, "%20").replace(/'/g, "%27");

        if (document.body.classList.contains("portrait"))
            return callback();

        let inner = <HTMLDivElement>document.querySelector(".graphics-inner");
        let zero = <HTMLDivElement>inner.children[0];
        let one = <HTMLDivElement>inner.children[1];
        let back = (zero.style.zIndex == "0" ? zero : one); 
        let front = (zero.style.zIndex == "0" ? one : zero); 

        let backFrame = <HTMLIFrameElement>back.firstElementChild;
        let frontFrame = <HTMLIFrameElement>front.firstElementChild;

        if (assetName.indexOf(".") == -1) assetName += ".jpg";
        let sceneUrl: string;
        if (assetName.endsWith(".html")) 
            sceneUrl = `game/${assetName}`;
        else
            sceneUrl = `game/teller-image.html?${assetName}`;
        if (frontFrame.src.indexOf(sceneUrl) != -1) return callback();

        let fader = <HTMLDivElement>inner.children[2];
        fader.style.opacity = "0.35";
        fader.style.zIndex = "2";

        let preloader = <HTMLDivElement>document.querySelector(".preloader");
        preloader.classList.add("change-bg");

        localStorage.setItem("ding", null);
        localStorage.setItem("_image_file", assetName);
        window.addEventListener("storage", function done(e: StorageEvent) {
            if (e.key == "ding" && (JSON.parse(e.newValue).content == "ready")) {
                window.removeEventListener("storage", done);
                back.style.opacity = "1";
                front.style.opacity = "0";
                fader.style.opacity = "0";
                preloader.classList.remove("change-bg");
                setTimeout(() => { /*do not use "transitionend" here as it was failing on me. hardcode the 1000ms delay instead*/
                    fader.style.zIndex = "0";
                    back.style.zIndex = "1";
                    front.style.zIndex = "0";
                    callback();
                }, 1000);
            }
        });

        back.style.opacity = "0";
        backFrame.setAttribute("src", sceneUrl);
    };

    private markupChunk = (chunk: IMomentData): string => {
        let dialog = <IDialog>chunk;
        let inline = <IInline>chunk;
        let backg = <IBackground>chunk;
        let html = Array<string>();

        if (backg.asset != undefined) {
        }
        else if (inline.image != undefined) {
            html.push("<section class='image'>");
            html.push("<div></div>");
            html.push("</section>");
        }
        else if (dialog.actor != undefined) {
            let hasImage = (dialog.mood != undefined);
            html.push("<section class='dialog'>");
            if (hasImage) {
                let assetName = dialog.mood.replace(/ /g, "%20").replace(/'/g, "%27");
                if (assetName.indexOf(".") == -1) assetName += ".jpg";                
                html.push(`<div class='head' style='background-image:url(game/assets/${assetName})'></div>`);
                html.push("<div class='text'>");
            }
            html.push(`<h1>${dialog.actor}</h1>`);

            if (dialog.parenthetical != undefined)
                html.push(`<h2>${dialog.parenthetical}</h2>`);

            for (var line of dialog.lines) {
                var spans = Array.prototype.map.call(line, function (char:any) {
                    return `<span style='visibility:hidden'>${char}</span>`;
                })
                html.push(`<p>${spans.join("")}</p>`);
            }
            if (hasImage) html.push("</div>");
            html.push("</section>");
        }
        else {
            html.push("<section class='text'>");
            for (var line of dialog.lines) {
                html.push(`<p>${line}</p>`);
            }
            html.push("</section>");
        }

        return html.join("");
    };

    private scrollContent = (element: Element) => {
        var start = element.scrollTop;
        var end = (element.scrollHeight - element.clientHeight);
        if (end <= start) return;
        var top = start;
        setTimeout(function scroll() {
            top += 10;
            element.scrollTop = top + 1;
            if (top < end) setTimeout(scroll, 10);
        }, 10);
    };
}
