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
    mids: Array<number>
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
            { id: 0, name: "Bord de l'eau", desc: "EXT. Bord de l'eau", mids: [], aids: [] },
            { id: 1, name: "Conductrice", desc: "EXT. Conductrice", mids: [0], aids: [] },
            { id: 2, name: "Camion", desc: "EXT. Le camion accidenté", mids: [0, 1, 2], aids: [0] },
            { id: 3, name: "Capot", desc: "EXT. Le capot", mids: [], aids: [] }
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

    saveData = (text: string) => {
        var gdata = <IGameData> JSON.parse(text);
        localStorage.clear();
        localStorage.setItem("game", JSON.stringify(gdata.game));
        localStorage.setItem("situations", JSON.stringify(gdata.situations));
        localStorage.setItem("scenes", JSON.stringify(gdata.scenes));
        localStorage.setItem("moments", JSON.stringify(gdata.moments));
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
        for (var sit of sits) {
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
        for (var sit of sits) {
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
        for (var sid of sit.sids) {
            this.deleteScene(sid);
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
        for (var scn of scns) {
            if (scn.id > id) id = scn.id;
        }
        id++;
        var scn: IScene = { id: id, name: null, desc: null, mids: [], aids: [] };
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
        for (var mid of scn.mids) {
            this.deleteMoment(mid);
        }
        //
        scns.splice(index, 1);
        this.scenes = scns;
        //
        var sits = this.situations;
        for (var sit of sits) {
            for (var i = 0; i < sit.sids.length; i++) {
                if (sit.sids[i] == id) {
                    sit.sids.splice(i, 1);
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
    addMoment = (scnid: number) => {
        var id = -1;
        var moms = this.moments;
        for (var mom of moms) {
            if (mom.id > id) id = mom.id;
        }
        id++;
        var mom: IMoment = { id: id, when: null, text: null };
        moms.push(mom);
        this.moments = moms;
        //
        var scns = this.scenes;
        var scn = this.getScene(scns, scnid);
        scn.mids.push(id);
        this.scenes = scns;
        return id;
    }

    deleteMoment = (id: number) => {
        var moms = this.moments;
        var index = this.getMomentIndex(moms, id);
        var mom = moms[index];
        //
        moms.splice(index, 1);
        this.moments = moms;
        //
        var scns = this.scenes;
        for (var scn of scns) {
            for (var i = 0; i < scn.mids.length; i++) {
                if (scn.mids[i] == id) {
                    scn.mids.splice(i, 1);
                    break;
                }
            }
        }
        this.scenes = scns;
    }

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
    //
    // game
    //
    get game() {
        return <IGame> JSON.parse(localStorage.getItem("game"));
    }

    set game(game: IGame) {
        localStorage.setItem("game", JSON.stringify(game));
    }

    //
    // situations
    //
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

    //
    // scenes
    //
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

    getScenesOf = (sit: ISituation): Array<IScene> => {
        var scenes = this.scenes;
        var scns: Array<IScene> = [];
        for (var sid of sit.sids) {
            for (var scene of scenes) {
                if (scene.id == sid) {
                    scns.push(scene);
                    break;
                }
            }
        }
        return scns;
    }

    //
    // moments
    //
    get moments() : Array<IMoment> {
        return JSON.parse(localStorage.getItem("moments"));
    }

    set moments(moms: Array<IMoment>) {
        localStorage.setItem("moments", JSON.stringify(moms));
    }

    getMoment = (moms: Array<IMoment>, id: number) => {
        return (moms[this.getMomentIndex(moms, id)]);
    }

    getMomentIndex = (moms: Array<IMoment>, id: number) => {
        for (var i = 0; i < moms.length; i++) {
            if (moms[i].id == id)
                return i;
        }
    }

    getMomentsOf = (scn: IScene): Array<IMoment> => {
        var moments = this.moments;
        var moms: Array<IMoment> = [];
        for (var mid of scn.mids) {
            for (var moment of moments) {
                if (moment.id == mid) {
                    moms.push(moment);
                    break;
                }
            }
        }
        return moms;
    }
}
