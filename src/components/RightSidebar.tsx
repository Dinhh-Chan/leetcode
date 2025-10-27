import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

const RightSidebar = () => {
  const companies = [
    { name: "Meta", count: 1319 },
    { name: "Google", count: 2140 },
    { name: "Amazon", count: 1894 },
    { name: "Bloomberg", count: 1199 },
    { name: "Microsoft", count: 1344 },
    { name: "Uber", count: 493 },
    { name: "TikTok", count: 446 },
    { name: "Apple", count: 481 },
    { name: "Oracle", count: 326 },
    { name: "Adobe", count: 299 },
    { name: "LinkedIn", count: 176 },
    { name: "Citadel", count: 103 },
    { name: "Atlassian", count: 63 },
    { name: "Snowflake", count: 102 },
    { name: "IBM", count: 193 },
    { name: "Nvidia", count: 166 },
  ];

  const currentDay = 13;
  const currentMonth = "Day 13";
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <aside className="w-80 border-l bg-card p-4">
      {/* Calendar */}
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold">{currentMonth}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {daysInMonth.map((day) => (
            <div
              key={day}
              className={`flex h-8 w-8 items-center justify-center rounded ${
                day === currentDay
                  ? "bg-success text-success-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {day}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-success">0 Redeem</span>
          <span className="text-xs text-muted-foreground">Rules</span>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">Weekly Premium ⓘ</div>
        <div className="mt-1 text-xs text-muted-foreground">2 days left</div>
      </div>

      {/* Trending Companies */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold">Trending Companies</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="relative mb-4">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for a company..."
            className="h-8 pl-8 text-xs"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {companies.map((company) => (
            <Badge
              key={company.name}
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80"
            >
              {company.name}
              <span className="ml-1 rounded bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                {company.count}
              </span>
            </Badge>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
