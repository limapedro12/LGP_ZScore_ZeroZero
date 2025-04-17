<?php
class GameConfig {
    private $configs = [
        'futsal' => [
            'periods' => 2,
            'periodDuration' => 60*20,
            'substitutionsPerTeam' => 0, // unlimited

        ],
        'basketball' => [
            'periods' => 4,
            'periodDuration' => 10 * 60,
            'substitutionsPerTeam' => 0, // unlimited
        ],
        'volleyball' => [
            'periods' => 5,
            // 'periodDuration' => 25 * 60, //there is no period duration, it is first to get to 25 or to win by 2 point difference after 25,
            'substitutionsPerTeam' => 6, // 6 per set
        ],
    ];
    
    public function getConfig($gameType) {
        if (isset($this->configs[strtolower($gameType)])) {
            return $this->configs[strtolower($gameType)];
        }
        throw new Exception("Unknown game type: $gameType");
    }
}