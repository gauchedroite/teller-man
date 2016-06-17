interface IGame {
    id: number
    name: string
    startsid: number
}

interface ISituation {
    id: number
    name: string
    when: string
    tags: Array<string>
    sids: Array<number>
    npcids: Array<number>
}

interface IScene {
    id: number
    name: string
    desc: string
    bids: Array<number>
    aids: Array<number>
}

interface IMoment {
    id: number
    when: string
    text: string
}

interface IGameData {
    game: IGame
    situations: Array<ISituation>
    scenes: Array<IScene>
    moments: Array<IMoment>
    me: any
    meid: number
}


class GameData {

    mockData = () => {
        localStorage.clear();
        var game: IGame = {
            id: 0, name: "Le jeu de paume", startsid: 0
        };
        var situations: Array<ISituation> = [
            { id: 0, name: "Beginning", when: "undef cheval", tags: ["chap1", "trésor"], sids: [0, 1, 2, 3], npcids: [0] },
            { id: 1, name: "Dead dog", when: "todo", tags: ["chap1", "dog"], sids: [], npcids: [] }
        ];
        var scenes: Array<IScene> = [
            { id: 0, name: "Bord de l'eau", desc: "EXT. Bord de l'eau", bids: [], aids: [] },
            { id: 1, name: "Conductrice", desc: "EXT. Conductrice", bids: [0], aids: [] },
            { id: 2, name: "Camion", desc: "EXT. Le camion accidenté", bids: [0, 1, 2], aids: [0] },
            { id: 3, name: "Capot", desc: "EXT. Le capot", bids: [], aids: [] }
        ];
        var moments: Array<IMoment> = [
            { id: 0, when: "not cheval", text: "[0] .a Jack" },
            { id: 1, when: "undef inv.crowbar", text: "[1] .a Jack" },
            { id: 2, when: "inv.crowbar", text: "[2] .a Jack" },
            { id: 3, when: "not inv.crowbar", text: "[3] .a Jack" }
        ];
        localStorage.setItem("game", JSON.stringify(game));
        localStorage.setItem("situations", JSON.stringify(situations));
        localStorage.setItem("scenes", JSON.stringify(scenes));
        localStorage.setItem("moments", JSON.stringify(moments));
    }

    loadGame = () => {
        var game = <IGame> JSON.parse(localStorage.getItem("game"));
        var sits = <Array<ISituation>> JSON.parse(localStorage.getItem("situations"));
        var scns = <Array<IScene>> JSON.parse(localStorage.getItem("scenes"));
        var moms = <Array<IMoment>> JSON.parse(localStorage.getItem("moments"));
        return <IGameData> { 
            game: game, 
            situations: sits,
            scenes: scns,
            moments: moms,
            me: null,
            meid: null
        };
    }

//
// game
//
    saveGameName = (name: string) => {
        var game = this.game;
        game.name = name;
        this.game = game;
    }

    saveGameStartSituation = (text: string) => {
        var game = this.game;
        var sits = this.situations;
        for (var i = 0; i < sits.length; i++) {
            var sit = sits[i];
            if (sit.name == text) {
                game.startsid = sit.id;
                this.game = game;
                return;
            }
        }
    }

//
// situations
//
    addSituation = () => {
        var id = -1;
        var sits = this.situations;
        for (var i = 0; i < sits.length; i++) {
            var sit = sits[i];
            if (sit.id > id) id = sit.id;
        }
        id++;
        var sit: ISituation = { id: id, name: null, when: null, tags: [], sids: [], npcids: [] };
        sits.push(sit);
        this.situations = sits;
        return id;
    }

    deleteSituation = (id: number) => {
        var sits = this.situations;
        var index = this.getSituationIndex(sits, id);
        var sit = sits[index];
        //
        for (var i = 0; i < sit.sids.length; i++) {
            var id = sit.sids[i];
            this.deleteScene(id);
        }
        //
        sit.sids = [];
        sits.splice(index, 1);
        this.situations = sits;
    }

