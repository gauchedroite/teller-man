
enum ChunkKind {
    dialog,
    text,
    background,
    inline,
    heading,
    doo,
    minigame,
    gameresult,
    waitclick,
    title
}
interface IChunkKind {
    kind: ChunkKind
}
interface IDialog extends IChunkKind {
    kind: ChunkKind
    actor: string
    mood: string
    parenthetical: string
    lines: Array<string>
}
interface IText extends IChunkKind {
    kind: ChunkKind
    lines: Array<string>
}
interface IBackground extends IChunkKind {
    kind: ChunkKind
    asset: string
    wide: boolean
}
interface IInline extends IChunkKind {
    kind: ChunkKind
    image: string
}
interface IHeading extends IChunkKind {
    kind: ChunkKind
    title: string
    subtitle: string
    css: string
}
interface IDo extends IChunkKind {
    kind: ChunkKind
    text: string
}
interface IMiniGame extends IChunkKind {
    kind: ChunkKind
    text: string
    url: string
    winText: string
    winCommand: string
    loseText: string
    loseCommand: string
}
interface IGameResult extends IChunkKind {
    kind: ChunkKind
    text: string
}
interface IWaitClick extends IChunkKind {
    kind: ChunkKind
}
interface ITitle extends IChunkKind {
    kind: ChunkKind
    text: string
}

type IMomentData = IDialog | IText | IBackground | IInline | IHeading | IDo | IMiniGame | IGameResult | IWaitClick | ITitle;

enum Op {
    START_BLURBING,         //0
    BLURB,                  //1
    BUILD_CHOICES,          //2
}

interface IOptions {
    skipFileLoad: boolean,
    skipMenu: boolean,
    syncEditor: boolean,
    fastStory: boolean
}

interface ISceneData {
    title: string,
    image: string
}

enum OpAction {
    SHOWING_CHOICES,
    GAME_START,
    SHOWING_MOMENT
}
