
export async function GET(request: Request) {
    void request.headers;
    return Response.json({ status: "ok" });
}