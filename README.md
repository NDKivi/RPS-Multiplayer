# RPS-Multiplayer
UMN Coding Boot Camp Firebase Homework

## In firebase
* Create a node to save all game data
* Create subnodes for...
    * Chat
    * Players - with subnodes for each player...
        * Choice (rock, paper or scissors)
        * Losses
        * Names
        * Wins

## Firebase events
* On load
Pull down information
* On change to choice
    * Update ready/waiting
    * Update choice
    * If both choices submitted, then update game
        * update game clears choices and updates wins and losses

## Look
* Three drag and drop divs to select rock, paper or scissors