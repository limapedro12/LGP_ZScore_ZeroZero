CREATE TABLE IF NOT EXISTS AbstractTeam (
    id INT PRIMARY KEY,
    logoURL VARCHAR(255) NOT NULL,
    color VARCHAR(255) NOT NULL,
    acronym VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    sport VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS VolleyballTeam (
    id INT PRIMARY KEY,
    abstractTeamId INT NOT NULL,
    FOREIGN KEY (abstractTeamId) REFERENCES AbstractTeam(id)
);

CREATE TABLE IF NOT EXISTS FutsalTeam (
    id INT PRIMARY KEY,
    abstractTeamId INT NOT NULL,
    FOREIGN KEY (abstractTeamId) REFERENCES AbstractTeam(id)
);

CREATE TABLE IF NOT EXISTS BasketballTeam (
    id INT PRIMARY KEY,
    abstractTeamId INT NOT NULL,
    FOREIGN KEY (abstractTeamId) REFERENCES AbstractTeam(id)
);

CREATE TABLE IF NOT EXISTS AbstractPlacard (
    id INT PRIMARY KEY,
    firstTeamId INT NOT NULL,
    secondTeamId INT NOT NULL,
    isFinished BOOLEAN NOT NULL,
    sport VARCHAR(255) NOT NULL,
    startTime DATETIME NOT NULL,
    FOREIGN KEY (firstTeamId) REFERENCES AbstractTeam(id),
    FOREIGN KEY (secondTeamId) REFERENCES AbstractTeam(id)
);

CREATE TABLE IF NOT EXISTS VolleyballPlacard (
    abstractPlacardId INT PRIMARY KEY,
    currentSet INT NULL,
    availableTimeOutsFirst INT NOT NULL,
    availableTimeOutsSecond INT NOT NULL,
    isTimeOut BOOLEAN NOT NULL,
    FOREIGN KEY (abstractPlacardId) REFERENCES AbstractPlacard(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS VolleyballSetResult (
    id INT PRIMARY KEY,
    placardId INT NOT NULL,
    setNumber INT NOT NULL,
    pointsFirstTeam INT NOT NULL,
    pointsSecondTeam INT NOT NULL,
    FOREIGN KEY (placardId) REFERENCES VolleyballPlacard(abstractPlacardId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS FutsalPlacard (
    abstractPlacardId INT PRIMARY KEY,
    currentGoalsFirstTeam INT NOT NULL,
    currentGoalsSecondTeam INT NOT NULL,
    numberFoulsFirst INT NOT NULL,
    numberFoulsSecond INT NOT NULL,
    availableTimeOutsFirst INT NOT NULL,
    availableTimeOutsSecond INT NOT NULL,
    isTimeOut BOOLEAN NOT NULL,
    isTimeStopped BOOLEAN NOT NULL,
    FOREIGN KEY (abstractPlacardId) REFERENCES AbstractPlacard(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS BasketballPlacard (
    abstractPlacardId INT PRIMARY KEY,
    currentQuarter INT NULL,
    availableTimeOutsFirst INT NOT NULL,
    availableTimeOutsSecond INT NOT NULL,
    isTimeOut BOOLEAN NOT NULL,
    isTimeStopped BOOLEAN NOT NULL,
    FOREIGN KEY (abstractPlacardId) REFERENCES AbstractPlacard(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS AbstractPlayer (
    id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    number INT NOT NULL,
    teamId INT NOT NULL,
    sport VARCHAR(255) NOT NULL,
    FOREIGN KEY (teamId) REFERENCES AbstractTeam(id)
);

CREATE TABLE IF NOT EXISTS VolleyballPlayer (
    id INT PRIMARY KEY,
    abstractPlayerId INT NOT NULL,
    teamId INT NOT NULL,
    FOREIGN KEY (abstractPlayerId) REFERENCES AbstractPlayer(id),
    FOREIGN KEY (teamId) REFERENCES VolleyballTeam(id)
);

CREATE TABLE IF NOT EXISTS FutsalPlayer (
    id INT PRIMARY KEY,
    abstractPlayerId INT NOT NULL,
    teamId INT NOT NULL,
    FOREIGN KEY (abstractPlayerId) REFERENCES AbstractPlayer(id),
    FOREIGN KEY (teamId) REFERENCES FutsalTeam(id)
);

CREATE TABLE IF NOT EXISTS BasketballPlayer (
    id INT PRIMARY KEY,
    abstractPlayerId INT NOT NULL,
    teamId INT NOT NULL,
    FOREIGN KEY (abstractPlayerId) REFERENCES AbstractPlayer(id),
    FOREIGN KEY (teamId) REFERENCES BasketballTeam(id)
);

CREATE TABLE IF NOT EXISTS AbstractEvent (
    id INT PRIMARY KEY,
    time TIME NOT NULL,
    sport VARCHAR(255) NOT NULL,
    placardId INT NOT NULL,
    eventType ENUM('Card', 'Point', 'Substitution') NOT NULL,
    FOREIGN KEY (placardId) REFERENCES AbstractPlacard(id)
);

CREATE TABLE IF NOT EXISTS CardEvent (
    id INT PRIMARY KEY,
    abstractEventId INT NOT NULL,
    playerId INT NOT NULL,
    cardColor VARCHAR(255) NOT NULL,
    FOREIGN KEY (abstractEventId) REFERENCES AbstractEvent(id),
    FOREIGN KEY (playerId) REFERENCES AbstractPlayer(id)
);

CREATE TABLE IF NOT EXISTS PointEvent (
    id INT PRIMARY KEY,
    abstractEventId INT NOT NULL,
    playerId INT NOT NULL,
    FOREIGN KEY (abstractEventId) REFERENCES AbstractEvent(id),
    FOREIGN KEY (playerId) REFERENCES AbstractPlayer(id)
);

CREATE TABLE IF NOT EXISTS SubstitutionEvent (
    id INT PRIMARY KEY,
    abstractEventId INT NOT NULL,
    playerInId INT NOT NULL,
    playerOutId INT NOT NULL,
    FOREIGN KEY (abstractEventId) REFERENCES AbstractEvent(id),
    FOREIGN KEY (playerInId) REFERENCES AbstractPlayer(id),
    FOREIGN KEY (playerOutId) REFERENCES AbstractPlayer(id)
);

CREATE TABLE IF NOT EXISTS PlacardPlayer (
    id INT PRIMARY KEY AUTO_INCREMENT,
    placardId INT NOT NULL,
    playerId INT NOT NULL,
    isStarting BOOLEAN NOT NULL,
    FOREIGN KEY (placardId) REFERENCES AbstractPlacard(id),
    FOREIGN KEY (playerId) REFERENCES AbstractPlayer(id)
);
