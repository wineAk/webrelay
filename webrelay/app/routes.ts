import { type RouteConfig, index, prefix, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  ...prefix("api/v1", [
    route("twilio/incidents", "routes/api/twilio-incidents.tsx"),
    route("*", "routes/api/404.tsx"),
  ]),
] satisfies RouteConfig;
