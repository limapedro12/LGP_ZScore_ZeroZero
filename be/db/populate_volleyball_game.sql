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
        INSERT INTO AbstractPlacard (id, firstTeamId, secondTeamId, isFinished, sport, startTime, allowColab)
        VALUES (placard_id_val, team1_id_val, team2_id_val, 0, sport_val, NOW(), 1);

        INSERT INTO VolleyballPlacard (abstractPlacardId, currentSet, availableTimeOutsFirst, availableTimeOutsSecond, isTimeOut)
        VALUES (placard_id_val, 1, 2, 2, 0);
    END IF;

   
    CALL AddPlayerToTeamAndLineup_VolleySpecific(placard_id_val, team1_id_val, 'Tiago Violas', 'Dtribuidor', 'D', 17, sport_val, 1);
    CALL AddPlayerToTeamAndLineup_VolleySpecific(placard_id_val, team1_id_val, 'Francisco Leitão', 'Dtribuidor', 'D', 5, sport_val, 1);
    CALL AddPlayerToTeamAndLineup_VolleySpecific(placard_id_val, team1_id_val, 'Bernardo Silva', 'Líbero', 'L', 2, sport_val, 1);
    CALL AddPlayerToTeamAndLineup_VolleySpecific(placard_id_val, team1_id_val, 'Ivo Casas', 'Líbero', 'L', 7, sport_val, 1);
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
    CALL AddPlayerToTeamAndLineup_VolleySpecific(placard_id_val, team2_id_val, 'Gonçalo Sousa', 'Líbero', 'L', 10, sport_val, 1);
    CALL AddPlayerToTeamAndLineup_VolleySpecific(placard_id_val, team2_id_val, 'Nicolás Perren', 'Líbero', 'L', 20, sport_val, 1);
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

CALL PopulateVolleyballGame_SLB_SCP();

