import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export const OAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const clientId = "5d225227-a760-4048-a6ae-e9d2a4a21da4";
        const clientSecret = "83a5c237-e597-46f9-9b67-62340b30a9a6-6b4db5ca-d241-4496-a9c0-a0926b8a8f0d";
        if (!code) {
            console.error("OAuth code is missing!");
            return;
        }

        fetch("http://127.0.0.1:3000/api/v1/oauth/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, clientId, clientSecret, state }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("OAuth token response:", data);
                if (data.access_token) {
                    localStorage.setItem("access_token", data.access_token);
                    navigate("/dashboard"); 
                } 
            })
            .catch((err) => console.error("Request error:", err));
    }, [searchParams, navigate]);

    return <div>OAuth 로그인 처리 중...</div>;
}
