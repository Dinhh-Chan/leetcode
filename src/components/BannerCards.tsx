import { Button } from "@/components/ui/button";

const BannerCards = () => {
  const cards = [
    {
      title: "JavaScript",
      subtitle: "30 Day Challenge",
      tag: "Beginner-Friendly",
      gradient: "bg-gradient-orange",
    },
    {
      title: "Top Interview",
      subtitle: "Questions",
      gradient: "bg-gradient-blue",
    },
    {
      title: "LeetCode's Interview",
      subtitle: "Crash Course:",
      description: "Data Structures and Algorithms",
      gradient: "bg-gradient-purple",
    },
    {
      title: "LeetCode's Interview",
      subtitle: "Crash Course:",
      description: "System Design for Interviews",
      gradient: "bg-gradient-green",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.gradient} relative overflow-hidden rounded-lg p-6 text-white shadow-lg`}
        >
          <div className="relative z-10">
            {card.tag && (
              <span className="mb-2 inline-block rounded bg-white/20 px-2 py-1 text-xs font-medium">
                {card.tag}
              </span>
            )}
            <h3 className="mb-1 text-lg font-bold">{card.title}</h3>
            <p className="mb-3 text-sm font-semibold opacity-90">{card.subtitle}</p>
            {card.description && (
              <p className="mb-3 text-xs opacity-80">{card.description}</p>
            )}
            {index === 0 && (
              <div className="mb-3 text-4xl font-bold">DAY<br />30</div>
            )}
            <Button
              size="sm"
              variant="secondary"
              className="bg-white text-foreground hover:bg-white/90"
            >
              {index === 0 ? "Start Learning" : "Get Started"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BannerCards;
