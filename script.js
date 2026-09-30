/* =========================================================
   DOM ELEMENTS
========================================================= */

const selectionScreen =
    document.getElementById("selection-screen");

const gameScreen =
    document.getElementById("game-screen");

const investigatorList =
    document.getElementById("investigator-list");

const investigatorName =
    document.getElementById("investigator-name");

const changeInvestigator =
    document.getElementById("change-investigator");

const investigatorStats =
    document.getElementById("investigator-stats");

const modifierMinus =
    document.getElementById("modifier-minus");

const modifierPlus =
    document.getElementById("modifier-plus");

const testModifierValue =
    document.getElementById("test-modifier-value");

const blessedButton =
    document.getElementById("blessed-button");

const cursedButton =
    document.getElementById("cursed-button");


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


/* MANUAL ROLL */

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

const countButtons =
    document.querySelectorAll(
        "#dice-count button"
    );


/* INVENTORY OVERLAY */

const inventoryOpen =
    document.getElementById("inventory-open");

const inventoryClose =
    document.getElementById("inventory-close");

const inventoryPanel =
    document.getElementById("inventory-panel");


/* INVENTORY VALUES */

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


/* INVENTORY SUMMARY */

const moneySummary =
    document.getElementById("money-summary");

const remnantsSummary =
    document.getElementById("remnants-summary");

const cluesSummary =
    document.getElementById("clues-summary");

const moneyMarker =
    document.getElementById("money-marker");

const remnantsMarker =
    document.getElementById("remnants-marker");

const cluesMarker =
    document.getElementById("clues-marker");


/* =========================================================
   APP STATE
========================================================= */

let investigators = [];

let currentInvestigator =
    null;

let state =
    null;

let selectedDiceCount =
    1;

let successThreshold =
    5;

let testModifier =
    0;

let isRolling =
    false;

let activeInvestigatorRoll =
    null;

let selectingFocusReroll =
    false;


/* =========================================================
   CREATE INVESTIGATOR STATE
========================================================= */

function createInvestigatorState(
    investigator
) {

    return {

        health:
            investigator.health,

        sanity:
            investigator.sanity,

        money:
            0,

        remnants:
            0,

        clues:
            0,

        focus: {

            lore:
                false,

            influence:
                false,

            observation:
                false,

            strength:
                false,

            will:
                false

        }

    };

}


/* =========================================================
   LOAD INVESTIGATORS
========================================================= */

async function loadInvestigators() {

    investigatorList.innerHTML = `
        <div class="selection-loading">
            Loading investigators...
        </div>
    `;


    try {

        const response =
            await fetch(
                "./data/investigators.json",
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `Could not load investigators.json (${response.status})`
            );

        }


        const data =
            await response.json();


        if (
            !Array.isArray(data) ||
            data.length === 0
        ) {

            throw new Error(
                "investigators.json contains no investigators"
            );

        }


        investigators =
            data;


        displayInvestigatorSelection();

    } catch (error) {

        console.error(
            "Failed to load investigators:",
            error
        );


        investigatorList.innerHTML = `
            <div class="selection-error">

                <strong>
                    Could not load investigators.
                </strong>

                <br><br>

                ${error.message}

            </div>
        `;

    }

}


/* =========================================================
   INVESTIGATOR SELECTION
========================================================= */

function displayInvestigatorSelection() {

    investigatorList.innerHTML =
        "";


    investigators.forEach(
        investigator => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "investigator-choice";


            const info =
                document.createElement(
                    "span"
                );


            info.className =
                "investigator-choice-info";


            const name =
                document.createElement(
                    "span"
                );


            name.className =
                "investigator-choice-name";


            name.textContent =
                investigator.name;


            const expansion =
                document.createElement(
                    "span"
                );


            expansion.className =
                "investigator-choice-expansion";


            expansion.textContent =
                investigator.expansion || "";


            const arrow =
                document.createElement(
                    "span"
                );


            arrow.className =
                "investigator-choice-arrow";


            arrow.textContent =
                "›";


            info.appendChild(
                name
            );


            info.appendChild(
                expansion
            );


            button.appendChild(
                info
            );


            button.appendChild(
                arrow
            );


            button.addEventListener(
                "click",
                () => {

                    selectInvestigator(
                        investigator
                    );

                }
            );


            investigatorList.appendChild(
                button
            );

        }
    );

}


