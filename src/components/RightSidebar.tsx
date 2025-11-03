import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

const RightSidebar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date>(new Date());

  return (
    <aside className="w-80 border-l bg-card p-4">
      <div className="mb-6">
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2">Lịch</h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={month}
            onMonthChange={setMonth}
            className="rounded-md border"
            formatters={{
              formatCaption: (date) => format(date, "MM/yyyy")
            }}
          />
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
