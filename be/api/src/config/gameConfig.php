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
            'points' => 1
        ],
        'basketball' => [
            'periods' => 4,
            'periodDuration' => 10 * 60,
            'timeoutDuration' => 60,
            'timeoutsPerTeam' => 5,
            'points' => [1, 2, 3],
        ],
        'volleyball' => [
            'periods' => 5,
            'timeoutDuration' => 30,
            'timeoutsPerTeam' => 2,
            'timeoutsPerPeriod' => 2,
            'cards' => ['white', 'yellow', 'red', 'yellow_red_together', 'yellow_red_separately'],
            'points' => 1,
            'periodEndScore' => 25,
            'pointDifference' => 2,
            'resetPointsEachPeriod' => true,
        ]
    ];
    
    public function getConfig($sport) {
        if (isset($this->configs[strtolower($sport)])) {
            return $this->configs[strtolower($sport)];
        }
        throw new Exception("Unknown sport: $sport");
    }
}