import { PreviewHost } from "@/components/preview-host";
export const metadata = {
  title: "Workspace preview",
  robots: { index: false, follow: false },
};
export default function PreviewPage() {
  return <PreviewHost />;
}
