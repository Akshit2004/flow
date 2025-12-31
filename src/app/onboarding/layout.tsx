import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import styles from "./layout.module.css";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  await dbConnect();
  const user = await User.findById(session.userId).lean();

  return (
    <div className={styles.container}>
      {children}
    </div>
  );
}
