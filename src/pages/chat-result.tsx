import { type FormEvent, type KeyboardEvent, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, SearchLg } from "@untitledui/icons";
import { cx } from "@/utils/cx";

// ─── Types ───────────────────────────────────────────────────

interface ChatResultState {
    query: string;
    title: string;
    response: string;
    timestamp: string;
    followUps: string[];
}

// ─── Data ────────────────────────────────────────────────────

const placeholderResults: Record<string, ChatResultState> = {
    "Show sprint overview for the current team sprint": {
        query: "Show sprint overview for the current team sprint",
        title: "Sprint overview for your team",
        response:
            "The current sprint has 12 tasks in progress, 8 completed, and 4 in review. The team is on track to complete 85% of planned story points by end of sprint on Friday.",
        timestamp: "",
        followUps: [
            "Which team members have the most tasks in progress?",
            "Can you break down completion rates by task category?",
            "What are the blockers for the 4 tasks in review?",
        ],
    },
    "Summarize active users across all projects this week": {
        query: "Summarize active users across all projects this week",
        title: "Active users across all projects",
        response:
            'There are 24 active users this week across 6 projects. The most active project is "Dashboard Redesign" with 9 contributors. User engagement is up 12% from last week.',
        timestamp: "",
        followUps: [
            "Which users have been inactive for more than 2 weeks?",
            "Can you show a breakdown of users by project?",
            "How does this week's engagement compare to the monthly average?",
        ],
    },
    "Show total points issued this month": {
        query: "Show total points issued this month",
        title: "Points issuance summary for this month",
        response:
            "Total points issued this month: 8,420 across 56 participants. That's a 15% increase from last month. The top program is US with 3,200 points issued.",
        timestamp: "",
        followUps: [
            "Which participants received the most points this month?",
            "Can you provide a breakdown of points by program?",
            "What is the redemption rate for points issued this month?",
        ],
    },
    "Show task completion rate compared to last month": {
        query: "Show task completion rate compared to last month",
        title: "Task completion rate comparison",
        response:
            "Task completion rate this month is 78%, up from 71% last month. The biggest improvement is in the Engineering team, which went from 65% to 82%. QA tasks still have the lowest completion rate at 61%.",
        timestamp: "",
        followUps: [
            "What specific changes led to the Engineering team's improvement?",
            "Can you suggest strategies to improve the QA completion rate?",
            "How does our completion rate compare to industry benchmarks?",
        ],
    },
};

function getFormattedTimestamp(): string {
    const now = new Date();
    return now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    }) +
        " \u00B7 " +
        now.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            timeZoneName: "short",
        });
}

function generateDefaultResult(query: string): ChatResultState {
    return {
        query,
        title: `Results for your question`,
        response: `Here's what I found for "${query}". This is a placeholder response — connect to your AI backend to get real answers.`,
        timestamp: "",
        followUps: [
            "Can you provide more details on this topic?",
            "What are the key metrics related to this?",
            "How has this changed over the past month?",
        ],
    };
}

// ─── Page ────────────────────────────────────────────────────

export const ChatResultPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [inputValue, setInputValue] = useState("");

    const state = location.state as { query?: string } | null;
    const query = state?.query ?? "";

    const result = placeholderResults[query] ?? generateDefaultResult(query);
    const timestamp = getFormattedTimestamp();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const trimmed = inputValue.trim();
        if (!trimmed) return;
        navigate("/dashboard/home-two/result", { state: { query: trimmed }, replace: true });
        setInputValue("");
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            const trimmed = inputValue.trim();
            if (!trimmed) return;
            navigate("/dashboard/home-two/result", { state: { query: trimmed }, replace: true });
            setInputValue("");
        }
    };

    const handleFollowUp = (followUp: string) => {
        navigate("/dashboard/home-two/result", { state: { query: followUp }, replace: true });
    };

    const handleTextareaInput = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    };

    return (
        <div className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col px-6 pt-6 pb-10 lg:px-8 lg:pt-8 lg:pb-14">
                {/* Back button */}
                <button
                    type="button"
                    onClick={() => navigate("/dashboard/home-two")}
                    className="mb-8 flex size-10 cursor-pointer items-center justify-center rounded-full border border-secondary bg-primary shadow-xs transition duration-100 ease-linear hover:bg-primary_hover"
                    aria-label="Back to Home"
                >
                    <ArrowLeft className="size-5 text-fg-secondary" />
                </button>

                {/* Result content */}
                <div className="max-w-3xl">
                    <h1 className="text-display-sm font-semibold text-primary lg:text-display-md">
                        {result.title}
                    </h1>
                    <p className="mt-2 text-sm text-tertiary">{timestamp}</p>

                    <p className="mt-8 text-md text-secondary leading-relaxed">{result.response}</p>

                    {/* Ask another question */}
                    <div className="mt-10">
                        <p className="text-md text-primary">
                            <span className="font-semibold">Still need help?</span>{" "}
                            <button
                                type="button"
                                onClick={() => navigate("/dashboard/home-two")}
                                className="cursor-pointer font-semibold underline underline-offset-4 transition duration-100 ease-linear hover:text-secondary"
                            >
                                Ask another question
                            </button>
                        </p>
                    </div>

                    {/* Follow up suggestions */}
                    <div className="mt-10">
                        <p className="mb-3 text-sm font-semibold text-primary">Follow up</p>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {result.followUps.map((followUp) => (
                                <button
                                    key={followUp}
                                    type="button"
                                    onClick={() => handleFollowUp(followUp)}
                                    className="cursor-pointer rounded-xl border border-secondary bg-secondary p-4 text-left text-sm text-secondary leading-relaxed transition duration-100 ease-linear hover:bg-secondary_hover hover:text-secondary_hover"
                                >
                                    {followUp}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky bottom input */}
            <div className="sticky bottom-0 border-t border-secondary bg-primary px-6 py-4 lg:px-8">
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center gap-2 rounded-xl border border-secondary bg-primary p-3 shadow-sm transition duration-100 ease-linear focus-within:border-brand focus-within:ring-1 focus-within:ring-brand">
                        <SearchLg className="mb-0.5 ml-1 size-5 shrink-0 text-fg-quaternary" />
                        <textarea
                            ref={textareaRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onInput={handleTextareaInput}
                            placeholder="Ask a follow-up question..."
                            rows={1}
                            className="max-h-30 min-h-6 flex-1 resize-none bg-transparent text-md text-primary placeholder:text-placeholder focus:outline-none"
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim()}
                            className={cx(
                                "flex size-8 shrink-0 items-center justify-center rounded-lg transition duration-100 ease-linear",
                                inputValue.trim()
                                    ? "cursor-pointer bg-brand-solid text-fg-white hover:bg-brand-solid_hover"
                                    : "cursor-not-allowed text-fg-quaternary opacity-40",
                            )}
                        >
                            <ArrowRight className="size-4.5 stroke-[2.5px]" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
