// Health check for the load balancer. It calls nothing else.
export async function GET(request: Request) {
  // Reading the request makes Next.js run this on every request instead of
  // answering from a response prepared at build time.
  void request.headers;
  return Response.json({ status: "ok" });
}
