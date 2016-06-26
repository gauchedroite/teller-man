
class Game {
    gdata: GameData;
    ui: UI;
    data: IGameData;
    currentScene: IScene;
    currentMoment: IMoment;
    forbiddenSceneId: number;
    chunks: Array<IMomentData>;
    cix: number;

    constructor() {
        this.gdata = new GameData();
this.gdata.state = { intro: true };  //clear and init the state
this.gdata.history = [];             //init the list of showned moments

        this.ui = new UI(this.update);
        this.update(Op.INIT);
    }

    update = (op: Op, param?: any): void => {
        this.data = this.gdata.loadGame();
        var ui = this.ui;

        if (op == Op.MOMENT) {
            if (this.currentMoment == null) { 
                ui.alert(Op.RETRY, "Il ne se passe plus rien pour le moment."); 
                return null;
            }

            this.chunks = this.parseAndExecuteMoment(this.currentMoment);
            this.cix = 0;

            this.currentScene = this.getParentScene(this.currentMoment);
            ui.setTitle(this.currentScene.name);
            ui.clearBlurb();
            ui.onBlurbTap(Op.BLURB);

            this.update(Op.BLURB);
        }
        else if (op == Op.BLURB) {
            if (this.cix < this.chunks.length) {
                var chunk = this.chunks[this.cix++];
                ui.addBlurb(chunk);
            }
            else {
                let state = this.gdata.state;
                if (state.intro != undefined) {
                    delete state.intro;
                    this.gdata.state = state;
                }
                let moments = this.getNextMoments();
                let choices = this.buildChoices(moments);
                if (choices.length > 0) {
                    ui.showChoices(Op.CHOICES, choices);
                }
                else {
                    ui.alert(Op.RETRY, "Il ne se passe plus rien pour le moment.");
                }
            }
        }
        else if (op == Op.CHOICES) {
            ui.hideChoices();
            let choice = <IChoice>param;
            let chosen = this.gdata.getScene(this.data.scenes, choice.id);
            this.currentMoment = this.getNextMoment(chosen);
            this.update(Op.MOMENT);
        }
        else if (op == Op.INIT) {
            this.currentMoment = this.getNextMoment();
            this.update(Op.MOMENT);
        }
        else if (op == Op.RETRY) {
            console.log("TODO: retrying");
        }
        else {
            ui.alert(Op.RETRY, "Game Over?");
        }
    };

    buildChoices = (moments: Array<IMoment>): Array<IChoice> => {
        let choices = Array<IChoice>();

        let scenes = Array<IScene>();
        for (var moment of moments) {
            let scene = this.getParentScene(moment);
            if (this.forbiddenSceneId == null || this.forbiddenSceneId != scene.id) {
                if (scenes.indexOf(scene) == -1)
                    scenes.push(scene);
            }
        }

        choices = scenes.map((obj) => { 
            return <IChoice> { 
                kind: "scene",
                id: obj.id,
                text: obj.name 
            }; 
        });
        
        this.forbiddenSceneId = null;
        return choices;
    };

    getNextMoments = (targetScene?: IScene): Array<IMoment> => {
        var data = this.data;
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
                        if (this.isValidMoment(moment)) {
                            moments.push(moment);
                        }
                    }
                }
            }
        }

        return moments;
    };

    getNextMoment = (targetScene?: IScene): IMoment => {
        var moments = this.getNextMoments(targetScene);

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
        // a moment can't be played twice
        var history = this.gdata.history;
        if (history.indexOf(moment.id) != -1)
            return false;
        //
        let ok = true;

        let conds = when.split(",");
        for (var cond of conds) {
            let parts = cond.replace("=", ":").split(":");
            let name = parts[0].trim();
            if (name.startsWith("/")) {
                if (name.startsWith("/here")) {
                    let sceneid = this.getParentScene(moment).id;
                    if (this.currentScene.id != sceneid) ok = false;
                }
                else {
                    ok = false;
                }
            }
            else
            {
                let value: any = (parts.length == 2 ? parts[1].trim() : "true");
                if (value == "true" || value == "false") value = (value == "true");
                let statevalue = state[name];
                if (value === "undef") {
                    if (typeof statevalue !== "undefined") ok = false;
                }
                else {
                    if (typeof statevalue === "undefined") ok = false;
                    else if (statevalue !== value) ok = false;
                }
            }
            if (ok == false) break;
        }
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
                else if (part.startsWith("//")) {
                }
                else if (part.startsWith(".a ")) {
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
                else if (part.startsWith(".r ")) {
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
                else if (part.startsWith(".f ")) {
                    let flags = part.substring(2).split(",");
                    for (var oneflag of flags) {
                        let flag = oneflag.trim();
                        if (flag == "can-repeat") canRepeat = true;
                        if (flag == "must-leave-scene") this.forbiddenSceneId = this.getParentScene(moment).id;
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
