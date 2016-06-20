
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
        this.showMoment(moment);

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

    showMoment = (moment: IMoment) => {
        var data = this.data;
        var scene = this.getParentScene(moment);

        var $title = document.querySelector(".title span");
        $title.textContent = scene.name;

        var $content = document.querySelector(".content-text");
        $content.innerHTML = this.parseMoment(moment.text);
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

    parseMoment = (text: string): string => {
        var chunks = Array<string>();

        var parts = text.split("\n");
        for (var part of parts) {
            if (part.length > 0) {
                if (part.startsWith(".a")) {
                    var actor = part.substring(2).trim();
                    var mood = "";
                    var aa = actor.split("/");
                    if (aa.length == 2) {
                        actor = aa[0];
                        mood = `<span>/${aa[1]}</span>`;
                    }
                    chunks.push(`<div class="actor">${actor}${mood}</div>`); 
                }
                else {
                    chunks.push(`<p>${part}</p>`);
                }
            }
        }

        return chunks.join("");;
    };
}
