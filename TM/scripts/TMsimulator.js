function colorStates(states, cssClass) {
    if (states === undefined || states === null) {
        return;
    }

    states = getElementsOfStates(states);

    for (var i = 0; i < states.length; i++) {
        states[i].children("ellipse").each(function () {
            $(this).attr("class", cssClass);
        });
    }
}

function colorDiv(divId, intervals, cssClass) {
    var regex = $("#" + divId).html();

    var start = 0;
    var out = "";
    var color;
    for (var i = 0; i < intervals.length; i++) {
        out += regex.slice(start, intervals[i][0]);
        if (regex.slice(intervals[i][0], intervals[i][1]) == " ")
            color = "^";
        else color = regex.slice(intervals[i][0], intervals[i][1]);
        out += '<font class="' + cssClass + '">' + color + '</font>';
        start = intervals[i][1];
    }

    out += regex.slice(start);

    $("#" + divId).html(out);
}
function getElementsOfStates(states) {
    var retVal = [];

    for (var i = 0; i < states.length; i++) {
        $("title:contains('" + states[i].toString() + "')").each(function (index, element) {
            if ($(this).text() === states[i].toString()) {
                retVal.push($(this).parent());
            }
        });
    }

    return retVal;
}

function reorderCirclesInAcceptingStates(states) {
    var stateElements = getElementsOfStates(states);

    for (var i = 0; i < stateElements.length; i++) {
        var e1 = $(stateElements[i].children("ellipse")[0]);
        var e2 = $(stateElements[i].children("ellipse")[1]);
        e1.insertAfter(e2);
    }
}

function drawGraph() {
    var dotString = noam.fsm.printDotFormat(automaton);
    var gvizXml = Viz(dotString, "svg");
    $("#automatonGraph").html(gvizXml);
    reorderCirclesInAcceptingStates(automaton.acceptingStates);
    $("#automatonGraph svg").width($("#automatonGraph").width());
}

function colorize() {
    colorStates(automaton.states, "inactiveStates");
    colorStates(oldState, "currentState");
}




$("#startStop").click(function () {
    if ($("#startStop").text() === "Start") {

        var r = $("#inputString").val();
        $("#inputString").parent().html('<div id="inputString" type="text" class="input-div input-block-level monospaceRegex" placeholder="See if this fits"><br></div>');
        $("#inputString").html(r === "" ? '<br>' : r);
        resetAutomaton();
        $("#inputString").removeAttr("contenteditable");
        $("#inputFirst").attr("disabled", false);
        if (document.getElementById("acceptor").checked == true) {
            document.getElementById("accepted").value = "";
        }

        $("#inputNext").attr("disabled", false);
        $("#fastRun").attr("disabled", false);
        $("#inputLast").attr("disabled", false);
        $("#startStop").text("Stop");
        accepted = false;
    } else {
        var r = $("#inputString").text();
        if (document.getElementById("acceptor").checked == true) {
            $("#producer").attr("disabled", false);
        }
        else {
            $("#acceptor").attr("disabled", false);
            $("#accepted").attr("disabled", false);
        }
        $("#inputString").parent().html('<input id="inputString" type="text" class="input-block-level monospaceRegex" placeholder="See if this fits">');
        $("#inputString").keyup(onInputStringChange);
        $("#inputString").change(onInputStringChange);
        $("#inputString").val(r);
        $("#inputString").attr("contenteditable", "");
        $("#inputFirst").attr("disabled", true);
        $("#inputNext").attr("disabled", true);
        $("#fastRun").attr("disabled", true);
        $("#inputLast").attr("disabled", true);
        $("#startStop").text("Start");
        $("#inputString").html(($("#inputString").text()));
        $("#inputString").focus();
        accepted = false;
    }
});

function onInputStringChange() {
    var chars = $("#inputString").val().split("");
    var isValidInputString = -1;
    for (var i = 0; i < chars.length; i++) {
        if (chars[i] === " ") {
        }
        else if (!noam.util.contains(automaton.alphabet, chars[i])) {
            isValidInputString = i;
            break;
        }
    }

    if (isValidInputString === -1) {
        $("#startStop").attr("disabled", false);
        if (document.getElementById("acceptor").checked == true) {
            $("#producer").attr("disabled", true);
        }
        else {
            $("#acceptor").attr("disabled", true);
            $("#accepted").attr("disabled", true);
        }
        $("#inputString").parent().addClass("success");
        $("#inputString").parent().removeClass("error");
        $("#inputError").hide();
    } else {
        $("#startStop").attr("disabled", true);
        $("#inputString").parent().removeClass("success");
        $("#inputString").parent().addClass("error");
        $("#inputError").show();
        $("#inputError").text("Error: input character at position " + i + " is not in TM alphabet.");
    }
}

