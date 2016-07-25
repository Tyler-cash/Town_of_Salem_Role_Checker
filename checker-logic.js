var PLAYER_LIMIT = 0;
var RULESET = 0;
var TOWN_LIMIT = 0;
var MAFIA_LIMIT = 0;
var available_roles = [];
var groups = [];
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
//TODO make read list and find roles that don't add up
function getPossibleRoles() {
    return available_roles;

}
function initialSetup() {
    setupGameMode(RULESET);
    possible_roles = getPossibleRoles();

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
                groups = [
                    roleValues("Jailor", 2, ["Jailor"]),
                    roleValues("Town Investigative", 3, ["Investigator", "Lookout", "Sheriff", "Spy"], "Town"),
                    roleValues("Town Killing", 3, ["Vampire Hunter", "Veteran", "Vigilante"], "Town"),
                    roleValues("Town Protective", 2, ["Bodyguard", "Doctor"], "Town"),
                    roleValues("Town Support", 3, ["Escort", "Medium", "Mayor", "Retributionist", "Transporter"], "Town"),
                    roleValues("Godfather", 1, ["Godfather"], "Mafia"),
                    roleValues("Mafioso", 1, ["Mafioso"], "Mafia"),
                    roleValues("Random Mafia", 2, ["Disguiser", "Forger", "Framer", "Janitor", "Blackmailer", "Consigliere", "Consort"],
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

    for (var key in claimed_roles) {
        for (var i = 0; i < groups.length; i++) {
            for (var k = 0; k < groups[i].roles.length; k++) {
                if (claimed_roles[key] == groups[i].roles[k]) {

                    var key_not_present = true;
                    for (var j = 0; j < groups[i].location_in_array.length; j++) {
                        if (groups[i].location_in_array[j] == key) {
                            key_not_present = false;
                            break;
                        }
                    }

                    if (key_not_present) {
                        //If true then role is already in use elsewhere
                        if (claimed_roles[key] != undefined) {
                            //Finds and remove the other role that already exists
                            for (var j = 0; j < groups.length; j++) {
                                for (var l = 0; l < groups[j].location_in_array.length; l++) {
                                    if (groups[j].location_in_array[l] == key) {
                                        groups[j].location_in_array.splice(l, 1);
                                    }
                                }
                            }
                        }
                        groups[i].location_in_array.push(key);
                    }
                }
            }
        }
    }

    for (var key in claimed_roles) {
        for (var i = 0; i < groups.length; i++) {
            for (var k = 0; k < groups[i].roles.length; k++) {
                //If roles are over individual group cap.
                var limitedGroup = 0;
                if (groups[i].location_in_array.length === groups[i].quantity_limit) {
                    limitedGroup = 1;
                } else if (groups[i].location_in_array.length > groups[i].quantity_limit) {
                    limitedGroup = 2;
                }
                //If roles are over town cap
                if (groups[i].location_in_array.length === TOWN_LIMIT && groups[i].affiliation == "Town") {
                    limitedGroup = 1;
                } else if (groups[i].location_in_array.length > TOWN_LIMIT && groups[i].affiliation == "Town") {
                    limitedGroup = 2;
                }
                //If roles are over mafia cap
                if (groups[i].location_in_array.length === MAFIA_LIMIT && groups[i].affiliation == "Mafia") {
                    limitedGroup = 1;
                } else if (groups[i].location_in_array.length > MAFIA_LIMIT && groups[i].affiliation == "Mafia") {
                    limitedGroup = 2;
                }

                for (var j = 0; j < groups[i].location_in_array.length; j++) {
                    var current_element = groups[i].location_in_array[j];
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
                    $("#" + current_element).children(".player-group").html(groups[i].name);
                }
            }
        }
    }
}
$(function () {
    $(".role-selector").change(function () {
        var player_num = $(this).parent().parent().children(".player-num").text();
        if (player_num !== "") {
            claimed_roles[player_num] = $(this).val();
            checkRoleValidity();
        }
    });
});