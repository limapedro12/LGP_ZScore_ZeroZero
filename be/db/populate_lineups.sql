DELIMITER //

DROP PROCEDURE IF EXISTS PopulateGameLineups;
//

CREATE PROCEDURE PopulateGameLineups()
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_placardId INT;
    DECLARE v_firstTeamId INT;
    DECLARE v_secondTeamId INT;
    DECLARE v_sport VARCHAR(255);

    -- Variables for player lists
    DECLARE v_player_names JSON;
    DECLARE v_player_positions JSON;
    DECLARE v_player_position_acronyms JSON;
    DECLARE v_roster_size INT;
    DECLARE v_num_starters INT;

    -- Cursor to iterate through all placards
    DECLARE placard_cursor CURSOR FOR
        SELECT id, firstTeamId, secondTeamId, sport
        FROM AbstractPlacard;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    OPEN placard_cursor;

    placard_loop: LOOP
        FETCH placard_cursor INTO v_placardId, v_firstTeamId, v_secondTeamId, v_sport;
        IF v_done THEN
            LEAVE placard_loop;
        END IF;

        -- Check if players for this placard already exist in PlacardPlayer to avoid duplication for the game
        IF NOT EXISTS (SELECT 1 FROM PlacardPlayer WHERE placardId = v_placardId) THEN

            IF v_sport = 'volleyball' THEN
                SET v_roster_size = 14;
                SET v_num_starters = 6;
                SET v_player_names = JSON_ARRAY(
                    'Bruno Rezende', 'Yoandy Leal', 'Ricardo Lucarelli', 'Wallace de Souza', 'Lucas Saatkamp', 'Mauricio Borges Silva',
                    'Thales Hoss', 'Maique Nascimento', 'Alan Souza', 'Douglas Souza', 'Isac Santos', 'Fernando Kreling',
                    'Paola Egonu', 'Tijana Bošković'
                );
                SET v_player_positions = JSON_ARRAY(
                    'Setter', 'Outside Hitter', 'Outside Hitter', 'Opposite Hitter', 'Middle Blocker', 'Middle Blocker',
                    'Libero', 'Libero', 'Opposite Hitter', 'Outside Hitter', 'Middle Blocker', 'Setter',
                    'Outside Hitter', 'Opposite Hitter'
                );
                SET v_player_position_acronyms = JSON_ARRAY(
                    'S', 'OH', 'OH', 'OP', 'MB', 'MB',
                    'L', 'L', 'OP', 'OH', 'MB', 'S',
                    'OH', 'OP'
                );

            ELSEIF v_sport = 'futsal' THEN
                SET v_roster_size = 14;
                SET v_num_starters = 5;
                SET v_player_names = JSON_ARRAY(
                    'Guitta', 'Rodrigo Hardy', 'Ferrao', 'Pito', 'Dyego Zuffo',
                    'Leandro Lino', 'Marcenio Ribeiro', 'Gadeia', 'Dieguinho', 'Rocha',
                    'Arthur Guilherme', 'Willian Dorn', 'Vinicius Rocha', 'Leozinho'
                );
                SET v_player_positions = JSON_ARRAY(
                    'Goalkeeper', 'Fixo', 'Pivot', 'Ala', 'Ala',
                    'Ala', 'Ala', 'Fixo', 'Pivot', 'Universal',
                    'Universal', 'Goalkeeper', 'Universal', 'Universal'
                );
                SET v_player_position_acronyms = JSON_ARRAY(
                    'GK', 'F', 'P', 'A', 'A',
                    'A', 'A', 'F', 'P', 'U',
                    'U', 'GK', 'U', 'U'
                );

            ELSEIF v_sport = 'basketball' THEN
                SET v_roster_size = 12;
                SET v_num_starters = 5;
                SET v_player_names = JSON_ARRAY(
                    'Stephen Curry', 'Klay Thompson', 'LeBron James', 'Kevin Durant', 'Nikola Jokic',
                    'Luka Doncic', 'Devin Booker', 'Jayson Tatum', 'Giannis Antetokounmpo', 'Joel Embiid',
                    'Damian Lillard', 'Zion Williamson'
                );
                SET v_player_positions = JSON_ARRAY(
                    'Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center',
                    'Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center',
                    'Sixth Man', 'Defensive Specialist'
                );
                SET v_player_position_acronyms = JSON_ARRAY(
                    'PG', 'SG', 'SF', 'PF', 'C',
                    'PG', 'SG', 'SF', 'PF', 'C',
                    '6M', 'DS'
                );
            ELSE
                -- Unknown sport, skip or handle as error
                ITERATE placard_loop;
            END IF;

            -- Process First Team
            -- Check if AbstractPlayers exist for v_firstTeamId and v_sport
            IF NOT EXISTS (SELECT 1 FROM AbstractPlayer WHERE teamId = v_firstTeamId AND sport = v_sport) THEN
                -- Insert players into AbstractPlayer for the first team
                FOR i IN 0..(v_roster_size - 1) DO
                    INSERT INTO AbstractPlayer (name, position, position_acronym, number, teamId, sport)
                    VALUES (
                        CONCAT(JSON_UNQUOTE(JSON_EXTRACT(v_player_names, CONCAT('$[', i, ']'))), ' (T', v_firstTeamId, ')'), 
                        JSON_UNQUOTE(JSON_EXTRACT(v_player_positions, CONCAT('$[', i, ']'))), 
                        JSON_UNQUOTE(JSON_EXTRACT(v_player_position_acronyms, CONCAT('$[', i, ']'))),
                        i + 1, 
                        v_firstTeamId, 
                        v_sport
                    );
                END FOR;
            END IF;

            -- Link players from AbstractPlayer to PlacardPlayer for the First Team
            BEGIN
                DECLARE v_done_team_players_first INT DEFAULT FALSE;
                DECLARE v_team_playerId_first INT;
                DECLARE v_player_idx_first INT DEFAULT 0;
                DECLARE v_isStarting_first BOOLEAN;
                DECLARE team_player_cursor_first CURSOR FOR
                    SELECT id FROM AbstractPlayer
                    WHERE teamId = v_firstTeamId AND sport = v_sport
                    ORDER BY number -- Assumes jersey numbers are 1 to roster_size
                    LIMIT v_roster_size;
                DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done_team_players_first = TRUE;

                OPEN team_player_cursor_first;
                first_team_player_loop: LOOP
                    FETCH team_player_cursor_first INTO v_team_playerId_first;
                    IF v_done_team_players_first THEN
                        LEAVE first_team_player_loop;
                    END IF;
                    SET v_isStarting_first = (v_player_idx_first < v_num_starters);
                    INSERT INTO PlacardPlayer (placardId, playerId, isStarting)
                    VALUES (v_placardId, v_team_playerId_first, v_isStarting_first);
                    SET v_player_idx_first = v_player_idx_first + 1;
                END LOOP first_team_player_loop;
                CLOSE team_player_cursor_first;
            END; -- End block for first team player linking

            -- Process Second Team
            -- Check if AbstractPlayers exist for v_secondTeamId and v_sport
            IF NOT EXISTS (SELECT 1 FROM AbstractPlayer WHERE teamId = v_secondTeamId AND sport = v_sport) THEN
                -- Insert players into AbstractPlayer for the second team
                FOR i IN 0..(v_roster_size - 1) DO
                    INSERT INTO AbstractPlayer (name, position, position_acronym, number, teamId, sport)
                    VALUES (
                        CONCAT(JSON_UNQUOTE(JSON_EXTRACT(v_player_names, CONCAT('$[', i, ']'))), ' (T', v_secondTeamId, ')'), 
                        JSON_UNQUOTE(JSON_EXTRACT(v_player_positions, CONCAT('$[', i, ']'))),
                        JSON_UNQUOTE(JSON_EXTRACT(v_player_position_acronyms, CONCAT('$[', i, ']'))),
                        i + 1, 
                        v_secondTeamId, 
                        v_sport
                    );
                END FOR;
            END IF;

            -- Link players from AbstractPlayer to PlacardPlayer for the Second Team
            BEGIN
                DECLARE v_done_team_players_second INT DEFAULT FALSE;
                DECLARE v_team_playerId_second INT;
                DECLARE v_player_idx_second INT DEFAULT 0;
                DECLARE v_isStarting_second BOOLEAN;
                DECLARE team_player_cursor_second CURSOR FOR
                    SELECT id FROM AbstractPlayer
                    WHERE teamId = v_secondTeamId AND sport = v_sport
                    ORDER BY number
                    LIMIT v_roster_size;
                DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done_team_players_second = TRUE;

                OPEN team_player_cursor_second;
                second_team_player_loop: LOOP
                    FETCH team_player_cursor_second INTO v_team_playerId_second;
                    IF v_done_team_players_second THEN
                        LEAVE second_team_player_loop;
                    END IF;
                    SET v_isStarting_second = (v_player_idx_second < v_num_starters);
                    INSERT INTO PlacardPlayer (placardId, playerId, isStarting)
                    VALUES (v_placardId, v_team_playerId_second, v_isStarting_second);
                    SET v_player_idx_second = v_player_idx_second + 1;
                END LOOP second_team_player_loop;
                CLOSE team_player_cursor_second;
            END; -- End block for second team player linking

        END IF; -- End check for existing PlacardPlayer entries for this placardId
    END LOOP placard_loop;

    CLOSE placard_cursor;
END //

DELIMITER ;