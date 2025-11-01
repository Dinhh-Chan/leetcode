import { Button } from "@/components/ui/button";
import { Database, Terminal, GitBranch, Code2, BarChart3 } from "lucide-react";

const FilterButtons = () => {
  const filters = [
    { label: "Tất cả chủ đề", icon: null, active: true },
    { label: "Algorithms", icon: Code2, active: false },
    { label: "Database", icon: Database, active: false },
    { label: "Shell", icon: Terminal, active: false },
    { label: "Concurrency", icon: GitBranch, active: false },
    { label: "JavaScript", icon: null, active: false },
    { label: "pandas", icon: BarChart3, active: false },
  ];

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {filters.map((filter) => {
        const Icon = filter.icon;
        return (
          <Button
            key={filter.label}
            variant={filter.active ? "default" : "outline"}
            size="sm"
            className={filter.active ? "bg-foreground text-background hover:bg-foreground/90" : ""}
          >
            {Icon && <Icon className="mr-2 h-4 w-4" />}
            {filter.label}
          </Button>
        );
      })}
    </div>
  );
};

export default FilterButtons;
