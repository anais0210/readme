import type { FormValues, SectionKey } from "./config";

export type Preset = {
  id: string;
  label: string;
  description: string;
  /** Seuls ces champs sont remplacés : l'identité et les liens sont conservés. */
  values: Pick<FormValues, "bio" | "badgesPreset" | "softSkillsPreset" | "style"> & {
    sections: Partial<Record<SectionKey, boolean>>;
  };
};

export const PRESETS: Preset[] = [
  {
    id: "formatrice",
    label: "Formatrice / formateur",
    description: "Pédagogie, ressources et accompagnement",
    values: {
      bio: "Formatrice tech 👩‍🏫 J’accompagne les apprenant·es du premier `git init` jusqu’au déploiement. Ici : mes supports, démos et projets pédagogiques.",
      badgesPreset: ["HTML5", "CSS3", "JavaScript", "TypeScript", "React", "Git", "GitHub"],
      softSkillsPreset: ["Pédagogie", "Communication", "Empathie", "Organisation"],
      style: "emoji",
      sections: { header: true, bio: true, badges: true, softSkills: true, keySkills: true, projects: true, stats: false, links: true },
    },
  },
  {
    id: "junior",
    label: "Junior en reconversion",
    description: "Mettre en avant la progression et les projets",
    values: {
      bio: "Développeur·euse junior en reconversion 🌱 Je construis des projets pour apprendre, et je cherche ma première expérience en entreprise.",
      badgesPreset: ["HTML5", "CSS3", "JavaScript", "React", "NodeJS", "Git"],
      softSkillsPreset: ["Curiosité", "Adaptabilité", "Travail d’équipe", "Autonomie"],
      style: "emoji",
      sections: { header: false, bio: true, badges: true, softSkills: true, projects: true, stats: true, links: true, fun: true },
    },
  },
  {
    id: "freelance",
    label: "Freelance",
    description: "Offre, expertise et prise de contact",
    values: {
      bio: "Développeur·euse freelance. J’aide les équipes à livrer des applications web fiables et accessibles. Disponible pour de nouvelles missions — écrivez-moi !",
      badgesPreset: ["TypeScript", "React", "NextJS", "NodeJS", "PostgreSQL", "Docker", "Vercel"],
      softSkillsPreset: ["Communication", "Autonomie", "Gestion du temps", "Résolution de problèmes"],
      style: "minimal",
      sections: { header: true, bio: true, badges: true, softSkills: false, keySkills: true, projects: true, stats: false, links: true },
    },
  },
];
