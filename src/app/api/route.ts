export async function GET() {
  return new Response(
    JSON.stringify({ status: 404, error: "endpoint not found" }),
    {
      status: 404,
      headers: { "Content-Type": "application/json" },
    }
  );
}
