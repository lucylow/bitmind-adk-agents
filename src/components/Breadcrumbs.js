import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
const routeLabels = {
    '/': 'Home',
    '/dashboard': 'Dashboard',
    '/invoices': 'Invoices',
    '/create': 'Create Invoice',
    '/demo': 'AI Demo',
    '/api-demo': 'API Demo',
    '/analytics': 'Analytics',
    '/help': 'Help',
    '/landing': 'Landing',
};
const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);
    // Don't show breadcrumbs on home or landing page
    if (location.pathname === '/' || location.pathname === '/landing') {
        return null;
    }
    const breadcrumbs = [
        { label: 'Home', path: '/' }
    ];
    let currentPath = '';
    pathnames.forEach((pathname, index) => {
        currentPath += `/${pathname}`;
        const label = routeLabels[currentPath] || pathname.charAt(0).toUpperCase() + pathname.slice(1);
        breadcrumbs.push({ label, path: currentPath });
    });
    return (_jsx("nav", { className: "bg-white border-b border-gray-200", children: _jsx("div", { className: "container mx-auto px-4 sm:px-6 lg:px-8 py-3", children: _jsx("ol", { className: "flex items-center space-x-2 text-sm", children: breadcrumbs.map((breadcrumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    const isFirst = index === 0;
                    return (_jsxs("li", { className: "flex items-center", children: [index > 0 && (_jsx(ChevronRight, { className: "w-4 h-4 text-gray-400 mx-2" })), isLast ? (_jsxs("span", { className: "text-gray-900 font-medium flex items-center gap-1", children: [isFirst && _jsx(Home, { className: "w-4 h-4" }), breadcrumb.label] })) : (_jsxs(Link, { to: breadcrumb.path, className: "text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1", children: [isFirst && _jsx(Home, { className: "w-4 h-4" }), breadcrumb.label] }))] }, breadcrumb.path));
                }) }) }) }));
};
export default Breadcrumbs;