function colorNextSymbol() {
    $("#inputString").html(inputString);

    if ($("#inputString").html() === "") {
        $("#inputString").html("<br>");
    }

    if (nextSymbolIndex < inputString.length) {
        colorDiv("inputString", [[nextSymbolIndex, nextSymbolIndex + 1]], "nextSymbol");
    }

}

function resetAutomaton() {
    currentStates = noam.fsm.computeEpsilonClosure(automaton, [automaton.initialState]);
    inputString = $("#inputString").text();
    nextSymbolIndex = 0;
    colorize();
    colorNextSymbol();
}

var accepted = false;
$("#inputNext").click(function () {


    var h = [];

    var sympol = inputString[nextSymbolIndex];
    if (inputString[nextSymbolIndex] == ' ') {
        sympol = '^';
    }
    oldState = currentStates;
    h = makeTransition(automaton, currentStates, sympol);
    currentStates = h[0];
    for (var i = 0; i < h[1].length; i++) {
        var symbol1 = automaton.transitions[h[1][i]].symbol.split('/');
        var sympol2 = symbol1[1].split('.');
        
    }
    for (var j = 0; j < automaton.acceptingStates.length; j++) {
        if (oldState[0] === automaton.acceptingStates[j]) {
            accepted = true;
            break;
        }
        else {
            accepted = false;
        }

    }
    var char = inputString.split("");

    if (document.getElementById("acceptor").checked == true) {
        if (accepted == true && currentStates.length === 0) {
            $("#accepted").val("accepted");
            colorNextSymbol();
            colorize();
            return;
        }
        else if (h[0].length === 0 && accepted == false) {
            $("#accepted").val("not accepted");
            colorize();
            colorNextSymbol();
            return;
        }
    }
    else {
        if (accepted == true && currentStates.length === 0) {
            colorize();
            colorNextSymbol();
            return;
        }
        else if (h[0].length === 0 && accepted == false) {
            colorize();
            colorNextSymbol();
            return;
        }
    }
    if (sympol2[0][0] == '^') {
        char[nextSymbolIndex] = ' ';
    }
    else {
        char[nextSymbolIndex] = sympol2[0][0];
    }
    inputString = "";
    for (var i = 0; i < char.length; i++) {
        inputString += char[i];

    }
    $("#inputString").val(inputString);
    if (sympol2[1] == 'R') {
        nextSymbolIndex += 1;
    }
    else if (sympol2[1] == 'L') {
        nextSymbolIndex -= 1;
    }
    if (nextSymbolIndex > inputString.length - 1) {
        inputString += ' ';
        $("#inputString").val(inputString);
    }
    else if (nextSymbolIndex < 0) {
        nextSymbolIndex += 1;
        inputString = ' ' + inputString;
        $("#inputString").val(inputString);

    }
    colorize();
    colorNextSymbol();


});

