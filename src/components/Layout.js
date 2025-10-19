import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import NavigationBar from './NavigationBar';
import Breadcrumbs from './Breadcrumbs';
import { Footer } from './Footer';
const Layout = ({ children, showNavigation = true, showBreadcrumbs = true, showFooter = true }) => {
    return (_jsxs("div", { className: "min-h-screen flex flex-col bg-background", children: [showNavigation && _jsx(NavigationBar, {}), showBreadcrumbs && _jsx(Breadcrumbs, {}), _jsx("main", { className: "flex-1", children: children }), showFooter && _jsx(Footer, {})] }));
};
export default Layout;