    saveSituationName = (name: string, id: number) => {
        var sits = this.situations;
        var sit = this.getSituation(sits, id);
        sit.name = name;
        this.situations = sits;
    }

    saveSituationWhen = (when: string, id: number) => {
        var sits = this.situations;
        var sit = this.getSituation(sits, id);
        sit.when = when;
        this.situations = sits;
    }

    saveSituationTags = (name: string, id: number) => {
        //TODO
    }

//
// scenes
//
    addScene = (sitid: number) => {
        var id = -1;
        var scns = this.scenes;
        for (var i = 0; i < scns.length; i++) {
            var scn = scns[i];
            if (scn.id > id) id = scn.id;
        }
        id++;
        var scn: IScene = { id: id, name: null, desc: null, bids: [], aids: [] };
        scns.push(scn);
        this.scenes = scns;
        //
        var sits = this.situations;
        var sit = this.getSituation(sits, sitid);
        sit.sids.push(id);
        this.situations = sits;
        return id;
    }

    deleteScene = (id: number) => {
        var scns = this.scenes;
        var index = this.getSceneIndex(scns, id);
        var scn = scns[index];
        //
        for (var i = 0; i < scn.bids.length; i++) {
            //todo this.deleteMoment(scn.bids[i]);
        }
        //
        scns.splice(index, 1);
        this.scenes = scns;
        //
        var sits = this.situations;
        for (var i = 0; i < sits.length; i++) {
            var sit = sits[i];
            for (var j = 0; j < sit.sids.length; j++) {
                if (sit.sids[j] == id) {
                    sit.sids.splice(j);
                    break;
                }
            }
        }
        this.situations = sits;
    }

    saveSceneName = (name: string, id: number) => {
        var scns = this.scenes;
        var scn = this.getScene(scns, id);
        scn.name = name;
        this.scenes = scns;
    }

    saveSceneDesc = (desc: string, id: number) => {
        var scns = this.scenes;
        var scn = this.getScene(scns, id);
        scn.desc = desc;
        this.scenes = scns;
    }

//
// moments
//
    saveMomentWhen = (when: string, id: number) => {
        var moms = this.moments;
        var mom = this.getMoment(moms, id);
        mom.when = when;
        this.moments = moms;
    }

    saveMomentText = (text: string, id: number) => {
        var moms = this.moments;
        var mom = this.getMoment(moms, id);
        mom.text = text;
        this.moments = moms;
    }


//
// localstorage
//
    get game() {
        return <IGame> JSON.parse(localStorage.getItem("game"));
    }

    set game(game: IGame) {
        localStorage.setItem("game", JSON.stringify(game));
    }

    get situations() : Array<ISituation> {
        return JSON.parse(localStorage.getItem("situations"));
    }

    set situations(sits: Array<ISituation>) {
        localStorage.setItem("situations", JSON.stringify(sits));
    }

    getSituation = (sits: Array<ISituation>, id: number) => {
        return (sits[this.getSituationIndex(sits, id)]);
    }

    getSituationIndex = (sits: Array<ISituation>, id: number) => {
        for (var i = 0; i < sits.length; i++) {
            if (sits[i].id == id)
                return i;
        }
    }

    get scenes() : Array<IScene> {
        return JSON.parse(localStorage.getItem("scenes"));
    }

    set scenes(moms: Array<IScene>) {
        localStorage.setItem("scenes", JSON.stringify(moms));
    }

    getScene = (scns: Array<IScene>, id: number) => {
        return (scns[this.getSceneIndex(scns, id)]);
    }

    getSceneIndex = (scns: Array<IScene>, id: number) => {
        for (var i = 0; i < scns.length; i++) {
            if (scns[i].id == id)
                return i;
        }
    }

    get moments() : Array<IMoment> {
        return JSON.parse(localStorage.getItem("moments"));
    }

    set moments(moms: Array<IMoment>) {
        localStorage.setItem("moments", JSON.stringify(moms));
    }

    getMoment = (moms: Array<IMoment>, id: number) => {
        for (var i = 0; i < moms.length; i++) {
            if (moms[i].id == id)
                return moms[i];
        }
    }
}