$("#fastRun").click(function () {
    function FastRun() {

        var h = [];

        var sympol = inputString[nextSymbolIndex];
        if (inputString[nextSymbolIndex] == ' ') {
            sympol = '^';
        }
        oldState = currentStates;
        h = makeTransition(automaton, currentStates, sympol);
        currentStates = h[0];
        for (var i = 0; i < h[1].length; i++) {
            var symbol1 = automaton.transitions[h[1][i]].symbol.split('/');
            var sympol2 = symbol1[1].split('.');
            
        }
        for (var j = 0; j < automaton.acceptingStates.length; j++) {
            if (oldState[0] === automaton.acceptingStates[j]) {
                accepted = true;
                break;
            }
            else {
                accepted = false;
            }

        }
        var char = inputString.split("");

        if (document.getElementById("acceptor").checked == true) {
            if (accepted == true && currentStates.length === 0) {
                $("#accepted").val("accepted");
                colorize();
                colorNextSymbol();
                return;
            }
            else if (h[0].length === 0 && accepted == false) {
                $("#accepted").val("not accepted");
                colorize();
                colorNextSymbol();
                return;
            }
        }
        else {
            if (accepted == true && currentStates.length === 0) {
                colorize();
                colorNextSymbol();
                return;

            }
            else if (h[0].length === 0 && accepted == false) {
                colorNextSymbol();
                colorize();
                return;
            }
        }
        if (sympol2[0][0] == '^') {
            char[nextSymbolIndex] = ' ';
        }
        else {
            char[nextSymbolIndex] = sympol2[0][0];
        }
        inputString = "";
        for (var i = 0; i < char.length; i++) {
            inputString += char[i];

        }
        $("#inputString").val(inputString);
        if (sympol2[1] == 'R') {
            nextSymbolIndex += 1;
        }
        else if (sympol2[1] == 'L') {
            nextSymbolIndex -= 1;
        }
        if (nextSymbolIndex > inputString.length - 1) {
            inputString += ' ';
            $("#inputString").val(inputString);
        }
        else if (nextSymbolIndex < 0) {

            inputString = ' ' + inputString;
            $("#inputString").val(inputString);
            nextSymbolIndex += 1;

        }
        colorize();
        colorNextSymbol();


        setTimeout(FastRun, 200);
    }
    FastRun();


});
var oldState
$("#inputLast").click(function () {
    while (true) {


        var h = [];

        var sympol = inputString[nextSymbolIndex];
        if (inputString[nextSymbolIndex] == ' ') {
            sympol = '^';
        }
        oldState = currentStates;
        h = makeTransition(automaton, currentStates, sympol);
        currentStates = h[0];
        for (var i = 0; i < h[1].length; i++) {
            var symbol1 = automaton.transitions[h[1][i]].symbol.split('/');
            var sympol2 = symbol1[1].split('.');
            
        }
        for (var j = 0; j < automaton.acceptingStates.length; j++) {
            if (oldState[0] === automaton.acceptingStates[j]) {
                accepted = true;
                break;
            }
            else {
                accepted = false;
            }
                

        }
        var char = inputString.split("");

        if (document.getElementById("acceptor").checked == true) {
            
        }
        else {

        }
        if (document.getElementById("acceptor").checked == true) {
            if (accepted == true && currentStates.length === 0) {
                $("#accepted").val("accepted");
                colorize();
                colorNextSymbol();
                break;
            }
           else if (h[0].length === 0 && accepted == false) {
               $("#accepted").val("not accepted");
               colorize();
                colorNextSymbol();
                break;
            }
        }
        else {
            if (accepted == true && currentStates.length === 0) {
                colorize();
                colorNextSymbol();
                break;

            }
            else if (h[0].length === 0 && accepted == false) {
                colorize();
                colorNextSymbol();
                break;
            }
        }
        if (sympol2[0][0] == '^') {
            char[nextSymbolIndex] = ' ';
        }
        else {
            char[nextSymbolIndex] = sympol2[0][0];
        }
        inputString = "";
        for (var i = 0; i < char.length; i++) {
            inputString += char[i];

        }

        if (sympol2[1] == 'R') {
            nextSymbolIndex += 1;
        }
        else if (sympol2[1] == 'L') {
            nextSymbolIndex -= 1;
        }
        if (nextSymbolIndex > inputString.length - 1) {
            inputString += ' ';

        }
        else if (nextSymbolIndex < 0) {

            inputString = ' ' + inputString;

            nextSymbolIndex += 1;

        }


        
    }
    $("#inputString").val(inputString);
    colorize();
    colorNextSymbol();
});

function initialize() {
    inputStringLeft = null;
    currentStates = null;
    inactiveStates = null;
    previousStates = null;
    nextStates = null;
}


var automaton = null;
var inputString = null;
var nextSymbolIndex = 0;
var currentStates = null;
var inactiveStates = null;
var previousStates = null;
var nextStates = null;
var inputIsRegex = true;

$("#createAutomaton").click(function () {

    automaton = parseFsmFromString($("#TM").val());
    initialize();
    drawGraph();
    resetAutomaton();
    $("#inputString").attr("disabled", false);
});


$("#TM").change(onRegexOrAutomatonChange);
$("#TM").keyup(onRegexOrAutomatonChange);

function onRegexOrAutomatonChange() {
    $("#automatonGraph").html("");
    $("#inputString").html("<br>");

    $("#createAutomaton").attr("disabled", true);
    $("#startStop").attr("disabled", true);
    $("#inputNext").attr("disabled", true);
    $("#fastRun").attr("disabled", true);
    $("#inputLast").attr("disabled", true);
    $("#inputString").parent().html('<input id="inputString" type="text" class="input-block-level monospaceRegex" placeholder="See if this fits" disabled>');
    $("#inputString").parent().removeClass("success error");
    $("#inputString").keyup(onInputStringChange);
    $("#inputString").change(onInputStringChange);
    $("#startStop").text("Start");
    $("#inputError").hide();

    validateFsm();

}

function validateFsm() {
    var TM = $("#TM").val();

    if (TM.length === 0) {
        $("#TM").parent().removeClass("success error");
        $("#fsmError").hide();
    } else {

        parseFsmFromString(TM);
        $("#TM").parent().removeClass("error");
        $("#TM").parent().addClass("success");
        $("#createAutomaton").attr("disabled", false);
        $("#fsmError").hide();
    }
}


