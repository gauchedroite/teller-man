
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
