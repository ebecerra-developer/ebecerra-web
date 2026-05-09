import imageUrlBuilder from "@sanity/image-url";
import { client } from "@ebecerra/sanity-client";

const builder = imageUrlBuilder(client);

export function urlFor(source: Parameters<typeof builder.image>[0]) {
  return builder.image(source);
}
