import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Code2, Trophy, BookOpen, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const features = [
    {
      icon: Code2,
      title: "Bài tập lập trình",
      description: "Thực hành với hàng trăm bài tập từ cơ bản đến nâng cao",
      gradient: "bg-gradient-orange",
      link: "/problems",
    },
    {
      icon: Trophy,
      title: "Cuộc thi",
      description: "Tham gia các cuộc thi lập trình và cạnh tranh với các lập trình viên khác",
      gradient: "bg-gradient-blue",
      link: "/contest",
    },
    {
      icon: BookOpen,
      title: "Học theo chủ đề",
      description: "Tổ chức bài tập theo từng chủ đề giúp bạn học tập hiệu quả hơn",
      gradient: "bg-gradient-purple",
      link: "/problems",
    },
    {
      icon: TrendingUp,
      title: "Theo dõi tiến độ",
      description: "Theo dõi số bài đã giải và cải thiện kỹ năng lập trình của bạn",
      gradient: "bg-gradient-green",
      link: "/profile",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl">
              Nền tảng học lập trình
              <span className="block bg-gradient-orange bg-clip-text text-transparent">
                Tốt nhất cho bạn
              </span>
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              Nâng cao kỹ năng lập trình của bạn với các bài tập thực hành và cuộc thi đầy thử thách
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/problems">
                <Button 
                  size="lg" 
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/80 dark:hover:text-primary-foreground"
                >
                  <span>Khám phá bài tập</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contest">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground dark:border-primary dark:text-primary dark:hover:bg-primary dark:hover:text-primary-foreground"
                >
                  <span>Xem cuộc thi</span>
                  <Trophy className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Tại sao chọn chúng tôi?
            </h2>
            <p className="text-lg text-muted-foreground">
              Mọi thứ bạn cần để nâng cao kỹ năng lập trình
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.title} to={feature.link || "#"}>
                  <Card className="group relative overflow-hidden p-6 transition-all hover:shadow-lg cursor-pointer h-full">
                    <div className={`mb-4 inline-flex rounded-lg ${feature.gradient} p-3 text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="bg-muted py-20">
        <div className="container mx-auto px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Bắt đầu ngay hôm nay
            </h2>
            <p className="text-lg text-muted-foreground">
              Khám phá các tính năng của nền tảng
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Link to="/problems">
              <Card className="group h-full cursor-pointer transition-all hover:shadow-lg">
                <CardContent className="p-8">
                  <div className="mb-4 inline-flex rounded-lg bg-gradient-orange p-4 text-white">
                    <Code2 className="h-8 w-8" />
                  </div>
                  <h3 className="mb-3 text-2xl font-semibold">Bài tập lập trình</h3>
                  <p className="mb-4 text-muted-foreground">
                    Thực hành giải quyết các bài toán lập trình với nhiều mức độ khó khác nhau. 
                    Từ những bài tập cơ bản đến những thách thức phức tạp.
                  </p>
                  <div className="flex items-center text-primary group-hover:underline">
                    Xem tất cả bài tập
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/contest">
              <Card className="group h-full cursor-pointer transition-all hover:shadow-lg">
                <CardContent className="p-8">
                  <div className="mb-4 inline-flex rounded-lg bg-gradient-blue p-4 text-white">
                    <Trophy className="h-8 w-8" />
                  </div>
                  <h3 className="mb-3 text-2xl font-semibold">Cuộc thi lập trình</h3>
                  <p className="mb-4 text-muted-foreground">
                    Tham gia các cuộc thi lập trình và cạnh tranh với các lập trình viên khác. 
                    Xem bảng xếp hạng và cải thiện kỹ năng của bạn.
                  </p>
                  <div className="flex items-center text-primary group-hover:underline">
                    Xem các cuộc thi
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary/10 to-accent/10 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Sẵn sàng bắt đầu hành trình của bạn?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Hãy tham gia cùng hàng nghìn lập trình viên đang cải thiện kỹ năng của mình
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/problems">
              <Button 
                size="lg" 
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/80 dark:hover:text-primary-foreground shadow-lg hover:shadow-xl transition-all"
              >
                <span>Khám phá bài tập</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/contest">
              <Button 
                size="lg" 
                variant="outline" 
                className="gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground dark:border-primary dark:text-primary dark:hover:bg-primary dark:hover:text-primary-foreground transition-all"
              >
                <span>Xem cuộc thi</span>
                <Trophy className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
