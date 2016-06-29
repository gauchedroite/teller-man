
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
                                        this.gdata.state = { intro: true };  //clear and init state
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

            this.currentScene = this.getSceneOf(this.currentMoment);
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
                let moments = this.getAllPossibleMoments();
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
            this.currentMoment = this.getChosenMoment(choice);
            this.update(Op.MOMENT);
        }
        else if (op == Op.INIT) {
            this.currentMoment = this.selectOne(this.getAllPossibleMoments());
            this.update(Op.MOMENT);
        }
        else if (op == Op.RETRY) {
            console.log("TODO: retrying");
        }
        else {
            ui.alert(Op.RETRY, "Game Over?");
        }
    };

    getAllPossibleMoments = (targetScene?: IScene): Array<IMoment> => {
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

    buildChoices = (moments: Array<IMoment>): Array<IChoice> => {
        let scenes = Array<IScene>();
        let actions = Array<IAction>();
        
        for (var moment of moments) {
            if (moment.kind == Kind.Moment) {
                let scene = this.getSceneOf(moment);
                if (this.forbiddenSceneId == null || this.forbiddenSceneId != scene.id) {
                    if (scenes.indexOf(scene) == -1)
                        scenes.push(scene);
                }
            }
            else {
                actions.push(<IAction>moment);                
            }
        }

        let choices = Array<IChoice>();
        choices = scenes.map((obj) => { 
            return <IChoice> { 
                kind: "scene",
                id: obj.id,
                text: obj.name 
            }; 
        });
        let choices2 = Array<IChoice>();
        choices2 = actions.map((obj) => { 
            return <IChoice> { 
                kind: "action",
                id: obj.id,
                text: obj.name 
            }; 
        });
        choices = choices.concat(choices2);
        
        this.forbiddenSceneId = null;
        return choices;
    };

    getChosenMoment = (choice: IChoice): IMoment => {
        if (choice.kind == "scene") {
            let data = this.data;
            let scene: IScene;
            for (scene of data.scenes) {
                if (scene.id == choice.id) break;
            }
            let moments = Array<IMoment>();
            for (var moment of data.moments) {
                if (moment.kind == Kind.Moment) {
                    if (scene.mids.indexOf(moment.id) != -1) {
                        if (this.isValidMoment(moment)) {
                            moments.push(moment);
                        }
                    }
                }
            }
            return this.selectOne(moments);
        }
        else if (choice.kind == "action") {
            let id = choice.id;
            for (var moment of this.data.moments) {
                if (moment.id == id)
                    return moment;
            }
        }
        return null;
    };

    selectOne = (moments: Array<IMoment>) => {
        if (moments.length == 0) return null;
        let winner = Math.floor(Math.random() * moments.length);
        let moment = moments[winner];
        return moment;
    }

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
                    let sceneid = this.getSceneOf(moment).id;
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

    getSceneOf = (moment: IMoment): IScene => {
        var scenes = this.data.scenes;
        for (var scene of scenes) {
            if (scene.id == moment.parentid) {
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
                        if (flag == "must-leave-scene") this.forbiddenSceneId = this.getSceneOf(moment).id;
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
