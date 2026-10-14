"use client";

import { BadgesFieldset, KeySkillsFieldset, SoftSkillsFieldset } from "@/components/form/SkillsFieldsets";

export function SkillsStep() {
  return (
    <div className="space-y-8">
      <BadgesFieldset />
      <SoftSkillsFieldset />
      <KeySkillsFieldset />
    </div>
  );
}
