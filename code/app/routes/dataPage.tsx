import type { Route } from "./+types/timeline";
import { ProgressPage } from "../Datapage/ProgressPage";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "Timeline " },
    { name: "description", content: "This here be a timeline" },
  ];
}

export default function TimeLineView() {
  return <ProgressPage />;
}
