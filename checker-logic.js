var TOTAL_PLAYERS = 15;
var RULESET = 0;
//0 = ranked
var available_roles = [];
var GROUPS = [];
var claimed_roles = [];

function createPlayer(player_number, roles) {
    var html =
        "<li id=\"" + player_number + "\" class=\"collection-item\">" +
        "<p class=\"player-num\">" + player_number + "</p>" +
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

    for (var i = 1; i < TOTAL_PLAYERS + 1; i++) {
        var element = createPlayer(i, available_roles);
        $("#alive-players").append(element);
        $("#selector" + i).material_select();
    }

    function setupGameMode(RULESET) {
        switch (RULESET) {
            //Ranked ruleset
            case 0:
                available_roles = ["Amnesiac", "Arsonist", "Blackmailer", "Bodyguard", "Consiglere", "Consort", "Disguiser",
                    "Doctor", "Escort", "Executioner", "Forger", "Framer", "Godfather", "Investigator", "Jailor",
                    "Janitor", "Jester", "Lookout", "Mafioso", "Mayor", "Medium", "Retributionist", "Serial Killer",
                    "Sheriff", "Spy", "Survivor", "Transporter", "Vampire Hunter", "Vigilante", "Werewolf", "Witch"];
                GROUPS = [roleValues("Jailor", 1, ["Jailor"]),
                    roleValues("Town Investigative", 2, ["Investigator", "Lookout", "Sheriff", "Spy"]),
                    roleValues("Town Killing", 2, ["Vampire Hunter", "Veteran", "Vigilante"]),
                    roleValues("Town Protective", 1, ["Bodyguard", "Doctor"]),
                    roleValues("Town Support", 1, ["Escort", "Medium", "Mayor", "Retributionist", "Transporter"]),
                    roleValues("Godfather", 1, ["Godfather"]),
                    roleValues("Mafioso", 1, ["Mafioso"]),
                    roleValues("Random Mafia", 1, ["Disguiser", "Forger", "Framer", "Janitor", "Blackmailer", "Consigliere", "Consort"]),
                    roleValues("Neutral Killing", 1, ["Arsonist", "Serial Killer", "Werewolf"]),
                    roleValues("Neutral Evil", 1, ["Executioner", "Jester", "Witch"]),
                    roleValues("Neutral Benign", 1, ["Amnesiac", "Survivor"]),
                    //("anything" == all town roles) == true
                    roleValues("Any", 1, ["anything"])];
                break;
        }

    }

    function roleValues(name, number, roles) {
        return {
            "name": name,
            "quantity_limit": number,
            "quantity": 0,
            "roles": roles
        };
    }
}

$(document).ready(function () {
    initialSetup();
});

function checkRoleValidity() {
    for (var key in claimed_roles) {
        for (var i = 0; i < GROUPS.length; i++) {
            for (var k = 0; k < GROUPS[i].roles.length; k++) {
                if (claimed_roles[key] === GROUPS[i].roles[k]) {
                    GROUPS[i].quantity++;
                    if (GROUPS[i].quantity >= GROUPS[i].quantity_limit) {
                        alert("Warning, " + GROUPS[i].name + " limit reached");
                    }
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