function parseFsmFromString(TM_string) {
    var lines = TM_string.split(/\r?\n/);

    var states = [];
    var initial;
    var accepting = [];
    var alphabet = [];
    var transitions = [];

    var parseState = null;

    var parseCounts = {
        states: 0,
        initial: 0,
        accepting: 0,
        alphabet: 0,
        transitions: 0
    };

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].replace(/\s/g, "");

        if (line.length === 0) {
            continue;
        } else if (line[0] === '#') {
            parseState = line.substr(1);

            if (typeof parseCounts[parseState] === 'undefined') {
                throw new Error('Line ' + (i + 1).toString() + ': invalid section name ' +
                                 parseState + '. Must be one of: states, initial, \
                           accepting, alphabet, transitions.');
            } else {
                parseCounts[parseState] += 1;

                if (parseCounts[parseState] > 1) {
                    throw new Error('Line ' + (i + 1).toString() +
                                    ': duplicate section name ' + parseState + '.');
                }
            }
        } else {
            if (parseState == null) {
                throw new Error('Line ' + (i + 1).toString() + ': no #section declared. \
                          Add one section: states, initial, accepting, \
                          alphabet, transitions.');
            } else if (parseState === 'states') {
                var st = line.split(";");
                states = states.concat(st);
            } else if (parseState == 'initial') {
                initial = line;
            } else if (parseState == 'accepting') {
                var ac = line.split(";");
                accepting = accepting.concat(ac);
            } else if (parseState == 'alphabet') {
                var al = line.split(";");
                alphabet = alphabet.concat(al);
            } else if (parseState == 'transitions') {
                var state_rest = line.split(':');

                var state = state_rest[0].split(',');
                var parts = state_rest[1].split(';');

                for (var j = 0; j < parts.length; j++) {
                    var left_right = parts[j].split('>');
                    var al_t = left_right[0].split(',');
                    var st_t = left_right[1].split(',');
                }

                transitions.push([state, al_t, st_t]);
            }
        }
    }

    for (var k in parseCounts) {
        if (parseCounts[k] !== 1) {
            throw new Error('Specification missing #' + parseCounts[k] +
              ' section.');
        }
    }

    var TM = noam.fsm.makeNew();

    for (var i = states.length - 1; i >= 0; i--) {
        noam.fsm.addState(TM, states[i]);
    }

    for (var i = alphabet.length - 1; i >= 0; i--) {
        noam.fsm.addSymbol(TM, alphabet[i]);
    }

    for (var i = 0; i < accepting.length; i++) {
        noam.fsm.addAcceptingState(TM, accepting[i]);
    }

    noam.fsm.setInitialState(TM, initial);

    for (var i = 0; i < transitions.length; i++) {
        var transition = transitions[i];

        for (var j = 0; j < transition[0].length; j++) {
            for (var k = 0; k < transition[1].length; k++) {
                if (transition[1][k] === noam.fsm.epsilonSymbol) {
                    noam.fsm.addEpsilonTransition(TM, transition[0][j], transition[2]);
                } else {
                    addTransition(TM, transition[0][j], transition[2], transition[1][k]);

                }

            }
        }
    }



    return TM;
}
function addTransition(TM, fromState, toStates, transitionSymbol) {
    noam.fsm._addTransition(TM, fromState, toStates, transitionSymbol);
};
function makeSimpleTransition(TM, states, symbol) {
    if (!(noam.util.containsAll(TM.states, states))) {
        throw new Error('TM must contain all states for which the transition is being computed');
    }

    if (!(noam.util.contains(TM.alphabet, symbol))) {
        throw new Error('TM must contain input symbol for which the transition is being computed');
    }

    var targetStates = [];
    var index = [];
    var doub = [];
    for (var i = 0; i < TM.transitions.length; i++) {
        var transition = TM.transitions[i];
        var symbol1 = TM.transitions[i].symbol.split('/');
        if (noam.util.areEquivalent(symbol1[0], symbol) &&
            noam.util.contains(states, transition.fromState)) {
            for (var j = 0; j < transition.toStates.length; j++) {
                if (!(noam.util.contains(targetStates, transition.toStates[j]))) {
                    targetStates.push(transition.toStates[j]);
                    index.push(i);
                }
            }
        }
    }
    doub.push(targetStates, index);
    return doub;
};

// makes transition from states array states and for input symbol symbol by:
//   a) computing the epsilon closure of states
//   b) making a simple transition from resulting states of a)
//   c) computing the epsilon closure of resulting states of b)
function makeTransition(TM, states, symbol) {
    if (!(noam.util.containsAll(TM.states, states))) {
        throw new Error('TM must contain all states for which the transition is being computed');
    }

    if (!(noam.util.contains(TM.alphabet, symbol))) {
        throw new Error('TM must contain input symbol for which the transition is being computed');
    }

    var targetStates = noam.util.clone(states);

    targetStates = makeSimpleTransition(TM, targetStates, symbol);

    return targetStates;
};
