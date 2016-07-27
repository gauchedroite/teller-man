
enum ChunkKind {
    dialog,
    text,
    background,
    inline,
    heading,
    pause
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
}
interface IInline extends IChunkKind {
    kind: ChunkKind
    image: string
}
interface IHeading extends IChunkKind {
    kind: ChunkKind
    title: string
    subtitle: string
}
interface IPause extends IChunkKind {
    kind: ChunkKind
    text: string
}

type IMomentData = IDialog | IText | IBackground | IInline | IHeading | IPause;

enum Op {
    WAITING,
    MOMENT,
    BLURB,
    CHOICES,
    MENU_BOOT,
    MENU_INGAME,
    NEWGAME,
    CONTINUE_SAVEDGAME,
    CONTINUE_INGAME
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
