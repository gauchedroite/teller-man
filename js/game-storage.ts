/// <reference path="igame-data.ts" />
/// <reference path="igame.ts" />

class GameStorage {

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

    //
    // options
    //
    get options() : IOptions {
        return JSON.parse(localStorage.getItem("options"));
    }

    set options(options: IOptions) {
        localStorage.setItem("options", JSON.stringify(options));
    }

    //
    // continue state
    //
    get continueState() : any {
        return JSON.parse(localStorage.getItem("continueState"));
    }

    set continueState(moms: any) {
        localStorage.setItem("continueState", JSON.stringify(moms));
    }

}