/* =========================================================
   SELECT INVESTIGATOR
========================================================= */

function selectInvestigator(
    investigator
) {

    currentInvestigator =
        investigator;


    state =
        createInvestigatorState(
            investigator
        );


    testModifier =
        0;


    clearActiveInvestigatorRoll();

    resetInvestigatorRollDisplay();

    renderInvestigator();

    showGameScreen();

}


/* =========================================================
   SCREEN NAVIGATION
========================================================= */

function showSelectionScreen() {

    closePanel(
        manualRollPanel
    );

    closePanel(
        inventoryPanel
    );


    clearActiveInvestigatorRoll();


    gameScreen.classList.add(
        "hidden"
    );


    selectionScreen.classList.remove(
        "hidden"
    );


    window.scrollTo(
        0,
        0
    );

}


function showGameScreen() {

    selectionScreen.classList.add(
        "hidden"
    );


    gameScreen.classList.remove(
        "hidden"
    );


    window.scrollTo(
        0,
        0
    );

}


/* =========================================================
   RENDER INVESTIGATOR
========================================================= */

function renderInvestigator() {

    if (
        !currentInvestigator ||
        !state
    ) {

        return;

    }


    investigatorName.textContent =
        currentInvestigator.name;


    renderVitals();

    renderStats();

    renderTestModifier();

    renderInventory();

    updateModifierButtons();

}


/* =========================================================
   VITALS
========================================================= */

function renderVitals() {

    healthCurrent.textContent =
        state.health;


    healthMax.textContent =
        currentInvestigator.health;


    sanityCurrent.textContent =
        state.sanity;


    sanityMax.textContent =
        currentInvestigator.sanity;

}


healthMinus.addEventListener(
    "click",
    () => {

        if (!state) {
            return;
        }


        state.health =
            Math.max(
                0,
                state.health - 1
            );


        renderVitals();

    }
);


healthPlus.addEventListener(
    "click",
    () => {

        if (!state) {
            return;
        }


        state.health =
            Math.min(
                currentInvestigator.health,
                state.health + 1
            );


        renderVitals();

    }
);


sanityMinus.addEventListener(
    "click",
    () => {

        if (!state) {
            return;
        }


        state.sanity =
            Math.max(
                0,
                state.sanity - 1
            );


        renderVitals();

    }
);


sanityPlus.addEventListener(
    "click",
    () => {

        if (!state) {
            return;
        }


        state.sanity =
            Math.min(
                currentInvestigator.sanity,
                state.sanity + 1
            );


        renderVitals();

    }
);


/* =========================================================
   STATS
========================================================= */

