<?php
class GameConfig {
    private $configs = [
        'futsal' => [
            'periods' => 2,
            'periodDuration' => 60*20,
            'points' => 1
        ],
        'basketball' => [
            'periods' => 4,
            'periodDuration' => 10 * 60,
            'points' => 1
        ],
        'volleyball' => [
            'points' => 1
        ],
    ];
    
    public function getConfig($gameType) {
        if (isset($this->configs[strtolower($gameType)])) {
            return $this->configs[strtolower($gameType)];
        }
        throw new Exception("Unknown game type: $gameType");
    }
}