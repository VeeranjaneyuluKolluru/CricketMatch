const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
const app = express();
app.use(express.json());

let db = null;
const intialize = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => console.log("server started"));
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
intialize();

converPlayer = (player) => {
  return {
    playerId: player.player_id,
    playerName: player.player_name,
  };
};

convertMatch = (mat) => {
  return {
    matchId: mat.match_id,
    match: mat.match,
    year: mat.year,
  };
};

//api1
app.get("/players/", async (request, response) => {
  const getPlayers = `select * from player_details`;
  const playerarray = await db.all(getPlayers);
  response.send(playerarray.map((player) => converPlayer(player)));
});

//api2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayers = `select * from player_details where player_id=${playerId}`;
  const playerarray = await db.get(getPlayers);
  response.send(converPlayer(playerarray));
});

//api3
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const uplayer = `update player_details set player_name='${playerName}'`;
  const updateP = await db.run(uplayer);
  response.send("Player Details Updated");
});

//api4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatch = `select * from match_details where match_id=${matchId}`;
  const matchr = await db.get(getMatch);
  response.send(convertMatch(matchr));
});

//api5
app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const getMatch = `select * from player_match_score natural join match_details where player_id=${playerId}`;
  const matchr = await db.all(getMatch);
  response.send(matchr.map((match) => convertMatch(match)));
});

//api6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayers = `select player_id, player_name from player_match_score natural join player_details where match_id=${matchId}`;
  const playerarray = await db.all(getPlayers);
  response.send(playerarray);
});

//api7
app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerScore = `select player_details.player_id as playerId , player_details.player_name as playerName, sum(player_match_score.score) as totalScore, sum(fours) as totalFours,sum(sixes) as totalSixes from player_details inner join player_match_score on player_details.player_id=player_match_score.player_id where player_details.player_id=${playerId}`;
  const result = await db.get(getPlayerScore);
  response.send(result);
});
module.exports = app;