function renderStats() {

    investigatorStats.innerHTML =
        "";


    const stats = [

        "lore",
        "influence",
        "observation",
        "strength",
        "will"

    ];


    stats.forEach(
        stat => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "stat-row";


            /* STAT BUTTON */

            const statButton =
                document.createElement(
                    "button"
                );


            statButton.className =
                "stat-button";


            statButton.dataset.stat =
                stat;


            const name =
                document.createElement(
                    "span"
                );


            name.className =
                "stat-name";


            name.textContent =
                stat;


            const value =
                document.createElement(
                    "span"
                );


            value.className =
                "stat-value";


            value.textContent =
                currentInvestigator
                    .stats[stat];


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
                        stat
                    );

                }
            );


            /* FOCUS BUTTON */

            const focusButton =
                document.createElement(
                    "button"
                );


            focusButton.className =
                "focus-button";


            if (
                state.focus[stat]
            ) {

                focusButton.classList.add(
                    "active"
                );


                focusButton.textContent =
                    "●";

            } else {

                focusButton.textContent =
                    "○";

            }


            focusButton.setAttribute(
                "aria-label",
                `Toggle ${stat} Focus`
            );


            focusButton.addEventListener(
                "click",
                () => {

                    toggleFocus(
                        stat
                    );

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


/* =========================================================
   FOCUS
========================================================= */

function toggleFocus(
    stat
) {

    if (!state) {
        return;
    }


    state.focus[stat] =
        !state.focus[stat];


    if (
        activeInvestigatorRoll &&
        activeInvestigatorRoll.stat === stat &&
        !state.focus[stat]
    ) {

        clearActiveInvestigatorRoll();

    }


    renderStats();

}


/* =========================================================
   TEST MODIFIER
========================================================= */

function renderTestModifier() {

    if (
        testModifier > 0
    ) {

        testModifierValue.textContent =
            `+${testModifier}`;

    } else {

        testModifierValue.textContent =
            testModifier;

    }

}


modifierMinus.addEventListener(
    "click",
    () => {

        testModifier--;

        renderTestModifier();

    }
);


modifierPlus.addEventListener(
    "click",
    () => {

        testModifier++;

        renderTestModifier();

    }
);


/* =========================================================
   BLESSED / CURSED
========================================================= */

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


/* =========================================================
   INVESTIGATOR STAT ROLL
========================================================= */

function rollInvestigatorStat(
    stat
) {

    if (
        !currentInvestigator ||
        !state ||
        isRolling
    ) {

        return;

    }


    clearActiveInvestigatorRoll();


    const baseDice =
        Number(
            currentInvestigator
                .stats[stat]
        );


    const hasFocus =
        state.focus[stat];


    let diceCount =
        baseDice +
        testModifier +
        (hasFocus ? 1 : 0);


    diceCount =
        Math.max(
            0,
            diceCount
        );


    const thresholdAtRoll =
        successThreshold;


    testModifier =
        0;


    renderTestModifier();


    rollDice({

        count:
            diceCount,

        threshold:
            thresholdAtRoll,

        diceContainer:
            investigatorDiceResults,

        rollArea:
            investigatorRollArea,

        successDisplay:
            investigatorSuccesses,

        onComplete:
            results => {

                if (
                    hasFocus &&
                    state.focus[stat]
                ) {

                    activeInvestigatorRoll = {

                        stat:
                            stat,

                        results:
                            [...results],

                        threshold:
                            thresholdAtRoll

                    };


                    showFocusRerollOption();

                }

            }

    });

}


/* =========================================================
   ACTIVE FOCUS REROLL
========================================================= */

function showFocusRerollOption() {

    selectingFocusReroll =
        false;


    investigatorDiceResults
        .classList
        .remove(
            "selecting-reroll"
        );


    focusRerollButton
        .classList
        .add(
            "visible"
        );

}


function clearActiveInvestigatorRoll() {

    activeInvestigatorRoll =
        null;


    selectingFocusReroll =
        false;


    focusRerollButton
        .classList
        .remove(
            "visible"
        );


    investigatorDiceResults
        .classList
        .remove(
            "selecting-reroll"
        );

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


        selectingFocusReroll =
            true;


        focusRerollButton
            .classList
            .remove(
                "visible"
            );


        investigatorDiceResults
            .classList
            .add(
                "selecting-reroll"
            );

    }
);


/* =========================================================
   SELECT DIE FOR FOCUS REROLL
========================================================= */

investigatorDiceResults.addEventListener(
    "click",
    event => {

        if (
            !selectingFocusReroll ||
            !activeInvestigatorRoll ||
            isRolling
        ) {

            return;

        }


        const die =
            event.target.closest(
                ".die-result"
            );


        if (
            !die ||
            !investigatorDiceResults
                .contains(die)
        ) {

            return;

        }


        const dice =
            Array.from(
                investigatorDiceResults
                    .querySelectorAll(
                        ".die-result"
                    )
            );


        const index =
            dice.indexOf(
                die
            );


        if (
            index === -1
        ) {

            return;

        }


        rerollFocusedDie(
            index,
            die
        );

    }
);


/* =========================================================
   REROLL ONE DIE
========================================================= */

function rerollFocusedDie(
    index,
    dieElement
) {

    if (
        !activeInvestigatorRoll ||
        isRolling
    ) {

        return;

    }


    isRolling =
        true;


    selectingFocusReroll =
        false;


    investigatorDiceResults
        .classList
        .remove(
            "selecting-reroll"
        );


    const rollInfo =
        activeInvestigatorRoll;


    state.focus[
        rollInfo.stat
    ] = false;


    renderStats();


    const newResult =
        rollDie();


    dieElement.innerHTML =
        "";


    dieElement.className =
        "die-result pip-die rerolling";


    setTimeout(
        () => {

            rollInfo.results[index] =
                newResult;


            dieElement.classList.remove(
                "rerolling"
            );


            displayDiceResults(

                rollInfo.results,

                rollInfo.threshold,

                investigatorDiceResults,

                investigatorSuccesses

            );


            const updatedDice =
                investigatorDiceResults
                    .querySelectorAll(
                        ".die-result"
                    );


            if (
                updatedDice[index]
            ) {

                updatedDice[index]
                    .classList
                    .add(
                        "landed"
                    );


                setTimeout(
                    () => {

                        if (
                            updatedDice[index]
                        ) {

                            updatedDice[index]
                                .classList
                                .remove(
                                    "landed"
                                );

                        }

                    },
                    200
                );

            }


            activeInvestigatorRoll =
                null;


            isRolling =
                false;

        },
        350
    );

}


/* =========================================================
   INVENTORY
========================================================= */

function renderInventory() {

    if (!state) {
        return;
    }


    /* OVERLAY VALUES */

    moneyValue.textContent =
        state.money;


    remnantsValue.textContent =
        state.remnants;


    cluesValue.textContent =
        state.clues;


    /* DASHBOARD SUMMARY */

    moneySummary.textContent =
        state.money;


    remnantsSummary.textContent =
        state.remnants;


    cluesSummary.textContent =
        state.clues;


    /* DIM EMPTY RESOURCES */

    moneyMarker.classList.toggle(
        "empty",
        state.money === 0
    );


    remnantsMarker.classList.toggle(
        "empty",
        state.remnants === 0
    );


    cluesMarker.classList.toggle(
        "empty",
        state.clues === 0
    );

}


/* MONEY */

moneyMinus.addEventListener(
    "click",
    () => {

        if (!state) {
            return;
        }


        state.money =
            Math.max(
                0,
                state.money - 1
            );


        renderInventory();

    }
);


moneyPlus.addEventListener(
    "click",
    () => {

        if (!state) {
            return;
        }


        state.money++;


        renderInventory();

    }
);


/* REMNANTS */

remnantsMinus.addEventListener(
    "click",
    () => {

        if (!state) {
            return;
        }


        state.remnants =
            Math.max(
                0,
                state.remnants - 1
            );


        renderInventory();

    }
);


remnantsPlus.addEventListener(
    "click",
    () => {

        if (!state) {
            return;
        }


        state.remnants++;


        renderInventory();

    }
);


/* CLUES */

cluesMinus.addEventListener(
    "click",
    () => {

        if (!state) {
            return;
        }


        state.clues =
            Math.max(
                0,
                state.clues - 1
            );


        renderInventory();

    }
);


cluesPlus.addEventListener(
    "click",
    () => {

        if (!state) {
            return;
        }


        state.clues++;


        renderInventory();

    }
);


/* =========================================================
   INVENTORY PANEL
========================================================= */

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


inventoryPanel.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            inventoryPanel
        ) {

            closePanel(
                inventoryPanel
            );

        }

    }
);


