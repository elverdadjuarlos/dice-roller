let selectedDiceCount = 1;
let successThreshold = 5;
let isRolling = false;

let currentMode = "manual";

let investigators = [];
let selectedInvestigator = null;

let currentRollInfo = null;

let rollHistory = [];


/* -------------------------
   ELEMENTS
------------------------- */

const countButtons =
    document.querySelectorAll("#dice-count button");

const blessedButton =
    document.getElementById("blessed-button");

const cursedButton =
    document.getElementById("cursed-button");

const manualTab =
    document.getElementById("manual-tab");

const investigatorTab =
    document.getElementById("investigator-tab");

const manualMode =
    document.getElementById("manual-mode");

const investigatorMode =
    document.getElementById("investigator-mode");

const investigatorSelect =
    document.getElementById("investigator-select");

const investigatorStats =
    document.getElementById("investigator-stats");

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


/* -------------------------
   MODE TABS
------------------------- */

manualTab.addEventListener("click", () => {

    currentMode = "manual";

    manualTab.classList.add("selected");
    investigatorTab.classList.remove("selected");

    manualMode.classList.remove("hidden");
    investigatorMode.classList.add("hidden");

    rollButton.style.display = "block";

});


investigatorTab.addEventListener("click", () => {

    currentMode = "investigator";

    investigatorTab.classList.add("selected");
    manualTab.classList.remove("selected");

    investigatorMode.classList.remove("hidden");
    manualMode.classList.add("hidden");

    /*
       Investigator stats roll immediately,
       so the large manual ROLL button
       isn't necessary.
    */
    rollButton.style.display = "none";

});


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

        blessedButton.classList.remove("selected");

        successThreshold = 5;

    } else {

        blessedButton.classList.add("selected");

        cursedButton.classList.remove("selected");

        successThreshold = 4;

    }

});


cursedButton.addEventListener("click", () => {

    if (cursedButton.classList.contains("selected")) {

        cursedButton.classList.remove("selected");

        successThreshold = 5;

    } else {

        cursedButton.classList.add("selected");

        blessedButton.classList.remove("selected");

        successThreshold = 6;

    }

});


/* -------------------------
   LOAD INVESTIGATORS
------------------------- */

async function loadInvestigators() {

    try {

        const response =
            await fetch("./data/investigators.json");

        if (!response.ok) {

            throw new Error(
                `HTTP error: ${response.status}`
            );

        }

        investigators =
            await response.json();

        populateInvestigatorSelect();

    } catch (error) {

        console.error(
            "Failed to load investigators:",
            error
        );

        investigatorSelect.innerHTML =
            `<option value="">
                Failed to load investigators
            </option>`;

    }

}


/* -------------------------
   INVESTIGATOR DROPDOWN
------------------------- */

function populateInvestigatorSelect() {

    investigatorSelect.innerHTML =
        `<option value="">
            Select Investigator
        </option>`;

    investigators.forEach((investigator, index) => {

        const option =
            document.createElement("option");

        option.value = index;

        option.textContent =
            investigator.name;

        investigatorSelect.appendChild(option);

    });

}


/* -------------------------
   SELECT INVESTIGATOR
------------------------- */

investigatorSelect.addEventListener(
    "change",
    () => {

        const selectedIndex =
            investigatorSelect.value;

        if (selectedIndex === "") {

            selectedInvestigator = null;

            investigatorStats.innerHTML = "";

            return;
        }

        selectedInvestigator =
            investigators[
                Number(selectedIndex)
            ];

        displayInvestigatorStats();

    }
);


/* -------------------------
   DISPLAY INVESTIGATOR STATS
------------------------- */

function displayInvestigatorStats() {

    investigatorStats.innerHTML = "";

    if (!selectedInvestigator) {
        return;
    }


    Object.entries(
        selectedInvestigator.stats
    ).forEach(([statName, statValue]) => {

        const button =
            document.createElement("button");

        button.classList.add("stat-button");


        const name =
            document.createElement("span");

        name.classList.add("stat-name");

        name.textContent =
            formatStatName(statName);


        const value =
            document.createElement("span");

        value.classList.add("stat-value");

        value.textContent =
            statValue;


        button.appendChild(name);

        button.appendChild(value);


        button.addEventListener("click", () => {

            rollInvestigatorStat(
                statName,
                statValue
            );

        });


        investigatorStats.appendChild(button);

    });

}


/* -------------------------
   FORMAT STAT NAME
------------------------- */

function formatStatName(statName) {

    return (
        statName.charAt(0).toUpperCase()
        +
        statName.slice(1)
    );

}


/* -------------------------
   ROLL INVESTIGATOR STAT
------------------------- */

function rollInvestigatorStat(
    statName,
    statValue
) {

    if (!selectedInvestigator) {
        return;
    }

    selectedDiceCount =
        Number(statValue);

    currentRollInfo = {

        investigator:
            selectedInvestigator.name,

        stat:
            formatStatName(statName)

    };

    rollDice();

}


/* -------------------------
   CREATE RANDOMNESS
------------------------- */

