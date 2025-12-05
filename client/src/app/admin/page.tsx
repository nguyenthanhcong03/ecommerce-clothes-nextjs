import { redirect } from "next/navigation";

export default function AdminPage() {
  // Redirect to products page as default
  redirect("/admin/products");
}
