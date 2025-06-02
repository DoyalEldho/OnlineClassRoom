import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PreventBack = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleBackButton = () => {
            navigate(1); // Prevent going back
        };

        window.history.pushState(null, "", window.location.href);
        window.addEventListener("popstate", handleBackButton);

        return () => {
            window.removeEventListener("popstate", handleBackButton);
        };
    }, [navigate]);

};

export default PreventBack;
