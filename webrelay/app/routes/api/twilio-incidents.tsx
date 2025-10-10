import type { Route } from "./+types/twilio-incidents";

type Payload = {
  body?: string;
};

export async function loader() {
  return new Response(JSON.stringify({ success: false, error: "Method Not Allowed." }), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function action({ request, context }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method Not Allowed." }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  // 環境変数GAS_TWILIO_INCIDENTS_URLを取得（https://script.google.com/macros/s/.../exec）
  const { GAS_TWILIO_INCIDENTS_URL } = context.cloudflare.env;
  if (!GAS_TWILIO_INCIDENTS_URL) {
    return new Response(JSON.stringify({ success: false, error: "Server misconfigured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 受信したらすぐに200返す
  const clone = request.clone(); // 非同期転送用に複製
  context.cloudflare.ctx.waitUntil(
    (async () => {
      try {
        // 生ボディ＋元のContent-Typeを踏襲
        const raw = await clone.arrayBuffer();
        const ct = clone.headers.get("content-type") || "application/octet-stream";
        await fetch(GAS_TWILIO_INCIDENTS_URL, {
          method: "POST",
          headers: { "Content-Type": ct },
          body: raw,
          redirect: "follow",
        });
      } catch (err) {
        console.error("forward error:", err);
      }
    })()
  );

  return new Response(JSON.stringify({ success: true }), {
    status: 200, // 204でも可
    headers: { "Content-Type": "application/json" },
  });
}