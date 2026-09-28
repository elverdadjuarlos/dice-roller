let selectedDiceCount = 1;
let successThreshold = 5;
let isRolling = false;


/* -------------------------
   ELEMENTS
------------------------- */

const countButtons =
    document.querySelectorAll("#dice-count button");

const blessedButton =
    document.getElementById("blessed-button");

const cursedButton =
    document.getElementById("cursed-button");

const rollArea =
    document.getElementById("roll-area");

const rollButton =
    document.getElementById("roll-button");

const diceResults =
    document.getElementById("dice-results");

const successesDisplay =
    document.getElementById("successes");

const history =
    document.getElementById("history");

const fullHistory =
    document.getElementById("full-history");

const clearHistory =
    document.getElementById("clear-history");

const viewHistory =
    document.getElementById("view-history");

const historyPanel =
    document.getElementById("history-panel");

const closeHistory =
    document.getElementById("close-history");


let rollHistory = [];


/* -------------------------
   SELECT NUMBER OF DICE
------------------------- */

countButtons.forEach(button => {

    button.addEventListener("click", () => {

        countButtons.forEach(btn => {
            btn.classList.remove("selected");
        });

        button.classList.add("selected");

        selectedDiceCount =
            Number(button.dataset.count);

    });

});


/* -------------------------
   MODIFIERS
------------------------- */

blessedButton.addEventListener("click", () => {

    if (blessedButton.classList.contains("selected")) {

        // Turn Blessed off
        // Return to normal 5+
        blessedButton.classList.remove("selected");

        successThreshold = 5;

    } else {

        // Turn Blessed on
        blessedButton.classList.add("selected");

        // Blessed and Cursed cannot
        // be active at the same time
        cursedButton.classList.remove("selected");

        successThreshold = 4;

    }

});


cursedButton.addEventListener("click", () => {

    if (cursedButton.classList.contains("selected")) {

        // Turn Cursed off
        // Return to normal 5+
        cursedButton.classList.remove("selected");

        successThreshold = 5;

    } else {

        // Turn Cursed on
        cursedButton.classList.add("selected");

        // Blessed and Cursed cannot
        // be active at the same time
        blessedButton.classList.remove("selected");

        successThreshold = 6;

    }

});


/* -------------------------
   CREATE RANDOMNESS
------------------------- */

function rollDie() {

    const range = 0x100000000;
    const limit = range - (range % 6);

    const array = new Uint32Array(1);

    let randomNumber;

    do {

        crypto.getRandomValues(array);

        randomNumber = array[0];

    } while (randomNumber >= limit);

    return (randomNumber % 6) + 1;
}


/* -------------------------
   ROLL DICE
------------------------- */

function rollDice() {

    // Don't allow another roll while
    // the current roll is animating
    if (isRolling) {
        return;
    }

    isRolling = true;

    const finalResults = [];

    for (let i = 0; i < selectedDiceCount; i++) {

        finalResults.push(rollDie());

    }


    // Clear old dice
    diceResults.innerHTML = "";


    // Create blank dice
    for (let i = 0; i < selectedDiceCount; i++) {

        const die =
            document.createElement("div");

        die.classList.add(
            "die-result",
            "pip-die"
        );

        diceResults.appendChild(die);

    }


    rollButton.disabled = true;

    rollArea.classList.add("rolling");


    setTimeout(() => {

        rollArea.classList.remove("rolling");

        displayResults(finalResults);

        addToHistory(finalResults);


        const diceElements =
            diceResults.querySelectorAll(
                ".die-result"
            );

        diceElements.forEach(die => {

            die.classList.add("landed");

            setTimeout(() => {

                die.classList.remove("landed");

            }, 200);

        });


        rollButton.disabled = false;

        isRolling = false;

    }, 350);
}


/* -------------------------
   DISPLAY RESULTS
------------------------- */

