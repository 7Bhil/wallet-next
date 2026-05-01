import { redirect } from "next/navigation";

export default function Home() {
  // Redirige automatiquement la racine '/' vers '/login'
  redirect("/login");
}