function rollDie() {

    const range = 0x100000000;

    const limit =
        range - (range % 6);

    const array =
        new Uint32Array(1);

    let randomNumber;


    do {

        crypto.getRandomValues(array);

        randomNumber =
            array[0];

    } while (
        randomNumber >= limit
    );


    return (
        randomNumber % 6
    ) + 1;

}


/* -------------------------
   ROLL DICE
------------------------- */

function rollDice() {

    if (isRolling) {
        return;
    }


    /*
       If we're manually rolling,
       remove any previous investigator
       information.
    */

    if (currentMode === "manual") {

        currentRollInfo = null;

    }


    isRolling = true;


    const finalResults = [];


    for (
        let i = 0;
        i < selectedDiceCount;
        i++
    ) {

        finalResults.push(
            rollDie()
        );

    }


    diceResults.innerHTML = "";


    /*
       Create blank dice while
       the animation plays.
    */

    for (
        let i = 0;
        i < selectedDiceCount;
        i++
    ) {

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

        rollArea.classList.remove(
            "rolling"
        );

        displayResults(
            finalResults
        );

        addToHistory(
            finalResults
        );


        const diceElements =
            diceResults.querySelectorAll(
                ".die-result"
            );


        diceElements.forEach(die => {

            die.classList.add(
                "landed"
            );

            setTimeout(() => {

                die.classList.remove(
                    "landed"
                );

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


        createPips(
            die,
            result
        );


        if (
            result >= successThreshold
        ) {

            die.classList.add(
                "success-die"
            );

        }


        diceResults.appendChild(die);

    });


    const successes =
        results.filter(
            result =>
                result >= successThreshold
        ).length;


    successesDisplay.textContent =
        successes;

}


/* -------------------------
   CREATE DICE PIPS
------------------------- */

function createPips(
    die,
    value
) {

    for (
        let position = 1;
        position <= 9;
        position++
    ) {

        const pip =
            document.createElement("span");

        pip.classList.add("pip");

        pip.dataset.position =
            position;

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


    pipPositions[value]
        .forEach(position => {

            const pip =
                die.querySelector(
                    `[data-position="${position}"]`
                );

            pip.classList.add(
                "visible"
            );

        });

}


/* -------------------------
   HISTORY
------------------------- */

function addToHistory(results) {

    const successes =
        results.filter(
            result =>
                result >= successThreshold
        ).length;


    const roll = {

        diceCount:
            selectedDiceCount,

        results:
            [...results],

        successes:
            successes,

        threshold:
            successThreshold,

        investigator:
            currentRollInfo
                ? currentRollInfo.investigator
                : null,

        stat:
            currentRollInfo
                ? currentRollInfo.stat
                : null

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


    const recentRolls =
        rollHistory.slice(0, 5);


    recentRolls.forEach(roll => {

        const item =
            createHistoryItem(roll);

        history.appendChild(item);

    });


    rollHistory.forEach(roll => {

        const item =
            createHistoryItem(roll);

        fullHistory.appendChild(item);

    });


    if (
        rollHistory.length > 5
    ) {

        viewHistory.style.display =
            "block";

    } else {

        viewHistory.style.display =
            "none";

    }

}


/* -------------------------
   CREATE HISTORY ITEM
------------------------- */

function createHistoryItem(roll) {

    const item =
        document.createElement("div");

    item.classList.add(
        "history-item"
    );


    const successText =
        roll.successes === 1
            ? "success"
            : "successes";


    let thresholdText;


    if (roll.threshold === 4) {

        thresholdText =
            "Blessed";

    } else if (
        roll.threshold === 6
    ) {

        thresholdText =
            "Cursed";

    } else {

        thresholdText =
            "Normal";

    }


    let rollLabel;


    if (
        roll.investigator &&
        roll.stat
    ) {

        rollLabel =
            `${roll.investigator} — ${roll.stat}`;

    } else {

        rollLabel =
            `${roll.diceCount}d6`;

    }


    item.innerHTML =
        `${rollLabel} (${thresholdText})
        → [${roll.results.join(", ")}]
        → <strong>${roll.successes} ${successText}</strong>`;


    return item;

}


/* -------------------------
   CLEAR HISTORY
------------------------- */

clearHistory.addEventListener(
    "click",
    () => {

        rollHistory = [];

        renderHistory();

    }
);


/* -------------------------
   HISTORY PANEL
------------------------- */

viewHistory.addEventListener(
    "click",
    () => {

        historyPanel.classList.add(
            "open"
        );

    }
);


closeHistory.addEventListener(
    "click",
    () => {

        historyPanel.classList.remove(
            "open"
        );

    }
);


/* -------------------------
   ROLL CONTROLS
------------------------- */

rollButton.addEventListener(
    "click",
    rollDice
);


/*
   Only allow tapping the roll area
   to roll while in Manual mode.

   Investigator rolls should happen
   by tapping a stat.
*/

rollArea.addEventListener(
    "click",
    () => {

        if (
            currentMode === "manual"
        ) {

            rollDice();

        }

    }
);


/* -------------------------
   INITIALIZE
------------------------- */

renderHistory();

loadInvestigators();


/* -------------------------
   SERVICE WORKER
------------------------- */

if (
    "serviceWorker" in navigator
) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register(
                    "./service-worker.js"
                )
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

        }
    );

}