import { profile } from "../data";
import { Icon } from "../components/Icon";

const links = [
  { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
  { label: "LinkedIn", value: "in/mdrobeulislam1251", href: profile.linkedin },
  { label: "GitHub · work", value: "robeul-trusted-leads", href: profile.github.work },
  { label: "GitHub · personal", value: "mdrobeulislam1251-ux", href: profile.github.personal },
];

export const Contact = () => (
  <div className="page contact">
    <div className="contact-card">
      <img src={profile.avatar} alt={profile.name} />
      <span className="eyebrow">
        <span className="pulse" /> Open to conversations
      </span>
      <h1>Let's build something you can trust.</h1>
      <p>
        Data engineering, verification pipelines, or agent infrastructure. I work remote on US hours from{" "}
        {profile.location}. Bengali native, professional English.
      </p>
      <div className="contact-links">
        {links.map((l) => (
          <a key={l.label} href={l.href} target="_blank" rel="noreferrer">
            <small>{l.label}</small>
            <strong>{l.value}</strong>
            <Icon name="external" size={14} />
          </a>
        ))}
      </div>
    </div>
  </div>
);
