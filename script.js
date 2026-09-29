let selectedDiceCount = 1;
let successThreshold = 5;
let isRolling = false;

let testModifier = 0;

let investigators = [];
let selectedInvestigator = null;

let activeInvestigatorRoll = null;


/* -------------------------
   INVESTIGATOR GAME STATE
------------------------- */

let investigatorState = {

    health: 0,
    maxHealth: 0,

    sanity: 0,
    maxSanity: 0,

    focus: {
        lore: false,
        influence: false,
        observation: false,
        strength: false,
        will: false
    },

    money: 0,
    remnants: 0,
    clues: 0

};


/* -------------------------
   ELEMENTS
------------------------- */

const countButtons =
    document.querySelectorAll("#dice-count button");

const blessedButton =
    document.getElementById("blessed-button");

const cursedButton =
    document.getElementById("cursed-button");

const investigatorSelect =
    document.getElementById("investigator-select");

const investigatorStats =
    document.getElementById("investigator-stats");

const investigatorName =
    document.getElementById("investigator-name");

const investigatorSelector =
    document.getElementById("investigator-selector");

const changeInvestigator =
    document.getElementById("change-investigator");

const modifierMinus =
    document.getElementById("modifier-minus");

const modifierPlus =
    document.getElementById("modifier-plus");

const testModifierValue =
    document.getElementById("test-modifier-value");


/* VITALS */

const healthCurrent =
    document.getElementById("health-current");

const healthMax =
    document.getElementById("health-max");

const healthMinus =
    document.getElementById("health-minus");

const healthPlus =
    document.getElementById("health-plus");

const sanityCurrent =
    document.getElementById("sanity-current");

const sanityMax =
    document.getElementById("sanity-max");

const sanityMinus =
    document.getElementById("sanity-minus");

const sanityPlus =
    document.getElementById("sanity-plus");


/* INVESTIGATOR ROLL */

const investigatorRollArea =
    document.getElementById("investigator-roll-area");

const investigatorDiceResults =
    document.getElementById("investigator-dice-results");

const investigatorSuccesses =
    document.getElementById("investigator-successes");

const focusRerollButton =
    document.getElementById("focus-reroll-button");


/* MANUAL */

const manualRollOpen =
    document.getElementById("manual-roll-open");

const manualRollClose =
    document.getElementById("manual-roll-close");

const manualRollPanel =
    document.getElementById("manual-roll-panel");

const manualRollButton =
    document.getElementById("manual-roll-button");

const manualRollArea =
    document.getElementById("manual-roll-area");

const manualDiceResults =
    document.getElementById("manual-dice-results");

const manualSuccesses =
    document.getElementById("manual-successes");

const manualStatusText =
    document.getElementById("manual-status-text");


/* INVENTORY */

const inventoryOpen =
    document.getElementById("inventory-open");

const inventoryClose =
    document.getElementById("inventory-close");

const inventoryPanel =
    document.getElementById("inventory-panel");

const moneyValue =
    document.getElementById("money-value");

const moneyMinus =
    document.getElementById("money-minus");

const moneyPlus =
    document.getElementById("money-plus");

const remnantsValue =
    document.getElementById("remnants-value");

const remnantsMinus =
    document.getElementById("remnants-minus");

const remnantsPlus =
    document.getElementById("remnants-plus");

const cluesValue =
    document.getElementById("clues-value");

const cluesMinus =
    document.getElementById("clues-minus");

const cluesPlus =
    document.getElementById("clues-plus");


/* -------------------------
   MANUAL DICE COUNT
------------------------- */

countButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            countButtons.forEach(btn => {
                btn.classList.remove("selected");
            });

            button.classList.add("selected");

            selectedDiceCount =
                Number(button.dataset.count);

        }
    );

});


/* -------------------------
   BLESSED / CURSED
------------------------- */

blessedButton.addEventListener(
    "click",
    () => {

        successThreshold =
            successThreshold === 4
                ? 5
                : 4;

        updateModifierButtons();

    }
);


