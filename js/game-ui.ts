/// <reference path="helpers.ts" />
/// <reference path="igame.ts" />
/// <reference path="iui.ts" />

class UI implements IUI {
    portrait = false;
    sections: Array<string>;
    previousSceneUrl: string;

    constructor () {
    }

    initialize = (fire: (payload: any) => void) => {
        FastClick.attach(document.body);

        document.querySelector(".goto-menu").addEventListener("click", (e) => {
            e.stopPropagation();
            setTimeout(() => { fire("goto-menu"); }, 0);
        });

        const onresize = () => {
            this.portrait = window.innerWidth < window.innerHeight;
            document.body.classList.remove("portrait", "landscape");
            document.body.classList.add(this.portrait ? "portrait" : "landscape");
        };
        window.onresize = onresize;
        onresize();

        document.querySelector(".title").addEventListener("click", (e) => {
            if (document.body.classList.contains("hide-story"))
                document.body.classList.remove("hide-story");
            else
                document.body.classList.add("hide-story");
        });
    };

    doAction = (payload: any) => {
        if (payload == "show-ui") {
            let storyWindow = document.querySelector(".story-window");
            storyWindow.classList.remove("hidden");
        }
        else if (payload == "close-drawer") {
            let storyWindow = document.querySelector(".story-window");
            storyWindow.classList.add("closed");
        }
        else if (payload == "open-drawer") {
            let storyWindow = document.querySelector(".story-window");
            storyWindow.classList.remove("closed");
        }
        else if (payload == "disable-ui") {
            document.body.classList.add("disabled");
        }
        else if (payload == "enable-ui") {
            document.body.classList.remove("disabled");
        }
    };

