
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardWithSidebar from "../components/dashboard/DashboardWithSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import GoalsTab from "../components/performance/GoalsTab";
import ReviewsTab from "../components/performance/ReviewsTab";
import SkillsTab from "../components/performance/SkillsTab";

const Performance = () => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab = tab || "goals";

  const handleTabChange = (value: string) => {
    navigate(`/performance/${value}`);
  };

  return (
    <DashboardWithSidebar>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Performance Management</h1>
        <p className="text-gray-600">Track your goals, reviews, and skills development</p>
      </div>

      <Card className="p-6">
        <Tabs value={activeTab} className="w-full" onValueChange={handleTabChange}>
          <TabsList className="mb-6">
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
          </TabsList>
          
          <TabsContent value="goals" className="space-y-4">
            <GoalsTab />
          </TabsContent>
          
          <TabsContent value="reviews" className="space-y-4">
            <ReviewsTab />
          </TabsContent>
          
          <TabsContent value="skills" className="space-y-4">
            <SkillsTab />
          </TabsContent>
        </Tabs>
      </Card>
    </DashboardWithSidebar>
  );
};

export default Performance;
