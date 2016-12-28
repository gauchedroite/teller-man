enum Kind {
    Moment,
    Action,
    MessageTo,
    MessageFrom
}

enum AKind {
    Player,
    NPC
}

interface IGameMeta {
    id: number
    name: string
    initialstate: string
    text: string
}

interface ISituation {
    id: number
    gameid: number
    name: string
    when: string
    text: string
    sids: Array<number>
    aids: Array<number>
    aid: number
}

interface IScene {
    id: number
    sitid: number
    name: string
    text: string
    mids: Array<number>
}

interface IActor {
    kind: AKind
    id: number
    sitid: number
    name: string
    text: string
    mids: Array<number>
}

interface IMoment {
    kind: Kind
    id: number
    parentid: number
    when: string
    text: string
}

interface IAction extends IMoment {
    name: string
}

interface IMessageTo extends IMoment {
    name: string
    to: number
}

interface IMessageFrom extends IMoment {
}

interface IGameData {
    game: IGameMeta
    situations: Array<ISituation>
    scenes: Array<IScene>
    actors: Array<IActor>
    moments: Array<IMoment>
    me: any
    meid: number
}
