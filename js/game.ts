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
        let menuHtml = (this.gdata.game != undefined ? this.gdata.game.desc : "");
        if (menuHtml == "") 
            menuHtml = "teller-menu.html";

        (<any>window).GameInstance = this;

        this.ui = new UI(menuHtml, 
            () => {
                if (skipMenu) {
                    options.skipMenu = false;
                    this.gdata.options = options;
                    this.update(Op.WAITING);
                }
                else {
                    this.update(Op.MENU_BOOT);
                }
            }, 
            () => { this.update(Op.MENU_INGAME); });
    }

    update = (op: Op, param?: any): void => {
        this.data = this.gdata.loadGame();
        var ui = this.ui;

        if (op == Op.MOMENT) {
            if (this.currentMoment == null) { 
                this.saveContinueState();
                this.idle("Il ne se passe plus rien pour le moment.");
                return null;
            }

            this.chunks = this.parseMoment(this.currentMoment);
            this.cix = 0;

            let kind = this.currentMoment.kind; 
            if (kind == Kind.Moment || kind == Kind.Action) {
                this.currentScene = this.getSceneOf(this.currentMoment);
            }
            this.saveContinueState();
            
            ui.clearBlurb();
            ui.initScene(this.parseScene(this.currentScene), () => {
                this.raiseActionEvent(OpAction.SHOWING_MOMENT, this.currentMoment);
                setTimeout(() => { this.update(Op.BLURB); }, 0);
            });
        }
        else if (op == Op.BLURB) {
            if (this.cix < this.chunks.length) {
                var chunk = this.chunks[this.cix++];

                let notLast = this.cix < this.chunks.length;
                let goFast = this.gdata.options.fastStory && notLast;
                if (goFast) {
                    ui.addBlurbFast(chunk, () => {
                        setTimeout(() => { this.update(Op.BLURB); }, 50);
                    });
                }
                else {
                    ui.addBlurb(chunk, () => {
                        setTimeout(() => { this.update(Op.BLURB); }, 50);
                    });
                }
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
                    ui.showChoices(choices, (chosen: IChoice) => {
                        this.update(Op.CHOICES, chosen);
                    });
                }
                else {
                    this.idle("Il ne se passe plus rien pour le moment.");
                }
            }
        }
        else if (op == Op.CHOICES) {
            ui.hideChoices(() => {
                let choice = <IChoice>param;
                this.currentMoment = this.getChosenMoment(choice);
                this.updateTimedState();
                setTimeout(() => { this.update(Op.MOMENT); }, 0);
            });
        }
        else if (op == Op.MENU_BOOT) {
            if (this.gdata.options == undefined)
                ui.showMenu(Op.NEWGAME, null, (chosen: Op) => {
                    setTimeout(() => { this.update(chosen); }, 0);
                });
            else
                ui.showMenu(Op.NEWGAME, Op.CONTINUE_SAVEDGAME, (chosen: Op) => {
                    setTimeout(() => { this.update(chosen); }, 0);
                });
        }
        else if (op == Op.MENU_INGAME) {
            ui.showMenu(Op.NEWGAME, Op.CONTINUE_INGAME, (chosen: Op) => {
                setTimeout(() => { this.update(chosen); }, 0);
            });
        }
        else if (op == Op.CONTINUE_SAVEDGAME) {
            if (this.gdata.options == undefined || this.gdata.options.skipFileLoad == false) {
                this.getDataFile("game/app.json", (text: string) => {
                    if (text != undefined && text.length > 0) this.gdata.saveData(text);
                    this.restoreContinueState();
                    ui.initScene(this.parseScene(this.currentScene), () => {
                        setTimeout(() => { this.update(Op.MOMENT); }, 0);
                    });
                });
            }
            else {
                this.restoreContinueState();
                ui.initScene(this.parseScene(this.currentScene), () => {
                    setTimeout(() => { this.update(Op.MOMENT); }, 0);
                });
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
            this.idle("Game Over?");
        }
    };

    saveContinueState = () => {
        this.gdata.continueState = {
            momentId: (this.currentMoment != undefined ? this.currentMoment.id : undefined),
            sceneId: (this.currentScene != undefined ? this.currentScene.id : undefined),
            forbiddenSceneId: this.forbiddenSceneId,
            state: this.gdata.state,
            history: this.gdata.history
        };
    };

    restoreContinueState = () => {
        let cstate = this.gdata.continueState;
        if (cstate != undefined) {
            this.currentMoment = (cstate.momentId != undefined ? this.gdata.getMoment(this.gdata.moments, cstate.momentId) : undefined);
            this.currentScene = (cstate.sceneId != undefined ? this.gdata.getScene(this.gdata.scenes, cstate.sceneId) : undefined);
            this.forbiddenSceneId = cstate.forbiddenSceneId;
            this.gdata.state = cstate.state; 
            this.gdata.history = cstate.history;
        }
    };

    newGame = () => {
        this.gdata.history = [];    //init the list of showned moments
        this.gdata.continueState = null;

        let options = this.gdata.options;
        if (options == undefined) options = <IOptions>{ 
            skipFileLoad: false,
            skipMenu: true,
            syncEditor: false,
            fastStory: false
        };
        options.skipMenu = true;
        this.gdata.options = options;

        this.raiseActionEvent(OpAction.GAME_START);

        const setInitialState = () => {
            //initial state is dependent on game data
            let state = { intro: true };
            state[this.gdata.game.initialstate] = true;
            this.gdata.state = state;
        };

        if (options.skipFileLoad == false) {
            this.getDataFile("game/app.json", (text: any) => {
                if (text != undefined && text.length > 0) this.gdata.saveData(text);
                setInitialState();
                setTimeout(function() { location.href = "index.html"; }, 0);
            });
        }
        else {
            setInitialState();
            setTimeout(function() { location.href = "index.html"; }, 0);
        }
    };

    idle = (text: string) => {
        let refreshed = (this.gdata.options != undefined && this.gdata.options.skipFileLoad);
        if (refreshed == false) {
            this.getDataFile("game/app.json", (text: string) => {
                if (text != undefined && text.length > 0) this.gdata.saveData(text);
                refreshed = true;
            });
        }
        this.ui.alert(text, () => { return refreshed; }, () => {
            this.update(Op.WAITING);
        }); 
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
        if (situation == undefined)
            return Array<IMoment>();

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
        if (situation == undefined)
            return Array<IMoment>();

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
                kind: ChoiceKind.scene,
                id: obj.id,
                text: obj.name 
            }; 
        });
        let choices2 = Array<IChoice>();
        choices2 = actions.map((obj) => { 
            return <IChoice> { 
                kind: ChoiceKind.action,
                id: obj.id,
                text: obj.name 
            }; 
        });
        choices = choices.concat(choices2);


        for (var message of messages) {
            if (message.kind == Kind.MessageFrom) {
                choices.push(<IChoice> {
                    kind: ChoiceKind.messageFrom,
                    id: message.id,
                    text: "Message de " + this.getActorOf(message).name
                });
            }
            else {
                let msg = (<IMessageTo>message);
                choices.push(<IChoice> {
                    kind: ChoiceKind.messageTo,
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
        if (choice.kind == ChoiceKind.scene) {
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
        var dialog = <IDialog>{};
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

                    dialog = <IDialog> { kind: ChunkKind.dialog };
                    if (aa.length == 2) {
                        dialog.actor = aa[0].trim();
                        dialog.mood = aa[1].trim();
                    }
                    else {
                        dialog.actor = aa[0];
                    }
                    fsm = "DIALOG";
                }
                else if (part.startsWith("(")) {
                    dialog.parenthetical = part;
                }
                else if (part.startsWith(".b")) {
                    let asset = <IBackground> { kind: ChunkKind.background, asset: part.substring(2).trim() };
                    parsed.push(asset);
                }
                else if (part.startsWith(".i")) {
                    let image = <IInline> { kind: ChunkKind.inline , image: part.substring(2).trim() };
                    parsed.push(image);
                }
                else if (part.startsWith(".d")) {
                    let space = part.indexOf(" ");
                    if (space != -1) {
                        let chance = parseInt(part.substring(2, space));
                        if ((Math.random() * chance) < 1) {
                            let lines = part.substr(space).trim().split("/");
                            let text = <IText> { kind: ChunkKind.text };
                            text.lines = Array<string>();
                            for (var line of lines) {
                                text.lines.push(line);
                            }
                            parsed[parsed.length - 1] = text;
                        }
                    }
                }
                else if (part.startsWith(".h")) {
                    let parts = part.substring(2).trim().split("/");
                    let title = parts[0].trim();
                    let subtitle = (parts.length > 1 ? parts[1].trim() : undefined);
                    let heading = <IHeading> { kind: ChunkKind.heading, title: title, subtitle: subtitle };
                    parsed.push(heading);
                }
                else if (part.startsWith(".p")) {
                    let text = part.substring(2).trim();
                    let pause = <IPause> { kind: ChunkKind.pause, text: text };
                    parsed.push(pause);
                }
                else if (part.startsWith(".")) {
                }
                else {
                    if (fsm == "DIALOG") {
                        var lines = part.split("/");

                        dialog.lines = Array<string>();
                        for (var line of lines) {
                            dialog.lines.push(line);
                        }
                        parsed.push(dialog);
                        fsm = "";
                    }
                    else {
                        var lines = part.split("/");

                        let text = <IText> { kind: ChunkKind.text };
                        text.lines = Array<string>();
                        for (var line of lines) {
                            text.lines.push(line);
                        }
                        parsed.push(text);
                    }
                }
            }
        }
        return parsed;
    };

    executeMoment = (id: number): void => {
        var moment = this.gdata.getMoment(this.gdata.moments, id); //we might have edited the moment
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
                    for (var del of flags) {
                        let flag = del.trim();
                        if (flag == "can-repeat") canRepeat = true;
                        if (flag == "must-leave-scene") this.forbiddenSceneId = this.getSceneOf(moment).id;
                    }
                }
                else if (part.startsWith(".x ")) {
                    let dels = part.substring(2).split(",");
                    let state = this.gdata.state;
                    for (var del of dels) {
                        let pattern = del.trim();
                        if (pattern == "*") {
                            for (var property in state) {
                                if (property.indexOf(".") == -1) //one part names only (not inv.*)
                                    delete state[property];
                            }
                        }
                        else if (pattern.endsWith(".*")) {
                            let prefix = pattern.split(".")[0].trim();
                            for (var property in state) {
                                if (property.startsWith(prefix + "."))
                                    delete state[property];
                            }
                        }
                        else {
                            delete state[pattern];
                        }
                    }
                    this.gdata.state = state;
                }
            }
        }
        if (canRepeat == false) {
            let history = this.gdata.history;
            history.push(moment.id);
            this.gdata.history = history;
        }
    };

    static getCommands = (text: string): Array<string> => {
        if (text == undefined) return [];
        var inComment = false
        var commands = new Array<string>();
        var parts = text.split("\n");
        for (var part of parts) {
            if (part.length > 0) {
                if (part.startsWith("/*")) { inComment = true; }
                else if (inComment) { inComment = (part.startsWith("*/") == false); }
                else if (part.startsWith(".r ") || part.startsWith(".f ") || part.startsWith(".x ")) {
                    commands.push(part);
                }
            }
        }
        return commands;
    };

    static getWhens = (text: string): Array<string> => {
        if (text == undefined) return [];
        var whens = new Array<string>();
        var parts = text.split(",");
        for (var part of parts) {
            if (part.length > 0) {
                whens.push(part.trim());
            }
        }
        return whens;
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

    getDataFile = (url: string, callback: (text: string) => void) => {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200)
                callback(xhr.responseText);
        }
        xhr.send();
    };
}
