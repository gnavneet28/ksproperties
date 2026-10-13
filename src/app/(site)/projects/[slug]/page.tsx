import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/content";
import { ProjectLanding } from "@/components/ProjectLanding";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.seo.title,
    description: project.seo.description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: project.seo.title,
      description: project.seo.description,
      images: [{ url: project.seo.ogImage.src, width: 1200, height: 630, alt: project.seo.ogImage.alt }],
    },
    twitter: { card: "summary_large_image", images: [project.seo.ogImage.src] },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  return <ProjectLanding project={project} showBreadcrumb />;
}
