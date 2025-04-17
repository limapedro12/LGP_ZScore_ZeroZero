<?php
class GameConfig {
    private $configs = [
        'futsal' => [
            'periods' => 2,
            'periodDuration' => 60*20,
            'timeoutDuration' => 60,
            'timeoutsPerTeam' => 1,
            'timeoutsPerPeriod' => 1,
            'cards' => ['yellow', 'red'],
        ],
        'basketball' => [
            'periods' => 4,
            'periodDuration' => 10 * 60,
            'timeoutDuration' => 60,
            'timeoutsPerTeam' => 6,
            'timeoutsPerPeriod' => 2,
        ],
        'volleyball' => [
            'periods' => 5,
            // 'periodDuration' => 25 * 60, //there is no period duration, it is first to get to 25 or to win by 2 point difference after 25
            'timeoutDuration' => 30,
            'timeoutsPerTeam' => 2,
            'timeoutsPerPeriod' => 2,
            'cards' => ['white', 'yellow', 'red', 'yellow_red_together', 'yellow_red_separately'],
        ],
    ];
    
    public function getConfig($sport) {
        if (isset($this->configs[strtolower($sport)])) {
            return $this->configs[strtolower($sport)];
        }
        throw new Exception("Unknown sport: $sport");
    }
}