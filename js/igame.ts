
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
    title,
    style
}
interface IChunkKind {
    kind: ChunkKind
}
interface IDialog extends IChunkKind {
    kind: ChunkKind
    actor: string
    parenthetical: string
    lines: Array<string>
    metadata: IMetadata
}
interface IText extends IChunkKind {
    kind: ChunkKind
    lines: Array<string>
}
interface IBackground extends IChunkKind {
    kind: ChunkKind
    asset: string
    wide: boolean
    metadata: IMetadata
}
interface IInline extends IChunkKind {
    kind: ChunkKind
    image: string
    metadata: IMetadata
}
interface IHeading extends IChunkKind {
    kind: ChunkKind
    title: string
    subtitle: string
    metadata: IMetadata
}
interface IDo extends IChunkKind {
    kind: ChunkKind
    text: string
    metadata: IMetadata
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
interface IStyle extends IChunkKind {
    kind: ChunkKind
    metadata: IMetadata
}

type IMomentData = IDialog | IText | IBackground | IInline | IHeading | IDo | IMiniGame | IGameResult | IWaitClick | ITitle | IStyle;

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

interface IMetadata {
    class: string,
    style: string,
    css: string
    image: string
}