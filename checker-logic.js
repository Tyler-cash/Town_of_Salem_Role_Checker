var PLAYER_LIMIT = 0;
var RULESET = 0;
var TOWN_LIMIT = 0;
var MAFIA_LIMIT = 0;
var available_roles = [];
var alignments = [];
var claimed_roles = [];


function createPlayer(player_number, roles) {
    var html =
        "<li id=\"" + player_number + "\" class=\"collection-item\">" +
        "<p class=\"player-num left\">" + player_number + "</p>" +
        "<p class=\"player-group left\"></p>" +
        "<select id=\"selector" + player_number + "\" class=\"role-selector right\">" +
        "<option value=\"0\" disabled selected>Please select role</option>";
    for (var i = 0; i < roles.length; i++) {
        html += "<option value=\"" + roles[i] + "\">" + roles[i] + "</option>";
    }

    return html + "<label></label></select></li>";
}
function initialSetup() {
    setupGameMode(RULESET);

    for (var i = 1; i < PLAYER_LIMIT + 1; i++) {
        var element = createPlayer(i, available_roles);
        $("#alive-players").append(element);
        $("#selector" + i).material_select();
    }

    function setupGameMode(RULESET) {
        switch (RULESET) {
            //Ranked ruleset
            case 0:
                available_roles = ["Amnesiac", "Arsonist", "Blackmailer", "Bodyguard", "Consigliere", "Consort", "Disguiser",
                    "Doctor", "Escort", "Executioner", "Forger", "Framer", "Godfather", "Investigator", "Jailor",
                    "Janitor", "Jester", "Lookout", "Mafioso", "Mayor", "Medium", "Retributionist", "Serial Killer",
                    "Sheriff", "Spy", "Survivor", "Transporter", "Vampire Hunter", "Vigilante", "Werewolf", "Witch"];
                alignments = [
                    roleValues("Jailor", 1, ["Jailor"]),
                    roleValues("Town Investigative", 2, ["Investigator", "Lookout", "Sheriff", "Spy"], "Town"),
                    roleValues("Town Killing", 1, ["Vampire Hunter", "Veteran", "Vigilante"], "Town"),
                    roleValues("Town Protective", 2, ["Bodyguard", "Doctor"], "Town"),
                    roleValues("Town Support", 2, ["Escort", "Medium", "Mayor", "Retributionist", "Transporter"], "Town"),
                    roleValues("Godfather", 1, ["Godfather"], "Mafia"),
                    roleValues("Mafioso", 1, ["Mafioso"], "Mafia"),
                    roleValues("Random Mafia", 1, ["Disguiser", "Forger", "Framer", "Janitor", "Blackmailer", "Consigliere", "Consort"],
                        "Mafia"),
                    roleValues("Neutral Killing", 1, ["Arsonist", "Serial Killer", "Werewolf"], "Neutral"),
                    roleValues("Neutral Evil", 1, ["Executioner", "Jester", "Witch"], "Neutral"),
                    roleValues("Neutral Benign", 1, ["Amnesiac", "Survivor"], "Neutral")
                ];
                TOWN_LIMIT = 9;
                MAFIA_LIMIT = 4;
                PLAYER_LIMIT = 15;
                break;
        }

    }

    function roleValues(name, number, roles, affiliation) {
        return {
            "name": name,
            "quantity_limit": number,
            "quantity": 0,
            "roles": roles,
            "affiliation": affiliation,
            "location_in_array": []
        };
    }
}

$(document).ready(function () {
    initialSetup();
});

