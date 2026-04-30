import { getHistory } from "@/lib/store";
import { getUid } from "@/lib/uid";

export async function GET(req: Request) {
  const uid = getUid(req);
  const entries = await getHistory(uid);
  return Response.json({ entries });
}
