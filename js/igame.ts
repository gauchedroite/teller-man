
interface IDialog {
    actor: string
    mood: string
    parenthetical: string
    lines: Array<string>
}

interface IText {
    lines: Array<string>
}

type IMomentData = IDialog | IText;

enum Op {
    WAITING,
    MOMENT,
    BLURB,
    CHOICES,
    MENU,
    NEWGAME,
    CONTINUE_SAVEDGAME,
    CONTINUE_INGAME
}

interface IdeOptions {
    useGameFile: boolean,
    startingNewGame: boolean
}
