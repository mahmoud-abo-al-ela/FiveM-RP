"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldAlert, HeartHandshake, Skull } from "lucide-react";

export default function Rules() {

  const rules = {
    general: [
      {
        title: "Respect & Toxicity",
        desc: "Zero tolerance for toxicity, racism, sexism, or harassment. Treat all players with respect.",
      },
      {
        title: "Roleplay Quality",
        desc: "Maintain character at all times. Use /me and /do commands appropriately for immersion.",
      },
      {
        title: "Mic Spam",
        desc: "Do not spam voice chat or play loud music in public areas without RP context.",
      },
    ],
    gameplay: [
      {
        title: "RDM (Random Death Match)",
        desc: "Killing another player without valid roleplay initiation or reason is strictly prohibited.",
      },
      {
        title: "VDM (Vehicle Death Match)",
        desc: "Using a vehicle as a weapon to kill or injure players without valid RP reason is not allowed.",
      },
      {
        title: "Metagaming",
        desc: "Using outside information (Discord, streams) in-game is banned. Keep IC and OOC separate.",
      },
      {
        title: "New Life Rule (NLR)",
        desc: "If you are downed and respawn at the hospital, you forget the events leading to your death.",
      },
    ],
    criminal: [
      {
        title: "Gang Limits",
        desc: "Maximum 6 members involved in a hostile situation or robbery.",
      },
      {
        title: "Cop Baiting",
        desc: "Intentionally provoking police for a chase or gunfight without reason is prohibited.",
      },
      {
        title: "Hostage Taking",
        desc: "Fake hostages are not allowed. You must have a valid reason to take a hostage.",
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-display font-bold mb-4 text-glow">
          Server Rules
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          To ensure a high-quality roleplay environment, all citizens must
          adhere to the following laws.
        </p>
      </motion.div>

      <Tabs defaultValue="gameplay" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 bg-black/40 border border-white/10 p-1 mb-8">
            <TabsTrigger
              value="general"
              className="data-[state=active]:bg-primary data-[state=active]:text-white font-display uppercase tracking-wider"
            >
              General
            </TabsTrigger>
            <TabsTrigger
              value="gameplay"
              className="data-[state=active]:bg-secondary data-[state=active]:text-black font-display uppercase tracking-wider"
            >
              Gameplay
            </TabsTrigger>
            <TabsTrigger
              value="criminal"
              className="data-[state=active]:bg-destructive data-[state=active]:text-white font-display uppercase tracking-wider"
            >
              Criminal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <RuleSection
              icon={HeartHandshake}
              title="Community Standards"
              items={rules.general}
              color="text-primary"
            />
          </TabsContent>
          <TabsContent value="gameplay">
            <RuleSection
              icon={ShieldAlert}
              title="Core Mechanics"
              items={rules.gameplay}
              color="text-secondary"
            />
          </TabsContent>
          <TabsContent value="criminal">
            <RuleSection
              icon={Skull}
              title="Criminal Activity"
              items={rules.criminal}
              color="text-destructive"
            />
          </TabsContent>
        </Tabs>
    </div>
  );
}

function RuleSection({ icon: Icon, title, items, color }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 mb-6">
        <Icon className={`h-8 w-8 ${color}`} />
        <h2 className="text-2xl font-display uppercase">{title}</h2>
      </div>

      <div className="grid gap-4">
        {items.map((rule: any, i: number) => (
          <Card
            key={i}
            className="bg-card/50 border-white/5 hover:border-white/20 transition-colors"
          >
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <span className={`${color} opacity-80`}>§{i + 1}.0</span>
                {rule.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{rule.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
