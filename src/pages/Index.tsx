import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Code2, Trophy, Users, BookOpen, Target, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const features = [
    {
      icon: Code2,
      title: "2000+ Problems",
      description: "Practice coding with a vast library of algorithmic challenges",
      gradient: "bg-gradient-orange",
    },
    {
      icon: Trophy,
      title: "Weekly Contests",
      description: "Compete with developers worldwide in timed competitions",
      gradient: "bg-gradient-blue",
    },
    {
      icon: Users,
      title: "Community Discussions",
      description: "Learn from millions of solutions and explanations",
      gradient: "bg-gradient-purple",
    },
    {
      icon: Target,
      title: "Interview Prep",
      description: "Get ready for technical interviews at top companies",
      gradient: "bg-gradient-green",
    },
  ];

  const stats = [
    { number: "3,715", label: "Problems" },
    { number: "500K+", label: "Active Users" },
    { number: "1000+", label: "Companies" },
    { number: "50M+", label: "Solutions" },
  ];

  const companies = [
    "Google", "Meta", "Amazon", "Microsoft", "Apple", "Netflix", 
    "Tesla", "Uber", "Adobe", "Bloomberg", "Oracle", "LinkedIn"
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl">
              A New Way to Learn
              <span className="block bg-gradient-orange bg-clip-text text-transparent">
                Coding & Programming
              </span>
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              LeetCode is the best platform to help you enhance your skills, expand your knowledge and prepare for technical interviews.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/problems">
                <Button size="lg" className="gap-2">
                  Explore Problems
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                Start Learning
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-card py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Why Choose LeetCode?
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to ace your technical interviews
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="group relative overflow-hidden p-6 transition-all hover:shadow-lg">
                  <div className={`mb-4 inline-flex rounded-lg ${feature.gradient} p-3 text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Learning Paths Section */}
      <section className="bg-muted py-20">
        <div className="container mx-auto px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Structured Learning Paths
            </h2>
            <p className="text-lg text-muted-foreground">
              Master coding skills with our curated study plans
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="overflow-hidden">
              <div className="bg-gradient-orange p-6 text-white">
                <BookOpen className="mb-4 h-8 w-8" />
                <h3 className="mb-2 text-xl font-semibold">Beginner's Guide</h3>
                <p className="mb-4 text-sm opacity-90">Start your coding journey with fundamental concepts</p>
                <Button variant="secondary" size="sm">
                  Get Started
                </Button>
              </div>
            </Card>
            <Card className="overflow-hidden">
              <div className="bg-gradient-blue p-6 text-white">
                <Target className="mb-4 h-8 w-8" />
                <h3 className="mb-2 text-xl font-semibold">Interview Preparation</h3>
                <p className="mb-4 text-sm opacity-90">Ace technical interviews at top tech companies</p>
                <Button variant="secondary" size="sm">
                  Start Preparing
                </Button>
              </div>
            </Card>
            <Card className="overflow-hidden">
              <div className="bg-gradient-purple p-6 text-white">
                <Zap className="mb-4 h-8 w-8" />
                <h3 className="mb-2 text-xl font-semibold">Advanced Algorithms</h3>
                <p className="mb-4 text-sm opacity-90">Master complex data structures and algorithms</p>
                <Button variant="secondary" size="sm">
                  Level Up
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Companies Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Trusted by Engineers at
            </h2>
            <p className="text-lg text-muted-foreground">
              Practice problems asked by top tech companies
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {companies.map((company) => (
              <div
                key={company}
                className="rounded-lg border bg-card px-6 py-3 text-lg font-semibold text-muted-foreground transition-all hover:border-primary hover:text-foreground"
              >
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary/10 to-accent/10 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Ready to Start Your Journey?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join millions of developers improving their coding skills
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/problems">
              <Button size="lg" className="gap-2">
                Browse Problems
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Sign Up Free
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2025 LeetCode Clone. Built with ❤️ for learning purposes.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
