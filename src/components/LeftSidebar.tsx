import { BookOpen, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path: string) => {
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  const isLibraryActive = location.pathname.startsWith("/problems");
  const isStudyPlanActive =
    location.pathname === "/study-plan" || location.pathname.startsWith("/courses");

  const buttonClasses = (isActive: boolean) =>
    `w-full justify-start text-sm font-medium ${
      isActive
        ? "bg-primary/10 text-primary hover:bg-primary/20"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <aside className="w-48 border-r bg-card p-4">
      <div className="space-y-2">
        <Button
          variant="ghost"
          className={buttonClasses(isLibraryActive)}
          onClick={() => handleNavigate("/problems")}
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Thư viện
        </Button>
        <Button
          variant="ghost"
          className={buttonClasses(isStudyPlanActive)}
          onClick={() => handleNavigate("/study-plan")}
        >
          <GraduationCap className="mr-2 h-4 w-4" />
          Lộ trình học
        </Button>
      </div>
    </aside>
  );
};

export default LeftSidebar;
