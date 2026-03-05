import { getCollection } from "astro:content";
import satori from "satori";
import sharp from "sharp";
import type { APIRoute } from "astro";

export async function getStaticPaths() {
  const posts = await getCollection("posts", ({ data }) => !data.draft);
  return posts.map((post) => ({
    params: { slug: post.id.replace(/\.mdx?$/, "") },
    props: { title: post.data.title, date: post.data.date },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { title, date } = props;
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Fetch font for Satori (needs raw ArrayBuffer)
  const fontData = await fetch(
    "https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-400-normal.woff"
  ).then((res) => res.arrayBuffer());

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          backgroundColor: "#0c0a09",
          fontFamily: "JetBrains Mono",
          borderBottom: "4px solid #f87171",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                fontSize: "20px",
                color: "#78716c",
                letterSpacing: "6px",
                textTransform: "uppercase" as const,
                marginBottom: "32px",
              },
              children: "ragastudio",
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                fontSize: title.length > 60 ? "36px" : "48px",
                color: "#e7e5e4",
                lineHeight: 1.2,
                fontWeight: 600,
                marginBottom: "40px",
                maxWidth: "900px",
              },
              children: title,
            },
          },
          {
            type: "div",
            props: {
              style: {
                fontSize: "18px",
                color: "#57534e",
                letterSpacing: "2px",
                textTransform: "uppercase" as const,
                display: "flex",
                alignItems: "center",
                gap: "16px",
              },
              children: [
                {
                  type: "span",
                  props: { children: formattedDate },
                },
                {
                  type: "span",
                  props: {
                    style: { color: "#f87171" },
                    children: "·",
                  },
                },
                {
                  type: "span",
                  props: { children: "ragastudio.org" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "JetBrains Mono",
          data: fontData,
          weight: 400,
          style: "normal",
        },
      ],
    }
  );

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
