<?php
require_once 'AbstractTeam.php';
require_once 'AbstractPlayer.php';
require_once 'AbstractPlacard.php';
require_once 'VolleyballTeam.php';
require_once 'VolleyballPlayer.php';
require_once 'VolleyballPlacard.php';
require_once 'FutsalTeam.php';
require_once 'FutsalPlayer.php';
require_once 'FutsalPlacard.php';
require_once 'CardEvent.php';
require_once 'AbstractEvent.php';

// Test VolleyballTeam and VolleyballPlayer
$volleyballTeam = new VolleyballTeam(1, "Volleyball Team A", "logoA.png");
$volleyballPlayer = new VolleyballPlayer(1, "Player A", "Setter", 7, $volleyballTeam);
$volleyballTeam->setPlayers([$volleyballPlayer]);

echo "Volleyball Team: " . $volleyballTeam->getName() . "\n";
echo "Player in Team: " . $volleyballTeam->getPlayers()[0]->getName() . "\n";

// Test VolleyballPlacard
$volleyballPlacard = new VolleyballPlacard($volleyballTeam, null, false, 1, 2, 2, false);
$volleyballPlacard->addSetResult(1, 25, 20);
echo "Volleyball Placard Current Set: " . $volleyballPlacard->getCurrentSet() . "\n";
echo "Set 1 Result: " . json_encode($volleyballPlacard->getSetNumber(1)) . "\n";

// Test CardEvent
$cardEvent = new CardEvent(10, "Volleyball", $volleyballPlacard, $volleyballPlayer, "Red");
$cardEvent->setPlayer($volleyballPlayer);
$cardEvent->setCardColor("Yellow");
$volleyballPlacard->addEvent($cardEvent);
echo "Card Event Player: " . $volleyballPlacard->getEvents()[0]->getPlayer()->getName() . "\n";
echo "Card Event Color: " . $volleyballPlacard->getEvents()[0]->getCardColor() . "\n";


// Test FutsalTeam and FutsalPlayer
$futsalTeam = new FutsalTeam(2, "Futsal Team B", "logoB.png");
$futsalPlayer = new FutsalPlayer(2, "Player B", "Forward", 10, $futsalTeam);
$futsalTeam->setPlayers([$futsalPlayer]);

echo "Futsal Team: " . $futsalTeam->getName() . "\n";
echo "Player in Team: " . $futsalTeam->getPlayers()[0]->getName() . "\n";

// Test FutsalPlacard
$futsalPlacard = new FutsalPlacard($futsalTeam, null, false, 3, 2, 1, 1, 1, false, false);
$futsalPlacard->setCurrentGoalsFirstTeam(5);
echo "Futsal Placard Goals for First Team: " . $futsalPlacard->getCurrentGoalsFirstTeam() . "\n";
?>
