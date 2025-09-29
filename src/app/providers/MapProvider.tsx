"use client";
import { useLoadScript } from "@react-google-maps/api";
import { environment } from "@/environments/env.api";
import { Loader2 } from "lucide-react";

export default function MapsProvider({ children }: { children: React.ReactNode }) {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: environment.NEXT_PUBLIC_GOOGLE_MAP_API_KEY,
        libraries: ["places", "drawing"],
    });

    if (loadError) {
        console.error('Failed to load Google Maps:', loadError);
        return (
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100vh',
                flexDirection: 'column',
                padding: '20px',
                textAlign: 'center',
                color: '#d32f2f',
                backgroundColor: '#ffebee',
            }}>
                <h2>Failed to load Google Maps</h2>
                <p>Please check your internet connection and try again.</p>
                <p>Error: {loadError.message}</p>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100vh',
                flexDirection: 'column'
            }}>
                <Loader2 style={{ color: "#4f46e5", fontSize: "2rem", width: "40px", height: "40px" }} />
                <p>Loading...</p>
            </div>
        );
    }

    return <>{children}</>;
}