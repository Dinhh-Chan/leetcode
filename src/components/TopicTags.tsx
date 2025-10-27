import { Badge } from "@/components/ui/badge";

const TopicTags = () => {
  const topics = [
    { name: "Array", count: 2016 },
    { name: "String", count: 817 },
    { name: "Hash Table", count: 740 },
    { name: "Dynamic Programming", count: 622 },
    { name: "Math", count: 621 },
    { name: "Sorting", count: 478 },
    { name: "Greedy", count: 437 },
    { name: "Depth-First Search", count: 329 },
  ];

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {topics.map((topic) => (
        <Badge
          key={topic.name}
          variant="secondary"
          className="cursor-pointer hover:bg-secondary/80"
        >
          {topic.name}
          <span className="ml-1 text-muted-foreground">{topic.count}</span>
        </Badge>
      ))}
    </div>
  );
};

export default TopicTags;
