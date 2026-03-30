import { ALLOWED_DOMAINS, INITIAL_KARMA } from "./constants";
import { db } from "./firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import type { User } from "firebase/auth";

export function validateEmailDomain(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return ALLOWED_DOMAINS.some((d) => domain === d);
}

export async function createUserProfile(
  user: User, 
  displayName: string, 
  major: string = "", 
  campusLocation: string = ""
): Promise<void> {
  const domain = user.email?.split("@")[1] ?? "";
  const university = domain.replace("student.", "").replace(/\.\w+$/, "").toUpperCase();
  const ref = doc(db, "users", user.uid);
  await setDoc(ref, {
    uid: user.uid,
    displayName: displayName ?? user.displayName ?? user.email?.split("@")[0] ?? "Student",
    email: user.email,
    university,
    major,
    campusLocation,
    karmaBalance: INITIAL_KARMA,
    createdAt: serverTimestamp(),
    avatarUrl: null,
  });
}
