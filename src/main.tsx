import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { DashboardHome, DashboardLayout } from "@/pages/dashboard";
import { DashboardHomeTwo } from "@/pages/dashboard-home-two";
import { ChatResultPage } from "@/pages/chat-result";
import { IssuePointsPage } from "@/pages/issue-points";
import { NotFound } from "@/pages/not-found";
import { ParticipantsPage } from "@/pages/participants";
import { PromotionsPage } from "@/pages/promotions";
import { ReportingPage } from "@/pages/reporting";
import { RouteProvider } from "@/providers/router-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import "@/styles/globals.css";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider>
            <BrowserRouter>
                <RouteProvider>
                    <Routes>
                        <Route path="/dashboard" element={<DashboardLayout />}>
                            <Route index element={<DashboardHome />} />
                            <Route path="home-two" element={<DashboardHomeTwo />} />
                            <Route path="home-two/result" element={<ChatResultPage />} />
                            <Route path="issue-points" element={<IssuePointsPage />} />
                            <Route path="participants" element={<ParticipantsPage />} />
                            <Route path="promotions" element={<PromotionsPage />} />
                            <Route path="reporting" element={<ReportingPage />} />
                        </Route>
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </RouteProvider>
            </BrowserRouter>
        </ThemeProvider>
    </StrictMode>,
);
