import { type FormEvent, type KeyboardEvent, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
    ArrowRight,
    BarChartSquare02,
    CoinsStacked01,
    LayersThree01,
    SearchLg,
    Users01,
} from "@untitledui/icons";
import { cx } from "@/utils/cx";

// ─── Types ───────────────────────────────────────────────────

interface Suggestion {
    label: string;
    icon: React.FC<{ className?: string }>;
    query: string;
}

// ─── Data ────────────────────────────────────────────────────

const suggestions: Suggestion[] = [
    { label: "Sprint overview", icon: LayersThree01, query: "Show sprint overview for the current team sprint" },
    { label: "Active users", icon: Users01, query: "Summarize active users across all projects this week" },
    { label: "Issuance summary", icon: CoinsStacked01, query: "Show total points issued this month" },
    { label: "Completion rate", icon: BarChartSquare02, query: "Show task completion rate compared to last month" },
];

// ─── Page ────────────────────────────────────────────────────

export const DashboardHomeTwo = () => {
    const [inputValue, setInputValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const navigate = useNavigate();

    const submitQuery = (query: string) => {
        navigate("/dashboard/home-two/result", { state: { query } });
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const trimmed = inputValue.trim();
        if (!trimmed) return;
        submitQuery(trimmed);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            const trimmed = inputValue.trim();
            if (!trimmed) return;
            submitQuery(trimmed);
        }
    };

    const handleTextareaInput = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    };

    return (
        <div className="flex flex-1 flex-col">
            {/* AI Hero Section */}
            <div className="border-b border-secondary bg-primary px-6 pt-10 pb-8 lg:px-8 lg:pt-14 lg:pb-10">
                <div>
                    {/* Greeting */}
                    <div className="mb-8">
                        <h1 className="text-display-sm font-light text-tertiary lg:text-display-md">
                            Welcome back, Michael.
                        </h1>
                        <p className="text-display-sm font-semibold text-primary lg:text-display-md">
                            How can we help?
                        </p>
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit}>
                        <div className="flex items-center gap-2 rounded-xl border border-secondary bg-primary p-3 shadow-sm transition duration-100 ease-linear focus-within:border-brand focus-within:ring-1 focus-within:ring-brand">
                            <SearchLg className="ml-1 size-5 shrink-0 text-fg-quaternary" />
                            <textarea
                                ref={textareaRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onInput={handleTextareaInput}
                                placeholder="Ask a question, find a file, or make a request"
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

                    {/* Suggestions */}
                    <div className="mt-4">
                        <p className="mb-2 text-xs font-medium text-quaternary">Suggestions</p>
                        <div className="flex flex-wrap gap-2">
                            {suggestions.map((suggestion) => (
                                <button
                                    key={suggestion.label}
                                    type="button"
                                    onClick={() => submitQuery(suggestion.query)}
                                    className="flex cursor-pointer items-center gap-1.5 rounded-full border border-secondary bg-primary px-3 py-1.5 text-sm font-medium text-secondary transition duration-100 ease-linear hover:bg-primary_hover hover:text-secondary_hover"
                                >
                                    <suggestion.icon className="size-3.5 text-fg-quaternary" />
                                    {suggestion.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard content below */}
            <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <MetricCard label="Total points issued" value="24,500" />
                    <MetricCard label="Active participants" value="142" />
                    <MetricCard label="Rewards this month" value="$1,280" />
                </div>

                <div className="flex-1 rounded-xl border border-secondary bg-primary p-6">
                    <p className="text-sm text-tertiary">Content area — ready for your components.</p>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ label, value }: { label: string; value: string }) => (
    <div className="rounded-xl border border-secondary bg-primary p-5">
        <p className="text-sm font-medium text-tertiary">{label}</p>
        <p className="mt-2 text-display-sm font-semibold text-primary">{value}</p>
    </div>
);
