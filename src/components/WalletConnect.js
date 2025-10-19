import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useWalletStore } from "@/store/useWalletStore";
import { connectWallet, disconnectWallet, userSession } from "@/lib/stacks";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
const WalletConnect = () => {
    const { isConnected, userAddress, setConnected, setDisconnected } = useWalletStore();
    const [isChecking, setIsChecking] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    // Check for existing wallet session on mount
    useEffect(() => {
        const checkExistingSession = () => {
            try {
                if (userSession.isUserSignedIn()) {
                    const userData = userSession.loadUserData();
                    const address = userData.profile.stxAddress.testnet || userData.profile.stxAddress.mainnet;
                    if (address && address !== userAddress) {
                        console.log('✅ Found existing wallet session:', address);
                        setConnected(address);
                        // Redirect from landing page to main app after wallet connection
                        if (location.pathname === '/landing') {
                            console.log('🔄 Redirecting from landing page to app');
                            navigate('/');
                        }
                    }
                }
                else if (isConnected) {
                    // Session expired but store shows connected - clear it
                    console.log('⚠️ Session expired, clearing wallet state');
                    setDisconnected();
                }
            }
            catch (error) {
                console.error('Error checking wallet session:', error);
                if (isConnected) {
                    setDisconnected();
                }
            }
            finally {
                setIsChecking(false);
            }
        };
        checkExistingSession();
    }, [setConnected, setDisconnected, userAddress, isConnected, navigate, location.pathname]);
    const handleConnect = () => {
        connectWallet((address) => {
            console.log('✅ Wallet connected:', address);
            setConnected(address);
            // Redirect from landing page to main app after connection
            if (location.pathname === '/landing') {
                console.log('🔄 Redirecting to app after connection');
                navigate('/');
            }
            // If user connected from a protected route gate, they'll auto-see the content
            // No need to redirect - the ProtectedRoute component handles that
        });
    };
    const handleDisconnect = () => {
        console.log('👋 Disconnecting wallet');
        disconnectWallet();
        setDisconnected();
    };
    if (isChecking) {
        return (_jsxs(Button, { disabled: true, variant: "outline", children: [_jsx(Wallet, { className: "w-4 h-4 mr-2" }), "Checking..."] }));
    }
    return (_jsx("div", { className: "flex items-center gap-4", children: isConnected ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("div", { className: "flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full animate-pulse" }), _jsx(Wallet, { className: "w-4 h-4" }), _jsxs("span", { className: "text-sm font-mono", children: [userAddress?.slice(0, 6), "...", userAddress?.slice(-4)] })] }), _jsx(Button, { variant: "outline", size: "sm", onClick: handleDisconnect, children: "Disconnect" })] })) : (_jsxs(Button, { onClick: handleConnect, className: "bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700", children: [_jsx(Wallet, { className: "w-4 h-4 mr-2" }), "Connect Wallet"] })) }));
};
export default WalletConnect;
