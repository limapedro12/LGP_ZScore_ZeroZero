<?php
class GameConfig {
    private $configs = [
        'futsal' => [
            'periods' => 2,
            'periodDuration' => 60*20,
            'timeoutDuration' => 60,
            'timeoutsPerTeam' => 5,
            'timeoutsPerPeriod' => 1,
        ],
        'basketball' => [
            'periods' => 4,
            'periodDuration' => 10 * 60,
            'timeoutDuration' => 60,
            'timeoutsPerTeam' => 6,
            'timeoutsPerPeriod' => 2,
        ],
    ];
    
    public function getConfig($sport) {
        if (isset($this->configs[strtolower($sport)])) {
            return $this->configs[strtolower($sport)];
        }
        throw new Exception("Unknown game type: $sport");
    }
}