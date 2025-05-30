<?php
class GameConfig {
    private $configs = [
        'futsal' => [
            'periods' => 2,
            'periodDuration' => 60*20,
            'substitutionsPerTeam' => 0,
            'timeoutDuration' => 60,
            'timeoutsPerTeam' => 1,
            'timeoutsPerPeriod' => 1,
            'cards' => ['yellow', 'red'],
            'points' => 1,
            'typeOfScore' => 'g',
            'foulsPenaltyThreshold' => 5,
            'positions' => [
                'Guarda-redes' => 'GR',
                'Fixo' => 'FX',
                'Ala' => 'ALA',
                'Pivô' => 'PV',
                'Universal' => 'UNI',
            ],
        ],
        'basketball' => [
            'periods' => 4,
            'periodDuration' => 10 * 60,
            'substitutionsPerTeam' => 0,
            'timeoutDuration' => 60,
            'timeoutsPerTeam' => 5,
            'points' => [1, 2, 3],
            'shotClock' => 24,
            'typeOfScore' => 'p',
            'foulsPenaltyThreshold' => 5,
            'positions' => [
                'Point Guard' => 'PG',
                'Shooting Guard' => 'SG',
                'Small Forward' => 'SF',
                'Power Forward' => 'PF',
                'Center' => 'C',
                'Sixth Man' => '6M',
                'Defensive Specialist' => 'DS',
            ],
        ],
        'volleyball' => [
            'periods' => 5,
            'substitutionsPerTeam' => 6,
            'timeoutDuration' => 30,
            'timeoutsPerTeam' => 2,
            'timeoutsPerPeriod' => 2,
            'cards' => ['white', 'yellow', 'red', 'yellowRedTogether', 'yellowRedSeparately'],
            'points' => 1,
            'periodEndScore' => 25,
            'pointDifference' => 2,
            'resetPointsEachPeriod' => true,
            'typeOfScore' => 'p',
            'positions' => [
                'Zona 4' => 'Z4',
                'Oposto' => 'OP',
                'Central' => 'C',
                'Distribuidor' => 'D',
                'Libero' => 'L',
            ],
        ]
    ];
    
    public function getConfig($sport) {
        if (isset($this->configs[strtolower($sport)])) {
            return $this->configs[strtolower($sport)];
        }
        throw new Exception("Unknown sport: $sport");
    }

    public function getAllConfigs() {
        return $this->configs;
    }
}