/* =========================================================
   MANUAL DICE COUNT
========================================================= */

countButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                countButtons.forEach(
                    otherButton => {

                        otherButton
                            .classList
                            .remove(
                                "selected"
                            );

                    }
                );


                button.classList.add(
                    "selected"
                );


                selectedDiceCount =
                    Number(
                        button.dataset.count
                    );

            }
        );

    }
);


/* =========================================================
   MANUAL ROLL PANEL
========================================================= */

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


manualRollPanel.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            manualRollPanel
        ) {

            closePanel(
                manualRollPanel
            );

        }

    }
);


/* =========================================================
   MANUAL ROLL
========================================================= */

manualRollButton.addEventListener(
    "click",
    () => {

        if (
            isRolling
        ) {

            return;

        }


        /*
           Starting another roll clears
           an unused Focus reroll without
           consuming the Focus.
        */

        clearActiveInvestigatorRoll();


        const thresholdAtRoll =
            successThreshold;


        rollDice({

            count:
                selectedDiceCount,

            threshold:
                thresholdAtRoll,

            diceContainer:
                manualDiceResults,

            rollArea:
                manualRollArea,

            successDisplay:
                manualSuccesses

        });

    }
);


/* =========================================================
   SHARED ROLL FUNCTION
========================================================= */

