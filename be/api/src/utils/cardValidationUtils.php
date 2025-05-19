<?php

require_once __DIR__ . '/../config/gameConfig.php';
require_once __DIR__ . '/requestUtils.php';

class CardValidationUtils {

    /**
     * Retrieves all card events for a specific game from Redis.
     * (Keep the existing getGameCards function as is)
     */
    private static function getGameCards($redis, $placardId): array {
        try {
            $keys = RequestUtils::getRedisKeys($placardId, 'cards');
            if (!$keys) return [];

            $gameCardsKey = $keys['game_cards'];
            $cardEventKeys = $redis->zRange($gameCardsKey, 0, -1);

            if (empty($cardEventKeys)) {
                return [];
            }

            $pipe = $redis->pipeline();
            foreach ($cardEventKeys as $key) {
                $pipe->hGetAll($key);
            }
            $cardHashes = $pipe->exec();

            $cards = [];
            foreach ($cardHashes as $hash) {
                if ($hash) {
                    // Ensure types are correct for comparison and sorting
                    if (isset($hash['timestamp'])) $hash['timestamp'] = (int)$hash['timestamp'];
                    if (isset($hash['eventId'])) $hash['eventId'] = (int)$hash['eventId'];
                    if (isset($hash['playerId'])) $hash['playerId'] = (int)$hash['playerId'];
                    $cards[] = $hash;
                }
            }
            return $cards;
        } catch (Exception $e) {
            error_log("Error fetching game cards: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Checks if assigning/updating a card maintains a valid sequence according to sport rules.
     *
     * @param Redis $redis Redis connection instance.
     * @param ?int $eventId The ID of the event being updated (null if adding).
     * @param string $placardId The ID of the game/placard.
     * @param string $sport The sport type ('futsal', 'volleyball', etc.).
     * @param int $playerId The ID of the player.
     * @param string $cardTypeToAssign The type of card to be assigned/updated to.
     * @param int $timestampToAssign The timestamp for the card assignment/update.
     * @return bool True if the assignment results in a valid sequence, false otherwise.
     */
    public static function canAssignCard($redis, $eventId, $placardId, $sport, $playerId, $cardTypeToAssign, $timestampToAssign): bool {
        $allCards = self::getGameCards($redis, $placardId); 

        $playerCards = array_filter($allCards, function($card) use ($playerId, $eventId) {
            if (!isset($card['playerId']) || $card['playerId'] !== $playerId) {
                return false;
            }
            if ($eventId !== null && isset($card['eventId']) && $card['eventId'] === $eventId) {
                return false;
            }
            return true;
        });

        $hypotheticalCard = [
            'eventId' => $eventId ?? ('temp_' . uniqid()),
            'placardId' => $placardId,
            'playerId' => $playerId,
            'cardType' => $cardTypeToAssign,
            'timestamp' => (int)$timestampToAssign
        ];

        $hypotheticalSequence = array_values($playerCards); 
        $hypotheticalSequence[] = $hypotheticalCard;

        usort($hypotheticalSequence, function($a, $b) {
            $timeComparison = $a['timestamp'] <=> $b['timestamp'];
            if ($timeComparison !== 0) {
                return $timeComparison;
            }
            
            return 0;
        });

        $sportLower = strtolower($sport);
        $gameConfig = new GameConfig();
        $sportConfig = $gameConfig->getConfig($sportLower);
        $validCardTypes = $sportConfig['cards'] ?? [];
        if (!in_array($cardTypeToAssign, $validCardTypes)) {
            error_log("Validation Fail: Invalid card type '{$cardTypeToAssign}' for sport '{$sportLower}'.");
            return false;
        }

        switch($sportLower) {
            case 'futsal':
                $yellowCount = 0;
                $hasRed = false;
                foreach ($hypotheticalSequence as $card) {
                    $currentCardType = $card['cardType'];

                    if ($hasRed) {
                        return false;
                    }

                    if ($currentCardType === 'yellow' && $yellowCount >= 2) {
                        return false;
                    }
                    
                    if ($currentCardType === 'yellow') {
                        $yellowCount++;
                    }

                    if ($currentCardType === 'red') {
                        $hasRed = true;
                    }
                    
                    if ($yellowCount === 2) {
                         if ($currentCardType === 'yellow') {
                            $hasRed = true; 
                         }
                    }
                }
                return true; 

            case 'volleyball':
                $sanctionLevels = [
                    'white' => 0,
                    'yellow' => 1, 
                    'red' => 2,
                    'yellow_red_together' => 3, 
                    'yellow_red_separately' => 4, 
                ];
            
                $currentMaxLevel = -1; 
                foreach ($hypotheticalSequence as $card) {
                    $currentCardType = $card['cardType'];
                    $level = $sanctionLevels[$currentCardType] ?? -1;

                    if ($level === -1) {
                         error_log("Volleyball Validation Fail: Unknown sanction level for card type '{$currentCardType}'.");
                         return false; 
                    }
                    if ($level <= $currentMaxLevel) {
                        return false;
                    }
                    $currentMaxLevel = $level;
                }
                return true; 

            default:
                return true;
        }
    }
}
?>