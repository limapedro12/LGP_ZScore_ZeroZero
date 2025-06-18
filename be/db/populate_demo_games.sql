DELIMITER //

DROP PROCEDURE IF EXISTS AddPlayerToTeamAndLineup_VolleySpecific; //
CREATE PROCEDURE AddPlayerToTeamAndLineup_VolleySpecific(
    IN p_placardId INT,
    IN p_teamId INT,
    IN p_playerName VARCHAR(255),
    IN p_position VARCHAR(255),
    IN p_positionAcronym VARCHAR(255),
    IN p_playerNumber INT,
    IN p_sport VARCHAR(255),
    IN p_isStarting BOOLEAN
)
BEGIN
    DECLARE v_abstractPlayerId INT;

    SELECT id INTO v_abstractPlayerId FROM AbstractPlayer
    WHERE name = p_playerName AND teamId = p_teamId AND sport = p_sport LIMIT 1;

    IF v_abstractPlayerId IS NULL THEN
        INSERT INTO AbstractPlayer (name, position, position_acronym, number, teamId, sport)
        VALUES (p_playerName, p_position, p_positionAcronym, p_playerNumber, p_teamId, p_sport);
        SET v_abstractPlayerId = LAST_INSERT_ID();

        INSERT INTO VolleyballPlayer (id, abstractPlayerId, teamId)
        VALUES (v_abstractPlayerId, v_abstractPlayerId, p_teamId);
    END IF;

    IF v_abstractPlayerId IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM PlacardPlayer WHERE placardId = p_placardId AND playerId = v_abstractPlayerId) THEN
            INSERT INTO PlacardPlayer (placardId, playerId, isStarting)
            VALUES (p_placardId, v_abstractPlayerId, p_isStarting);
        END IF;
    END IF;
END //

