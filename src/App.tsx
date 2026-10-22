import { Refine } from "@refinedev/core";
import routerProvider, { DocumentTitleHandler } from "@refinedev/react-router";
import { HashRouter, Outlet, Route, Routes } from "react-router";
import { dataProvider } from "./dataProvider";
import { Layout } from "./components/Layout";
import { Icon } from "./components/Icon";
import { Welcome } from "./pages/Welcome";
import { ExperienceList, ExperienceShow } from "./pages/Experience";
import { ProjectList, ProjectShow } from "./pages/Projects";
import { Pipeline } from "./pages/Pipeline";
import { Doctrine } from "./pages/Doctrine";
import { Companies } from "./pages/Companies";
import { Stack } from "./pages/Stack";
import { Contact } from "./pages/Contact";

const resources = [
  { name: "welcome", list: "/", meta: { label: "Welcome", icon: <Icon name="home" /> } },
  { name: "experiences", list: "/experience", show: "/experience/:id", meta: { label: "Experience", icon: <Icon name="briefcase" /> } },
  { name: "projects", list: "/projects", show: "/projects/:id", meta: { label: "Case files", icon: <Icon name="film" /> } },
  { name: "pipeline", list: "/pipeline", meta: { label: "The pipeline", icon: <Icon name="flow" /> } },
  { name: "rules", list: "/doctrine", meta: { label: "Doctrine", icon: <Icon name="shield" /> } },
  { name: "companies", list: "/companies", meta: { label: "Companies", icon: <Icon name="building" /> } },
  { name: "stack", list: "/stack", meta: { label: "Stack", icon: <Icon name="layers" /> } },
  { name: "contact", list: "/contact", meta: { label: "Contact", icon: <Icon name="mail" /> } },
  { name: "lessons", meta: { hide: true } },
];

const title = ({ resource, action }: { resource?: { meta?: { label?: string } }; action?: string }) => {
  const label = resource?.meta?.label;
  if (!label || label === "Welcome") return "Robeul Console";
  return `${label}${action === "show" ? " · detail" : ""} · Robeul Console`;
};

export default function App() {
  return (
    <HashRouter>
      <Refine
        dataProvider={dataProvider}
        routerProvider={routerProvider}
        resources={resources}
        options={{ disableTelemetry: true, syncWithLocation: true }}
      >
        <Routes>
          <Route
            element={
              <Layout>
                <Outlet />
              </Layout>
            }
          >
            <Route index element={<Welcome />} />
            <Route path="/experience" element={<ExperienceList />} />
            <Route path="/experience/:id" element={<ExperienceShow />} />
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/projects/:id" element={<ProjectShow />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/doctrine" element={<Doctrine />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/stack" element={<Stack />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Welcome />} />
          </Route>
        </Routes>
        <DocumentTitleHandler handler={title as never} />
      </Refine>
    </HashRouter>
  );
}
