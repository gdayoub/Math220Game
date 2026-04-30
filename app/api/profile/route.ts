import { getProfile } from "@/lib/store";
import { getUid } from "@/lib/uid";

export async function GET(req: Request) {
  const uid = getUid(req);
  const profile = await getProfile(uid);
  return Response.json(profile);
}
