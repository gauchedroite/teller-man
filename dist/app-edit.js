var ChunkKind;
(function (ChunkKind) {
    ChunkKind[ChunkKind["dialog"] = 0] = "dialog";
    ChunkKind[ChunkKind["text"] = 1] = "text";
    ChunkKind[ChunkKind["background"] = 2] = "background";
    ChunkKind[ChunkKind["inline"] = 3] = "inline";
    ChunkKind[ChunkKind["heading"] = 4] = "heading";
    ChunkKind[ChunkKind["doo"] = 5] = "doo";
    ChunkKind[ChunkKind["minigame"] = 6] = "minigame";
    ChunkKind[ChunkKind["gameresult"] = 7] = "gameresult";
    ChunkKind[ChunkKind["waitclick"] = 8] = "waitclick";
})(ChunkKind || (ChunkKind = {}));
var Op;
(function (Op) {
    Op[Op["CURRENT_MOMENT"] = 0] = "CURRENT_MOMENT";
    Op[Op["BLURB"] = 1] = "BLURB";
    Op[Op["BUILD_CHOICES"] = 2] = "BUILD_CHOICES";
})(Op || (Op = {}));
var OpAction;
(function (OpAction) {
    OpAction[OpAction["SHOWING_CHOICES"] = 0] = "SHOWING_CHOICES";
    OpAction[OpAction["GAME_START"] = 1] = "GAME_START";
    OpAction[OpAction["SHOWING_MOMENT"] = 2] = "SHOWING_MOMENT";
})(OpAction || (OpAction = {}));
var Kind;
(function (Kind) {
    Kind[Kind["Moment"] = 0] = "Moment";
    Kind[Kind["Action"] = 1] = "Action";
    Kind[Kind["MessageTo"] = 2] = "MessageTo";
    Kind[Kind["MessageFrom"] = 3] = "MessageFrom";
})(Kind || (Kind = {}));
var AKind;
(function (AKind) {
    AKind[AKind["Player"] = 0] = "Player";
    AKind[AKind["NPC"] = 1] = "NPC";
})(AKind || (AKind = {}));
/// <reference path="igame.ts" />
/// <reference path="igame-data.ts" />
var GameData = (function () {
    function GameData() {
        var _this = this;
        this.loadGame = function () {
            var game = _this.game;
            var sits = _this.situations;
            var scns = _this.scenes;
            var acts = _this.actors;
            var moms = _this.moments;
            var gdata = {
                game: game || { id: 0, name: null, initialstate: null, desc: null },
                situations: sits,
                scenes: scns,
                actors: acts,
                moments: moms,
                me: null,
                meid: null
            };
            if (game == null) {
                var text = JSON.stringify(gdata);
                _this.saveData(text);
            }
            return gdata;
        };
        this.saveData = function (text) {
            var gdata = JSON.parse(text);
            _this.game = gdata.game;
            _this.situations = gdata.situations;
            _this.scenes = gdata.scenes;
            _this.actors = gdata.actors;
            _this.moments = gdata.moments;
        };
        //
        // game
        //
        this.saveGameName = function (name) {
            var game = _this.game;
            game.name = name;
            _this.game = game;
        };
        this.saveGameInitialState = function (text) {
            var game = _this.game;
            game.initialstate = text;
            _this.game = game;
        };
        this.saveGameDesc = function (text) {
            var game = _this.game;
            game.desc = text;
            _this.game = game;
        };
        //
        // situations
        //
        this.addSituation = function (gameid) {
            var id = -1;
            var sits = _this.situations;
            for (var _i = 0, sits_1 = sits; _i < sits_1.length; _i++) {
                var sit = sits_1[_i];
                if (sit.id > id)
                    id = sit.id;
            }
            id++;
            var sit = { id: id, gameid: gameid, name: null, when: null, tags: [], sids: [], aids: [], aid: null };
            sits.push(sit);
            _this.situations = sits;
            //
            var aid = _this.addActor(id, AKind.Player);
            _this.saveSituationPlayerId(aid, id);
            //
            return id;
        };
        this.deleteSituation = function (id) {
            var sits = _this.situations;
            var index = _this.getSituationIndex(sits, id);
            var sit = sits[index];
            //
            for (var _i = 0, _a = sit.sids; _i < _a.length; _i++) {
                var sid = _a[_i];
                _this.deleteScene(sid);
            }
            //
            _this.deleteActor(sit.aid);
            for (var _b = 0, _c = sit.aids; _b < _c.length; _b++) {
                var aid = _c[_b];
                _this.deleteActor(aid);
            }
            //
            sits.splice(index, 1);
            _this.situations = sits;
        };
        this.saveSituationName = function (name, id) {
            var sits = _this.situations;
            var sit = _this.getSituation(sits, id);
            sit.name = name;
            _this.situations = sits;
        };
        this.saveSituationWhen = function (when, id) {
            var sits = _this.situations;
            var sit = _this.getSituation(sits, id);
            sit.when = when;
            _this.situations = sits;
        };
        this.saveSituationPlayerId = function (aid, id) {
            var sits = _this.situations;
            var sit = _this.getSituation(sits, id);
            sit.aid = aid;
            sit.aids = [];
            _this.situations = sits;
        };
        this.saveSituationTags = function (name, id) {
            //TODO
        };
        this.getSituation = function (sits, id) {
            return (sits[_this.getSituationIndex(sits, id)]);
        };
        this.getSituationIndex = function (sits, id) {
            for (var i = 0; i < sits.length; i++) {
                if (sits[i].id == id)
                    return i;
            }
        };
        this.getSituationOfMessageTo = function (sits, msg) {
            var aid = msg.parentid;
        };
        //
        // scenes
        //
        this.addScene = function (sitid) {
            var id = -1;
            var scns = _this.scenes;
            for (var _i = 0, scns_1 = scns; _i < scns_1.length; _i++) {
                var scn = scns_1[_i];
                if (scn.id > id)
                    id = scn.id;
            }
            id++;
            var scn = { id: id, sitid: sitid, name: null, desc: null, mids: [] };
            scns.push(scn);
            _this.scenes = scns;
            //
            var sits = _this.situations;
            var sit = _this.getSituation(sits, sitid);
            sit.sids.push(id);
            _this.situations = sits;
            return id;
        };
        this.deleteScene = function (id) {
            var scns = _this.scenes;
            var index = _this.getSceneIndex(scns, id);
            var scn = scns[index];
            //
            for (var _i = 0, _a = scn.mids; _i < _a.length; _i++) {
                var mid = _a[_i];
                _this.deleteSceneMoment(mid);
            }
            //
            scns.splice(index, 1);
            _this.scenes = scns;
            //
            var sits = _this.situations;
            for (var _b = 0, sits_2 = sits; _b < sits_2.length; _b++) {
                var sit = sits_2[_b];
                for (var i = 0; i < sit.sids.length; i++) {
                    if (sit.sids[i] == id) {
                        sit.sids.splice(i, 1);
                        break;
                    }
                }
            }
            _this.situations = sits;
        };
        this.saveSceneName = function (name, id) {
            var scns = _this.scenes;
            var scn = _this.getScene(scns, id);
            scn.name = name;
            _this.scenes = scns;
        };
        this.saveSceneDesc = function (desc, id) {
            var scns = _this.scenes;
            var scn = _this.getScene(scns, id);
            scn.desc = desc;
            _this.scenes = scns;
        };
        this.getScene = function (scns, id) {
            return (scns[_this.getSceneIndex(scns, id)]);
        };
        this.getSceneIndex = function (scns, id) {
            for (var i = 0; i < scns.length; i++) {
                if (scns[i].id == id)
                    return i;
            }
        };
        this.getScenesOf = function (sit) {
            var scenes = _this.scenes;
            var scns = [];
            for (var _i = 0, _a = sit.sids; _i < _a.length; _i++) {
                var sid = _a[_i];
                for (var _b = 0, scenes_1 = scenes; _b < scenes_1.length; _b++) {
                    var scene = scenes_1[_b];
                    if (scene.id == sid) {
                        scns.push(scene);
                        break;
                    }
                }
            }
            return scns;
        };
        //
        // actors
        //
        this.addActor = function (sitid, akind) {
            var id = -1;
            var acts = _this.actors;
            for (var _i = 0, acts_1 = acts; _i < acts_1.length; _i++) {
                var act = acts_1[_i];
                if (act.id > id)
                    id = act.id;
            }
            id++;
            var kind = (akind == undefined ? AKind.NPC : akind);
            var act = { id: id, sitid: sitid, kind: kind, name: null, desc: null, mids: [] };
            acts.push(act);
            _this.actors = acts;
            //
            var sits = _this.situations;
            var sit = _this.getSituation(sits, sitid);
            sit.aids.push(id);
            _this.situations = sits;
            return id;
        };
        this.deleteActor = function (id) {
            var acts = _this.actors;
            var index = _this.getActorIndex(acts, id);
            var act = acts[index];
            //
            for (var _i = 0, _a = act.mids; _i < _a.length; _i++) {
                var mid = _a[_i];
                _this.deleteActorMoment(mid);
            }
            //
            acts.splice(index, 1);
            _this.actors = acts;
            //
            var sits = _this.situations;
            for (var _b = 0, sits_3 = sits; _b < sits_3.length; _b++) {
                var sit = sits_3[_b];
                for (var i = 0; i < sit.aids.length; i++) {
                    if (sit.aids[i] == id) {
                        sit.aids.splice(i, 1);
                        break;
                    }
                }
            }
            _this.situations = sits;
        };
        this.saveActorName = function (name, id) {
            var acts = _this.actors;
            var act = _this.getActor(acts, id);
            act.name = name;
            _this.actors = acts;
        };
        this.saveActorDesc = function (desc, id) {
            var acts = _this.actors;
            var act = _this.getActor(acts, id);
            act.desc = desc;
            _this.actors = acts;
        };
        this.getActor = function (acts, id) {
            return (acts[_this.getActorIndex(acts, id)]);
        };
        this.getActorIndex = function (acts, id) {
            for (var i = 0; i < acts.length; i++) {
                if (acts[i].id == id)
                    return i;
            }
        };
        this.getActorsOf = function (sit) {
            var actors = _this.actors;
            var acts = [];
            for (var _i = 0, _a = sit.aids; _i < _a.length; _i++) {
                var aid = _a[_i];
                for (var _b = 0, actors_1 = actors; _b < actors_1.length; _b++) {
                    var actor = actors_1[_b];
                    if (actor.id == aid) {
                        acts.push(actor);
                        break;
                    }
                }
            }
            return acts;
        };
        //
        // moments
        //
        this.addMoment = function (scnid) {
            var id = -1;
            var moms = _this.moments;
            for (var _i = 0, moms_1 = moms; _i < moms_1.length; _i++) {
                var mom = moms_1[_i];
                if (mom.id > id)
                    id = mom.id;
            }
            id++;
            var mom = { kind: Kind.Moment, id: id, parentid: scnid, when: null, text: null };
            moms.push(mom);
            _this.moments = moms;
            //
            var scns = _this.scenes;
            var scn = _this.getScene(scns, scnid);
            scn.mids.push(id);
            _this.scenes = scns;
            return id;
        };
        this.deleteSceneMoment = function (id) {
            var moms = _this.moments;
            var index = _this.getMomentIndex(moms, id);
            var mom = moms[index];
            //
            moms.splice(index, 1);
            _this.moments = moms;
            //
            var scns = _this.scenes;
            for (var _i = 0, scns_2 = scns; _i < scns_2.length; _i++) {
                var scn = scns_2[_i];
                for (var i = 0; i < scn.mids.length; i++) {
                    if (scn.mids[i] == id) {
                        scn.mids.splice(i, 1);
                        break;
                    }
                }
            }
            _this.scenes = scns;
        };
        this.deleteActorMoment = function (id) {
            var moms = _this.moments;
            var index = _this.getMomentIndex(moms, id);
            var mom = moms[index];
            //
            moms.splice(index, 1);
            _this.moments = moms;
            //
            var acts = _this.actors;
            for (var _i = 0, acts_2 = acts; _i < acts_2.length; _i++) {
                var act = acts_2[_i];
                for (var i = 0; i < act.mids.length; i++) {
                    if (act.mids[i] == id) {
                        act.mids.splice(i, 1);
                        break;
                    }
                }
            }
            _this.actors = acts;
        };
        this.saveMomentWhen = function (when, id) {
            var moms = _this.moments;
            var mom = _this.getMoment(moms, id);
            mom.when = when;
            _this.moments = moms;
        };
        this.saveMomentText = function (text, id) {
            var moms = _this.moments;
            var mom = _this.getMoment(moms, id);
            mom.text = text;
            _this.moments = moms;
        };
        this.getMoment = function (moms, id) {
            return (moms[_this.getMomentIndex(moms, id)]);
        };
        this.getMomentIndex = function (moms, id) {
            for (var i = 0; i < moms.length; i++) {
                if (moms[i].id == id)
                    return i;
            }
        };
        this.getMomentsOf = function (scn) {
            var moments = _this.moments;
            var moms = [];
            for (var _i = 0, _a = scn.mids; _i < _a.length; _i++) {
                var mid = _a[_i];
                for (var _b = 0, moments_1 = moments; _b < moments_1.length; _b++) {
                    var moment = moments_1[_b];
                    if (moment.id == mid && moment.kind == Kind.Moment) {
                        moms.push(moment);
                        break;
                    }
                }
            }
            return moms;
        };
        //
        // actions
        //
        this.addAction = function (scnid) {
            var id = -1;
            var moms = _this.moments;
            for (var _i = 0, moms_2 = moms; _i < moms_2.length; _i++) {
                var mom = moms_2[_i];
                if (mom.id > id)
                    id = mom.id;
            }
            id++;
            var act = { kind: Kind.Action, id: id, parentid: scnid, when: null, text: null, name: null };
            moms.push(act);
            _this.moments = moms;
            //
            var scns = _this.scenes;
            var scn = _this.getScene(scns, scnid);
            scn.mids.push(id);
            _this.scenes = scns;
            return id;
        };
        this.deleteAction = function (id) {
            _this.deleteSceneMoment(id);
        };
        this.saveActionWhen = function (when, id) {
            _this.saveMomentWhen(when, id);
        };
        this.saveActionName = function (text, id) {
            var moms = _this.moments;
            var act = _this.getAction(moms, id);
            act.name = text;
            _this.moments = moms;
        };
        this.saveActionText = function (text, id) {
            _this.saveMomentText(text, id);
        };
        this.getAction = function (acts, id) {
            return _this.getMoment(acts, id);
        };
        this.getActionsOf = function (scn) {
            var moments = _this.moments;
            var moms = [];
            for (var _i = 0, _a = scn.mids; _i < _a.length; _i++) {
                var mid = _a[_i];
                for (var _b = 0, moments_2 = moments; _b < moments_2.length; _b++) {
                    var moment = moments_2[_b];
                    if (moment.id == mid && moment.kind == Kind.Action) {
                        moms.push(moment);
                        break;
                    }
                }
            }
            return moms;
        };
        //
        // messages TO
        //
        this.addMessageTo = function (actid) {
            var id = -1;
            var moms = _this.moments;
            for (var _i = 0, moms_3 = moms; _i < moms_3.length; _i++) {
                var mom = moms_3[_i];
                if (mom.id > id)
                    id = mom.id;
            }
            id++;
            var msg = { kind: Kind.MessageTo, id: id, parentid: actid, when: null, text: null, name: null, to: null };
            moms.push(msg);
            _this.moments = moms;
            //
            var acts = _this.actors;
            var act = _this.getActor(acts, actid);
            act.mids.push(id);
            _this.actors = acts;
            return id;
        };
        this.deleteMessageTo = function (id) {
            _this.deleteActorMoment(id);
        };
        this.saveMessageToWhen = function (when, id) {
            _this.saveMomentWhen(when, id);
        };
        this.saveMessageToName = function (text, id) {
            var moms = _this.moments;
            var msg = _this.getMessageTo(moms, id);
            msg.name = text;
            _this.moments = moms;
        };
        this.saveMessageToText = function (text, id) {
            _this.saveMomentText(text, id);
        };
        this.saveMessageToActorTo = function (to, id) {
            var moms = _this.moments;
            var msg = _this.getMessageTo(moms, id);
            msg.to = to;
            _this.moments = moms;
        };
        this.getMessageTo = function (msgs, id) {
            return _this.getMoment(msgs, id);
        };
        this.getMessageToOf = function (act) {
            var moments = _this.moments;
            var moms = [];
            for (var _i = 0, _a = act.mids; _i < _a.length; _i++) {
                var mid = _a[_i];
                for (var _b = 0, moments_3 = moments; _b < moments_3.length; _b++) {
                    var moment = moments_3[_b];
                    if (moment.id == mid && moment.kind == Kind.MessageTo) {
                        moms.push(moment);
                        break;
                    }
                }
            }
            return moms;
        };
        this.getActorsForMessageTo = function (data, msg) {
            var player = _this.getActor(data.actors, msg.parentid);
            var sit = _this.getSituation(data.situations, player.sitid);
            var actors = data.actors;
            var acts = [];
            for (var _i = 0, _a = sit.aids; _i < _a.length; _i++) {
                var aid = _a[_i];
                for (var _b = 0, actors_2 = actors; _b < actors_2.length; _b++) {
                    var actor = actors_2[_b];
                    if (actor.id == aid && actor.id != sit.aid) {
                        acts.push(actor);
                        break;
                    }
                }
            }
            return acts;
        };
        //
        // messages FROM
        //
        this.addMessageFrom = function (actid) {
            var id = -1;
            var moms = _this.moments;
            for (var _i = 0, moms_4 = moms; _i < moms_4.length; _i++) {
                var mom = moms_4[_i];
                if (mom.id > id)
                    id = mom.id;
            }
            id++;
            var msg = { kind: Kind.MessageFrom, id: id, parentid: actid, when: null, text: null };
            moms.push(msg);
            _this.moments = moms;
            //
            var acts = _this.actors;
            var act = _this.getActor(acts, actid);
            act.mids.push(id);
            _this.actors = acts;
            return id;
        };
        this.deleteMessageFrom = function (id) {
            _this.deleteActorMoment(id);
        };
        this.saveMessageFromWhen = function (when, id) {
            _this.saveMomentWhen(when, id);
        };
        this.saveMessageFromText = function (text, id) {
            _this.saveMomentText(text, id);
        };
        this.getMessageFrom = function (msgs, id) {
            return _this.getMoment(msgs, id);
        };
        this.getMessageFromOf = function (act) {
            var moments = _this.moments;
            var moms = [];
            for (var _i = 0, _a = act.mids; _i < _a.length; _i++) {
                var mid = _a[_i];
                for (var _b = 0, moments_4 = moments; _b < moments_4.length; _b++) {
                    var moment = moments_4[_b];
                    if (moment.id == mid && moment.kind == Kind.MessageFrom) {
                        moms.push(moment);
                        break;
                    }
                }
            }
            return moms;
        };
        //
        // localstorage
        //
        this.clearStorage = function () {
            localStorage.clear();
        };
    }
    Object.defineProperty(GameData.prototype, "game", {
        //
        // game
        //
        get: function () {
            return JSON.parse(localStorage.getItem("game"));
        },
        set: function (game) {
            localStorage.setItem("game", JSON.stringify(game));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameData.prototype, "situations", {
        //
        // situations
        //
        get: function () {
            return JSON.parse(localStorage.getItem("situations")) || [];
        },
        set: function (sits) {
            localStorage.setItem("situations", JSON.stringify(sits));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameData.prototype, "scenes", {
        //
        // scenes
        //
        get: function () {
            return JSON.parse(localStorage.getItem("scenes")) || [];
        },
        set: function (moms) {
            localStorage.setItem("scenes", JSON.stringify(moms));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameData.prototype, "actors", {
        //
        // actors
        //
        get: function () {
            return JSON.parse(localStorage.getItem("actors")) || [];
        },
        set: function (moms) {
            localStorage.setItem("actors", JSON.stringify(moms));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameData.prototype, "moments", {
        //
        // moments
        //
        get: function () {
            return JSON.parse(localStorage.getItem("moments")) || [];
        },
        set: function (moms) {
            localStorage.setItem("moments", JSON.stringify(moms));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameData.prototype, "state", {
        //
        // state
        //
        get: function () {
            return JSON.parse(localStorage.getItem("state"));
        },
        set: function (moms) {
            localStorage.setItem("state", JSON.stringify(moms));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameData.prototype, "history", {
        //
        // history
        //
        get: function () {
            return JSON.parse(localStorage.getItem("history"));
        },
        set: function (mids) {
            localStorage.setItem("history", JSON.stringify(mids));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameData.prototype, "options", {
        //
        // options
        //
        get: function () {
            return JSON.parse(localStorage.getItem("options"));
        },
        set: function (options) {
            localStorage.setItem("options", JSON.stringify(options));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameData.prototype, "continueState", {
        //
        // continue state
        //
        get: function () {
            return JSON.parse(localStorage.getItem("continueState"));
        },
        set: function (moms) {
            localStorage.setItem("continueState", JSON.stringify(moms));
        },
        enumerable: true,
        configurable: true
    });
    return GameData;
}());
;
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
    };
}
if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (searchString, position) {
        var subjectString = this.toString();
        if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
            position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    };
}
/// <reference path="helpers.ts" />
;
var GameHelper = (function () {
    function GameHelper() {
    }
    GameHelper.getCommands = function (text) {
        if (text == undefined)
            return [];
        var inComment = false;
        var commands = new Array();
        var parts = text.split("\n");
        for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
            var part = parts_1[_i];
            if (part.length > 0) {
                if (part.startsWith("/*")) {
                    inComment = true;
                }
                else if (inComment) {
                    inComment = (part.startsWith("*/") == false);
                }
                else if (part.startsWith(".r ") || part.startsWith(".f ") || part.startsWith(".x ")) {
                    commands.push(part);
                }
            }
        }
        return commands;
    };
    GameHelper.getWhens = function (text) {
        if (text == undefined)
            return [];
        var whens = new Array();
        var parts = text.split(",");
        for (var _i = 0, parts_2 = parts; _i < parts_2.length; _i++) {
            var part = parts_2[_i];
            if (part.length > 0) {
                whens.push(part.trim());
            }
        }
        return whens;
    };
    return GameHelper;
}());
/// <reference path="igame-data.ts" />
/// <reference path="igame.ts" />
/// <reference path="game-data.ts" />
/// <reference path="game-helper.ts" />
/// <reference path="ieditor.ts" />
var Editor = (function () {
    function Editor() {
        var _this = this;
        this.initialize = function () {
            var app = new Framework7({
                cache: false,
                preprocess: _this.preprocess.bind(_this)
            });
            var leftView = app.addView(".view-left", { dynamicNavbar: true });
            var centerView = app.addView(".view-center", { dynamicNavbar: true });
            var rightView = app.addView(".view-right", { dynamicNavbar: true });
            _this.setup(app, leftView, centerView, rightView);
        };
        this.setup = function (app, leftView, centerView, rightView) {
            _this.app = app;
            _this.leftView = leftView;
            _this.centerView = centerView;
            _this.rightView = rightView;
            var $ = _this.$;
            app.onPageInit("*", function (page) {
                if (page.url == undefined)
                    return;
                if (page.query.hasOwnProperty("direct"))
                    return;
                if (page.url.startsWith("page/scene.html")) {
                    rightView.router.back({ url: rightView.history[0], force: true });
                }
                if (page.url.startsWith("page/actor.html")) {
                    rightView.router.back({ url: rightView.history[0], force: true });
                }
                if (page.url.startsWith("page/player.html")) {
                    rightView.router.back({ url: rightView.history[0], force: true });
                }
            });
            app.onPageBack("*", function (page) {
                if (page.url == undefined)
                    return;
                if (page.url.startsWith("page/scene.html")) {
                    rightView.router.back({ url: rightView.history[0], force: true });
                }
                if (page.url.startsWith("page/player.html")) {
                    rightView.router.back({ url: rightView.history[0], force: true });
                }
                if (page.url.startsWith("page/actor.html")) {
                    rightView.router.back({ url: rightView.history[0], force: true });
                }
                if (page.url.startsWith("page/situation.html")) {
                    centerView.router.back({ url: centerView.history[0], force: true });
                }
            });
            app.onPageAfterAnimation("*", function (page) {
                if (page.url == undefined)
                    return;
                if (page.query.select == undefined)
                    return;
                var $view = $(page.view.selector);
                $view.find(".ted-selected").removeClass("ted-selected");
                var $a = $view.find(".page-on-center").find("a[href='" + page.query.select + "']");
                var $li = $a.closest("li");
                $li.addClass("ted-selected");
            });
            $(document).on("click", "div#ted-situations li", function (e) {
                $(e.target.closest(".page")).find("li").removeClass("ted-selected");
                $(e.target.closest("li")).addClass("ted-selected");
            });
            $(document).on("click", "div#ted-scenes li", function (e) {
                $(e.target.closest(".page")).find("li").removeClass("ted-selected");
                $(e.target.closest("li")).addClass("ted-selected");
            });
            $(document).on("click", "div#ted-actors li", function (e) {
                $(e.target.closest(".page")).find("li").removeClass("ted-selected");
                $(e.target.closest("li")).addClass("ted-selected");
            });
            $(document).on("click", "div#ted-moments li", function (e) {
                $(e.target.closest(".page")).find("li").removeClass("ted-selected");
                $(e.target.closest("li")).addClass("ted-selected");
            });
            $(document).on("click", "div#ted-actions li", function (e) {
                $(e.target.closest(".page")).find("li").removeClass("ted-selected");
                $(e.target.closest("li")).addClass("ted-selected");
            });
            $(document).on("click", "div#ted-messages-to li", function (e) {
                $(e.target.closest(".page")).find("li").removeClass("ted-selected");
                $(e.target.closest("li")).addClass("ted-selected");
            });
            $(document).on("click", "div#ted-messages-from li", function (e) {
                $(e.target.closest(".page")).find("li").removeClass("ted-selected");
                $(e.target.closest("li")).addClass("ted-selected");
            });
            $(document).on("click", "#ted-load-game", function (e) {
                var data = _this.gdata.loadGame();
                delete data.me;
                delete data.meid;
                var text = JSON.stringify(data);
                $("#ted-game-data").val(text);
            });
            $(document).on("click", "#ted-load-game2", function (e) {
                var data = _this.gdata.loadGame();
                delete data.me;
                delete data.meid;
                var text = JSON.stringify(data);
                $("#ted-game-data2").val(text);
            });
            $(document).on("click", "#ted-save-game", function (e) {
                app.confirm("This will ovewrite the current game data. A manual refresh of the game will be required. Is this ok?", "Save Game Data", function () {
                    var text = $("#ted-game-data").val();
                    _this.gdata.saveData(text);
                });
            });
            $(document).on("click", "#ted-add-situation", function (e) {
                var gameid = _this.getMeId(e.target);
                var id = _this.gdata.addSituation(gameid);
                var li = '<li class="ted-selected">'
                    + '<a href="page/situation.html?id=' + id + '" class="item-link">'
                    + '<div class="item-content">'
                    + '<div class="item-inner">'
                    + '<div class="item-title"></div>'
                    + '</div>'
                    + '</div>'
                    + '</a>'
                    + '</li>';
                var $ul = $("#ted-situations ul");
                $ul.find("li").removeClass("ted-selected");
                $ul.append(li);
                leftView.router.load({ url: "page/situation.html?id=" + id });
            });
            $(document).on("click", "#ted-back-situations", function (e) {
                //if the editor is synced with the game this page might not have history, so go to home page 
                leftView.router.back({ url: leftView.history[0], force: true });
            });
            $(document).on("click", "#ted-delete-situation", function (e) {
                app.confirm("Are you sure?", "Delete Situation", function () {
                    _this.gdata.deleteSituation(_this.getMeId(e.target));
                    var history = _this.leftView.history;
                    _this.leftView.router.back({
                        url: history[history.length - 2],
                        force: true,
                        ignoreCache: true
                    });
                });
            });
            $(document).on("click", "#ted-add-scene", function (e) {
                var sitid = _this.getMeId(e.target);
                var id = _this.gdata.addScene(sitid);
                var li = '<li class="ted-selected">'
                    + '<a href="page/scene.html?id=' + id + '" data-view=".view-center" class="item-link">'
                    + '<div class="item-content">'
                    + '<div class="item-inner">'
                    + '<div class="item-title"></div>'
                    + '</div>'
                    + '</div>'
                    + '</a>'
                    + '</li>';
                var $ul = $("#ted-scenes ul");
                $ul.find("li").removeClass("ted-selected");
                $ul.append(li);
                centerView.router.load({ url: "page/scene.html?id=" + id });
            });
            $(document).on("click", "#ted-back-situation", function (e) {
                //if the editor is synced with the game we will have a lot of pages in the history, so bypass them
                leftView.router.back({ url: "page/situation-index.html", force: true });
            });
            $(document).on("click", "#ted-delete-scene", function (e) {
                app.confirm("Are you sure?", "Delete Scene", function () {
                    _this.gdata.deleteScene(_this.getMeId(e.target));
                    var history = _this.centerView.history;
                    _this.centerView.router.back({
                        url: history[0],
                        force: true,
                        ignoreCache: true
                    });
                    _this.leftView.router.refreshPage();
                });
            });
            $(document).on("click", "#ted-add-actor", function (e) {
                var sitid = _this.getMeId(e.target);
                var id = _this.gdata.addActor(sitid);
                var li = '<li class="ted-selected">'
                    + '<a href="page/actor.html?id=' + id + '" data-view=".view-center" class="item-link">'
                    + '<div class="item-content">'
                    + '<div class="item-inner">'
                    + '<div class="item-title"></div>'
                    + '</div>'
                    + '</div>'
                    + '</a>'
                    + '</li>';
                var $ul = $("#ted-actors ul");
                $ul.find("li").removeClass("ted-selected");
                $ul.append(li);
                centerView.router.load({ url: "page/actor.html?id=" + id });
            });
            $(document).on("click", "#ted-delete-actor", function (e) {
                app.confirm("Are you sure?", "Delete Actor", function () {
                    _this.gdata.deleteActor(_this.getMeId(e.target));
                    var history = _this.centerView.history;
                    _this.centerView.router.back({
                        url: history[0],
                        force: true,
                        ignoreCache: true
                    });
                    _this.leftView.router.refreshPage();
                });
            });
            $(document).on("click", "#ted-add-moment", function (e) {
                var momid = _this.getMeId(e.target);
                var id = _this.gdata.addMoment(momid);
                var li = '<li class="ted-selected">'
                    + '<a href="page/moment.html?id=' + id + '" data-view=".view-right" class="item-link item-content">'
                    + '<div class="item-inner">'
                    + '<div class="item-title-row">'
                    + '<div class="item-title"></div>'
                    + '</div>'
                    + '<div class="item-text">'
                    + '</div>'
                    + '</div>'
                    + '</a>'
                    + '</li>';
                var $ul = $("#ted-moments > div > ul");
                $ul.find("li").removeClass("ted-selected");
                $ul.append(li);
                rightView.router.load({ url: "page/moment.html?id=" + id });
            });
            $(document).on("click", "#ted-delete-moment", function (e) {
                app.confirm("Are you sure?", "Delete Moment", function () {
                    _this.gdata.deleteSceneMoment(_this.getMeId(e.target));
                    var history = _this.rightView.history;
                    _this.rightView.router.back({
                        url: history[0],
                        force: true,
                        ignoreCache: true
                    });
                    _this.centerView.router.refreshPage();
                });
            });
            $(document).on("click", "#ted-add-action", function (e) {
                var actid = _this.getMeId(e.target);
                var id = _this.gdata.addAction(actid);
                var li = '<li class="ted-selected">'
                    + '<a href="page/action.html?id=' + id + '" data-view=".view-right" class="item-link item-content">'
                    + '<div class="item-inner">'
                    + '<div class="item-title-row">'
                    + '<div class="item-title"></div>'
                    + '</div>'
                    + '<div class="item-subtitle"></div>'
                    + '<div class="item-text">'
                    + '</div>'
                    + '</div>'
                    + '</a>'
                    + '</li>';
                var $ul = $("#ted-actions > div > ul");
                $ul.find("li").removeClass("ted-selected");
                $ul.append(li);
                rightView.router.load({ url: "page/action.html?id=" + id });
            });
            $(document).on("click", "#ted-delete-action", function (e) {
                app.confirm("Are you sure?", "Delete Action", function () {
                    _this.gdata.deleteAction(_this.getMeId(e.target));
                    var history = _this.rightView.history;
                    _this.rightView.router.back({
                        url: history[0],
                        force: true,
                        ignoreCache: true
                    });
                    _this.centerView.router.refreshPage();
                });
            });
            $(document).on("click", "#ted-add-message-to", function (e) {
                var actid = _this.getMeId(e.target);
                var id = _this.gdata.addMessageTo(actid);
                var li = '<li class="ted-selected">'
                    + '<a href="page/message-to.html?id=' + id + '" data-view=".view-right" class="item-link item-content">'
                    + '<div class="item-inner">'
                    + '<div class="item-title-row">'
                    + '<div class="item-title"></div>'
                    + '</div>'
                    + '<div class="item-subtitle"></div>'
                    + '<div class="item-text"></div>'
                    + '</div>'
                    + '</a>'
                    + '</li>';
                var $ul = $("#ted-messages-to > div > ul");
                $ul.find("li").removeClass("ted-selected");
                $ul.append(li);
                rightView.router.load({ url: "page/message-to.html?id=" + id });
            });
            $(document).on("click", "#ted-delete-message-to", function (e) {
                app.confirm("Are you sure?", "Delete Message", function () {
                    _this.gdata.deleteMessageTo(_this.getMeId(e.target));
                    var history = _this.rightView.history;
                    _this.rightView.router.back({
                        url: history[0],
                        force: true,
                        ignoreCache: true
                    });
                    _this.centerView.router.refreshPage();
                });
            });
            $(document).on("click", "#ted-add-message-from", function (e) {
                var actid = _this.getMeId(e.target);
                var id = _this.gdata.addMessageFrom(actid);
                var li = '<li class="ted-selected">'
                    + '<a href="page/message-from.html?id=' + id + '" data-view=".view-right" class="item-link item-content">'
                    + '<div class="item-inner">'
                    + '<div class="item-title-row">'
                    + '<div class="item-title"></div>'
                    + '</div>'
                    + '<div class="item-text"></div>'
                    + '</div>'
                    + '</a>'
                    + '</li>';
                var $ul = $("#ted-messages-from > div > ul");
                $ul.find("li").removeClass("ted-selected");
                $ul.append(li);
                rightView.router.load({ url: "page/message-from.html?id=" + id });
            });
            $(document).on("click", "#ted-delete-message-from", function (e) {
                app.confirm("Are you sure?", "Delete Message", function () {
                    _this.gdata.deleteMessageTo(_this.getMeId(e.target));
                    var history = _this.rightView.history;
                    _this.rightView.router.back({
                        url: history[0],
                        force: true,
                        ignoreCache: true
                    });
                    _this.centerView.router.refreshPage();
                });
            });
            $(document).on("change", "#ted-game-name", function (e) {
                _this.gdata.saveGameName(e.target.value);
            });
            $(document).on("change", "#ted-game-initialstate", function (e) {
                _this.gdata.saveGameInitialState(e.target.value);
            });
            $(document).on("change", "#ted-game-desc", function (e) {
                _this.gdata.saveGameDesc(e.target.value);
            });
            $(document).on("change", "#ted-situation-name", function (e) {
                _this.gdata.saveSituationName(e.target.value, _this.getMeId(e.target));
                $("#ted-situations li.ted-selected div.item-title").text(e.target.value);
            });
            $(document).on("change", "#ted-situation-when", function (e) {
                _this.gdata.saveSituationWhen(e.target.value, _this.getMeId(e.target));
            });
            $(document).on("change", "#ted-situation-tags", function (e) {
                _this.gdata.saveSituationTags(e.target.value, _this.getMeId(e.target));
            });
            $(document).on("change", "#ted-scene-name", function (e) {
                _this.gdata.saveSceneName(e.target.value, _this.getMeId(e.target));
                $("#ted-scenes li.ted-selected div.item-title").text(e.target.value);
            });
            $(document).on("change", "#ted-scene-desc", function (e) {
                _this.gdata.saveSceneDesc(e.target.value, _this.getMeId(e.target));
            });
            $(document).on("change", "#ted-player-name", function (e) {
                _this.gdata.saveActorName(e.target.value, _this.getMeId(e.target));
            });
            $(document).on("change", "#ted-player-desc", function (e) {
                _this.gdata.saveActorDesc(e.target.value, _this.getMeId(e.target));
            });
            $(document).on("change", "#ted-actor-name", function (e) {
                _this.gdata.saveActorName(e.target.value, _this.getMeId(e.target));
                $("#ted-actors li.ted-selected div.item-title").text(e.target.value);
            });
            $(document).on("change", "#ted-actor-desc", function (e) {
                _this.gdata.saveActorDesc(e.target.value, _this.getMeId(e.target));
            });
            $(document).on("change", "#ted-moment-when", function (e) {
                _this.gdata.saveMomentWhen(e.target.value, _this.getMeId(e.target));
                $("#ted-moments li.ted-selected div.item-title").text(e.target.value);
            });
            $(document).on("change", "#ted-moment-text", function (e) {
                _this.gdata.saveMomentText(e.target.value, _this.getMeId(e.target));
                var ul = "<ul><li>" + GameHelper.getCommands(e.target.value).join("</li><li>") + "</li></ul>";
                $("#ted-moments li.ted-selected div.item-text").html(ul);
            });
            $(document).on("change", "#ted-action-name", function (e) {
                _this.gdata.saveActionName(e.target.value, _this.getMeId(e.target));
                $("#ted-actions li.ted-selected div.item-subtitle").text(e.target.value);
            });
            $(document).on("change", "#ted-action-when", function (e) {
                _this.gdata.saveActionWhen(e.target.value, _this.getMeId(e.target));
                $("#ted-actions li.ted-selected div.item-title").text(e.target.value);
            });
            $(document).on("change", "#ted-action-text", function (e) {
                _this.gdata.saveActionText(e.target.value, _this.getMeId(e.target));
                var ul = "<ul><li>" + GameHelper.getCommands(e.target.value).join("</li><li>") + "</li></ul>";
                $("#ted-actions li.ted-selected div.item-text").html(ul);
            });
            $(document).on("change", "#ted-message-to-name", function (e) {
                _this.gdata.saveMessageToName(e.target.value, _this.getMeId(e.target));
                $("#ted-messages-to li.ted-selected div.item-subtitle").text(e.target.value);
            });
            $(document).on("change", "#ted-message-to-when", function (e) {
                _this.gdata.saveMessageToWhen(e.target.value, _this.getMeId(e.target));
                $("#ted-messages-to li.ted-selected div.item-title").text(e.target.value);
            });
            $(document).on("click", "input[name^='radio-']", function (e) {
                var $ssp = $(e.target).closest("div.smart-select-popup");
                if ($ssp.length == 0)
                    return;
                //
                var $dp = $ssp.find("div[data-page]");
                var $dsn = $dp.find("div[data-select-name]");
                var $pc = $dp.find("div.page-content input:checked");
                var $it = $pc.next("div.item-inner").find("div.item-title");
                //
                var name = $dsn[0].getAttribute("data-select-name");
                if (name.startsWith("actors-for-")) {
                    var toid = parseInt($pc.val());
                    var meid = parseInt(name.substr("actors-for-".length));
                    _this.gdata.saveMessageToActorTo(toid, meid);
                }
            });
            $(document).on("change", "#ted-message-to-text", function (e) {
                _this.gdata.saveMessageToText(e.target.value, _this.getMeId(e.target));
                var ul = "<ul><li>" + GameHelper.getCommands(e.target.value).join("</li><li>") + "</li></ul>";
                $("#ted-messages-to li.ted-selected div.item-text").html(ul);
            });
            $(document).on("change", "#ted-message-from-when", function (e) {
                _this.gdata.saveMessageFromWhen(e.target.value, _this.getMeId(e.target));
                $("#ted-messages-from li.ted-selected div.item-title").text(e.target.value);
            });
            $(document).on("change", "#ted-message-from-text", function (e) {
                _this.gdata.saveMessageFromText(e.target.value, _this.getMeId(e.target));
                var ul = "<ul><li>" + GameHelper.getCommands(e.target.value).join("</li><li>") + "</li></ul>";
                $("#ted-messages-from li.ted-selected div.item-text").html(ul);
            });
        };
        this.getMeId = function (target) {
            return parseInt(target.closest("div.page").getAttribute("data-ted-meid"));
        };
        window.EditorInstance = this;
        this.gdata = new GameData();
        this.$ = Dom7;
        var $ = Dom7;
        var data = this.gdata.loadGame();
        var gameinfo = document.querySelector("div.pages");
        var content = gameinfo.innerHTML;
        var template = Template7.compile(content);
        gameinfo.innerHTML = template(data);
    }
    Editor.prototype.preprocess = function (content, url, next) {
        var gdata = this.gdata;
        var pages = [
            {
                url: "http://",
                getData: function (id) {
                    var data = gdata.loadGame();
                    return data;
                }
            },
            {
                url: "page/situation-index.html",
                getData: function (id) {
                    var data = gdata.loadGame();
                    return data;
                }
            },
            {
                url: "page/situation.html",
                getData: function (id) {
                    var data = gdata.loadGame();
                    var me = gdata.getSituation(gdata.situations, id);
                    data.me = me;
                    data.meid = id;
                    data.me.scenes = gdata.getScenesOf(me);
                    data.me.actors = gdata.getActorsOf(me);
                    return data;
                }
            },
            {
                url: "page/scene.html",
                getData: function (id) {
                    var data = gdata.loadGame();
                    var me = gdata.getScene(gdata.scenes, id);
                    data.me = me;
                    data.meid = id;
                    data.me.moments = gdata.getMomentsOf(me);
                    data.me.actions = gdata.getActionsOf(me);
                    for (var _i = 0, _a = data.me.moments; _i < _a.length; _i++) {
                        var mom = _a[_i];
                        mom.commands = GameHelper.getCommands(mom.text);
                    }
                    for (var _b = 0, _c = data.me.actions; _b < _c.length; _b++) {
                        var act = _c[_b];
                        act.commands = GameHelper.getCommands(act.text);
                    }
                    return data;
                }
            },
            {
                url: "page/moment.html",
                getData: function (id) {
                    var data = gdata.loadGame();
                    var me = gdata.getMoment(gdata.moments, id);
                    data.me = me;
                    data.meid = id;
                    return data;
                }
            },
            {
                url: "page/action.html",
                getData: function (id) {
                    var data = gdata.loadGame();
                    var me = gdata.getAction(gdata.moments, id);
                    data.me = me;
                    data.meid = id;
                    return data;
                }
            },
            {
                url: "page/player.html",
                getData: function (id) {
                    var data = gdata.loadGame();
                    var me = gdata.getActor(gdata.actors, id);
                    data.me = me;
                    data.meid = id;
                    data.me.messages = gdata.getMessageToOf(me);
                    for (var _i = 0, _a = data.me.messages; _i < _a.length; _i++) {
                        var msg = _a[_i];
                        msg.commands = GameHelper.getCommands(msg.text);
                    }
                    return data;
                }
            },
            {
                url: "page/actor.html",
                getData: function (id) {
                    var data = gdata.loadGame();
                    var me = gdata.getActor(gdata.actors, id);
                    data.me = me;
                    data.meid = id;
                    data.me.messages = gdata.getMessageFromOf(me);
                    for (var _i = 0, _a = data.me.messages; _i < _a.length; _i++) {
                        var msg = _a[_i];
                        msg.commands = GameHelper.getCommands(msg.text);
                    }
                    return data;
                }
            },
            {
                url: "page/message-to.html",
                getData: function (id) {
                    var data = gdata.loadGame();
                    var me = gdata.getMessageTo(gdata.moments, id);
                    data.me = me;
                    data.meid = id;
                    data.me.actors = gdata.getActorsForMessageTo(data, me);
                    for (var _i = 0, _a = data.me.actors; _i < _a.length; _i++) {
                        var act = _a[_i];
                        act.selected = (act.id == me.to ? "selected" : null);
                    }
                    return data;
                }
            },
            {
                url: "page/message-from.html",
                getData: function (id) {
                    var data = gdata.loadGame();
                    var me = gdata.getMessageFrom(gdata.moments, id);
                    data.me = me;
                    data.meid = id;
                    return data;
                }
            }
        ];
        if (url == undefined)
            return;
        for (var _i = 0, pages_1 = pages; _i < pages_1.length; _i++) {
            var page = pages_1[_i];
            if (url.startsWith(page.url)) {
                var id = this.$.parseUrlQuery(url).id;
                var data = page.getData(id);
                var template = Template7.compile(content);
                var resultContent = template(data);
                return resultContent;
            }
        }
        return (content);
    };
    ;
    Editor.prototype.gotoMoment = function (moment) {
        if (moment.kind == Kind.Moment || moment.kind == Kind.Action) {
            var scenes = this.gdata.scenes;
            var scene = this.gdata.getScene(scenes, moment.parentid);
            var sits = this.gdata.situations;
            var sit = this.gdata.getSituation(sits, scene.sitid);
            var rightUrl = null;
            if (moment.kind == Kind.Moment)
                rightUrl = "page/moment.html?id=" + moment.id;
            else
                rightUrl = "page/action.html?id=" + moment.id;
            var centerUrl = "page/scene.html?id=" + moment.parentid;
            var leftUrl = "page/situation.html?id=" + sit.id;
            this.rightView.router.load({ url: rightUrl, animatePages: false, ignoreCache: true, query: { direct: true } });
            this.centerView.router.load({ url: centerUrl + "&mid=" + moment.id, animatePages: false, ignoreCache: true, query: { direct: true, select: rightUrl } });
            this.leftView.router.load({ url: leftUrl + "&mpid=" + moment.parentid, animatePages: false, ignoreCache: true, query: { direct: true, select: centerUrl } });
        }
        else {
            var acts = this.gdata.actors;
            var actor = this.gdata.getActor(acts, moment.parentid);
            var sits = this.gdata.situations;
            var sit = this.gdata.getSituation(sits, actor.sitid);
            var rightUrl = null;
            if (moment.kind == Kind.MessageTo)
                rightUrl = "page/message-to.html?id=" + moment.id;
            else
                rightUrl = "page/message-from.html?id=" + moment.id;
            var centerUrl = null;
            if (actor.id == sit.aid)
                centerUrl = "page/player.html?id=" + moment.parentid;
            else
                centerUrl = "page/actor.html?id=" + moment.parentid;
            var leftUrl = "page/situation.html?id=" + sit.id;
            this.rightView.router.load({ url: rightUrl, animatePages: false, ignoreCache: true, query: { direct: true } });
            this.centerView.router.load({ url: centerUrl + "&mid=" + moment.id, animatePages: false, ignoreCache: true, query: { direct: true, select: rightUrl } });
            this.leftView.router.load({ url: leftUrl + "&mpid=" + moment.parentid, animatePages: false, ignoreCache: true, query: { direct: true, select: centerUrl } });
        }
    };
    return Editor;
}());
//# sourceMappingURL=app-edit.js.map