function checkRoleValidity() {
    function removeColor(ele) {
        $(ele).attr("class", "collection-item");
    }

    // Horrifically inefficient algo
    //This loop manages the role trackers. It will ensure that a player isn't duplicated
    //and they are present in the role tracker once a role has been selected.
    for (var key in claimed_roles) {
        for (var i = 0; i < alignments.length; i++) {
            for (var k = 0; k < alignments[i].roles.length; k++) {
                if (claimed_roles[key] == alignments[i].roles[k]) {

                    //Determines if the role has already been added into it's alignment's
                    //location tracker
                    var key_present = true;
                    for (var j = 0; j < alignments[i].location_in_array.length; j++) {
                        if (alignments[i].location_in_array[j] == key) {
                            key_present = false;
                            break;
                        }
                    }

                    //Will only be false when player doesn't exist in the current alignments role
                    //tracker
                    if (key_present) {
                        //If true then role is already in use elsewhere and needs to be removed
                        //otherwise player will have 2 roles which is impossible. (Although this
                        //allignment is correct due to it matching the player's current role)
                        if (claimed_roles[key] != undefined) {
                            //Finds and removes the player's other alignment
                            for (var j = 0; j < alignments.length; j++) {
                                for (var l = 0; l < alignments[j].location_in_array.length; l++) {
                                    if (alignments[j].location_in_array[l] == key) {
                                        alignments[j].location_in_array.splice(l, 1);
                                    }
                                }
                            }
                        }
                        alignments[i].location_in_array.push(key);
                    }
                }
            }
        }
    }

    /*Horrifically inefficient algo
     colors each player with their claimed role. The color depends on how many people
     have claimed a role that falls within that alignment.
     - Red is a warning that the player is either lying, any role or random town.
     - Orange is an alert that any more claims for that alignment will be any or
     random town.
     -Green means that all claims so far are okay.

     Unique alignments such as godfather, jailor and mafioso will never be green as they
     will always be at their limit.*/

    for (var i = 0; i < alignments.length; i++) {
        for (var k = 0; k < alignments[i].roles.length; k++) {
            //(Definitions can be seen above)
            //limitedGroup = 0 is green
            //limitedGroup = 1 is orange
            //limitedGroup = 2 is red

            //If roles are over individual group cap.
            var limitedGroup = 0;
            if (alignments[i].location_in_array.length === alignments[i].quantity_limit) {
                limitedGroup = 1;
            } else if (alignments[i].location_in_array.length > alignments[i].quantity_limit) {
                limitedGroup = 2;
            }

            //If roles are over town cap
            if (alignments[i].location_in_array.length === TOWN_LIMIT && alignments[i].affiliation == "Town") {
                limitedGroup = 1;
            } else if (alignments[i].location_in_array.length > TOWN_LIMIT && alignments[i].affiliation == "Town") {
                limitedGroup = 2;
            }

            //If roles are over mafia cap
            if (alignments[i].location_in_array.length === MAFIA_LIMIT && alignments[i].affiliation == "Mafia") {
                limitedGroup = 1;
            } else if (alignments[i].location_in_array.length > MAFIA_LIMIT && alignments[i].affiliation == "Mafia") {
                limitedGroup = 2;
            }

            //Iterates through role tracker for alignments[i] and assigns it's
            //respective color level. (Definitions can be seen above)
            for (var j = 0; j < alignments[i].location_in_array.length; j++) {
                var current_element = alignments[i].location_in_array[j];
                if (limitedGroup === 0) {
                    removeColor("#" + current_element);
                    $("#" + current_element).addClass("#b9f6ca green accent-1");
                }
                if (limitedGroup === 1) {
                    removeColor("#" + current_element);
                    $("#" + current_element).addClass("#ffecb3 amber lighten-4");
                } else if (limitedGroup === 2) {
                    removeColor("#" + current_element);
                    $("#" + current_element).addClass("#ffcdd2 red lighten-4");
                }
                //Adds specific roles alignment to be visible by user.
                $("#" + current_element).children(".player-group").html(alignments[i].name);
            }
        }
    }
}
$(function () {
    //color codes all selected players and adds their alignment to be visible
    //by the user.
    $(".role-selector").change(function () {
        //Gets player number relevant to role that was changed and adds it to
        //the global role tracker.
        var player_num = $(this).parent().parent().children(".player-num").text();
        if (player_num !== "") {
            claimed_roles[player_num] = $(this).val();
            checkRoleValidity();
        }
    });

    //removes all players and reinitializes the web app
    $("#reset-button").click(function () {
        //Removes all players. PLAYER_LIMIT will always be 1 too low in the
        //context of a for loop so requires +1.
        for (var i = 1; i < PLAYER_LIMIT + 1; i++) {
            removePlayer(i);
        }
        initialSetup();
    });

    //Removes player at position if it exists.
    function removePlayer(position) {
        if ($("#" + position + "").length) {
            $("#" + position + "").remove();
        }
    }
});