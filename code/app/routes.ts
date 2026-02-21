import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("narrative", "routes/narrative.tsx"),
    route("timekeeping", "routes/timekeeping.tsx"),
    route("timeline","routes/dataPage.tsx"),
] satisfies RouteConfig;

