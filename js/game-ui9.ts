/// <reference path="helpers.ts" />
/// <reference path="igame.ts" />
/// <reference path="iui.ts" />

class UI9 implements IUI {
    portrait = false;
    sections: Array<string>;

    constructor () {
    }

    initialize = (onmenu: () => void) => {
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
            document.addEventListener("DOMContentLoaded", () => {
                FastClick.attach(document.body);
                this.portrait = window.innerWidth < 750;
                let format = (this.portrait ? "portrait" : "landscape");
                document.body.classList.add(format);
            }, false);
        }

        window.onresize = () => {
            this.portrait = window.innerWidth < 750;
            let format = (this.portrait ? "portrait" : "landscape");
            if (document.body.classList.contains(format) == false) {
                document.body.removeAttribute("class");
                document.body.classList.add(format);
            }
        };
    };

    showUi = () => {
    };

    alert = (text: string, canclose: () => boolean, onalert: () => void) => {
        let content = <HTMLElement>document.querySelector(".content");
        content.classList.add("overlay");
        content.style.pointerEvents = "none";

        let panel = <HTMLElement>document.querySelector(".modal-inner");
        panel.innerHTML = "<p>" + text + "</p>";

        let modal = <HTMLElement>document.querySelector(".modal");
        modal.classList.add("show");

        let onclick = () => {
            modal.removeEventListener("click", onclick);
            panel.innerHTML = `<div class="bounce1"></div><div class="bounce2"></div>`;
            const waitForClose = () => {
                var ready = canclose();
                if (ready) {
                    modal.classList.remove("show");
                    modal.classList.remove("disable");
                    setTimeout(() => { 
                        content.classList.remove("overlay");
                        content.style.pointerEvents = "";
                        setTimeout(onalert, 0);
                    }, 250);
                }
                else {
                    modal.classList.add("disable");
                    setTimeout(waitForClose, 100);
                }
            };
            waitForClose();
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
            if (choice.kind == ChoiceKind.action) icon = "ion-flash";
            if (choice.kind == ChoiceKind.messageTo) icon = "ion-android-person";
            if (choice.kind == ChoiceKind.messageFrom) icon = "ion-chatbubble-working";

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

    addBlurb = (chunk: IMomentData, callback: (result?: any) => void) => {
        let html = this.markupChunk(chunk);
        let content = document.querySelector(".content");
        let inner = document.querySelector(".content-inner");
        let div = document.createElement("div");
        div.innerHTML = html;
        let section = <HTMLDivElement>div.firstChild;

        if (chunk.kind == ChunkKind.background) {
            if (this.portrait) return callback();
            let bg = <IBackground>chunk;
            this.changeBackground(bg.asset, () => {
                if (bg.wait) {
                    content.addEventListener("click", function onclick() {
                        content.removeEventListener("click", onclick);
                        return callback();
                    });
                }
                else
                    callback();
            });
        }
        else if (chunk.kind == ChunkKind.inline) {
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
        else if (chunk.kind == ChunkKind.text || chunk.kind == ChunkKind.dialog || chunk.kind == ChunkKind.gameresult) {
            section.style.opacity = "0";
            inner.appendChild(section);
            this.scrollContent(inner.parentElement);
            section.style.opacity = "1";
            section.style.transition = "all 0.15s ease";

            if (chunk.kind == ChunkKind.dialog) {
                let dialog = <IDialog>chunk;
                if (dialog.mood != undefined) {
                    let assetName = "game/assets/" + dialog.mood.replace(/ /g, "%20").replace(/'/g, "%27");
                    if (assetName.indexOf(".") == -1) assetName += ".jpg";
                    let head = <HTMLDivElement>section.getElementsByClassName("head")[0];
                    let image = new Image();
                    image.onload = function() {
                        head.style.backgroundImage = "url(" + assetName  + ")";
                        head.classList.add("show");
                    };
                    setTimeout(() => { image.src = assetName; }, 100);
                }
            }

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
        else if (chunk.kind == ChunkKind.heading) {
            let heading = <HTMLDivElement>document.querySelector(".heading");
            let inner = <HTMLDivElement>document.querySelector(".heading-inner");
            inner.innerHTML = html;
            heading.classList.add("show", "showing");
            heading.addEventListener("click", function onclick() {
                heading.removeEventListener("click", onclick);
                heading.classList.remove("showing");
                setTimeout(() => { heading.classList.remove("show"); callback(); }, 500);
            });
        }
        else if (chunk.kind == ChunkKind.doo) {
            let choices = Array<IChoice>();
            choices.push(<IChoice> { 
                kind: ChoiceKind.action,
                id: 0,
                text: (<IDo>chunk).text 
            });
            this.showChoices(choices, (chosen: IChoice) => {
                this.hideChoices(callback);
            });
        }
        else if (chunk.kind == ChunkKind.minigame) {
            this.setupMinigame(<IMiniGame>chunk, callback);
        }
        else if (chunk.kind == ChunkKind.waitclick) {
            content.addEventListener("click", function onclick() {
                content.removeEventListener("click", onclick);
                return callback();
            });
        }
        else {
            callback();
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

    addChildWindow = (source: string, callback: (game: IGameInstance) => void) => {
        callback(null);
    };
    
    private changeBackground = (assetName: string, callback: () => void) => {
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

        this.fader(true);
        let preloader = <HTMLDivElement>document.querySelector(".preloader");
        preloader.classList.add("change-bg");

        (<any>window).eventHubAction = (result: any) => {
            if (result.content == "ready") {
                back.style.opacity = "1";
                front.style.opacity = "0";
                this.fader(false);
                preloader.classList.remove("change-bg");
                setTimeout(() => { //do not use "transitionend" here as it was failing on me. hardcode the delay instead
                    back.style.zIndex = "1";
                    front.style.zIndex = "0";
                    callback();
                }, 500);
            }
        };

        back.style.opacity = "0";
        backFrame.setAttribute("src", sceneUrl);
    };

    private setupMinigame = (chunk: IMiniGame, callback: (result?: any) => void) => {
        let minigame = <IMiniGame>chunk;
        let game = <HTMLDivElement>document.querySelector(".game");
        let story = document.querySelector(".story-inner");
        let panel = <HTMLDivElement>document.querySelector(".choice-panel");
        let preloader = <HTMLDivElement>document.querySelector(".preloader");
        let ready = false;
        let fadedout = false;
        this.runMinigame(minigame.url, (result: any) => {
            if (result.ready != undefined) { 
                if (fadedout) {
                    game.classList.add("show");
                    story.classList.add("retracted");
                    this.fader(false);
                    preloader.classList.remove("change-bg");
                }
                ready = true;
            }
            else {
                game.classList.remove("show");
                story.classList.remove("retracted");
                panel.classList.remove("disabled");
                this.hideChoices(() => {
                    let text = (result.win == true ? minigame.winText : minigame.loseText);
                    setTimeout(() => { callback(result); }, 0);
                });
            }
        });
        let choices = Array<IChoice>();
        choices.push(<IChoice> { 
            kind: ChoiceKind.action,
            id: 0,
            text: minigame.text
        });
        this.showChoices(choices, (chosen: IChoice) => {
            if (ready) { 
                game.classList.add("show");
                story.classList.add("retracted");
            }
            else {
                fadedout = true;
                this.fader(true); 
                preloader.classList.add("change-bg");
            } 
            panel.classList.add("disabled");
        });
    };

    private runMinigame = (url: string, callback: (result: any) => void) => {
        let src = `game/${url.replace(/ /g, "%20").replace(/'/g, "%27")}`;

        let game = <HTMLDivElement>document.querySelector(".game");
        let gameFrame = <HTMLIFrameElement>game.firstElementChild;

        (<any>window).eventHubAction = (result: any) => {
            setTimeout(() => { callback(result); }, 0);
        };
        gameFrame.setAttribute("src", src);
    }

    private fader = (enable: boolean) => {
        let inner = <HTMLDivElement>document.querySelector(".graphics-inner");
        let div = <HTMLDivElement>inner.children[3];
        if (enable) {
            div.style.opacity = "0.35";
            div.style.zIndex = "3";
        }
        else {
            div.style.opacity = "0";
            setTimeout(() => { div.style.zIndex = "0"; }, 500);
        }
    };

    private markupChunk = (chunk: IMomentData): string => {
        let html = Array<string>();

        if (chunk.kind == ChunkKind.text) {
            let text = <IText>chunk;
            html.push("<section class='text'>");
            for (var line of text.lines) {
                html.push(`<p>${line}</p>`);
            }
            html.push("</section>");
        }
        else if (chunk.kind == ChunkKind.dialog) {
            let dialog = <IDialog>chunk;
            let hasImage = (dialog.mood != undefined);
            html.push("<section class='dialog'>");
            if (hasImage) {
                html.push(`<div class='head-placeholder'></div>`);
                html.push(`<div class='head'></div>`);
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
        else if (chunk.kind == ChunkKind.gameresult) {
            let result = <IGameResult>chunk;
            html.push("<section class='result'>");
            html.push(`<p>${result.text}</p>`);
            html.push("</section>");
        }
        else if (chunk.kind == ChunkKind.inline) {
            html.push("<section class='image'>");
            html.push("<div></div>");
            html.push("</section>");
        }
        else if (chunk.kind == ChunkKind.heading) {
            let heading = <IHeading>chunk;
            html.push(`<h1>${heading.title}</h1>`);
            if (heading.subtitle != undefined) html.push(`<h2>${heading.subtitle}</h2>`);
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
