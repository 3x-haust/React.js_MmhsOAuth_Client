import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export const OAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const clientId = searchParams.get("client_id");
        const clientSecret = searchParams.get("client_secret");
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