DROP PROCEDURE IF EXISTS PopulateVolleyballGame_SLB_SCP; //
CREATE PROCEDURE PopulateVolleyballGame_SLB_SCP()
BEGIN
    DECLARE team1_id_val INT DEFAULT 210943;
    DECLARE team1_name_val VARCHAR(255) DEFAULT 'SL Benfica';
    DECLARE team1_logo_val VARCHAR(255) DEFAULT 'https://www.zerozero.pt/img/logos/equipas/4_imgbank_1683238034.png';
    DECLARE team1_color_val VARCHAR(255) DEFAULT '#FF0000';
    DECLARE team1_acronym_val VARCHAR(255) DEFAULT 'SLB';

    DECLARE team2_id_val INT DEFAULT 210970;
    DECLARE team2_name_val VARCHAR(255) DEFAULT 'Sporting CP';
    DECLARE team2_logo_val VARCHAR(255) DEFAULT 'https://www.zerozero.pt/img/logos/equipas/16_imgbank_1741687081.png';
    DECLARE team2_color_val VARCHAR(255) DEFAULT '#008000';
    DECLARE team2_acronym_val VARCHAR(255) DEFAULT 'SCP';

    DECLARE sport_val VARCHAR(255) DEFAULT 'volleyball';
    DECLARE placard_id_val INT;
    DECLARE max_existing_placard_id INT;

    SELECT MAX(id) INTO max_existing_placard_id FROM AbstractPlacard;
    IF max_existing_placard_id IS NULL THEN
        SET placard_id_val = 1;
    ELSE
        SET placard_id_val = max_existing_placard_id + 1;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM AbstractTeam WHERE id = team1_id_val) THEN
        INSERT INTO AbstractTeam (id, logoURL, color, acronym, name, sport)
        VALUES (team1_id_val, team1_logo_val, team1_color_val, team1_acronym_val, team1_name_val, sport_val);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM VolleyballTeam WHERE id = team1_id_val) THEN
        INSERT INTO VolleyballTeam (id, abstractTeamId) VALUES (team1_id_val, team1_id_val);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM AbstractTeam WHERE id = team2_id_val) THEN
        INSERT INTO AbstractTeam (id, logoURL, color, acronym, name, sport)
        VALUES (team2_id_val, team2_logo_val, team2_color_val, team2_acronym_val, team2_name_val, sport_val);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM VolleyballTeam WHERE id = team2_id_val) THEN
        INSERT INTO VolleyballTeam (id, abstractTeamId) VALUES (team2_id_val, team2_id_val);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM AbstractPlacard WHERE id = placard_id_val) THEN
        INSERT INTO AbstractPlacard (id, firstTeamId, secondTeamId, isFinished, sport, startTime, allowColab, stadium, competition)
        VALUES (placard_id_val, team1_id_val, team2_id_val, 0, sport_val, '2025-06-3 13:00:00', 1, 'Pavilhão Nº 2 da Luz', 'Liga Una Seguros Play-Off 2024/25 - Final');

        INSERT INTO VolleyballPlacard (abstractPlacardId, currentSet, availableTimeOutsFirst, availableTimeOutsSecond, isTimeOut)
        VALUES (placard_id_val, 1, 2, 2, 0);
    END IF;

   
    CALL AddPlayerToTeamAndLineup_VolleySpecific(placard_id_val, team1_id_val, 'Tiago Violas', 'Distribuidor', 'D', 17, sport_val, 1);
    CALL AddPlayerToTeamAndLineup_VolleySpecific(placard_id_val, team1_id_val, 'Francisco Leitão', 'Distribuidor', 'D', 5, sport_val, 1);
    CALL AddPlayerToTeamAndLineup_VolleySpecific(placard_id_val, team1_id_val, 'Bernardo Silva', 'Libero', 'L', 2, sport_val, 1);
    CALL AddPlayerToTeamAndLineup_VolleySpecific(placard_id_val, team1_id_val, 'Ivo Casas', 'Libero', 'L', 7, sport_val, 1);
    CALL AddPlayerToTeamAndLineup_VolleySpecific(placard_id_val, team1_id_val, 'Pearson Eshenko', 'Central', 'C', 11, sport_val, 1);
    CALL AddPlayerToTeamAndLineup_VolleySpecific(placard_id_val, team1_id_val, 'Matheus Alejandro', 'Central', 'C', 12, sport_val, 1);
    CALL AddPlayerToTeamAndLineup_VolleySpecific(placard_id_val, team1_id_val, 'Lucas França', 'Central', 'C', 14, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_VolleySpecific(placard_id_val, team1_id_val, 'Felipe Banderó', 'Oposto', 'OP', 13, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_VolleySpecific(placard_id_val, team1_id_val, 'Michal Godlewski', 'Oposto', 'OP', 21, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_VolleySpecific(placard_id_val, team1_id_val, 'Pablo Natan', 'Zona 4', 'Z4', 10, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_VolleySpecific(placard_id_val, team1_id_val, 'Tomás Natário', 'Zona 4', 'Z4', 16, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_VolleySpecific(placard_id_val, team1_id_val, 'Japa', 'Zona 4', 'Z4', 18, sport_val, 0);

    CALL AddPlayerToTeamAndLineup_VolleySpecific(placard_id_val, team2_id_val, 'Armando Velásquez', 'Distribuidor', 'D', 17, sport_val, 1);
    CALL AddPlayerToTeamAndLineup_VolleySpecific(placard_id_val, team2_id_val, 'Yurii Synytsia', 'Distribuidor', 'D', 8, sport_val, 1);
    CALL AddPlayerToTeamAndLineup_VolleySpecific(placard_id_val, team2_id_val, 'Gonçalo Sousa', 'Libero', 'L', 10, sport_val, 1);
    CALL AddPlayerToTeamAndLineup_VolleySpecific(placard_id_val, team2_id_val, 'Nicolás Perren', 'Libero', 'L', 20, sport_val, 1);
    CALL AddPlayerToTeamAndLineup_VolleySpecific(placard_id_val, team2_id_val, 'Tiago Barth', 'Central', 'C', 13, sport_val, 1);
    CALL AddPlayerToTeamAndLineup_VolleySpecific(placard_id_val, team2_id_val, 'Jonas Aguenier', 'Central', 'C', 14, sport_val, 1);
    CALL AddPlayerToTeamAndLineup_VolleySpecific(placard_id_val, team2_id_val, 'Alejandro Vigil', 'Central', 'C', 22, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_VolleySpecific(placard_id_val, team2_id_val, 'Leonel Lanção', 'Oposto', 'OP', 15, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_VolleySpecific(placard_id_val, team2_id_val, 'Breno Silva', 'Oposto', 'OP', 16, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_VolleySpecific(placard_id_val, team2_id_val, 'Pedro Abecasis', 'Zona 4', 'Z4', 11, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_VolleySpecific(placard_id_val, team2_id_val, 'Tiago Pereira', 'Zona 4', 'Z4', 2, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_VolleySpecific(placard_id_val, team2_id_val, 'Jan Galabov', 'Zona 4', 'Z4', 3, sport_val, 0);

END //

DELIMITER ;

DELIMITER //

DROP PROCEDURE IF EXISTS AddPlayerToTeamAndLineup_BasketballSpecific; //
CREATE PROCEDURE AddPlayerToTeamAndLineup_BasketballSpecific(
    IN p_placardId INT,
    IN p_teamId INT,
    IN p_playerName VARCHAR(255),
    IN p_position VARCHAR(255),
    IN p_positionAcronym VARCHAR(255),
    IN p_playerNumber INT,
    IN p_sport VARCHAR(255),
    IN p_isStarting BOOLEAN
)
BEGIN
    DECLARE v_abstractPlayerId INT;

    SELECT id INTO v_abstractPlayerId FROM AbstractPlayer
    WHERE name = p_playerName AND teamId = p_teamId AND sport = p_sport LIMIT 1;

    IF v_abstractPlayerId IS NULL THEN
        INSERT INTO AbstractPlayer (name, position, position_acronym, number, teamId, sport)
        VALUES (p_playerName, p_position, p_positionAcronym, p_playerNumber, p_teamId, p_sport);
        SET v_abstractPlayerId = LAST_INSERT_ID();

        INSERT INTO BasketballPlayer (id, abstractPlayerId, teamId)
        VALUES (v_abstractPlayerId, v_abstractPlayerId, p_teamId);
    END IF;

    IF v_abstractPlayerId IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM PlacardPlayer WHERE placardId = p_placardId AND playerId = v_abstractPlayerId) THEN
            INSERT INTO PlacardPlayer (placardId, playerId, isStarting)
            VALUES (p_placardId, v_abstractPlayerId, p_isStarting);
        END IF;
    END IF;
END //

DROP PROCEDURE IF EXISTS PopulateBasketballGame_SCP_SCC; //
CREATE PROCEDURE PopulateBasketballGame_SCP_SCC()
BEGIN
    DECLARE team1_id_val INT DEFAULT 218603; 
    DECLARE team1_name_val VARCHAR(255) DEFAULT 'Sporting CP';
    DECLARE team1_logo_val VARCHAR(255) DEFAULT 'https://www.zerozero.pt/img/logos/equipas/16_imgbank_1741687081.png';
    DECLARE team1_color_val VARCHAR(255) DEFAULT '#008000';
    DECLARE team1_acronym_val VARCHAR(255) DEFAULT 'SCP';

    DECLARE team2_id_val INT DEFAULT 219170;
    DECLARE team2_name_val VARCHAR(255) DEFAULT 'SC Coimbrões';
    DECLARE team2_logo_val VARCHAR(255) DEFAULT 'https://www.zerozero.pt/img/logos/equipas/6406_imgbank_1712159000.png';
    DECLARE team2_color_val VARCHAR(255) DEFAULT '#FFFFFF';
    DECLARE team2_acronym_val VARCHAR(255) DEFAULT 'SCC';

    DECLARE sport_val VARCHAR(255) DEFAULT 'basketball';
    DECLARE placard_id_val INT;
    DECLARE max_existing_placard_id INT;

    DECLARE v_stadium VARCHAR(255) DEFAULT 'Pavilhão João Rocha';
    DECLARE v_competition VARCHAR(255) DEFAULT 'I Divisão Feminina Basquetebol Play-Off 24/25 - Final';
    DECLARE v_startTime DATETIME DEFAULT '2025-06-3 13:00:00';

    SELECT MAX(id) INTO max_existing_placard_id FROM AbstractPlacard;
    IF max_existing_placard_id IS NULL THEN
        SET placard_id_val = 1;
    ELSE
        SET placard_id_val = max_existing_placard_id + 1;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM AbstractTeam WHERE id = team1_id_val) THEN
        INSERT INTO AbstractTeam (id, logoURL, color, acronym, name, sport)
        VALUES (team1_id_val, team1_logo_val, team1_color_val, team1_acronym_val, team1_name_val, sport_val);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM BasketballTeam WHERE id = team1_id_val) THEN
        INSERT INTO BasketballTeam (id, abstractTeamId) VALUES (team1_id_val, team1_id_val);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM AbstractTeam WHERE id = team2_id_val) THEN
        INSERT INTO AbstractTeam (id, logoURL, color, acronym, name, sport)
        VALUES (team2_id_val, team2_logo_val, team2_color_val, team2_acronym_val, team2_name_val, sport_val);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM BasketballTeam WHERE id = team2_id_val) THEN
        INSERT INTO BasketballTeam (id, abstractTeamId) VALUES (team2_id_val, team2_id_val);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM AbstractPlacard WHERE id = placard_id_val) THEN
        INSERT INTO AbstractPlacard (id, firstTeamId, secondTeamId, isFinished, sport, startTime, allowColab, stadium, competition)
        VALUES (placard_id_val, team1_id_val, team2_id_val, 0, sport_val, v_startTime, 1, v_stadium, v_competition);

        INSERT INTO BasketballPlacard (abstractPlacardId, currentQuarter, availableTimeOutsFirst, availableTimeOutsSecond, isTimeOut, isTimeStopped)
        VALUES (placard_id_val, 1, 5, 5, 0, 0); 
    END IF;

    CALL AddPlayerToTeamAndLineup_BasketballSpecific(placard_id_val, team1_id_val, 'Rita Medeiros', 'Point Guard', 'PG', 1, sport_val, 1);
    CALL AddPlayerToTeamAndLineup_BasketballSpecific(placard_id_val, team1_id_val, 'Mafalda Monteiro', 'Point Guard', 'PG', 42, sport_val, 1);
    CALL AddPlayerToTeamAndLineup_BasketballSpecific(placard_id_val, team1_id_val, 'Inês Santos', 'Point Guard', 'PG', 83, sport_val, 1);
    CALL AddPlayerToTeamAndLineup_BasketballSpecific(placard_id_val, team1_id_val, 'Diana Baptista', 'Point Guard', 'PG', 24, sport_val, 1);
    CALL AddPlayerToTeamAndLineup_BasketballSpecific(placard_id_val, team1_id_val, 'Emilie Silva', 'Point Guard', 'PG', 80, sport_val, 1);
    CALL AddPlayerToTeamAndLineup_BasketballSpecific(placard_id_val, team1_id_val, 'Shanyce Makuei', 'Point Guard', 'PG', 9, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_BasketballSpecific(placard_id_val, team1_id_val, 'Isabel Azevedo', 'Shooting Guard', 'SG', 0, sport_val, 0); -- Assuming 0 for '-'
    CALL AddPlayerToTeamAndLineup_BasketballSpecific(placard_id_val, team1_id_val, 'Ana Cristóvão', 'Shooting Guard', 'SG', 14, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_BasketballSpecific(placard_id_val, team1_id_val, 'Ana Oliveira', 'Shooting Guard', 'SG', 17, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_BasketballSpecific(placard_id_val, team1_id_val, 'Lauren Golding', 'Shooting Guard', 'SG', 21, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_BasketballSpecific(placard_id_val, team1_id_val, 'Maria Marinho', 'Shooting Guard', 'SG', 23, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_BasketballSpecific(placard_id_val, team1_id_val, 'Cátia Lopes', 'Shooting Guard', 'SG', 25, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_BasketballSpecific(placard_id_val, team1_id_val, 'Mafalda Pereira', 'Shooting Guard', 'SG', 7, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_BasketballSpecific(placard_id_val, team1_id_val, 'Beatriz Lopes', 'Shooting Guard', 'SG', 8, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_BasketballSpecific(placard_id_val, team1_id_val, 'Maria Rodrigues', 'Shooting Guard', 'SG', 77, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_BasketballSpecific(placard_id_val, team1_id_val, 'Inês Baptista', 'Center', 'C', 15, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_BasketballSpecific(placard_id_val, team1_id_val, 'Catarina Lopes', 'Center', 'C', 5, sport_val, 0);

    CALL AddPlayerToTeamAndLineup_BasketballSpecific(placard_id_val, team2_id_val, 'Carolina Duarte', 'Point Guard', 'PG', 10, sport_val, 1);
    CALL AddPlayerToTeamAndLineup_BasketballSpecific(placard_id_val, team2_id_val, 'Mariana Pires', 'Point Guard', 'PG', 12, sport_val, 1);
    CALL AddPlayerToTeamAndLineup_BasketballSpecific(placard_id_val, team2_id_val, 'Madalena Costa', 'Point Guard', 'PG', 13, sport_val, 1);
    CALL AddPlayerToTeamAndLineup_BasketballSpecific(placard_id_val, team2_id_val, 'Luana Serranho', 'Point Guard', 'PG', 15, sport_val, 1);
    CALL AddPlayerToTeamAndLineup_BasketballSpecific(placard_id_val, team2_id_val, 'Maria Oliveira', 'Point Guard', 'PG', 26, sport_val, 1);
    CALL AddPlayerToTeamAndLineup_BasketballSpecific(placard_id_val, team2_id_val, 'Ana Sofia Rua', 'Point Guard', 'PG', 5, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_BasketballSpecific(placard_id_val, team2_id_val, 'Madalena Amaro', 'Point Guard', 'PG', 4, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_BasketballSpecific(placard_id_val, team2_id_val, 'Cláudia Almeida', 'Shooting Guard', 'SG', 14, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_BasketballSpecific(placard_id_val, team2_id_val, 'Rita Chainho', 'Shooting Guard', 'SG', 16, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_BasketballSpecific(placard_id_val, team2_id_val, 'Hannah Pratt', 'Shooting Guard', 'SG', 22, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_BasketballSpecific(placard_id_val, team2_id_val, 'Filipa Cruz', 'Shooting Guard', 'SG', 25, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_BasketballSpecific(placard_id_val, team2_id_val, 'Sienna Durr', 'Shooting Guard', 'SG', 30, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_BasketballSpecific(placard_id_val, team2_id_val, 'Mariana Barros', 'Shooting Guard', 'SG', 6, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_BasketballSpecific(placard_id_val, team2_id_val, 'Caty Martins', 'Shooting Guard', 'SG', 9, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_BasketballSpecific(placard_id_val, team2_id_val, 'Emília Ferreira', 'Center', 'C', 20, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_BasketballSpecific(placard_id_val, team2_id_val, 'Maria Cruz', 'Center', 'C', 48, sport_val, 0);

END //

DELIMITER ;

DELIMITER //

DROP PROCEDURE IF EXISTS AddPlayerToTeamAndLineup_FutsalSpecific; //
CREATE PROCEDURE AddPlayerToTeamAndLineup_FutsalSpecific(
    IN p_placardId INT,
    IN p_teamId INT,
    IN p_playerName VARCHAR(255),
    IN p_position VARCHAR(255),
    IN p_positionAcronym VARCHAR(255),
    IN p_playerNumber INT,
    IN p_sport VARCHAR(255),
    IN p_isStarting BOOLEAN
)
BEGIN
    DECLARE v_abstractPlayerId INT;

    SELECT id INTO v_abstractPlayerId FROM AbstractPlayer
    WHERE name = p_playerName AND teamId = p_teamId AND sport = p_sport LIMIT 1;

    IF v_abstractPlayerId IS NULL THEN
        INSERT INTO AbstractPlayer (name, position, position_acronym, number, teamId, sport)
        VALUES (p_playerName, p_position, p_positionAcronym, p_playerNumber, p_teamId, p_sport);
        SET v_abstractPlayerId = LAST_INSERT_ID();

        INSERT INTO FutsalPlayer (id, abstractPlayerId, teamId)
        VALUES (v_abstractPlayerId, v_abstractPlayerId, p_teamId);
    END IF;

    IF v_abstractPlayerId IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM PlacardPlayer WHERE placardId = p_placardId AND playerId = v_abstractPlayerId) THEN
            INSERT INTO PlacardPlayer (placardId, playerId, isStarting)
            VALUES (p_placardId, v_abstractPlayerId, p_isStarting);
        END IF;
    END IF;
END //

DROP PROCEDURE IF EXISTS PopulateFutsalGame_SCB_SLB; //
CREATE PROCEDURE PopulateFutsalGame_SCB_SLB()
BEGIN
    DECLARE team1_id_val INT DEFAULT 6555;
    DECLARE team1_name_val VARCHAR(255) DEFAULT 'SC Braga';
    DECLARE team1_logo_val VARCHAR(255) DEFAULT 'https://www.zerozero.pt/img/logos/equipas/15_imgbank_1744105134.png';
    DECLARE team1_color_val VARCHAR(255) DEFAULT '#FFFFFF';
    DECLARE team1_acronym_val VARCHAR(255) DEFAULT 'SCB';

    DECLARE team2_id_val INT DEFAULT 4368; 
    DECLARE team2_name_val VARCHAR(255) DEFAULT 'SL Benfica';
    DECLARE team2_logo_val VARCHAR(255) DEFAULT 'https://www.zerozero.pt/img/logos/equipas/4_imgbank_1683238034.png';
    DECLARE team2_color_val VARCHAR(255) DEFAULT '#FF0000';
    DECLARE team2_acronym_val VARCHAR(255) DEFAULT 'SLB';

    DECLARE sport_val VARCHAR(255) DEFAULT 'futsal';
    DECLARE placard_id_val INT;
    DECLARE max_existing_placard_id INT;

    DECLARE v_stadium VARCHAR(255) DEFAULT 'AMCO Arena';
    DECLARE v_competition VARCHAR(255) DEFAULT 'Liga Placard Futsal 2024/25 - Meias-Finais';
    DECLARE v_startTime DATETIME DEFAULT '2025-06-3 13:00:00';

    SELECT MAX(id) INTO max_existing_placard_id FROM AbstractPlacard;
    IF max_existing_placard_id IS NULL THEN
        SET placard_id_val = 1;
    ELSE
        SET placard_id_val = max_existing_placard_id + 1;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM AbstractTeam WHERE id = team1_id_val) THEN
        INSERT INTO AbstractTeam (id, logoURL, color, acronym, name, sport)
        VALUES (team1_id_val, team1_logo_val, team1_color_val, team1_acronym_val, team1_name_val, sport_val);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM FutsalTeam WHERE id = team1_id_val) THEN
        INSERT INTO FutsalTeam (id, abstractTeamId) VALUES (team1_id_val, team1_id_val);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM AbstractTeam WHERE id = team2_id_val) THEN
        INSERT INTO AbstractTeam (id, logoURL, color, acronym, name, sport)
        VALUES (team2_id_val, team2_logo_val, team2_color_val, team2_acronym_val, team2_name_val, sport_val);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM FutsalTeam WHERE id = team2_id_val) THEN
        INSERT INTO FutsalTeam (id, abstractTeamId) VALUES (team2_id_val, team2_id_val);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM AbstractPlacard WHERE id = placard_id_val) THEN
        INSERT INTO AbstractPlacard (id, firstTeamId, secondTeamId, isFinished, sport, startTime, allowColab, stadium, competition)
        VALUES (placard_id_val, team1_id_val, team2_id_val, 0, sport_val, v_startTime, 1, v_stadium, v_competition);

        INSERT INTO FutsalPlacard (abstractPlacardId, currentGoalsFirstTeam, currentGoalsSecondTeam, numberFoulsFirst, numberFoulsSecond, availableTimeOutsFirst, availableTimeOutsSecond, isTimeOut, isTimeStopped)
        VALUES (placard_id_val, 0, 0, 0, 0, 1, 1, 0, 0);
    END IF;

    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team1_id_val, 'João Cunha', 'Guarda-redes', 'GR', 1, sport_val, 1);
    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team1_id_val, 'Buzuzu', 'Fixo', 'FX', 22, sport_val, 1);
    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team1_id_val, 'Fábio Cecílio', 'Universal', 'UNI', 5, sport_val, 1);
    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team1_id_val, 'Tiago Correia', 'Ala', 'ALA', 10, sport_val, 1);
    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team1_id_val, 'Tiago Sousa', 'Pivô', 'PV', 28, sport_val, 1);

    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team1_id_val, 'Dudu', 'Guarda-redes', 'GR', 2, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team1_id_val, 'Leandro Costa', 'Guarda-redes', 'GR', 21, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team1_id_val, 'Tiago Sousa', 'Fixo', 'FX', 3, sport_val, 0); -- Note: Same name, different player/role
    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team1_id_val, 'Ricardo Lopes', 'Fixo', 'FX', 9, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team1_id_val, 'Ygor Mota', 'Fixo', 'FX', 96, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team1_id_val, 'Bebé', 'Ala', 'ALA', 13, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team1_id_val, 'Tiago Brito', 'Ala', 'ALA', 6, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team1_id_val, 'Gabriel Mazetto', 'Ala', 'ALA', 7, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team1_id_val, 'Gabriel Penézio', 'Ala', 'ALA', 77, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team1_id_val, 'Rafael Henmi', 'Ala', 'ALA', 8, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team1_id_val, 'Lucas Gomes', 'Ala', 'ALA', 15, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team1_id_val, 'Hugo Neves', 'Pivô', 'PV', 17, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team1_id_val, 'Ítalo Rossetti', 'Pivô', 'PV', 4, sport_val, 0);

    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team2_id_val, 'André Correia', 'Guarda-redes', 'GR', 1, sport_val, 1);
    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team2_id_val, 'Afonso Jesus', 'Fixo', 'FX', 4, sport_val, 1);
    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team2_id_val, 'Arthur', 'Ala', 'ALA', 10, sport_val, 1);
    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team2_id_val, 'Ivan Chishkala', 'Ala', 'ALA', 11, sport_val, 1);
    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team2_id_val, 'Higor de Souza', 'Pivô', 'PV', 9, sport_val, 1);

    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team2_id_val, 'Daniel Osuji', 'Guarda-redes', 'GR', 12, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team2_id_val, 'Léo Gugiel', 'Guarda-redes', 'GR', 22, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team2_id_val, 'Tiago Reis', 'Fixo', 'FX', 31, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team2_id_val, 'Raúl Moreira', 'Fixo', 'FX', 6, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team2_id_val, 'André Coelho', 'Fixo', 'FX', 8, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team2_id_val, 'Edmilson Kutchy', 'Ala', 'ALA', 14, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team2_id_val, 'Carlos Monteiro', 'Ala', 'ALA', 17, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team2_id_val, 'Diego Nunes', 'Ala', 'ALA', 18, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team2_id_val, 'Silvestre Ferreira', 'Ala', 'ALA', 2, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team2_id_val, 'Simão Cordeiro', 'Ala', 'ALA', 5, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team2_id_val, 'Lúcio Rocha', 'Ala', 'ALA', 7, sport_val, 0);
    CALL AddPlayerToTeamAndLineup_FutsalSpecific(placard_id_val, team2_id_val, 'Jacaré', 'Pivô', 'PV', 99, sport_val, 0);

END //

DELIMITER ;

CALL PopulateVolleyballGame_SLB_SCP();
CALL PopulateBasketballGame_SCP_SCC();
CALL PopulateFutsalGame_SCB_SLB();