function displayResults(results) {

    diceResults.innerHTML = "";

    results.forEach(result => {

        const die =
            document.createElement("div");

        die.classList.add(
            "die-result",
            "pip-die"
        );

        createPips(die, result);


        // Dice that meet or surpass
        // the current threshold are successes
        if (result >= successThreshold) {

            die.classList.add("success-die");

        }


        diceResults.appendChild(die);

    });


    // Count successes using
    // the current threshold
    const successes =
        results.filter(
            result => result >= successThreshold
        ).length;

    successesDisplay.textContent = successes;
}


/* -------------------------
   CREATE DICE PIPS
------------------------- */

function createPips(die, value) {

    for (let position = 1; position <= 9; position++) {

        const pip =
            document.createElement("span");

        pip.classList.add("pip");

        pip.dataset.position = position;

        die.appendChild(pip);

    }


    const pipPositions = {

        1: [5],

        2: [1, 9],

        3: [1, 5, 9],

        4: [1, 3, 7, 9],

        5: [1, 3, 5, 7, 9],

        6: [1, 3, 4, 6, 7, 9]

    };


    pipPositions[value].forEach(position => {

        const pip =
            die.querySelector(
                `[data-position="${position}"]`
            );

        pip.classList.add("visible");

    });

}


/* -------------------------
   HISTORY
------------------------- */

function addToHistory(results) {

    const successes =
        results.filter(
            result => result >= successThreshold
        ).length;

    const roll = {

        diceCount: selectedDiceCount,

        results: [...results],

        successes: successes,

        threshold: successThreshold

    };


    rollHistory.unshift(roll);

    renderHistory();
}


/* -------------------------
   RENDER HISTORY
------------------------- */

function renderHistory() {

    history.innerHTML = "";

    fullHistory.innerHTML = "";


    // Main screen:
    // latest 5 rolls only
    const recentRolls =
        rollHistory.slice(0, 5);


    recentRolls.forEach(roll => {

        const item =
            createHistoryItem(roll);

        history.appendChild(item);

    });


    // Full history panel
    rollHistory.forEach(roll => {

        const item =
            createHistoryItem(roll);

        fullHistory.appendChild(item);

    });


    // Only show View All if needed
    if (rollHistory.length > 5) {

        viewHistory.style.display = "block";

    } else {

        viewHistory.style.display = "none";

    }

}


/* -------------------------
   CREATE HISTORY ITEM
------------------------- */

function createHistoryItem(roll) {

    const item =
        document.createElement("div");

    item.classList.add("history-item");


    const successText =
        roll.successes === 1
            ? "success"
            : "successes";


    let thresholdText;

    if (roll.threshold === 4) {

        thresholdText = "Blessed";

    } else if (roll.threshold === 6) {

        thresholdText = "Cursed";

    } else {

        thresholdText = "Normal";

    }


    item.innerHTML =
        `${roll.diceCount}d6 (${thresholdText})
        → [${roll.results.join(", ")}]
        → <strong>${roll.successes} ${successText}</strong>`;


    return item;
}


/* -------------------------
   CLEAR HISTORY
------------------------- */

clearHistory.addEventListener("click", () => {

    rollHistory = [];

    renderHistory();

});


/* -------------------------
   HISTORY PANEL
------------------------- */

viewHistory.addEventListener("click", () => {

    historyPanel.classList.add("open");

});


closeHistory.addEventListener("click", () => {

    historyPanel.classList.remove("open");

});


/* -------------------------
   ROLL CONTROLS
------------------------- */

rollButton.addEventListener(
    "click",
    rollDice
);


rollArea.addEventListener(
    "click",
    rollDice
);


/* -------------------------
   INITIALIZE
------------------------- */

renderHistory();


/* -------------------------
   SERVICE WORKER
------------------------- */

if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker.register("./service-worker.js")
            .then(() => {

                console.log(
                    "Service Worker registered"
                );

            })
            .catch(error => {

                console.error(
                    "Service Worker registration failed:",
                    error
                );

            });

    });

}