import {
  siCaddy, siClaude, siCloudflare, siCoolify, siDocker, siElasticsearch, siExpress, siFastapi, siGit, siGithub,
  siGithubactions, siGnubash, siJavascript, siKotlin, siLinux, siModelcontextprotocol, siN8n, siNextdotjs, siNginx,
  siNodedotjs, siOpensearch, siPostgresql, siPython, siQwen, siReact, siSupabase, siTailscale, siTypescript, siUbuntu,
  siVercel, siVllm,
} from "simple-icons";
import { brandIcons } from "../data";

const icons: Record<string, { path: string; hex: string }> = Object.fromEntries(
  [
    siCaddy, siClaude, siCloudflare, siCoolify, siDocker, siElasticsearch, siExpress, siFastapi, siGit, siGithub,
    siGithubactions, siGnubash, siJavascript, siKotlin, siLinux, siModelcontextprotocol, siN8n, siNextdotjs, siNginx,
    siNodedotjs, siOpensearch, siPostgresql, siPython, siQwen, siReact, siSupabase, siTailscale, siTypescript, siUbuntu,
    siVercel, siVllm,
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
