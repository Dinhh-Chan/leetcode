import { BookOpen, GraduationCap, Plus, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const LeftSidebar = () => {
  return (
    <aside className="w-48 border-r bg-card p-4">
      <div className="space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-sm font-normal"
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Library
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-sm font-normal"
        >
          <GraduationCap className="mr-2 h-4 w-4" />
          Study Plan
        </Button>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">My Lists</span>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-sm font-normal"
        >
          ⭐ Favorite
          <Lock className="ml-auto h-3 w-3" />
        </Button>
      </div>
    </aside>
  );
};

export default LeftSidebar;
