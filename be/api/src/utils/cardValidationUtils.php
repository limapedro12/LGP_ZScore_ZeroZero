<?php

require_once __DIR__ . '/../config/gameConfig.php';
require_once __DIR__ . '/requestUtils.php'; 

class CardValidationUtils {

    /**
     * Retrieves all card events for a specific game from Redis.
     *
     * @param Redis $redis Redis connection instance.
     * @param string $placardId The ID of the game/placard.
     * @return array List of card events, or empty array if none/error.
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
                    if (isset($hash['timestamp'])) $hash['timestamp'] = (int)$hash['timestamp'];
                    if (isset($hash['eventId'])) $hash['eventId'] = (int)$hash['eventId'];
                    if (isset($hash['playerId'])) $hash['playerId'] = (int)$hash['playerId']; // Ensure playerId is int for comparison
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
     * Checks if a specific card can be assigned to a player in a game based on sport rules.
     *
     * @param Redis $redis Redis connection instance.
     * @param string $placardId The ID of the game/placard.
     * @param string $sport The sport type ('futsal', 'volleyball', etc.).
     * @param int $playerId The ID of the player.
     * @param string $cardTypeToAssign The type of card to be assigned.
     * @return bool True if the card can be assigned, false otherwise.
     */
    public static function canAssignCard($redis, $placardId, $sport, $playerId, $cardTypeToAssign): bool {
        $allCards = self::getGameCards($redis, $placardId);
        $playerCards = array_filter($allCards, fn($card) => isset($card['playerId']) && $card['playerId'] === $playerId);

        $sportLower = strtolower($sport);

        switch($sportLower) {
            case 'futsal':
                $yellowCount = 0;
                $hasRed = false;
                foreach ($playerCards as $card) {
                    if ($card['cardType'] === 'yellow') $yellowCount++;
                    if ($card['cardType'] === 'red') $hasRed = true;
                }

                if ($hasRed) {
                    return false; 
                }

                if ($cardTypeToAssign === 'red' && $yellowCount <= 2) {
                    return true; 
                }
                
                return $cardTypeToAssign === 'yellow' && $yellowCount < 2;

            case'volleyball':
                $sanctionLevels = [
                    'yellow' => 1, 
                    'red' => 2,
                    'yellow_red_together' => 3,
                    'yellow_red_separately' => 4,
                ];

                $currentMaxLevel = 0;
                foreach ($playerCards as $card) {
                    $level = $sanctionLevels[$card['cardType']] ?? 0;
                    if ($level > $currentMaxLevel) {
                        $currentMaxLevel = $level;
                    }
                }

                $levelToAssign = $sanctionLevels[$cardTypeToAssign] ?? 0;

                return $levelToAssign > $currentMaxLevel;

            default:
                return true;
        }
    }
}
?>