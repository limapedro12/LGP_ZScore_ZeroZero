<?php
class GameConfig {
    private $configs = [
        'futsal' => [
            'periods' => 2,
            'periodDuration' => 60*20
        ],
        'basketball' => [
            'periods' => 4,
            'periodDuration' => 10 * 60
        ],
    ];
    
    public function getConfig($gameType) {
        if (isset($this->configs[strtolower($gameType)])) {
            return $this->configs[strtolower($gameType)];
        }
        throw new Exception("Unknown game type: $gameType");
    }
}