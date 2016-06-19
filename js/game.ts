
class Game {
    constructor() {
        document.querySelector(".content").addEventListener("click", this.onContent);
        document.querySelector(".choice-panel").addEventListener("click", this.onChoice);
    }

    onContent = () => {
        var panel = document.querySelector(".choice-panel");
        panel.classList.add("raise");
    };

    onChoice = () => {
        var panel = document.querySelector(".choice-panel");
        panel.classList.remove("raise");
    };
}
