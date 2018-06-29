//=============================================================================
// Global variables
//=============================================================================

// Firebase configuration
const config = {
    apiKey: "AIzaSyBDqJM-oP8ywFh9no-_C1dEial1O7gtn8A",
    authDomain: "testproject-bf7f4.firebaseapp.com",
    databaseURL: "https://testproject-bf7f4.firebaseio.com",
    projectId: "testproject-bf7f4",
    storageBucket: "testproject-bf7f4.appspot.com",
    messagingSenderId: "1052088344148"
};
firebase.initializeApp(config);
const childRef = firebase.database().ref().child("RPC/players");
const chatRef = firebase.database().ref().child("RPC/chat");
let myKey;
let isWaiting;
let myName;

//=============================================================================
// Events
//=============================================================================

// When document is loaded
$(document).ready(function () {
    // Start initialization
    myKey = sessionStorage.getItem("myKey");
    if (myKey) {
        childRef.child(myKey).update({
            "active": "true",
        });
    } else {
        myKey = childRef.push().key;
        sessionStorage.setItem("myKey", myKey);
        childRef.child(myKey).update({
            "wins": 0,
            "losses": 0,
            "ties": 0
        });
    }
    displayChoices();
    // End initialization

    // Update the player's name
    $("#submit-player-name").on("click", function (event) {
        event.preventDefault();
        myName = $("#player-name").val();
        childRef.child(myKey).update({
            "name": myName
        });
    });

    // Update the player's name
    $("#submit-message").on("click", function (event) {
        event.preventDefault();
        let myMessage = $("#message").val();
        let chatKey = chatRef.push().key;
        chatRef.child(chatKey).update({
            name: myName,
            time: moment().format("h:m a"),
            message: myMessage
        });
    });


    $("main").on("click", ".game-image", function () {
        if (!isWaiting) {
            isWaiting = true;
            let thisID = $(this).attr("id");
            switch (thisID) {
                case "rock":
                    $(this).remove();
                    $("#selected-object").html(`<img id="rock" src="assets/images/rock.png" alt="rock">`);
                    childRef.child(myKey).update({
                        "selectedObject": "rock"
                    });
                    break;
                case "paper":
                    $(this).remove();
                    $("#selected-object").html(`<img id="paper" src="assets/images/paper.png" alt="paper">`);
                    childRef.child(myKey).update({
                        "selectedObject": "paper"
                    });
                    break;
                case "scissors":
                    $(this).remove();
                    $("#selected-object").html(`<img id="scissors" src="assets/images/scissors.png" alt="scissors">`);
                    childRef.child(myKey).update({
                        "selectedObject": "scissors"
                    });
                    break;
                default:
                    console.log("WHAT?");
            }
        }
    });

    chatRef.on("value", function (snapshot) {
        let messages = snapshot.val();
        $("#conversation").empty();
        for (let messageIndex in messages) {
            $("#conversation").prepend(`<p><strong>${messages[messageIndex].time}</strong> [${messages[messageIndex].name}] ${messages[messageIndex].message}</p>`);
        }
    });


    //event when updating child
    childRef.on("value", function (snapshot) {
        console.log(snapshot.val());
        let players = snapshot.val();

        // Draw your own name, wins, and losses
        myName = players[myKey].name;
        $("#my-name").text("Name: " + players[myKey].name);
        $("#my-losses").text("Losses: " + players[myKey].losses);
        $("#my-wins").text("Wins: " + players[myKey].wins);
        $("#my-ties").text("Ties: " + players[myKey].ties);

        // Draw the opposing name if there is an enemy
        let myEnemyKey;
        for (let playerIndex in players) {
            if (playerIndex !== myKey && players[playerIndex].active !== "false") {
                myEnemyKey = playerIndex;
            }
        }
        if (myEnemyKey) {
            $("#opponent-name").text("Name: " + players[myEnemyKey].name);
            $("#opponent-losses").text("Losses: " + players[myEnemyKey].losses);
            $("#opponent-wins").text("Wins: " + players[myEnemyKey].wins);
            $("#opponent-ties").text("Ties: " + players[myEnemyKey].ties);
            $("#opponent-object").empty();
            if (players[myEnemyKey].selectedObject) {
                $("#opponent-object").append(`<img id="question-mark" src="assets/images/question.png" alt="question mark">`)
            } 
        } else {
            handleGameLogic = true;
        }

        let myChoice;
        let enemyChoice;
        myChoice = players[myKey].selectedObject;
        enemyChoice = players[myEnemyKey].selectedObject;
        if (myChoice && enemyChoice) {
            if (myChoice === enemyChoice) {
                alert("Drats!  It's a tie.");
                let newNum = parseInt(players[myKey].ties);
                newNum++;
                childRef.child(myKey).update({ "selectedObject": "", "ties": newNum });
            } else if ((myChoice === "paper" && enemyChoice === "rock")
                || (myChoice === "rock" && enemyChoice === "scissors")
                || (myChoice === "scissors" && enemyChoice === "paper")) {
                alert("Congrats! You won this round.");
                let newNum = parseInt(players[myKey].wins);
                newNum++;
                childRef.child(myKey).update({ "selectedObject": "", "wins": newNum });
            } else {
                alert("Sorry!  You lost.  Try harder.")
                let newNum = parseInt(players[myKey].losses);
                newNum++;
                childRef.child(myKey).update({ "selectedObject": "", "losses": newNum });
            }
            isWaiting = false;
            displayChoices();
        }
    });
});

// When user closes their browser or browser tab
$(window).on("unload", function () {
    childRef.child(myKey).update({ "active": "false" });
});

//=============================================================================
// Display
//=============================================================================

function displayChoices() {
    $("#choices").empty();
    $("#selected-object").empty();
    $("#choices").append(
        `<img id="rock" class="game-image" src="assets/images/rock.png" alt="rock">
        <img id="paper" class="game-image" src="assets/images/paper.png" alt="paper">
        <img id="scissors" class="game-image" src="assets/images/scissors.png" alt="scissors">`
    );
}