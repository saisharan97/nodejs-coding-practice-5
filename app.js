const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server Running on Port 3000");
    });
  } catch (e) {
    console.log(`DB Encountered Error :${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const conversionOfDBObjectToResponseObjectForAPI1 = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

const conversionOfDBObjectToResponseObjectForAPI3 = (dbObject) => {
  console.log(dbObject);
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const conversionOfDBObjectToResponseObjectForAPI6 = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

// API-1 Get All Movies

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
                            select 
                                * 
                            from 
                                movie;
                            `;
  const moviesArray = await db.all(getMoviesQuery);
  const responseMoviesArray = moviesArray.map((eachMovie) =>
    conversionOfDBObjectToResponseObjectForAPI1(eachMovie)
  );
  //   console.log(typeof moviesArray);
  response.send(responseMoviesArray);
});

// API 2 Create New Movie
app.post("/movies/", async (request, response) => {
  //   console.log(request.body);
  const { directorId, movieName, leadActor } = request.body;
  const createNewMovieQuery = `
                            insert into movie 
                            (director_id, movie_name, lead_actor) 
                            values ( ${directorId}, '${movieName}', '${leadActor}' );
                            `;
  const dbResponse = await db.run(createNewMovieQuery);
  //   console.log(dbResponse);
  response.send("Movie Successfully Added");
});

// API 3  Get Movie with ID
app.get("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  const getMovieQuery = `
                            select
                            *
                            from
                                movie
                            where
                                movie_id = ${movieId};
                            `;

  const movie = await db.get(getMovieQuery);
  //   console.log(movie);
  const responseObjectOfMovie = conversionOfDBObjectToResponseObjectForAPI3(
    movie
  );
  //   console.log(player);
  response.send(responseObjectOfMovie);
});

//  API 4 Update Existing Movie
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
                                update movie
                                set director_id = ${directorId}, 
                                movie_name = '${movieName}', 
                                lead_actor = '${leadActor}' 
                                where movie_id = ${movieId};
                              `;
  const dbResponse = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//  API 5 Delete Movie with ID
app.delete("/movies/:movie_Id/", async (request, response) => {
  const { movie_Id } = request.params;
  const deleteMovieQuery = `
                                delete 
                                from
                                movie 
                                where movie_id = ${movie_Id};`;
  const dbResponse = await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

// API-6 Get All Directors

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
                            select 
                                * 
                            from 
                                director;
                            `;
  const directorsArray = await db.all(getDirectorsQuery);
  const responseDirectorsArray = directorsArray.map((eachDirector) =>
    conversionOfDBObjectToResponseObjectForAPI6(eachDirector)
  );
  //   console.log(typeof moviesArray);
  response.send(responseDirectorsArray);
});

// API-7 Get All Movies Directed by specific director

app.get("/directors/:directorId/movies/", async (request, response) => {
  let { directorId } = request.params;
  directorId = parseInt(directorId);
  console.log(directorId);
  const getMoviesByDirectorQuery = `
                            select 
                                * 
                            from 
                                movie natural join director
                            where director_id = ${directorId};
                            `;
  const moviesByDirectorArray = await db.all(getMoviesByDirectorQuery);
  const responseMoviesByDirectorsArray = moviesByDirectorArray.map(
    (eachMovie) => conversionOfDBObjectToResponseObjectForAPI1(eachMovie)
  );
  //   console.log(moviesByDirectorArray);
  response.send(responseMoviesByDirectorsArray);
});

module.exports = app;
