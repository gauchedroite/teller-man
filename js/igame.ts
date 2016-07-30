
enum ChunkKind {
    dialog,
    text,
    background,
    inline,
    heading,
    doo,
    minigame,
    gameresult,
    waitclick
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

type IMomentData = IDialog | IText | IBackground | IInline | IHeading | IDo | IMiniGame | IGameResult | IWaitClick;

enum Op {
    STARTING_NEWGAME,       //0
    CURRENT_MOMENT,         //1
    BLURB,                  //2
    BUILD_CHOICES,          //3
    MENU_F5,                //4
    MENU_INGAME,            //5
    NEWGAME,                //6
    CONTINUE_SAVEDGAME,     //7
    CONTINUE_INGAME         //8
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
