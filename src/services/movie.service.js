import { goodfellas, popular } from "../../test/fixtures/movies.js";
import { roles } from "../../test/fixtures/people.js";
import { toNativeTypes } from "../utils.js";
import { int } from "neo4j-driver";
import NotFoundError from "../errors/not-found.error.js";

// TODO: Import the `int` function from neo4j-driver

export default class MovieService {
  /**
   * @type {neo4j.Driver}
   */
  driver;

  /**
   * The constructor expects an instance of the Neo4j Driver, which will be
   * used to interact with Neo4j.
   *
   * @param {neo4j.Driver} driver
   */
  constructor(driver) {
    this.driver = driver;
  }

  /**
   * @public
   * This method should return a paginated list of movies ordered by the `sort`
   * parameter and limited to the number passed as `limit`.  The `skip` variable should be
   * used to skip a certain number of rows.
   *
   * If a userId value is suppled, a `favorite` boolean property should be returned to
   * signify whether the user has aded the movie to their "My Favorites" list.
   *
   * @param {string} sort
   * @param {string} order
   * @param {number} limit
   * @param {number} skip
   * @param {string | undefined} userId
   * @returns {Promise<Record<string, any>[]>}
   */
  async all(
    sort = "title",
    order = "ASC",
    limit = 6,
    skip = 0,
    userId = undefined
  ) {
    const session = this.driver.session();
    const res = await session.executeRead(async (tx) => {
      const favorites = await this.getUserFavorites(tx, userId);

      return tx.run(
        `
            MATCH (m:Movie)
            WHERE m.\`${sort}\` IS NOT NULL
            RETURN m {
              .*,
              favorite: m.tmdbId IN $favorites
            } AS movie
            ORDER BY m.\`${sort}\` ${order}
            SKIP $skip
            LIMIT $limit
          `,
        { skip: int(skip), limit: int(limit), favorites }
      );
    });
    const movies = res.records.map((row) => toNativeTypes(row.get("movie")));
    await session.close();

    return movies;
  }

  /**
   * @public
   * This method should return a paginated list of movies that have a relationship to the
   * supplied Genre.
   *
   * Results should be ordered by the `sort` parameter, and in the direction specified
   * in the `order` parameter.
   * Results should be limited to the number passed as `limit`.
   * The `skip` variable should be used to skip a certain number of rows.
   *
   * If a userId value is suppled, a `favorite` boolean property should be returned to
   * signify whether the user has aded the movie to their "My Favorites" list.
   *
   * @param {string} name
   * @param {string} sort
   * @param {string} order
   * @param {number} limit
   * @param {number} skip
   * @param {string | undefined} userId
   * @returns {Promise<Record<string, any>[]>}
   */
  async getByGenre(
    name,
    sort = "title",
    order = "ASC",
    limit = 6,
    skip = 0,
    userId = undefined
  ) {
    const session = this.driver.session();

    const res = await session.executeRead(async (tx) => {
      const favorites = await this.getUserFavorites(tx, userId);

      return tx.run(
        `
        MATCH (m:Movie)-[:IN_GENRE]->(:Genre {name: $name})
        WHERE m.\`${sort}\` IS NOT NULL
        RETURN m {
          .*,
          favorite: m.tmdbId IN $favorites
        } AS movie
        ORDER BY m.\`${sort}\` ${order}
        SKIP $skip
        LIMIT $limit
      `,
        { skip: int(skip), limit: int(limit), favorites, name }
      );
    });

    const movies = res.records.map((row) => toNativeTypes(row.get("movie")));

    await session.close();

    return movies;
  }

  /**
   * @public
   * This method should return a paginated list of movies that have an ACTED_IN relationship
   * to a Person with the id supplied
   *
   * Results should be ordered by the `sort` parameter, and in the direction specified
   * in the `order` parameter.
   * Results should be limited to the number passed as `limit`.
   * The `skip` variable should be used to skip a certain number of rows.
   *
   * If a userId value is suppled, a `favorite` boolean property should be returned to
   * signify whether the user has aded the movie to their "My Favorites" list.
   *
   * @param {string} id
   * @param {string} sort
   * @param {string} order
   * @param {number} limit
   * @param {number} skip
   * @param {string | undefined} userId
   * @returns {Promise<Record<string, any>[]>}
   */
  async getForActor(
    id,
    sort = "title",
    order = "ASC",
    limit = 6,
    skip = 0,
    userId = undefined
  ) {
    const session = this.driver.session();

    const res = await session.executeRead(async (tx) => {
      const favorites = await this.getUserFavorites(tx, userId);

      return tx.run(
        `
        MATCH (:Person {tmdbId: $id})-[:ACTED_IN]->(m:Movie)
        WHERE m.\`${sort}\` IS NOT NULL
        RETURN m {
          .*,
          favorite: m.tmdbId IN $favorites
        } AS movie
        ORDER BY m.\`${sort}\` ${order}
        SKIP $skip
        LIMIT $limit
      `,
        { skip: int(skip), limit: int(limit), favorites, id }
      );
    });

    const movies = res.records.map((row) => toNativeTypes(row.get("movie")));

    await session.close();

    return movies;
  }

