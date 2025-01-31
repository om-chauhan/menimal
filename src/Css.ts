import * as Fs from "@effect/platform-node/FileSystem";
import * as PlatformError from "@effect/platform/Error";
import { Context, Data, Effect, Layer } from "effect";
import * as _Lightningcss from "lightningcss";

class CssError extends Data.TaggedError("CssError")<{
  error: unknown;
}> {}

export interface Css {
  readonly _: unique symbol;
}

export interface CssImpl {
  build: Effect.Effect<
    never,
    PlatformError.PlatformError | CssError,
    globalThis.Uint8Array
  >;
}

export const Css = Context.Tag<Css, CssImpl>("@app/Css");

export const CssLightingCss = Layer.effect(
  Css,
  Effect.map(Fs.FileSystem, (fs) =>
    Css.of({
      build: Effect.gen(function* (_) {
        const code = yield* _(fs.readFile("./style.css"));
        const result = _Lightningcss.transform({
          code,
          filename: "style.css",
          minify: true,
        });
        return result.code;
      }),
    })
  )
).pipe(Layer.provide(Fs.layer));
