enum Kind {
    Moment,
    Action
}

enum AKind {
    Player,
    NPC
}

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
    aids: Array<number>
    aid: number
}

interface IScene {
    id: number
    name: string
    desc: string
    mids: Array<number>
}

interface IActor {
    kind: AKind
    id: number
    name: string
    mids: Array<number>
}

interface IMoment {
    kind: Kind
    id: number
    scnid: number
    when: string
    text: string
}

interface IAction extends IMoment {
    name: string
}

interface IGameData {
    game: IGame
    situations: Array<ISituation>
    scenes: Array<IScene>
    actors: Array<IActor>
    moments: Array<IMoment>
    me: any
    meid: number
}


class GameData {

    loadGame = () => {
        var game = this.game;
        var sits = this.situations;
        var scns = this.scenes;
        var acts = this.actors;
        var moms = this.moments;
        var gdata = <IGameData> { 
            game: game || <IGame>{id:0, name: null, startsid:0}, 
            situations: sits,
            scenes: scns,
            actors: acts,
            moments: moms,
            me: null,
            meid: null
        };
        if (game == null) {
            var text = JSON.stringify(gdata);
            this.saveData(text);
        }
        return gdata;
    }

    saveData = (text: string) => {
        var gdata = <IGameData> JSON.parse(text);
        this.clearStorage();
        this.game = gdata.game;
        this.situations = gdata.situations;
        this.scenes = gdata.scenes;
        this.actors = gdata.actors;
        this.moments = gdata.moments;
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
        var sit: ISituation = { id: id, name: null, when: null, tags: [], sids: [], aids: [], aid: null };
        sits.push(sit);
        this.situations = sits;
        //
        var aid = this.addActor(id, AKind.Player);
        this.saveSituationPlayerId(aid, id);
        //
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
        this.deleteActor(sit.aid);
        for (var aid of sit.aids) {
            this.deleteActor(aid);
        }
        //
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

    saveSituationPlayerId = (aid: number, id: number) => {
        var sits = this.situations;
        var sit = this.getSituation(sits, id);
        sit.aid = aid;
        sit.aids = [];
        this.situations = sits;
    }

    saveSituationTags = (name: string, id: number) => {
        //TODO
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
    addScene = (sitid: number) => {
        var id = -1;
        var scns = this.scenes;
        for (var scn of scns) {
            if (scn.id > id) id = scn.id;
        }
        id++;
        var scn: IScene = { id: id, name: null, desc: null, mids: [] };
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
            this.deleteSceneMoment(mid);
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
// actors
//
    addActor = (sitid: number, akind?: AKind) => {
        var id = -1;
        var acts = this.actors;
        for (var act of acts) {
            if (act.id > id) id = act.id;
        }
        id++;
        var kind: AKind =  (akind == undefined ? AKind.NPC : akind);
        var act: IActor = { id: id, kind: kind, name: null, mids: [] };
        acts.push(act);
        this.actors = acts;
        //
        var sits = this.situations;
        var sit = this.getSituation(sits, sitid);
        sit.aids.push(id);
        this.situations = sits;
        return id;
    }

    deleteActor = (id: number) => {
        var acts = this.actors;
        var index = this.getActorIndex(acts, id);
        var act = acts[index];
        //
        for (var mid of act.mids) {
            this.deleteActorMoment(mid);
        }
        //
        acts.splice(index, 1);
        this.actors = acts;
        //
        var sits = this.situations;
        for (var sit of sits) {
            for (var i = 0; i < sit.aids.length; i++) {
                if (sit.aids[i] == id) {
                    sit.aids.splice(i, 1);
                    break;
                }
            }
        }
        this.situations = sits;
    }

    saveActorName = (name: string, id: number) => {
        var acts = this.actors;
        var act = this.getActor(acts, id);
        act.name = name;
        this.actors = acts;
    }

    getActor = (acts: Array<IActor>, id: number) => {
        return (acts[this.getActorIndex(acts, id)]);
    }

    getActorIndex = (acts: Array<IActor>, id: number) => {
        for (var i = 0; i < acts.length; i++) {
            if (acts[i].id == id)
                return i;
        }
    }

    getActorsOf = (sit: ISituation): Array<IActor> => {
        var actors = this.actors;
        var acts: Array<IActor> = [];
        for (var aid of sit.aids) {
            for (var actor of actors) {
                if (actor.id == aid) {
                    acts.push(actor);
                    break;
                }
            }
        }
        return acts;
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
        var mom: IMoment = { kind: Kind.Moment, id: id, scnid: scnid, when: null, text: null };
        moms.push(mom);
        this.moments = moms;
        //
        var scns = this.scenes;
        var scn = this.getScene(scns, scnid);
        scn.mids.push(id);
        this.scenes = scns;
        return id;
    }

    deleteSceneMoment = (id: number) => {
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

    deleteActorMoment = (id: number) => {
        var moms = this.moments;
        var index = this.getMomentIndex(moms, id);
        var mom = moms[index];
        //
        moms.splice(index, 1);
        this.moments = moms;
        //
        var acts = this.actors;
        for (var act of acts) {
            for (var i = 0; i < act.mids.length; i++) {
                if (act.mids[i] == id) {
                    act.mids.splice(i, 1);
                    break;
                }
            }
        }
        this.actors = acts;
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
                if (moment.id == mid && moment.kind == Kind.Moment) {
                    moms.push(moment);
                    break;
                }
            }
        }
        return moms;
    }

//
// actions
//
    addAction = (scnid: number) => {
        var id = -1;
        var moms = this.moments;
        for (var mom of moms) {
            if (mom.id > id) id = mom.id;
        }
        id++;
        var act: IAction = { kind: Kind.Action, id: id, scnid: scnid, when: null, text: null, name: null };
        moms.push(act);
        this.moments = moms;
        //
        var scns = this.scenes;
        var scn = this.getScene(scns, scnid);
        scn.mids.push(id);
        this.scenes = scns;
        return id;
    }

    deleteAction = (id: number) => {
        this.deleteSceneMoment(id);
    }

    saveActionWhen = (when: string, id: number) => {
        this.saveMomentWhen(when, id);
    }

    saveActionName = (text: string, id: number) => {
        var moms = <Array<IAction>>this.moments;
        var act = this.getAction(moms, id);
        act.name = text;
        this.moments = moms;
    }

    saveActionText = (text: string, id: number) => {
        this.saveMomentText(text, id);
    }

    getAction = (acts: Array<IMoment>, id: number) => {
        return <IAction>this.getMoment(acts, id);
    }

    getActionsOf = (scn: IScene): Array<IAction> => {
        var moments = this.moments;
        var moms: Array<IMoment> = [];
        for (var mid of scn.mids) {
            for (var moment of moments) {
                if (moment.id == mid && moment.kind == Kind.Action) {
                    moms.push(moment);
                    break;
                }
            }
        }
        return <Array<IAction>>moms;
    }


//
// localstorage
//
    clearStorage = () => {
        localStorage.clear();
    }

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
        return JSON.parse(localStorage.getItem("situations")) || [];
    }

    set situations(sits: Array<ISituation>) {
        localStorage.setItem("situations", JSON.stringify(sits));
    }

    //
    // scenes
    //
    get scenes() : Array<IScene> {
        return JSON.parse(localStorage.getItem("scenes")) || [];
    }

    set scenes(moms: Array<IScene>) {
        localStorage.setItem("scenes", JSON.stringify(moms));
    }

    //
    // actors
    //
    get actors() : Array<IActor> {
        return JSON.parse(localStorage.getItem("actors")) || [];
    }

    set actors(moms: Array<IActor>) {
        localStorage.setItem("actors", JSON.stringify(moms));
    }

    //
    // moments
    //
    get moments() : Array<IMoment> {
        return JSON.parse(localStorage.getItem("moments")) || [];
    }

    set moments(moms: Array<IMoment>) {
        localStorage.setItem("moments", JSON.stringify(moms));
    }

    //
    // state
    //
    get state() : any {
        return JSON.parse(localStorage.getItem("state"));
    }

    set state(moms: any) {
        localStorage.setItem("state", JSON.stringify(moms));
    }

    //
    // history
    //
    get history() : Array<number> {
        return JSON.parse(localStorage.getItem("history"));
    }

    set history(mids: Array<number>) {
        localStorage.setItem("history", JSON.stringify(mids));
    }
}
