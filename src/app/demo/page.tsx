import { SiteHeader } from "@/components/site";
import { Demo } from "@/components/demo";
export const metadata = { title: "Live demo" };
export default function DemoPage() {
  return (
    <>
      <SiteHeader active="demo" wide />
      <Demo />
    </>
  );
}
