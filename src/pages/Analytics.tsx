
import React from "react";
import Layout from "@/components/Layout";
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import { Link } from "react-router-dom";
import { BarChart2, TrendingUp, Brain, Lightbulb } from "lucide-react";

const Analytics: React.FC = () => {
  return (
    <Layout>
      <div className="animate-fade-in">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground mt-1">Insights and planning tools for your platforms</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <NeuCard className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <BarChart2 className="text-primary" size={24} />
              <h2 className="text-xl font-bold">Performance Overview</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Track and analyze the performance of your platforms and assets over time.
            </p>
            <p className="text-sm bg-neugray-100 p-3 rounded-md mb-4">
              Performance analytics are coming soon! We're working on integrating with your ad platforms to provide unified reporting.
            </p>
            <div className="mt-auto">
              <NeuButton variant="outline" disabled>View Performance Dashboard</NeuButton>
            </div>
          </NeuCard>

          <NeuCard className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="text-primary" size={24} />
              <h2 className="text-xl font-bold">AI Media Planning</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Generate comprehensive media plans using AI based on your platforms, assets, and business goals.
            </p>
            <div className="bg-primary/10 p-4 rounded-md mb-6">
              <div className="flex items-start gap-3">
                <Lightbulb className="text-primary shrink-0 mt-1" size={20} />
                <div>
                  <h3 className="font-medium mb-1">Intelligent Media Planning</h3>
                  <p className="text-sm">
                    Our AI analyzes your platforms and assets to create data-driven media plans with 
                    strategic recommendations, budget allocation, and expected performance metrics.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-auto">
              <Link to="/media-plan">
                <NeuButton className="w-full">Create Media Plan</NeuButton>
              </Link>
            </div>
          </NeuCard>
        </div>

        <NeuCard>
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-primary" size={24} />
            <h2 className="text-xl font-bold">Coming Soon</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-neugray-200 rounded-md p-4">
              <h3 className="font-medium mb-2">Campaign Reporting</h3>
              <p className="text-sm text-muted-foreground">
                Unified campaign performance reporting across all your platforms
              </p>
            </div>
            <div className="border border-neugray-200 rounded-md p-4">
              <h3 className="font-medium mb-2">Audience Insights</h3>
              <p className="text-sm text-muted-foreground">
                Detailed audience analysis and demographic reporting
              </p>
            </div>
            <div className="border border-neugray-200 rounded-md p-4">
              <h3 className="font-medium mb-2">Performance Forecasting</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered predictions for campaign performance
              </p>
            </div>
          </div>
        </NeuCard>
      </div>
    </Layout>
  );
};

export default Analytics;
