"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Users, Activity, ExternalLink, Calendar, ArrowRight, Trophy, Zap, Shield, Gamepad2 } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function Home() {
  const { user } = useAuth();
  
  const { data: serverStatus } = useQuery({
    queryKey: ["server-status"],
    queryFn: async () => {
      const res = await fetch("/api/server-status");
      if (!res.ok) throw new Error("Failed to fetch server status");
      return res.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: news = [] } = useQuery({
    queryKey: ["news"],
    queryFn: async () => {
      const res = await fetch("/api/news?limit=3");
      if (!res.ok) throw new Error("Failed to fetch news");
      return res.json();
    },
  });

  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ["upcoming-events"],
    queryFn: async () => {
      const res = await fetch("/api/events");
      if (!res.ok) return [];
      const events = await res.json();
      return events.slice(0, 2);
    },
  });

  const stats = [
    { label: "Active Players", value: "2.5K+", icon: Users, color: "text-blue-400" },
    { label: "Total Events", value: "150+", icon: Calendar, color: "text-purple-400" },
    { label: "Server Uptime", value: "99.9%", icon: Activity, color: "text-green-400" },
    { label: "Community Size", value: "10K+", icon: Trophy, color: "text-yellow-400" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(/assets/generated_images/cyberpunk_city_street_at_night_with_neon_lights_and_rain.png)` }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        <div className="container relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center gap-6"
          >
            <Badge variant="outline" className="border-primary text-primary px-4 py-1 text-sm tracking-widest uppercase bg-primary/10 backdrop-blur-md">
              Season 2 Now Live
            </Badge>
            
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase mb-4">
              Legacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary text-glow">RP</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
              Experience the next generation of FiveM roleplay. 
              Custom framework, player-driven economy, and infinite possibilities.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button 
                data-testid="button-connect"
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-none clip-path-slant shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:scale-105 transition-transform"
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                Connect Now
              </Button>
              <Link href="/rules">
                <Button 
                  data-testid="button-rules"
                  size="lg" 
                  variant="outline" 
                  className="border-secondary text-secondary hover:bg-secondary/10 px-8 py-6 text-lg rounded-none clip-path-slant hover:scale-105 transition-transform"
                >
                   <Shield className="mr-2 h-5 w-5" />
                   View Rules
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-8 text-sm text-gray-400 bg-black/40 p-4 rounded-full backdrop-blur-sm border border-white/5">
              <div className="flex items-center gap-2">
                <div 
                  data-testid="status-indicator"
                  className={`h-2 w-2 rounded-full ${serverStatus?.online ? 'bg-green-500' : 'bg-red-500'} shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse`} 
                />
                <span>{serverStatus?.online ? 'Online' : 'Offline'}</span>
              </div>
              <div className="h-4 w-[1px] bg-white/10" />
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span data-testid="text-player-count">{serverStatus?.currentPlayers || 0} / {serverStatus?.maxPlayers || 200} Players</span>
              </div>
              <div className="h-4 w-[1px] bg-white/10" />
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-secondary" />
                <span data-testid="text-ping">{serverStatus?.ping || 0}ms Ping</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-b from-background to-background/50 border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-card/30 border-white/5 hover:border-primary/30 transition-all text-center">
                  <CardContent className="p-6">
                    <stat.icon className={`h-10 w-10 ${stat.color} mx-auto mb-3`} />
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Preview */}
      {upcomingEvents.length > 0 && (
        <section className="py-24 container mx-auto px-4 border-b border-white/5">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-display font-bold uppercase mb-2">
                Upcoming <span className="text-primary">Events</span>
              </h2>
              <p className="text-muted-foreground">Don't miss out on the action!</p>
            </div>
            <Link href="/events">
              <Button variant="ghost" className="text-primary hover:bg-primary/10">
                View All Events <ArrowRight className="ml-2 h-4 w-4"/>
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingEvents.map((event: any, i: number) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-card/30 border-white/5 hover:border-primary/30 transition-all group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{new Date(event.start_time).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{event.current_participants || 0} participants</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Latest News Section */}
      <section className="py-24 container mx-auto px-4 border-b border-white/5">
        <div className="flex justify-between items-end mb-12">
           <div>
             <h2 className="text-4xl font-display font-bold uppercase mb-2">Latest <span className="text-primary">Intel</span></h2>
             <p className="text-muted-foreground">Stay updated with the latest server changes and events.</p>
           </div>
           <Button variant="ghost" className="text-primary hover:bg-primary/10">View All News <ArrowRight className="ml-2 h-4 w-4"/></Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {news.map((item: any, i: number) => (
             <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="bg-card/30 border-white/5 hover:border-primary/30 transition-all group h-full flex flex-col">
                <CardHeader>
                   <div className="flex justify-between items-start mb-4">
                      <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20">{item.category}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3"/> 
                        {new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                   </div>
                   <CardTitle className="text-xl font-display uppercase group-hover:text-primary transition-colors">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                   <p className="text-muted-foreground text-sm leading-relaxed">{item.preview}</p>
                </CardContent>
                <div className="p-6 pt-0 mt-auto">
                   <Button variant="link" className="p-0 text-white hover:text-primary h-auto">Read More <ArrowRight className="ml-1 h-3 w-3" /></Button>
                </div>
              </Card>
             </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 container mx-auto px-4 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] z-0" />
        
        <div className="text-center mb-16 relative z-10">
          <h2 className="text-4xl font-display font-bold uppercase mb-4">
            Why Choose <span className="text-primary">Legacy RP</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Experience roleplay like never before with our cutting-edge features
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {[
            { 
              title: "Custom Framework", 
              desc: "Built from the ground up for maximum performance and unique features you won't find anywhere else.", 
              icon: Server, 
              color: "text-primary",
              gradient: "from-primary/20 to-primary/5"
            },
            { 
              title: "Player Economy", 
              desc: "A realistic, player-driven economy where every job, business, and interaction matters.", 
              icon: Activity, 
              color: "text-secondary",
              gradient: "from-secondary/20 to-secondary/5"
            },
            { 
              title: "Active Community", 
              desc: "Join thousands of active players in a toxicity-free environment monitored by professional staff.", 
              icon: Users, 
              color: "text-blue-400",
              gradient: "from-blue-400/20 to-blue-400/5"
            },
            { 
              title: "Regular Events", 
              desc: "Participate in weekly events, tournaments, and special activities with amazing rewards.", 
              icon: Calendar, 
              color: "text-green-400",
              gradient: "from-green-400/20 to-green-400/5"
            },
            { 
              title: "Advanced Systems", 
              desc: "Custom scripts for housing, vehicles, jobs, gangs, and much more.", 
              icon: Zap, 
              color: "text-yellow-400",
              gradient: "from-yellow-400/20 to-yellow-400/5"
            },
            { 
              title: "Fair Moderation", 
              desc: "Experienced staff team ensuring fair play and handling reports 24/7.", 
              icon: Shield, 
              color: "text-red-400",
              gradient: "from-red-400/20 to-red-400/5"
            },
            { 
              title: "Optimized Performance", 
              desc: "Smooth gameplay with 60+ FPS on most systems thanks to our optimization.", 
              icon: Gamepad2, 
              color: "text-purple-400",
              gradient: "from-purple-400/20 to-purple-400/5"
            },
            { 
              title: "Competitive Leaderboards", 
              desc: "Climb the ranks and compete with other players in various categories.", 
              icon: Trophy, 
              color: "text-orange-400",
              gradient: "from-orange-400/20 to-orange-400/5"
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
            >
              <Card className={`bg-gradient-to-br ${feature.gradient} border-white/5 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 group h-full`}>
                <CardHeader>
                  <feature.icon className={`h-12 w-12 ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`} />
                  <CardTitle className="text-xl font-display uppercase tracking-wide">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl"
        >
          <Card className="bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 border-white/10">
            <CardContent className="p-12 text-center relative">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-display font-bold uppercase mb-4">
                  Ready to Start Your <span className="text-primary">Journey</span>?
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join thousands of players in the most immersive FiveM roleplay experience
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg">
                    <ExternalLink className="mr-2 h-5 w-5" />
                    Connect to Server
                  </Button>
                  <Link href="/events">
                    <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/10 px-8 py-6 text-lg">
                      <Calendar className="mr-2 h-5 w-5" />
                      View Events
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}
