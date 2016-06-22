
class Game {
    gdata: GameData;
    ui: UI;
    data: IGameData;
    chunks: Array<IMomentData>
    cix: number;
    mode: string;

    constructor() {
        this.gdata = new GameData();

        var state = this.gdata.state;
        if (state == undefined || state == null) {
            this.gdata.state = { intro: true };
        }

        this.data = this.gdata.loadGame();
        this.ui = new UI(this.update);
        this.mode = "INIT";
        this.update();
    }

    update = (): void => {
        var ui = this.ui;
        if (this.mode == "SECTION") {
            if (this.cix < this.chunks.length) {
                var chunk = this.chunks[this.cix++];
                ui.typeSection(chunk);
            }
            else {
                this.mode = "CHOICES";
                ui.slideChoicesUp();                
            }
        }
        else if (this.mode == "CHOICES") {
            this.mode = "";
            ui.slideChoicesDown();
        }
        else if (this.mode == "INIT") {
            var moment = this.getNextMoment();
            this.chunks = this.parseMoment(moment);
            this.cix = 0;

            var scene = this.getParentScene(moment);
            ui.typeTitle(scene.name);

            this.mode = "SECTION";
            this.update();
        }
        else {
            console.log("g.a.m.e.o.v.e.r?");
        }
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
        return parsed;
    };
}
