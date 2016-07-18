declare var FastClick: any;

class Game {
    gdata: GameData;
    ui: UI;
    data: IGameData;
    currentMoment: IMoment;
    currentScene: IScene;
    forbiddenSceneId: number;
    chunks: Array<IMomentData>;
    cix: number;

    constructor() {
        this.gdata = new GameData();
        let options = this.gdata.options;
        let skipMenu = (options != undefined && options.skipMenu);

        (<any>window).GameInstance = this;

        this.ui = new UI(this.update, Op.MENU_INGAME, skipMenu, this.gdata.game.desc, () => {
            if (skipMenu) {
                options.skipMenu = false;
                this.gdata.options = options;
                this.update(Op.WAITING);
            }
            else {
                this.update(Op.MENU_BOOT);
            }
        });
    }

    update = (op: Op, param?: any): void => {
        this.data = this.gdata.loadGame();
        var ui = this.ui;

        if (op == Op.MOMENT) {
            this.saveContinueState();

            if (this.currentMoment == null) { 
                ui.alert(Op.WAITING, "Il ne se passe plus rien pour le moment."); 
                return null;
            }

            this.chunks = this.parseMoment(this.currentMoment);
            this.cix = 0;

            let kind = this.currentMoment.kind; 
            if (kind == Kind.Moment || kind == Kind.Action) {
                this.currentScene = this.getSceneOf(this.currentMoment);
            }
            ui.initScene(this.parseScene(this.currentScene));
            ui.clearBlurb();
            ui.onBlurbTap(Op.BLURB);

            this.raiseActionEvent(OpAction.SHOWING_MOMENT, this.currentMoment);

            setTimeout(() => { this.update(Op.BLURB); }, 0);
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
                this.executeMoment(this.currentMoment.id);
                this.raiseActionEvent(OpAction.SHOWING_CHOICES);
                let moments = this.getAllPossibleMoments();
                let messages = this.getAllPossibleMessages();
                let choices = this.buildChoices(moments, messages);
                if (choices.length > 0) {
                    ui.showChoices(Op.CHOICES, choices);
                }
                else {
                    ui.alert(Op.WAITING, "Il ne se passe plus rien pour le moment.");
                }
            }
        }
        else if (op == Op.CHOICES) {
            ui.hideChoices();
            let choice = <IChoice>param;
            this.currentMoment = this.getChosenMoment(choice);
            this.updateTimedState();
            setTimeout(() => { this.update(Op.MOMENT); }, 0);
        }
        else if (op == Op.MENU_BOOT) {
            if (this.gdata.options == undefined)
                ui.showMenu(Op.NEWGAME);
            else
                ui.showMenu(Op.NEWGAME, Op.CONTINUE_SAVEDGAME);
        }
        else if (op == Op.MENU_INGAME) {
            ui.showMenu(Op.NEWGAME, Op.CONTINUE_INGAME);
        }
        else if (op == Op.CONTINUE_SAVEDGAME) {
            if (this.gdata.options == undefined || this.gdata.options.skipFileLoad == false) {
                this.getDataFile("dist/game/app.json", (text: any) => {
                    this.gdata.saveData(text);
                    this.restoreContinueState();
                    setTimeout(() => { this.update(Op.MOMENT); }, 0);
                });
            }
            else {
                this.restoreContinueState();
                setTimeout(() => { this.update(Op.MOMENT); }, 0);
            }
        }
        else if (op == Op.CONTINUE_INGAME) {
        }
        else if (op == Op.NEWGAME) {
            this.newGame();
        }
        else if (op == Op.WAITING) {
            this.raiseActionEvent(OpAction.SHOWING_CHOICES);
            this.currentMoment = this.selectOne(this.getAllPossibleEverything());
            this.updateTimedState();
            setTimeout(() => { this.update(Op.MOMENT); }, 0);
        }
        else {
            ui.alert(Op.WAITING, "Game Over?");
        }
    };

    saveContinueState = () => {
        this.gdata.continueState = {
            moment: this.currentMoment,
            scene: this.currentScene,
            forbiddenSceneId: this.forbiddenSceneId,
            state: this.gdata.state,
            history: this.gdata.history
        };
    };

    restoreContinueState = () => {
        let cstate = this.gdata.continueState;
        if (cstate != undefined) {
            this.currentMoment = cstate.moment;
            this.currentScene = cstate.scene;
            this.forbiddenSceneId = cstate.forbiddenSceneId;
            this.gdata.state = cstate.state; 
            this.gdata.history = cstate.history;
        }
    };

    newGame = () => {
        let state = { intro: true};
        state[this.gdata.game.initialstate] = true;
        this.gdata.state = state;   //clear and init state
        this.gdata.history = [];    //init the list of showned moments
        this.gdata.continueState = null;

        let options = this.gdata.options;
        if (options == undefined) options = <IOptions>{ skipFileLoad: false };
        options.skipMenu = true;
        this.gdata.options = options;

        this.raiseActionEvent(OpAction.GAME_START);

        if (options.skipFileLoad == false) {
            this.getDataFile("dist/game/app.json", (text: any) => {
                this.gdata.saveData(text);
                setTimeout(function() { location.href = "index.html"; }, 0);
            });
        }
        else {
            setTimeout(function() { location.href = "index.html"; }, 0);
        }
    };

    raiseActionEvent = (op: OpAction, param?: any) => {
        if (window != window.top) 
            (<any>window.parent).onAction(op, param);
    };

    getAllPossibleMoments = (): Array<IMoment> => {
        var data = this.data;

        let sits = data.situations;
        let situation: ISituation;
        for (var sit of sits) {
            if (this.isValidSituation(sit)) {
                situation = sit;
                break;
            }
        }

        var sids = Array<number>();
        //
        for (var scene of data.scenes) {
            if (scene.sitid == situation.id) {
                sids.push(scene.id);
            }
        }

        var moments = Array<IMoment>();
        //
        for (var moment of data.moments) {
            if (moment.kind == Kind.Moment || moment.kind == Kind.Action) {
                if (sids.indexOf(moment.parentid) != -1) {
                    if (this.isValidMoment(moment)) {
                        moments.push(moment);
                    }
                }
            }
        }
        //
        return moments;
    };

    getAllPossibleMessages = (): Array<IMoment> => {
        var data = this.data;

        let sits = data.situations;
        let situation: ISituation;
        for (var sit of sits) {
            if (this.isValidSituation(sit)) {
                situation = sit;
                break;
            }
        }

        var aids = Array<number>();
        //
        for (var actor of data.actors) {
            if (actor.sitid == situation.id) {
                aids.push(actor.id);
            }
        }

        var messages = Array<IMoment>();
        //
        for (var moment of data.moments) {
            if (moment.kind == Kind.MessageTo || moment.kind == Kind.MessageFrom) {
                if (aids.indexOf(moment.parentid) != -1) {
                    if (this.isValidMoment(moment)) {
                        messages.push(moment);
                    }
                }
            }
        }
        //
        return messages;
    };

    getAllPossibleEverything = (): Array<IMoment> => {
        let all = this.getAllPossibleMoments();
        Array.prototype.push.apply(all, this.getAllPossibleMessages());
        return all;
    };

    buildChoices = (moments: Array<IMoment>, messages: Array<IMoment>): Array<IChoice> => {
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
                kind: CKind.scene,
                id: obj.id,
                text: obj.name 
            }; 
        });
        let choices2 = Array<IChoice>();
        choices2 = actions.map((obj) => { 
            return <IChoice> { 
                kind: CKind.action,
                id: obj.id,
                text: obj.name 
            }; 
        });
        choices = choices.concat(choices2);


        for (var message of messages) {
            if (message.kind == Kind.MessageFrom) {
                choices.push(<IChoice> {
                    kind: CKind.messageFrom,
                    id: message.id,
                    text: "Message de " + this.getActorOf(message).name
                });
            }
            else {
                let msg = (<IMessageTo>message);
                choices.push(<IChoice> {
                    kind: CKind.messageTo,
                    id: msg.id,
                    text: "Contacter " + this.getActorById(msg.to).name,
                    subtext: msg.name
                });
            }
        }
        
        this.forbiddenSceneId = null;
        return choices;
    };

    getChosenMoment = (choice: IChoice): IMoment => {
        if (choice.kind == CKind.scene) {
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
        else {
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
        return this.isValidCondition(state, when);
    };

    isValidSituation = (situation: ISituation): boolean => {
        var when = situation.when || "";
        if (when == "") return false;
        return this.isValidCondition(this.gdata.state, when);
    }

    isValidCondition = (state: any, when: string) => {
        let ok = true;
        let conds = when.split(",");
        for (var cond of conds) {
            let parts = cond.replace("=", ":").split(":");
            let name = parts[0].trim();
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
            if (ok == false) break;
        }
        return ok;
    }

    getSceneOf = (moment: IMoment): IScene => {
        var scenes = this.data.scenes;
        for (var scene of scenes) {
            if (scene.id == moment.parentid) {
                return scene;
            }
        }
    };

    getActorOf = (message: IMoment): IActor => {
        var actors = this.data.actors;
        for (var actor of actors) {
            if (actor.id == message.parentid) {
                return actor;
            }
        }
    };

    getActorById = (id: number): IActor => {
        var actors = this.data.actors;
        for (var actor of actors) {
            if (actor.id == id) {
                return actor;
            }
        }
    };

    parseMoment = (moment: IMoment): Array<IMomentData> => {
        var parsed = Array<IMomentData>();
        var current = <IMomentData>{};
        var fsm = "";
        var inComment = false

        if (moment.text == null)
            return parsed;
            
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
                else if (part.startsWith(".")) {
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
        return parsed;
    };

    executeMoment = (id: number): void => {
        var moment = this.gdata.getMoment(this.gdata.moments, id); //we might have edited the moment
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
            }
        }
        if (canRepeat == false) {
            let history = this.gdata.history;
            history.push(moment.id);
            this.gdata.history = history;
        }
    };

    parseScene = (scene: IScene) => {
        var data = <ISceneData>{};
        data.title = scene.name;
        data.image = scene.desc;
        return data;
    };

    updateTimedState = () => {
        let state = this.gdata.state;
        var change = false;
        for (var prop in state) {
            var parts = prop.split("/");
            if (parts.length == 2) {
                var value = state[prop];
                var name = parts[0];
                var countdown = parseInt(parts[1]) - 1;
                if (countdown == 0) {
                    state[name] = value;
                }
                else {
                    state[`${name}/${countdown}`] = value;
                }
                delete state[prop];
                change = true;
            }
        }
        if (change) {
            this.gdata.state = state;
        }
    };

    getDataFile = (url: string, callback: (text: any) => void) => {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200)
                callback(xhr.responseText);
        }
        xhr.send();
    };
}
