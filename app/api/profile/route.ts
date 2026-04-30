import { readProfile } from "@/lib/profile";

export async function GET() {
  const profile = await readProfile();
  return Response.json(profile);
}
