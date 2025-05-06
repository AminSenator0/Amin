import { PassThrough } from "stream";
import { RemixServer } from "@remix-run/react";
import ReactDOMServer from "react-dom/server";
import type { EntryContext } from "@remix-run/node";

// مهم: destructure از default import
const { renderToPipeableStream } = ReactDOMServer;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  return new Promise((resolve, reject) => {
    let didError = false;

    const stream = new PassThrough();

    const { pipe } = renderToPipeableStream(
      <RemixServer context={remixContext} url={request.url} />,
      {
        onShellReady() {
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              status: didError ? 500 : responseStatusCode,
              headers: responseHeaders,
            })
          );
          pipe(stream);
        },
        onShellError(err) {
          reject(err);
        },
        onError(err) {
          didError = true;
          console.error(err);
        },
      }
    );
  });
}
