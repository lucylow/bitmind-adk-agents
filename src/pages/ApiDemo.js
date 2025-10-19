import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * API Demo Page - Showcases public API integrations
 */
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PublicApiDemo } from "@/components/PublicApiDemo";
const ApiDemo = () => {
    return (_jsx("div", { className: "min-h-screen bg-background", children: _jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("header", { className: "mb-8", children: [_jsx(Link, { to: "/", children: _jsxs(Button, { variant: "outline", className: "mb-4", children: [_jsx(ArrowLeft, { className: "w-4 h-4 mr-2" }), "Back to Dashboard"] }) }), _jsx("h1", { className: "text-4xl font-bold mb-2 text-foreground", children: "Public API Integrations Demo" }), _jsx("p", { className: "text-muted-foreground text-lg", children: "Explore free, open APIs with no authentication required" })] }), _jsx(PublicApiDemo, {})] }) }));
};
export default ApiDemo;
