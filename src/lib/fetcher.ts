import { type Result, failure, success, withAsyncResult } from "./result";
import type { Nullable } from "./utility-types";

type FetcherResponse = Readonly<{
  body: Nullable<ReadableStream<Uint8Array>>;
  bodyUsed: boolean;
  headers: Headers;
  ok: boolean;
  redirected: boolean;
  status: number;
  statusText: string;
  type: ResponseType;
  url: string;
  arrayBuffer(): Promise<Result<ArrayBuffer, Error>>;
  blob(): Promise<Result<Blob, Error>>;
  clone(): FetcherResponse;
  formData(): Promise<Result<FormData, Error>>;
  json<Data = unknown>(): Promise<Result<Data, Error>>;
  text(): Promise<Result<string, Error>>;
}>;

export type Fetcher = (
  url: string,
  options?: RequestInit,
) => Promise<Result<FetcherResponse, Error>>;

export function createFetcherResponse(response: Response): FetcherResponse {
  const res: FetcherResponse = {
    get body() {
      return response.body;
    },
    get bodyUsed() {
      return response.bodyUsed;
    },
    get headers() {
      return response.headers;
    },
    get ok() {
      return response.ok;
    },
    get redirected() {
      return response.redirected;
    },
    get status() {
      return response.status;
    },
    get statusText() {
      return response.statusText;
    },
    get type() {
      return response.type;
    },
    get url() {
      return response.url;
    },
    arrayBuffer: withAsyncResult(() => response.arrayBuffer()),
    blob: withAsyncResult(() => response.blob()),
    formData: withAsyncResult(() => response.formData()),
    text: withAsyncResult(() => response.text()),
    async json<Data = unknown>(): Promise<Result<Data, Error>> {
      try {
        const data = (await response.json()) as Data;
        return success<Data>(data);
      } catch (error) {
        return failure(error instanceof Error ? error : new Error(`${error}`));
      }
    },
    clone() {
      return createFetcherResponse(response.clone());
    },
  };

  return res;
}

export function createFetcher(request = fetch): Fetcher {
  return async (
    url: string,
    options?: RequestInit,
  ): Promise<Result<FetcherResponse, Error>> => {
    try {
      const response = await request(url, options);
      return success(createFetcherResponse(response));
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(`${error}`));
    }
  };
}

export const fetcher = createFetcher();
