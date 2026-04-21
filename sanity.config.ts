import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { languageFilter } from "@sanity/language-filter";
import { schemaTypes } from "./lib/sanity/schemas";

export default defineConfig({
  name: "ebecerra-web",
  title: "ebecerra.es",
  projectId: "gdtxcn4l",
  dataset: "production",
  basePath: "/studio",
  plugins: [
    structureTool(),
    visionTool(),
    languageFilter({
      supportedLanguages: [
        { id: "es", title: "Español" },
        { id: "en", title: "English" },
      ],
      defaultLanguages: ["es"],
      documentTypes: [
        "experience",
        "skill",
        "techTag",
        "project",
        "profile",
        "service",
        "processStep",
        "caseStudy",
      ],
      filterField: (enclosingType, member, selectedLanguageIds) =>
        !enclosingType.name.startsWith("locale") ||
        ("name" in member && selectedLanguageIds.includes(member.name)),
    }),
  ],
  schema: {
    types: schemaTypes,
  },
});
