
interface IEditor {
    initialize: () => void;
    preprocess: (content: string, url: any, next: any) => void;
    setup: (app: any, leftView: any, centerView: any, rightView: any) => void;
    gotoMoment: (moment: IMoment) => void;
    getMeId: (target: any) => void;
}
