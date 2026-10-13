import type { Metadata } from "next";
import { featuredProject } from "@/content";
import { ProjectLanding } from "@/components/ProjectLanding";

const project = featuredProject();

// The ad landing page: the featured project, canonical to its project URL.
export const metadata: Metadata = {
  title: project.seo.title,
  description: project.seo.description,
  alternates: { canonical: `/projects/${project.slug}` },
};

export default function Home() {
  return <ProjectLanding project={project} />;
}