cursedButton.addEventListener(
    "click",
    () => {

        successThreshold =
            successThreshold === 6
                ? 5
                : 6;

        updateModifierButtons();

    }
);


function updateModifierButtons() {

    const blessed =
        successThreshold === 4;

    const cursed =
        successThreshold === 6;


    blessedButton.classList.toggle(
        "selected",
        blessed
    );

    cursedButton.classList.toggle(
        "selected",
        cursed
    );


    if (blessed) {

        manualStatusText.textContent =
            "Blessed";

    } else if (cursed) {

        manualStatusText.textContent =
            "Cursed";

    } else {

        manualStatusText.textContent =
            "Normal";

    }

}


/* -------------------------
   LOAD INVESTIGATORS
------------------------- */

async function loadInvestigators() {

    try {

        const response =
            await fetch(
                "./data/investigators.json"
            );


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


    investigators.forEach(
        (investigator, index) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                index;


            option.textContent =
                investigator.name;


            investigatorSelect.appendChild(
                option
            );

        }
    );

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

            investigatorName.textContent =
                "Select Investigator";

            investigatorStats.innerHTML =
                "";

            resetInvestigatorState();

            clearActiveInvestigatorRoll();

            clearInvestigatorDice();

            return;

        }


        selectedInvestigator =
            investigators[
                Number(selectedIndex)
            ];


        investigatorName.textContent =
            selectedInvestigator.name;


        investigatorSelector.classList.add(
            "hidden"
        );


        initializeInvestigatorState();

        displayInvestigatorStats();

        clearActiveInvestigatorRoll();

        clearInvestigatorDice();

    }
);


changeInvestigator.addEventListener(
    "click",
    () => {

        investigatorSelector.classList.remove(
            "hidden"
        );

        investigatorSelect.focus();

    }
);


/* -------------------------
   INVESTIGATOR STATE
------------------------- */

function createEmptyFocusState() {

    return {
        lore: false,
        influence: false,
        observation: false,
        strength: false,
        will: false
    };

}


function initializeInvestigatorState() {

    investigatorState = {

        health:
            Number(selectedInvestigator.health),

        maxHealth:
            Number(selectedInvestigator.health),

        sanity:
            Number(selectedInvestigator.sanity),

        maxSanity:
            Number(selectedInvestigator.sanity),

        focus:
            createEmptyFocusState(),

        money: 0,
        remnants: 0,
        clues: 0

    };


    updateInvestigatorStateDisplay();

}


function resetInvestigatorState() {

    investigatorState = {

        health: 0,
        maxHealth: 0,

        sanity: 0,
        maxSanity: 0,

        focus:
            createEmptyFocusState(),

        money: 0,
        remnants: 0,
        clues: 0

    };


    updateInvestigatorStateDisplay();

}


function updateInvestigatorStateDisplay() {

    healthCurrent.textContent =
        selectedInvestigator
            ? investigatorState.health
            : "—";

    healthMax.textContent =
        selectedInvestigator
            ? investigatorState.maxHealth
            : "—";


    sanityCurrent.textContent =
        selectedInvestigator
            ? investigatorState.sanity
            : "—";

    sanityMax.textContent =
        selectedInvestigator
            ? investigatorState.maxSanity
            : "—";


    moneyValue.textContent =
        investigatorState.money;

    remnantsValue.textContent =
        investigatorState.remnants;

    cluesValue.textContent =
        investigatorState.clues;

}


/* -------------------------
   HEALTH
------------------------- */

healthMinus.addEventListener(
    "click",
    () => {

        if (!selectedInvestigator) {
            return;
        }


        investigatorState.health =
            Math.max(
                0,
                investigatorState.health - 1
            );


        updateInvestigatorStateDisplay();

    }
);


healthPlus.addEventListener(
    "click",
    () => {

        if (!selectedInvestigator) {
            return;
        }


        investigatorState.health =
            Math.min(
                investigatorState.maxHealth,
                investigatorState.health + 1
            );


        updateInvestigatorStateDisplay();

    }
);


