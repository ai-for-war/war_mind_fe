import { useSkillPluginsPageState } from "@/features/skill-plugins/hooks"

export const SkillPluginsPage = () => {
  const pageState = useSkillPluginsPageState()

  return (
    <section
      className="flex flex-col gap-3"
      data-status-filter={pageState.statusFilter}
    >
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
          Skill Plugins
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Manage skill plugins for your lead agent workspace.
        </p>
      </header>
    </section>
  );
};
