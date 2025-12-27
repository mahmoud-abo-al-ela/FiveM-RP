"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ActivationForm } from "@/components/auth/ActivationForm";

export default function ActivatePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="bg-card/30 border-white/5 backdrop-blur-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-display font-bold uppercase mb-2">
              Account <span className="text-primary">Activation</span>
            </CardTitle>
            <CardDescription className="text-base">
              Complete the form below to activate your account and join Legacy RP
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActivationForm />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
