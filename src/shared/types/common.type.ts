import type { Params, Props } from "astro";

export type GetStaticPathsResult<T = Props> = {
  params: Params;
  props?: T;
};
