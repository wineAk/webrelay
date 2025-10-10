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
  // メソッドを取得
  const method = request.method;
  console.log("[twilio-incidents.tsx] - action - method:", method);
  if (method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method Not Allowed." }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 環境変数GAS_TWILIO_INCIDENTS_URLを取得（https://script.google.com/macros/s/.../exec）
  const { GAS_TWILIO_INCIDENTS_URL } = context.cloudflare.env;
  console.log("[twilio-incidents.tsx] - action - GAS_TWILIO_INCIDENTS_URL:", GAS_TWILIO_INCIDENTS_URL);
  if (!GAS_TWILIO_INCIDENTS_URL) {
    return new Response(JSON.stringify({ success: false, error: "Server misconfigured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // レスポンスを返す前にボディを読み取る（JSON文字列のまま）
  const body = await request.text();
  console.log("[twilio-incidents.tsx] - action - body:", body);

  // 受信したらすぐに200返す
  context.cloudflare.ctx.waitUntil(
    (async () => {
      try {
        const res = await fetch(GAS_TWILIO_INCIDENTS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          redirect: "follow",
        });
        console.log("[twilio-incidents.tsx] - action - res:", res);
      } catch (err) {
        console.error("[twilio-incidents.tsx] - action - forward error:", err);
      }
    })()
  );

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
