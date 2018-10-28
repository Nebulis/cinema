declare module "allocine-api" {
  function api(
    method: "search",
    options: ISearchMoviesParams,
    callback: (error: Error | undefined, results: IAllocineMoviesResult) => any
  ): any;
  function api(
    method: "search",
    options: ISearchTvShowsParams,
    callback: (error: Error | undefined, results: IAllocineTvShowsResult) => any
  ): any;
  function api(
    method: "movie",
    options: IGetParams,
    callback: (error: Error | undefined, result: IMovie) => any
  ): any;
  function api(
    method: "tvseries",
    options: IGetParams,
    callback: (error: Error | undefined, result: ITvShow) => any
  ): any;
}

interface IBaseSearch {
  count?: number;
  q: string;
}

interface IGetParams {
  code: string;
}

interface ISearchMoviesParams extends IBaseSearch {
  filter: "movie";
}

interface ISearchTvShowsParams extends IBaseSearch {
  filter: "tvseries";
}

interface IAllocineBaseFeed {
  page: number;
  count: number;
  totalResults: number;
}

interface IAllocineMoviesFeed extends IAllocineBaseFeed {
  movie?: IMovie[];
}

interface IAllocineBaseResult {
  error?: {
    code: number;
    $: string;
  };
}

interface IAllocineMoviesResult extends IAllocineBaseResult {
  feed: IAllocineMoviesFeed;
}

interface IAllocineTvShowsFeed extends IAllocineBaseFeed {
  tvseries?: ITvShow[];
}

interface IAllocineTvShowsResult extends IAllocineBaseResult {
  feed: IAllocineTvShowsFeed;
}

interface IMovie {
  title: string;
}
interface ITvShow {
  title: string;
}
