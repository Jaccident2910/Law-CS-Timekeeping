import type { Route } from "./+types/timeline";
import { TimeLinePage } from "../Datapage/timeLineView";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "Timeline " },
    { name: "description", content: "This here be a timeline" },
  ];
}

export default function TimeLineView() {
  return <TimeLinePage />;
}