/* -------------------------
   SANITY
------------------------- */

sanityMinus.addEventListener(
    "click",
    () => {

        if (!selectedInvestigator) {
            return;
        }


        investigatorState.sanity =
            Math.max(
                0,
                investigatorState.sanity - 1
            );


        updateInvestigatorStateDisplay();

    }
);


sanityPlus.addEventListener(
    "click",
    () => {

        if (!selectedInvestigator) {
            return;
        }


        investigatorState.sanity =
            Math.min(
                investigatorState.maxSanity,
                investigatorState.sanity + 1
            );


        updateInvestigatorStateDisplay();

    }
);


/* -------------------------
   INVENTORY
------------------------- */

moneyMinus.addEventListener(
    "click",
    () => {

        if (!selectedInvestigator) {
            return;
        }


        investigatorState.money =
            Math.max(
                0,
                investigatorState.money - 1
            );


        updateInvestigatorStateDisplay();

    }
);


moneyPlus.addEventListener(
    "click",
    () => {

        if (!selectedInvestigator) {
            return;
        }


        investigatorState.money++;

        updateInvestigatorStateDisplay();

    }
);


remnantsMinus.addEventListener(
    "click",
    () => {

        if (!selectedInvestigator) {
            return;
        }


        investigatorState.remnants =
            Math.max(
                0,
                investigatorState.remnants - 1
            );


        updateInvestigatorStateDisplay();

    }
);


remnantsPlus.addEventListener(
    "click",
    () => {

        if (!selectedInvestigator) {
            return;
        }


        investigatorState.remnants++;

        updateInvestigatorStateDisplay();

    }
);


cluesMinus.addEventListener(
    "click",
    () => {

        if (!selectedInvestigator) {
            return;
        }


        investigatorState.clues =
            Math.max(
                0,
                investigatorState.clues - 1
            );


        updateInvestigatorStateDisplay();

    }
);


cluesPlus.addEventListener(
    "click",
    () => {

        if (!selectedInvestigator) {
            return;
        }


        investigatorState.clues++;

        updateInvestigatorStateDisplay();

    }
);


/* -------------------------
   DISPLAY STATS
------------------------- */

function displayInvestigatorStats() {

    investigatorStats.innerHTML =
        "";


    if (!selectedInvestigator) {
        return;
    }


    Object.entries(
        selectedInvestigator.stats
    ).forEach(
        ([statName, statValue]) => {

            const row =
                document.createElement(
                    "div"
                );


            row.classList.add(
                "stat-row"
            );


            /* STAT BUTTON */

            const statButton =
                document.createElement(
                    "button"
                );


            statButton.classList.add(
                "stat-button"
            );


            statButton.dataset.stat =
                statName;


            const name =
                document.createElement(
                    "span"
                );


            name.classList.add(
                "stat-name"
            );


            name.textContent =
                formatStatName(
                    statName
                );


            const value =
                document.createElement(
                    "span"
                );


            value.classList.add(
                "stat-value"
            );


            value.textContent =
                statValue;


            statButton.appendChild(
                name
            );


            statButton.appendChild(
                value
            );


            statButton.addEventListener(
                "click",
                () => {

                    rollInvestigatorStat(
                        statName,
                        statValue
                    );

                }
            );


            /* FOCUS BUTTON */

            const focusButton =
                document.createElement(
                    "button"
                );


            focusButton.classList.add(
                "focus-button"
            );


            focusButton.dataset.stat =
                statName;


            updateFocusButton(
                focusButton,
                statName
            );


            focusButton.addEventListener(
                "click",
                () => {

                    investigatorState.focus[
                        statName
                    ] =
                        !investigatorState.focus[
                            statName
                        ];


                    updateFocusButton(
                        focusButton,
                        statName
                    );


                    /*
                       If the player manually
                       removes the Focus used by
                       the active test, its reroll
                       is no longer available.
                    */

                    if (
                        activeInvestigatorRoll &&
                        activeInvestigatorRoll
                            .rollInfo
                            .statKey === statName &&
                        !investigatorState.focus[
                            statName
                        ]
                    ) {

                        clearActiveInvestigatorRoll();

                    }

                }
            );


            row.appendChild(
                statButton
            );


            row.appendChild(
                focusButton
            );


            investigatorStats.appendChild(
                row
            );

        }
    );

}


