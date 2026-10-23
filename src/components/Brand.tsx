import {
  siAndroid, siAsana, siCaddy, siClaude, siClickhouse, siCloudflare, siCoolify, siDocker, siElasticsearch, siExpress, siFastapi, siGit, siGithub, siGithubactions, siGnubash, siGooglesheets, siGraphql, siHubspot, siJavascript, siKotlin, siLetsencrypt, siLinear, siLinux, siMikrotik, siModelcontextprotocol, siN8n, siNextdotjs, siNginx, siNodedotjs, siOpenapiinitiative, siOpensearch, siPostgresql, siPython, siQwen, siReact, siStripe, siSupabase, siSwift, siTailscale, siTypescript, siUbuntu, siVercel, siVllm, siWireguard,
} from "simple-icons";
import { brandIcons } from "../data";

const icons: Record<string, { path: string; hex: string }> = Object.fromEntries(
  [
    siAndroid, siAsana, siCaddy, siClaude, siClickhouse, siCloudflare, siCoolify, siDocker, siElasticsearch, siExpress, siFastapi, siGit, siGithub, siGithubactions, siGnubash, siGooglesheets, siGraphql, siHubspot, siJavascript, siKotlin, siLetsencrypt, siLinear, siLinux, siMikrotik, siModelcontextprotocol, siN8n, siNextdotjs, siNginx, siNodedotjs, siOpenapiinitiative, siOpensearch, siPostgresql, siPython, siQwen, siReact, siStripe, siSupabase, siSwift, siTailscale, siTypescript, siUbuntu, siVercel, siVllm, siWireguard,
  ].map((i) => [i.slug, i]),
);

/** The skill's brand mark in its brand colour, or nothing when it has none. */
export const Brand = ({ name, size = 14 }: { name: string; size?: number }) => {
  const ref = brandIcons[name];
  if (!ref) return null;
  if (ref.startsWith("./")) return <img src={ref} alt="" width={size} height={size} />;
  const icon = icons[ref];
  if (!icon) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill={`#${icon.hex}`} d={icon.path} />
    </svg>
  );
};