function rollDice({

    count,
    threshold,
    diceContainer,
    rollArea,
    successDisplay,
    onComplete = null

}) {

    if (
        isRolling
    ) {

        return;

    }


    isRolling =
        true;


    const results =
        [];


    for (
        let i = 0;
        i < count;
        i++
    ) {

        results.push(
            rollDie()
        );

    }


    diceContainer.innerHTML =
        "";


    successDisplay.textContent =
        "—";


    for (
        let i = 0;
        i < count;
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


    rollArea.classList.add(
        "rolling"
    );


    setTimeout(
        () => {

            rollArea.classList.remove(
                "rolling"
            );


            displayDiceResults(

                results,

                threshold,

                diceContainer,

                successDisplay

            );


            const diceElements =
                diceContainer
                    .querySelectorAll(
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


            if (
                typeof onComplete ===
                "function"
            ) {

                onComplete(
                    results
                );

            }

        },
        350
    );

}


/* =========================================================
   DISPLAY DICE
========================================================= */

function displayDiceResults(

    results,
    threshold,
    diceContainer,
    successDisplay

) {

    diceContainer.innerHTML =
        "";


    let successes =
        0;


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
                result >= threshold
            ) {

                die.classList.add(
                    "success-die"
                );


                successes++;

            }


            diceContainer.appendChild(
                die
            );

        }
    );


    successDisplay.textContent =
        successes;

}


/* =========================================================
   CREATE PIPS
========================================================= */

function createPips(
    die,
    value
) {

    const visiblePips = {

        1:
            [4],

        2:
            [0, 8],

        3:
            [0, 4, 8],

        4:
            [0, 2, 6, 8],

        5:
            [0, 2, 4, 6, 8],

        6:
            [0, 2, 3, 5, 6, 8]

    };


    for (
        let i = 0;
        i < 9;
        i++
    ) {

        const pip =
            document.createElement(
                "span"
            );


        pip.className =
            "pip";


        if (
            visiblePips[value]
                .includes(i)
        ) {

            pip.classList.add(
                "visible"
            );

        }


        die.appendChild(
            pip
        );

    }

}


/* =========================================================
   RANDOM D6
========================================================= */

function rollDie() {

    const range =
        0x100000000;


    const limit =
        range -
        (range % 6);


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


/* =========================================================
   RESET INVESTIGATOR ROLL
========================================================= */

function resetInvestigatorRollDisplay() {

    investigatorDiceResults.innerHTML =
        "";


    investigatorSuccesses.textContent =
        "—";


    focusRerollButton
        .classList
        .remove(
            "visible"
        );


    investigatorDiceResults
        .classList
        .remove(
            "selecting-reroll"
        );

}


/* =========================================================
   PANEL HELPERS
========================================================= */

function openPanel(
    panel
) {

    if (!panel) {
        return;
    }


    panel.classList.add(
        "open"
    );

}


function closePanel(
    panel
) {

    if (!panel) {
        return;
    }


    panel.classList.remove(
        "open"
    );

}


/* =========================================================
   CHANGE INVESTIGATOR
========================================================= */

changeInvestigator.addEventListener(
    "click",
    () => {

        showSelectionScreen();

    }
);


/* =========================================================
   INITIALIZATION
========================================================= */

updateModifierButtons();

loadInvestigators();


/* =========================================================
   SERVICE WORKER
========================================================= */

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
                .catch(
                    error => {

                        console.error(
                            "Service worker registration failed:",
                            error
                        );

                    }
                );

        }
    );

}