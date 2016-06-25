
class Game {
    gdata: GameData;
    ui: UI;
    data: IGameData;
    choiceScenes: Array<IScene>;
    moment: IMoment;
    chunks: Array<IMomentData>;
    cix: number;

    constructor() {
        this.gdata = new GameData();
this.gdata.state = { intro: true };  //clear and init the state
this.gdata.history = [];             //init the list of showned moments

        this.data = this.gdata.loadGame();
        this.ui = new UI(this.update);
        this.update("INIT");
    }

    update = (mode: string, param?: any): void => {
        var ui = this.ui;
        if (mode == "MOMENT") {
            if (this.moment == null) { console.log("No moment to play"); return null; }

            this.chunks = this.parseAndExecuteMoment(this.moment);
            this.cix = 0;

            let scene = this.getParentScene(this.moment);
            ui.typeTitle(scene.name);
            ui.clearBlurb();
            ui.onBlurbTap("BLURB");

            this.update("BLURB");
        }
        else if (mode == "BLURB") {
            if (this.cix < this.chunks.length) {
                var chunk = this.chunks[this.cix++];
                ui.typeBlurb(chunk);
            }
            else {
                let state = this.gdata.state;
                if (state.intro != undefined) {
                    delete state.intro;
                    this.gdata.state = state;
                }
                this.choiceScenes = this.getPossibleScenes();
                if (this.choiceScenes.length > 0) {
                    let textChoices = this.choiceScenes.map((obj) => { return obj.name; });
                    ui.slideChoicesUp("CHOICES", textChoices);
                }
                else {
                    this.ui.alert("RETRY", "Il ne se passe plus rien pour le moment");
                }
            }
        }
        else if (mode == "CHOICES") {
            ui.slideChoicesDown();
            let chosen = this.choiceScenes[<number>param];
            this.moment = this.getNextMoment(chosen);
            this.update("MOMENT");
        }
        else if (mode == "INIT") {
            this.moment = this.getNextMoment();
            this.update("MOMENT");
        }
        else if (mode == "RETRY") {
            console.log("retrying");
        }
        else {
            console.log("g.a.m.e.o.v.e.r?");
        }
    };

    getPossibleScenes = (): Array<IScene> => {
        var data = this.data;

        // todo - filter situations
        var situation = data.situations[0];

        var scenes = Array<IScene>();
        //
        for (var sid of situation.sids) {
            for (var scene of data.scenes) {
                if (scene.id == sid) {

                    for (var mid of scene.mids) {
                        let oneMoment = false;
                        for (var moment of data.moments) {
                            if (moment.id == mid) {
                                if (this.isValidMoment(moment)) {
                                    scenes.push(scene);
                                    oneMoment = true;
                                    break;
                                }
                            }
                        }
                        if (oneMoment) break;
                    }

                }
            }
        }
        //
        return scenes;
    };

    getNextMoment = (targetScene?: IScene): IMoment => {
        var data = this.data;
        var history = this.gdata.history;
        var scenes = Array<IScene>();

        if (targetScene == undefined) {
            // todo - filter situations
            let situation = data.situations[0];

            for (var sid of situation.sids) {
                for (var scene of data.scenes) {
                    if (scene.id == sid) {
                        scenes.push(scene);
                        break;
                    }
                }
            }
        }
        else {
            scenes.push(targetScene);
        }

        var moments = Array<IMoment>();
        //
        for (var scene of scenes) {
            for (var mid of scene.mids) {
                for (var moment of data.moments) {
                    if (moment.id == mid) {
                        // do not show the same moment twice
                        if (history.indexOf(mid) == -1) {
                            // only show valid moments
                            if (this.isValidMoment(moment)) {
                                moments.push(moment);
                            }
                        }
                    }
                }
            }
        }

        if (moments.length == 0) return null;
        var winner = Math.floor(Math.random() * moments.length);
        var moment = moments[winner];
        return moment;
    };

    isValidMoment = (moment: IMoment): boolean => {
        var when = moment.when || "";
        if (when == "") return false;
        let state = this.gdata.state;
        //
        if (typeof state.intro !== "undefined") {
            if (when == "intro") return true;
            return false;
        }
        //
        let ok = true;
//console.log(state);
        let conds = when.split(",");
        for (var cond of conds) {
            let parts = cond.replace("=", ":").split(":");
            let name = parts[0].trim();
            let value: any = (parts.length == 2 ? parts[1].trim() : "true");
            if (value == "true" || value == "false") value = (value == "true");
            let statevalue = state[name];
//console.log(`  name=${name}, value=${value},  state[${name}]=${statevalue}`);
            if (value === "undef") {
                if (typeof statevalue !== "undefined") ok = false;
            }
            else {
                if (typeof statevalue === "undefined") ok = false;
                else if (statevalue !== value) ok = false;
            }
            if (ok == false) break;
        }
//console.log(`  ok=${ok}, when=${moment.when}`);
        return ok;
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

    parseAndExecuteMoment = (moment: IMoment): Array<IMomentData> => {
        var parsed = Array<IMomentData>();
        var current = <IMomentData>{};
        var fsm = "";
        var inComment = false
        var canRepeat = false;

        var parts = moment.text.split("\n");
        for (var part of parts) {
            if (part.length > 0) {
                if (part.startsWith("/*")) {
                    inComment = true;
                }
                else if (inComment) {
                    inComment = (part.startsWith("*/") == false);
                }
                else if (part.startsWith(".a")) {
                    let actor = part.substring(2).trim();
                    let aa = actor.split("/");

                    let dialog = current = <IDialog>{};
                    if (aa.length == 2) {
                        dialog.actor = aa[0];
                        dialog.mood = aa[1];
                    }
                    else {
                        dialog.actor = aa[0];
                    }
                    fsm = "DIALOG";
                }
                else if (part.startsWith("(")) {
                    (<IDialog>current).parenthetical = part;
                }
                else if (part.startsWith(".r")) {
                    let rems = part.substring(2).split(",");
                    for (var rem of rems) {
                        let parts = rem.replace("=", ":").split(":");
                        let name = parts[0].trim();
                        let value: any = (parts.length == 2 ? parts[1].trim() : "true");
                        if (value == "true" || value == "false") value = (value == "true");

                        let state = this.gdata.state;
                        if (value === "undef")
                            delete state[name];
                        else
                            state[name] = value;
                        this.gdata.state = state;
                    }
                }
                else if (part.startsWith(".f")) {
                    let flags = part.substring(2).split(",");
                    for (var oneflag of flags) {
                        let flag = oneflag.trim();
                        if (flag == "can-repeat") canRepeat = true;
                    }
                }
                else {
                    if (fsm == "DIALOG") {
                        var lines = part.split("/");

                        let my = <IDialog>current;
                        my.lines = Array<string>();
                        for (var line of lines) {
                            my.lines.push(line);
                        }
                        parsed.push(current);
                        fsm = "";
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
        if (canRepeat == false) {
            let history = this.gdata.history;
            history.push(moment.id);
            this.gdata.history = history;
        }
        return parsed;
    };
}
