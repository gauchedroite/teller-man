
interface IDialog {
    actor: string
    mood: string
    parenthetical: string
    lines: Array<string>
}
interface IText {
    lines: Array<string>
}
type IMomentData = IDialog | IText;

class Game {
    gdata: GameData;
    data: IGameData;

    constructor() {
        this.gdata = new GameData();

        var state = this.gdata.state;
        if (state == undefined || state == null) {
            this.gdata.state = { intro: true };
        }

        this.data = this.gdata.loadGame();
        var moment = this.getNextMoment();
        var parsed = this.parseMoment(moment);
        var markup = this.markupParsedMoment(parsed);
        var scene = this.getParentScene(moment);

        var $title = document.querySelector(".title span");
        $title.textContent = scene.name;

        var $content = document.querySelector(".content-text");
        $content.innerHTML = markup;

        document.querySelector(".content").addEventListener("click", this.slideChoicesUp);
        document.querySelector(".choice-panel").addEventListener("click", this.slideChoicesDown);
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

    getNextMoment = (): IMoment => {
        var data = this.data;

        // todo - filter situations
        var situation = data.situations[0];

        var scenes = Array<IScene>();
        //
        for (var sid of situation.sids) {
            for (var scene of data.scenes) {
                if (scene.id == sid) {
                    scenes.push(scene);
                    break;
                }
            }
        }

        var moments = Array<IMoment>();
        //
        for (var scene of scenes) {
            for (var mid of scene.mids) {
                for (var moment of data.moments) {
                    if (moment.id == mid) {
                        if (this.isValidMoment(moment)) {
                            moments.push(moment);
                        }
                    }
                }
            }
        }

        if (moments.length == 0)
            return null;

        var winner = Math.floor(Math.random() * moments.length);
        return moments[winner];
    };

    isValidMoment = (moment: IMoment): boolean => {
        var when = moment.when || "";
        if (when == "")
            return false;

        var state = this.gdata.state;
        var value = state[when];

        if (value == undefined || value == null)
            return false;

        return true;
    };

    getParentScene = (moment: IMoment): IScene => {
        var scenes = this.data.scenes;
        for (var scene of scenes) {
            for (var id of scene.mids) {
                if (id == moment.id)
                    return scene;
            }
        }
    };

    parseMoment = (moment: IMoment): Array<IMomentData> => {
        var text = moment.text;
        var parsed = Array<IMomentData>();
        var current = <IMomentData>{};
        var state = "";

        var parts = text.split("\n");
        for (var part of parts) {
            if (part.length > 0) {
                if (part.startsWith(".a")) {
                    var actor = part.substring(2).trim();
                    var aa = actor.split("/");

                    var dialog = current = <IDialog>{};
                    if (aa.length == 2) {
                        dialog.actor = aa[0];
                        dialog.mood = aa[1];
                    }
                    else {
                        dialog.actor = aa[0];
                    }
                    state = "DIALOG";
                }
                else if (part.startsWith("(")) {
                    (<IDialog>current).parenthetical = part;
                }
                else {
                    if (state == "DIALOG") {
                        var lines = part.split("/");

                        let my = <IDialog>current;
                        my.lines = Array<string>();
                        for (var line of lines) {
                            my.lines.push(line);
                        }
                        parsed.push(current);
                        state = "";
                    }
                    else {
                        var lines = part.split("/");

                        let my = <IText>{};
                        my.lines = Array<string>();
                        for (var line of lines) {
                            my.lines.push(line);
                        }
                        parsed.push(my);
                    }
                }
            }
        }
        console.log(parsed);
        return parsed;
    };

    markupParsedMoment = (parsed: Array<IMomentData>): string => {
        var chunks = Array<string>();
        for (var part of parsed) {
            let dialog = <IDialog>part;

            if (dialog.actor != undefined) {
                chunks.push(`<section class="dialog">`);
                chunks.push(`<h1>${dialog.actor}</h1>`);

                if (dialog.parenthetical != undefined)
                    chunks.push(`<h2>${dialog.parenthetical}</h2>`);

                for (var line of dialog.lines) {
                    chunks.push(`<p>${line}</p>`);
                }
                chunks.push(`</section>`);
            }
            else {
                chunks.push(`<section class="text">`);
                for (var line of dialog.lines) {
                    chunks.push(`<p>${line}</p>`);
                }
                chunks.push(`</section>`);
            }
        }
        return chunks.join("");
    }
}