function updateFocusButton(
    button,
    statName
) {

    const hasFocus =
        investigatorState.focus[
            statName
        ];


    button.textContent =
        hasFocus
            ? "●"
            : "○";


    button.classList.toggle(
        "active",
        hasFocus
    );


    button.setAttribute(
        "aria-label",
        `${formatStatName(statName)} focus ${
            hasFocus
                ? "active"
                : "inactive"
        }`
    );

}


function refreshFocusButtons() {

    const buttons =
        investigatorStats.querySelectorAll(
            ".focus-button"
        );


    buttons.forEach(button => {

        updateFocusButton(
            button,
            button.dataset.stat
        );

    });

}


function formatStatName(statName) {

    const statNames = {

        lore:
            "Lore",

        influence:
            "Infl",

        observation:
            "Obs",

        strength:
            "Str",

        will:
            "Will"

    };


    return (
        statNames[statName]
        ||
        statName
    );

}


/* -------------------------
   TEST MODIFIER
------------------------- */

modifierMinus.addEventListener(
    "click",
    () => {

        testModifier--;

        updateTestModifierDisplay();

    }
);


modifierPlus.addEventListener(
    "click",
    () => {

        testModifier++;

        updateTestModifierDisplay();

    }
);


function updateTestModifierDisplay() {

    testModifierValue.textContent =
        testModifier > 0
            ? `+${testModifier}`
            : testModifier;

}


function resetTestModifier() {

    testModifier = 0;

    updateTestModifierDisplay();

}


/* -------------------------
   INVESTIGATOR ROLL
------------------------- */

function rollInvestigatorStat(
    statName,
    statValue
) {

    if (
        !selectedInvestigator ||
        isRolling
    ) {
        return;
    }


    /*
       Beginning another test ends the
       reroll opportunity from the
       previous test.

       It does NOT consume that Focus.
    */

    clearActiveInvestigatorRoll();


    const modifier =
        testModifier;


    const hasFocus =
        investigatorState.focus[
            statName
        ];


    const focusBonus =
        hasFocus
            ? 1
            : 0;


    const diceCount =
        Math.max(
            1,
            Number(statValue)
            + modifier
            + focusBonus
        );


    const rollInfo = {

        statKey:
            statName,

        usedFocus:
            hasFocus,

        rerollAvailable:
            hasFocus

    };


    resetTestModifier();


    rollDice(
        diceCount,
        investigatorDiceResults,
        investigatorRollArea,
        investigatorSuccesses,
        rollInfo
    );

}


/* -------------------------
   FOCUS REROLL
------------------------- */

function showFocusRerollButton() {

    focusRerollButton.textContent =
        "Reroll One Die";


    focusRerollButton.classList.add(
        "visible"
    );

}


function hideFocusRerollButton() {

    focusRerollButton.classList.remove(
        "visible"
    );


    investigatorDiceResults.classList.remove(
        "selecting-reroll"
    );


    focusRerollButton.textContent =
        "Reroll One Die";

}


function clearActiveInvestigatorRoll() {

    activeInvestigatorRoll =
        null;


    hideFocusRerollButton();

}


focusRerollButton.addEventListener(
    "click",
    () => {

        if (
            !activeInvestigatorRoll ||
            isRolling
        ) {
            return;
        }


        const statName =
            activeInvestigatorRoll
                .rollInfo
                .statKey;


        if (
            !investigatorState.focus[
                statName
            ]
        ) {

            clearActiveInvestigatorRoll();

            return;

        }


        investigatorDiceResults.classList.add(
            "selecting-reroll"
        );


        focusRerollButton.textContent =
            "Select a Die";

    }
);