    alert = (text: string, canclose: () => boolean, onalert: () => void) => {
        document.body.classList.add("showing-alert");

        let storyInner = <HTMLElement>document.querySelector(".story-inner");

        let inner = <HTMLElement>document.querySelector(".modal-inner");
        let panel = inner.querySelector("span");
        panel.innerHTML = "<p>" + text + "</p>";

        let modal = <HTMLElement>document.querySelector(".modal");
        modal.classList.add("show");

        const waitToMinimize = (e: any) => {
            e.stopPropagation();
            if (storyInner.classList.contains("minimized"))
                storyInner.classList.remove("minimized");
            else
                storyInner.classList.add("minimized");
        };
        let minimizer = inner.querySelector(".minimizer");
        minimizer.addEventListener("click", waitToMinimize);

        const waitForClick = (done: () => void) => {
            const onclick = () => {
                modal.removeEventListener("click", onclick);
                return done();
            };
            modal.addEventListener("click", onclick);
        };

        waitForClick(() => {
            panel.innerHTML = `<div class="bounce1"></div><div class="bounce2"></div>`;
            const waitForClose = () => {
                var ready = canclose();
                if (ready) {
                    minimizer.removeEventListener("click", waitToMinimize);
                    modal.classList.remove("show");
                    modal.classList.remove("disable");
                    setTimeout(() => { 
                        document.body.classList.remove("showing-alert");
                        setTimeout(onalert, 0);
                    }, 250);
                }
                else {
                    modal.classList.add("disable");
                    setTimeout(waitForClose, 100);
                }
            };
            waitForClose();
        });
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
            icon = "ion-arrow-right-b";

            let li = <HTMLLIElement>document.createElement("li");
            li.setAttribute("data-kind", choice.kind.toString());
            li.setAttribute("data-id", choice.id.toString());
            li.classList.add("hidden");
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

        document.body.classList.add("showing-choices");

        panel.style.top = "calc(100% - " + panel.offsetHeight + "px)";

        let storyInner = <HTMLElement>document.querySelector(".story-inner");
        //storyInner.style.height = `calc(25% + ${panel.offsetHeight}px)`;
        storyInner.classList.remove("minimized");

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
            li.classList.add("selected");
            setTimeout(() => {
                onchoice(<IChoice> {
                    kind: parseInt(li.getAttribute("data-kind")),
                    id: parseInt(li.getAttribute("data-id")),
                    text: ""
                });
            }, 500);
        };
        for (var i = 0; i < lis.length; i++) {
            lis[i].addEventListener("click", onChoice);
            lis[i].classList.remove("hidden");
        } 
    };

    hideChoices = (callback: () => void) => {
        document.body.classList.remove("showing-choices");

        // make sure the first blurb will be visible
        var content = <HTMLElement>document.querySelector(".content");
        let storyInner = <HTMLElement>document.querySelector(".story-inner");
        storyInner.scrollTop = content.offsetTop;
        //storyInner.style.height = "25%";

        var panel = <HTMLElement>document.querySelector(".choice-panel");
        panel.style.top = "100%";

        var text = <HTMLElement>document.querySelector(".content-inner");
        text.style.marginBottom = "0";
        text.setAttribute("style", "");
        
        setTimeout(callback, 250/*matches .choice-panel transition*/);
    };

    initScene = (data: ISceneData, callback: () => void) => {
        this.setTitle(data.title);
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

        const waitForClick = (done: () => void) => {
            const onclick = () => {
                content.removeEventListener("click", onclick);
                return done();
            };
            content.addEventListener("click", onclick);
        };

        if (chunk.kind == ChunkKind.background) {
            if (this.portrait) return callback();
            let bg = <IBackground>chunk;
            this.changeBackground(bg.asset, () => {
                if (bg.wait) {
                    waitForClick(callback);
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
                waitForClick(callback);
            }
            else {
                let ispan = 0;
                waitForClick(() => {
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
            let css = (<IHeading>chunk).css;
            heading.classList.add("show");
            if (css != undefined) heading.classList.add(css);
            heading.addEventListener("click", function onclick() {
                heading.removeEventListener("click", onclick);
                heading.classList.remove("show");
                if (css != undefined) heading.classList.remove(css);
                setTimeout(() => { callback(); }, 500);
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
            this.runMinigame(<IMiniGame>chunk, callback);
        }
        else if (chunk.kind == ChunkKind.waitclick) {
            waitForClick(callback);
        }
        else if (chunk.kind == ChunkKind.title) {
            this.setTitle((<ITitle>chunk).text);
            callback();
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
        let storyWindow = document.querySelector(".story-window");
        let iframe = document.createElement("iframe");
        iframe.setAttribute("src", source);
        storyWindow.appendChild(iframe);
        setTimeout(function retry() {
            let doc = <any>iframe.contentWindow;
            if (doc.GameInstance == undefined)
                setTimeout(retry, 50);
            else
                callback(doc.GameInstance);
        }, 0);
    };

    private setTitle = (title: string) => {
        let inner = document.querySelector(".title-inner");
        if (inner.innerHTML != title) {
            setTimeout(function() {
                inner.innerHTML = title;
                inner.classList.remove("out");
            }, 500);
            inner.classList.add("out");
        }
    };

    private changeBackground = (assetName: string, callback: () => void) => {
        if (assetName == undefined) return callback();
        assetName = assetName.replace(/ /g, "%20").replace(/'/g, "%27");

        let solid = <HTMLDivElement>document.querySelector(".solid-inner");
        let zero = <HTMLDivElement>solid.children[0];
        let one = <HTMLDivElement>solid.children[1];
        let back = (zero.style.zIndex == "0" ? zero : one); 
        let front = (zero.style.zIndex == "0" ? one : zero); 

        let backFrame = <HTMLIFrameElement>back.firstElementChild;
        let frontFrame = <HTMLIFrameElement>front.firstElementChild;

        let css = assetName.replace(".html", "").replace(".jpg", "").replace(".png", "");
        document.body.setAttribute("data-bg", css);

        if (assetName.indexOf(".") == -1) assetName += ".jpg";
        let sceneUrl: string;
        if (assetName.endsWith(".html")) 
            sceneUrl = `game/${assetName}`;
        else
            sceneUrl = `game/teller-image.html?${assetName}`;
        if (frontFrame.src.indexOf(sceneUrl) != -1) return callback();

        if (sceneUrl == this.previousSceneUrl)
            return callback();

        this.previousSceneUrl = sceneUrl;

        document.body.classList.add("change-bg");

        (<any>window).eventHubAction = (result: any) => {
            if (result.content == "ready") {
                back.style.opacity = "1";
                front.style.opacity = "0";
                document.body.classList.remove("change-bg");
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

    private runMinigame = (chunk: IMiniGame, callback: (result?: any) => void) => {
        let minigame = <IMiniGame>chunk;
        let gameReady = false;
        let choiceMade = false;
        
        const fireMinigame = (url: string, callback: (result: any) => void) => {
            let game = document.querySelector(".game");
            let gameFrame = <HTMLIFrameElement>game.firstElementChild;

            (<any>window).eventHubAction = (result: any) => {
                setTimeout(() => { callback(result); }, 0);
            };

            let src = `game/${url.replace(/ /g, "%20").replace(/'/g, "%27")}`;
            gameFrame.setAttribute("src", src);
        };

        fireMinigame(minigame.url, (result: any) => {
            if (result.ready != undefined) {
                if (choiceMade) {
                    document.body.classList.add("show-game");
                    document.body.classList.remove("change-bg");
                    document.body.classList.remove("disabled");
                }
                gameReady = true;
            }
            else {
                document.body.classList.remove("show-game");
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
            if (gameReady) {
                document.body.classList.add("show-game");
                document.body.classList.remove("disabled");
            }
            else {
                document.body.classList.add("change-bg");
                document.body.classList.add("disabled");
            }
            choiceMade = true;
        });
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