  /**
   * @public
   * This method should return a paginated list of movies that have an DIRECTED relationship
   * to a Person with the id supplied
   *
   * Results should be ordered by the `sort` parameter, and in the direction specified
   * in the `order` parameter.
   * Results should be limited to the number passed as `limit`.
   * The `skip` variable should be used to skip a certain number of rows.
   *
   * If a userId value is suppled, a `favorite` boolean property should be returned to
   * signify whether the user has aded the movie to their "My Favorites" list.
   *
   * @param {string} id
   * @param {string} sort
   * @param {string} order
   * @param {number} limit
   * @param {number} skip
   * @param {string | undefined} userId
   * @returns {Promise<Record<string, any>[]>}
   */
  async getForDirector(
    id,
    sort = "title",
    order = "ASC",
    limit = 6,
    skip = 0,
    userId = undefined
  ) {
    const session = this.driver.session();

    const res = await session.executeRead(async (tx) => {
      const favorites = await this.getUserFavorites(tx, userId);

      return tx.run(
        `
        MATCH (:Person {tmdbId: $id})-[:DIRECTED]->(m:Movie)
        WHERE m.\`${sort}\` IS NOT NULL
        RETURN m {
          .*,
          favorite: m.tmdbId IN $favorites
        } AS movie
        ORDER BY m.\`${sort}\` ${order}
        SKIP $skip
        LIMIT $limit
      `,
        { skip: int(skip), limit: int(limit), favorites, id }
      );
    });

    const movies = res.records.map((row) => toNativeTypes(row.get("movie")));

    await session.close();

    return movies;
  }

  /**
   * @public
   * This method find a Movie node with the ID passed as the `id` parameter.
   * Along with the returned payload, a list of actors, directors, and genres should
   * be included.
   * The number of incoming RATED relationships should also be returned as `ratingCount`
   *
   * If a userId value is suppled, a `favorite` boolean property should be returned to
   * signify whether the user has aded the movie to their "My Favorites" list.
   *
   * @param {string} id
   * @returns {Promise<Record<string, any>>}
   */
  async findById(id, userId = undefined) {
    const session = this.driver.session();

    const res = await session.executeRead(async (tx) => {
      const favorites = await this.getUserFavorites(tx, userId);

      return tx.run(
        `
        MATCH (m:Movie {tmdbId: $id})
        RETURN m {
          .*,
          actors: [ (a)-[r:ACTED_IN]->(m) | a { .*, role: r.role } ],
          directors: [ (d)-[:DIRECTED]->(m) | d { .* } ],
          genres: [ (m)-[:IN_GENRE]->(g) | g { .name }],
          ratingCount: count{ (m)<-[:RATED]-() },
          favorite: m.tmdbId IN $favorites
        } AS movie
        LIMIT 1
      `,
        { id, favorites }
      );
    });

    await session.close();

    if (res.records.length === 0) {
      throw new NotFoundError(`Could not find a Movie with tmdbId ${id}`);
    }

    const [first] = res.records;

    return toNativeTypes(first.get("movie"));
  }

  /**
   * @public
   * This method should return a paginated list of similar movies to the Movie with the
   * id supplied.  This similarity is calculated by finding movies that have many first
   * degree connections in common: Actors, Directors and Genres.
   *
   * Results should be ordered by the `sort` parameter, and in the direction specified
   * in the `order` parameter.
   * Results should be limited to the number passed as `limit`.
   * The `skip` variable should be used to skip a certain number of rows.
   *
   * If a userId value is suppled, a `favorite` boolean property should be returned to
   * signify whether the user has aded the movie to their "My Favorites" list.
   *
   * @param {string} id
   * @param {number} limit
   * @param {number} skip
   * @param {string | undefined} userId
   * @returns {Promise<Record<string, any>[]>}
   */
  async getSimilarMovies(id, limit = 6, skip = 0, userId = undefined) {
    const session = this.driver.session();

    const res = await session.executeRead(async (tx) => {
      const favorites = await this.getUserFavorites(tx, userId);

      return tx.run(
        `
        MATCH (:Movie {tmdbId: $id})-[:IN_GENRE|ACTED_IN|DIRECTED]->()<-[:IN_GENRE|ACTED_IN|DIRECTED]-(m)
        WHERE m.imdbRating IS NOT NULL
        WITH m, count(*) AS inCommon
        WITH m, inCommon, m.imdbRating * inCommon AS score
        ORDER BY score DESC
        SKIP $skip
        LIMIT $limit
        RETURN m {
          .*,
          score: score,
          favorite: m.tmdbId IN $favorites
        } AS movie
      `,
        { id, skip: int(skip), limit: int(limit), favorites }
      );
    });

    const movies = res.records.map((row) => toNativeTypes(row.get("movie")));

    await session.close();

    return movies;
  }

  /**
   * @private
   * This function should return a list of tmdbId properties for the movies that
   * the user has added to their 'My Favorites' list.
   *
   * @param {neo4j.Transaction} tx   The open transaction
   * @param {string} userId          The ID of the current user
   * @returns {Promise<string[]>}
   */
  async getUserFavorites(tx, userId) {
    if (userId === undefined) {
      return [];
    }

    const favoriteResult = await tx.run(
      `
        MATCH (:User {userId: $userId})-[:HAS_FAVORITE]->(m)
        RETURN m.tmdbId AS id
      `,
      { userId }
    );

    return favoriteResult.records.map((row) => row.get("id"));
  }
}