investigatorDiceResults.addEventListener(
    "click",
    event => {

        if (
            !activeInvestigatorRoll ||
            !investigatorDiceResults
                .classList
                .contains(
                    "selecting-reroll"
                ) ||
            isRolling
        ) {
            return;
        }


        const die =
            event.target.closest(
                ".die-result"
            );


        if (!die) {
            return;
        }


        const dice =
            Array.from(
                investigatorDiceResults
                    .querySelectorAll(
                        ".die-result"
                    )
            );


        const dieIndex =
            dice.indexOf(
                die
            );


        if (dieIndex === -1) {
            return;
        }


        rerollFocusedDie(
            dieIndex
        );

    }
);


function rerollFocusedDie(
    dieIndex
) {

    if (
        !activeInvestigatorRoll ||
        isRolling
    ) {
        return;
    }


    const activeRoll =
        activeInvestigatorRoll;


    const statName =
        activeRoll
            .rollInfo
            .statKey;


    if (
        !investigatorState.focus[
            statName
        ]
    ) {

        clearActiveInvestigatorRoll();

        return;

    }


    const dice =
        investigatorDiceResults
            .querySelectorAll(
                ".die-result"
            );


    const selectedDie =
        dice[dieIndex];


    if (!selectedDie) {
        return;
    }


    isRolling =
        true;


    const results =
        activeRoll.results;


    const rollThreshold =
        activeRoll.threshold;


    const newResult =
        rollDie();


    results[dieIndex] =
        newResult;


    selectedDie.innerHTML =
        "";


    selectedDie.classList.remove(
        "success-die"
    );


    selectedDie.classList.add(
        "rerolling"
    );


    setTimeout(
        () => {

            selectedDie.classList.remove(
                "rerolling"
            );


            createPips(
                selectedDie,
                newResult
            );


            if (
                newResult >=
                rollThreshold
            ) {

                selectedDie.classList.add(
                    "success-die"
                );

            }


            selectedDie.classList.add(
                "landed"
            );


            const successes =
                results.filter(
                    result =>
                        result >=
                        rollThreshold
                ).length;


            investigatorSuccesses.textContent =
                successes;


            /*
               Focus is consumed ONLY
               when the reroll is used.
            */

            investigatorState.focus[
                statName
            ] = false;


            refreshFocusButtons();


            /*
               Only one Focus reroll
               is allowed for this test.
            */

            clearActiveInvestigatorRoll();


            setTimeout(
                () => {

                    selectedDie.classList.remove(
                        "landed"
                    );

                },
                200
            );


            isRolling =
                false;

        },
        250
    );

}


/* -------------------------
   OVERLAYS
------------------------- */

function openPanel(panel) {

    panel.classList.add(
        "open"
    );

}


function closePanel(panel) {

    panel.classList.remove(
        "open"
    );

}


manualRollOpen.addEventListener(
    "click",
    () => {

        openPanel(
            manualRollPanel
        );

    }
);


manualRollClose.addEventListener(
    "click",
    () => {

        closePanel(
            manualRollPanel
        );

    }
);


inventoryOpen.addEventListener(
    "click",
    () => {

        openPanel(
            inventoryPanel
        );

    }
);


inventoryClose.addEventListener(
    "click",
    () => {

        closePanel(
            inventoryPanel
        );

    }
);


[
    manualRollPanel,
    inventoryPanel
].forEach(panel => {

    panel.addEventListener(
        "click",
        event => {

            if (
                event.target === panel
            ) {

                closePanel(
                    panel
                );

            }

        }
    );

});


/* -------------------------
   MANUAL ROLL
------------------------- */

manualRollButton.addEventListener(
    "click",
    () => {

        if (isRolling) {
            return;
        }


        rollDice(
            selectedDiceCount,
            manualDiceResults,
            manualRollArea,
            manualSuccesses,
            null
        );

    }
);


