const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

const convertToResponseData = (obj) => {
  return {
    playerId: obj.player_id,
    playerName: obj.player_name,
  };
};

const convertToResponseDataOfPlayer = (obj) => {
  return {
    playerId: obj.player_id,
    playerName: obj.player_name,
  };
};

const convertToResponseOfMatchDetails = (obj) => {
  return {
    matchId: obj.match_id,
    match: obj.match,
    year: obj.year,
  };
};

const convertToResponseOfMatchDetailsBasedOnPlayerId = (obj) => {
  return {
    matchId: obj.match_id,
    match: obj.match,
    year: obj.year,
  };
};

const convertToResponseOfPlayerDetailsBasedOnMatchId = (obj) => {
  return {
    playerId: obj.player_id,
    playerName: obj.player_name,
  };
};

///API 1
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      player_details`;
  const player = await db.all(getPlayersQuery);
  response.send(player.map((each) => convertToResponseData(each)));
});

//API 2

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getStateQuery = `
    SELECT
      *
    FROM
      player_details
    WHERE
      player_id = ${playerId};`;
  const player = await db.get(getStateQuery);
  response.send(convertToResponseDataOfPlayer(player));
});

///API 3
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;

  const updatePlayerQuery = `
    UPDATE
      player_details
    SET
      
      player_name='${playerName}'
    WHERE
      player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//API 4

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `
    SELECT
      *
    FROM
      match_details
    WHERE
      match_id = ${matchId};`;
  const match = await db.get(getMatchQuery);
  response.send(convertToResponseOfMatchDetails(match));
});

///API 5
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchQuery = `
    SELECT
     match_details.match_id,
     match_details.match,
     match_details.year
    FROM
     match_details INNER JOIN player_match_score
     ON match_details.match_id = player_match_score.match_id
    WHERE
      player_id = ${playerId};`;
  const matchArray = await db.all(getPlayerMatchQuery);
  response.send(
    matchArray.map((each) =>
      convertToResponseOfMatchDetailsBasedOnPlayerId(each)
    )
  );
});

//API 6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayerMatchQuery = `
    SELECT
    player_details.player_id,
    player_details.player_name
    FROM
     player_match_score
     INNER JOIN match_details
     ON match_details.match_id == player_match_score.match_id
     INNER JOIN player_details
     ON player_match_score.player_id ==player_details.player_id


    WHERE
      player_match_score.match_id = ${matchId};`;
  const matchArray = await db.all(getPlayerMatchQuery);
  response.send(
    matchArray.map((each) =>
      convertToResponseOfPlayerDetailsBasedOnMatchId(each)
    )
  );
});

///API 7
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerScoreQuery = `
    SELECT
    player_match_score.player_id AS playerId,
    player_details.player_name AS playerName,
    sum(player_match_score.score) AS totalScore,
    sum(player_match_score.fours) AS totalFours,
    sum(player_match_score.sixes) AS totalSixes
    FROM
      player_match_score
     INNER JOIN match_details
     ON match_details.match_id == player_match_score.match_id
     INNER JOIN player_details
     ON player_match_score.player_id ==player_details.player_id
     


    WHERE
      player_match_score.player_id = ${playerId};
      GROUP BY player_match_score.player_id`;
  const scoreArray = await db.get(getPlayerScoreQuery);
  response.send(scoreArray);
});

initializeDBAndServer();
module.exports = app;