/* -------------------------
   RANDOM D6
------------------------- */

function rollDie() {

    const range =
        0x100000000;


    const limit =
        range - (range % 6);


    const array =
        new Uint32Array(1);


    let randomNumber;


    do {

        crypto.getRandomValues(
            array
        );


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
   SHARED ROLL
------------------------- */

function rollDice(
    diceCount,
    diceContainer,
    rollContainer,
    successDisplay,
    rollInfo
) {

    if (isRolling) {
        return;
    }


    isRolling =
        true;


    /*
       Snapshot the threshold so changing
       Blessed/Cursed during the animation
       cannot alter an existing roll.
    */

    const rollThreshold =
        successThreshold;


    const finalResults =
        [];


    for (
        let i = 0;
        i < diceCount;
        i++
    ) {

        finalResults.push(
            rollDie()
        );

    }


    diceContainer.innerHTML =
        "";


    for (
        let i = 0;
        i < diceCount;
        i++
    ) {

        const die =
            document.createElement(
                "div"
            );


        die.classList.add(
            "die-result",
            "pip-die"
        );


        diceContainer.appendChild(
            die
        );

    }


    rollContainer.classList.add(
        "rolling"
    );


    setTimeout(
        () => {

            rollContainer.classList.remove(
                "rolling"
            );


            displayResults(
                finalResults,
                diceContainer,
                successDisplay,
                rollThreshold
            );


            /*
               Focused investigator tests
               receive one optional reroll.
            */

            if (
                rollInfo &&
                rollInfo.rerollAvailable
            ) {

                activeInvestigatorRoll = {

                    results:
                        [...finalResults],

                    rollInfo:
                        rollInfo,

                    threshold:
                        rollThreshold

                };


                showFocusRerollButton();

            } else if (rollInfo) {

                clearActiveInvestigatorRoll();

            }


            const diceElements =
                diceContainer.querySelectorAll(
                    ".die-result"
                );


            diceElements.forEach(
                die => {

                    die.classList.add(
                        "landed"
                    );


                    setTimeout(
                        () => {

                            die.classList.remove(
                                "landed"
                            );

                        },
                        200
                    );

                }
            );


            isRolling =
                false;

        },
        350
    );

}


/* -------------------------
   DISPLAY RESULTS
------------------------- */

function displayResults(
    results,
    diceContainer,
    successDisplay,
    threshold
) {

    diceContainer.innerHTML =
        "";


    results.forEach(
        result => {

            const die =
                document.createElement(
                    "div"
                );


            die.classList.add(
                "die-result",
                "pip-die"
            );


            createPips(
                die,
                result
            );


            if (
                result >=
                threshold
            ) {

                die.classList.add(
                    "success-die"
                );

            }


            diceContainer.appendChild(
                die
            );

        }
    );


    const successes =
        results.filter(
            result =>
                result >= threshold
        ).length;


    successDisplay.textContent =
        successes;

}


/* -------------------------
   PIPS
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
            document.createElement(
                "span"
            );


        pip.classList.add(
            "pip"
        );


        pip.dataset.position =
            position;


        die.appendChild(
            pip
        );

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
        .forEach(
            position => {

                const pip =
                    die.querySelector(
                        `[data-position="${position}"]`
                    );


                pip.classList.add(
                    "visible"
                );

            }
        );

}


/* -------------------------
   CLEAR MAIN DICE
------------------------- */

function clearInvestigatorDice() {

    investigatorDiceResults.innerHTML =
        "";


    investigatorSuccesses.textContent =
        "—";


    clearActiveInvestigatorRoll();

}


/* -------------------------
   INITIALIZE
------------------------- */

updateModifierButtons();

updateTestModifierDisplay();

updateInvestigatorStateDisplay();

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
                .then(
                    () => {

                        console.log(
                            "Service Worker registered"
                        );

                    }
                )
                .catch(
                    error => {

                        console.error(
                            "Service Worker registration failed:",
                            error
                        );

                    }
                );

        }
    );

}